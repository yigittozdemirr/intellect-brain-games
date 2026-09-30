import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PixelButton from "../ui/PixelButton";
import PixelPanel from "../ui/PixelPanel";
import ComboHUD from "./ComboHUD";
import { ParticleLayer, useParticles } from "./ParticleEffects";
import ErrorBoundary from "./ErrorBoundary";
import {
  createGameState,
  processCorrect,
  processWrong,
  GAME_DURATION,
  FAST_DURATION,
  INPUT_LOCK_MS,
  WRONG_PENALTY_SECONDS,
} from "../../lib/scoring";
import {
  playCorrect,
  playWrong,
  playMultUp,
  playTick,
  playGo,
  playFanfare,
  playNewBest,
  isMuted,
  toggleMute,
} from "../../lib/sound";
import { hasSeenRules, markRulesSeen } from "../../lib/progress";
import { formatNumber } from "../../lib/helpers";
import { useMounted, useCountdown, useGameTimer } from "../../lib/useGameTimer";

const PHASES = { RULES: "rules", COUNTDOWN: "countdown", PLAYING: "playing", PAUSED: "paused", RESULTS: "results" };

const isFastMode = typeof import.meta !== "undefined" && import.meta.env?.DEV && new URLSearchParams(window.location.search).get("fast") === "1";
const gameDuration = isFastMode ? FAST_DURATION : GAME_DURATION;

/**
 * GameShell — wraps every game with:
 * Rules modal, 3-2-1-GO countdown, 60s timer, pause, HUD, results screen.
 *
 * The game component receives: { level, onCorrect, onWrong, isActive }
 */
export default function GameShell({ game, onBack, onRecordResult }) {
  const { id, name, rules, Component, icon } = game;
  const mountedRef = useMounted();

  // Phase state
  const [phase, setPhase] = useState(
    hasSeenRules(id) ? PHASES.COUNTDOWN : PHASES.RULES
  );
  const [dontShowAgain, setDontShowAgain] = useState(hasSeenRules(id));

  // Game state
  const [gameState, setGameState] = useState(createGameState);
  const [lastFx, setLastFx] = useState(null);
  const [screenShake, setScreenShake] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [muted, setMuted] = useState(isMuted);
  const [resultRecorded, setResultRecorded] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);

  const inputLocked = useRef(false);
  const phaseRef = useRef(phase);
  const gameStateRef = useRef(gameState);

  const { particles, spawnBurst, spawnConfetti } = useParticles();

  // Sync refs
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  // ─── Countdown (uses robust hook) ──────────────────────
  const countdownActive = phase === PHASES.COUNTDOWN;
  const handleCountdownFinish = useCallback(() => {
    playGo();
    setPhase(PHASES.PLAYING);
  }, []);

  const { count: countdown, reset: resetCountdown } = useCountdown(
    3, countdownActive, handleCountdownFinish, 700
  );

  // Play tick sound on each countdown change
  useEffect(() => {
    if (countdownActive && countdown > 0) {
      playTick();
    }
  }, [countdownActive, countdown]);

  // ─── Game Timer (uses robust hook) ─────────────────────
  const timerActive = phase === PHASES.PLAYING;
  const handleTimerFinish = useCallback(() => {
    setPhase(PHASES.RESULTS);
  }, []);

  const { timeLeft, setTimeLeft, reset: resetTimer } = useGameTimer(
    gameDuration, timerActive, handleTimerFinish, 1000
  );

  // ─── Tab visibility → auto-pause ──────────────────────
  useEffect(() => {
    function handleVisibility() {
      if (document.hidden && phaseRef.current === PHASES.PLAYING) {
        setPhase(PHASES.PAUSED);
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // ─── Esc to pause ─────────────────────────────────────
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") {
        if (phaseRef.current === PHASES.PLAYING) {
          e.preventDefault();
          setPhase(PHASES.PAUSED);
        } else if (phaseRef.current === PHASES.PAUSED) {
          e.preventDefault();
          setPhase(PHASES.PLAYING);
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // ─── Record result on RESULTS phase ───────────────────
  useEffect(() => {
    if (phase !== PHASES.RESULTS || resultRecorded) return;
    setResultRecorded(true);
    playFanfare();
    const result = onRecordResult?.(gameStateRef.current);
    if (result?.isNewBest) {
      setIsNewBest(true);
      const t = setTimeout(() => {
        if (mountedRef.current) {
          playNewBest();
          spawnConfetti(window.innerWidth / 2, window.innerHeight / 2);
        }
      }, 600);
      return () => clearTimeout(t);
    }
  }, [phase, resultRecorded, onRecordResult, spawnConfetti, mountedRef]);

  // ─── Game callbacks ───────────────────────────────────
  const onCorrect = useCallback((opts = {}) => {
    if (inputLocked.current || phaseRef.current !== PHASES.PLAYING) return;
    inputLocked.current = true;
    setTimeout(() => { inputLocked.current = false; }, INPUT_LOCK_MS);

    setGameState((prev) => {
      const { state: next, fx } = processCorrect(prev, opts.bonus || 0);
      setLastFx({ ...fx, _ts: Date.now() });
      playCorrect(next.combo);
      if (fx.multUp) {
        playMultUp();
        setScreenShake(true);
        setTimeout(() => { if (mountedRef.current) setScreenShake(false); }, 200);
      }
      spawnBurst(
        window.innerWidth / 2,
        window.innerHeight / 2 - 40,
        fx.tier === "rainbow" ? "#c13cff" : fx.tier
      );
      return next;
    });
  }, [spawnBurst, mountedRef]);

  const onWrong = useCallback(() => {
    if (inputLocked.current || phaseRef.current !== PHASES.PLAYING) return;
    inputLocked.current = true;
    setTimeout(() => { inputLocked.current = false; }, INPUT_LOCK_MS);

    setGameState((prev) => {
      const { state: next, fx } = processWrong(prev);
      if (fx.comboBreak) {
        setScreenShake(true);
        setTimeout(() => { if (mountedRef.current) setScreenShake(false); }, 300);
      }
      playWrong();
      setWrongFlash(true);
      setTimeout(() => { if (mountedRef.current) setWrongFlash(false); }, 200);
      setTimeLeft((t) => Math.max(0, t - WRONG_PENALTY_SECONDS));
      return next;
    });
  }, [mountedRef, setTimeLeft]);

  const handleToggleMute = useCallback(() => {
    const m = toggleMute();
    setMuted(m);
  }, []);

  const handlePlayAgain = useCallback(() => {
    setGameState(createGameState());
    setLastFx(null);
    resetTimer(gameDuration);
    setScreenShake(false);
    setWrongFlash(false);
    setResultRecorded(false);
    setIsNewBest(false);
    resetCountdown(3);
    setPhase(PHASES.COUNTDOWN);
  }, [resetTimer, resetCountdown]);

  const handleStartFromRules = useCallback(() => {
    if (dontShowAgain) markRulesSeen(id);
    setPhase(PHASES.COUNTDOWN);
  }, [dontShowAgain, id]);

  const timerPercent = (timeLeft / gameDuration) * 100;
  const timerColor = timeLeft <= 10 ? "bg-pixel-pink" : timeLeft <= 20 ? "bg-pixel-orange" : "bg-pixel-green";
  const isActive = phase === PHASES.PLAYING;

  const gameProps = useMemo(() => ({
    level: gameState.level,
    onCorrect,
    onWrong,
    isActive,
  }), [gameState.level, onCorrect, onWrong, isActive]);

  return (
    <div className="fixed inset-0 bg-pixel-dark z-40 flex flex-col" style={{ touchAction: "manipulation" }}>
      <ParticleLayer particles={particles} />

      {/* Wrong answer flash overlay */}
      <AnimatePresence>
        {wrongFlash && (
          <motion.div
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-pixel-pink z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* ─── Rules Modal ─── */}
      <AnimatePresence>
        {phase === PHASES.RULES && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pixel-dark/90"
          >
            <PixelPanel className="max-w-sm w-full text-center">
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="font-pixel-label text-sm text-pixel-cream mb-3">{name}</h3>
              <p className="font-pixel-body text-xs text-pixel-cream/70 mb-5 leading-relaxed">{rules}</p>
              <label className="flex items-center justify-center gap-2 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="accent-pixel-magenta w-4 h-4"
                />
                <span className="font-pixel-body text-[11px] text-pixel-cream/60">Don&apos;t show again</span>
              </label>
              <div className="flex gap-3 justify-center">
                <PixelButton variant="ghost" onClick={onBack} className="text-xs">BACK</PixelButton>
                <PixelButton variant="orange" onClick={handleStartFromRules} className="text-xs">PLAY</PixelButton>
              </div>
            </PixelPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Countdown ─── */}
      <AnimatePresence>
        {phase === PHASES.COUNTDOWN && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-pixel-dark/80"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="font-pixel-label text-5xl md:text-7xl text-pixel-cream"
            >
              {countdown > 0 ? countdown : "GO!"}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Pause Overlay ─── */}
      <AnimatePresence>
        {phase === PHASES.PAUSED && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-pixel-dark/90"
          >
            <PixelPanel className="text-center max-w-xs">
              <h3 className="font-pixel-label text-lg text-pixel-cream mb-4">PAUSED</h3>
              <div className="flex flex-col gap-3">
                <PixelButton variant="orange" onClick={() => setPhase(PHASES.PLAYING)}>RESUME</PixelButton>
                <PixelButton variant="ghost" onClick={onBack}>QUIT</PixelButton>
              </div>
            </PixelPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Results Screen ─── */}
      <AnimatePresence>
        {phase === PHASES.RESULTS && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pixel-dark/95"
          >
            <PixelPanel className="max-w-sm w-full text-center">
              {isNewBest && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, -5, 5, 0] }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="font-pixel-label text-xs text-pixel-yellow bg-pixel-yellow/10 border border-pixel-yellow/30 rounded px-3 py-1.5 mb-4 inline-block"
                >
                  ⭐ NEW BEST! ⭐
                </motion.div>
              )}
              <h3 className="font-pixel-label text-sm text-pixel-cream/60 mb-2">{name}</h3>
              <motion.p
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="font-pixel-label text-3xl md:text-4xl text-pixel-cream mb-6"
              >
                {formatNumber(gameState.score)}
              </motion.p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-pixel-dark/50 border border-pixel-cream/10 rounded p-2">
                  <p className="font-pixel-label text-[8px] text-pixel-green mb-1">CORRECT</p>
                  <p className="font-pixel-label text-sm text-pixel-cream">{gameState.correctCount}</p>
                </div>
                <div className="bg-pixel-dark/50 border border-pixel-cream/10 rounded p-2">
                  <p className="font-pixel-label text-[8px] text-pixel-orange mb-1">BEST COMBO</p>
                  <p className="font-pixel-label text-sm text-pixel-cream">{gameState.bestCombo}</p>
                </div>
                <div className="bg-pixel-dark/50 border border-pixel-cream/10 rounded p-2">
                  <p className="font-pixel-label text-[8px] text-pixel-cream/50 mb-1">ACCURACY</p>
                  <p className="font-pixel-label text-sm text-pixel-cream">
                    {gameState.correctCount + gameState.wrongCount > 0
                      ? Math.round((gameState.correctCount / (gameState.correctCount + gameState.wrongCount)) * 100)
                      : 0}%
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <PixelButton variant="orange" onClick={handlePlayAgain} className="text-xs">PLAY AGAIN</PixelButton>
                <PixelButton variant="ghost" onClick={onBack} className="text-xs">BACK TO GAMES</PixelButton>
              </div>
            </PixelPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── HUD Bar ─── */}
      {(phase === PHASES.PLAYING || phase === PHASES.PAUSED) && (
        <div className="flex-shrink-0 px-3 py-2 bg-pixel-dark/80 border-b-2 border-pixel-cream/10">
          <div className="w-full h-2 bg-pixel-dark/60 rounded-sm overflow-hidden mb-2 border border-pixel-cream/10">
            <motion.div
              className={`h-full ${timerColor}`}
              animate={{ width: `${timerPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPhase(PHASES.PAUSED)}
                className="font-pixel-label text-[9px] text-pixel-cream/60 hover:text-pixel-cream border border-pixel-cream/20 rounded px-2 py-0.5 transition-colors"
                aria-label="Pause"
              >
                ⏸
              </button>
              <button
                onClick={handleToggleMute}
                className="font-pixel-label text-[9px] text-pixel-cream/60 hover:text-pixel-cream border border-pixel-cream/20 rounded px-2 py-0.5 transition-colors"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? "🔇" : "🔊"}
              </button>
              <span className="font-pixel-label text-[9px] text-pixel-cream/50">
                LVL {gameState.level}
              </span>
            </div>
            <ComboHUD gameState={gameState} lastFx={lastFx} totalScore={gameState.score} />
            <span className="font-pixel-label text-sm text-pixel-cream min-w-[40px] text-right">
              {timeLeft}s
            </span>
          </div>
        </div>
      )}

      {/* ─── Game Area ─── */}
      <motion.div
        animate={screenShake ? { x: [0, -4, 4, -3, 3, 0], y: [0, 2, -2, 1, -1, 0] } : {}}
        transition={{ duration: 0.25 }}
        className="flex-1 overflow-hidden relative"
      >
        {(phase === PHASES.PLAYING || phase === PHASES.PAUSED || phase === PHASES.RESULTS) && (
          <ErrorBoundary onBack={onBack}>
            <Component {...gameProps} />
          </ErrorBoundary>
        )}
      </motion.div>
    </div>
  );
}
