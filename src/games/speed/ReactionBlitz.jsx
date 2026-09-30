import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { randInt } from "../../lib/helpers";

/**
 * ReactionBlitz — panel shows WAIT (red); after random delay turns green (GO).
 * Tapping after green = correct with speed bonus. Tapping early = wrong.
 * Shows reaction time in ms.
 */

export default function ReactionBlitz({ level, onCorrect, onWrong, isActive }) {
  const [phase, setPhase] = useState("waiting"); // "waiting" | "ready" | "result"
  const [reactionMs, setReactionMs] = useState(null);
  const [lastResult, setLastResult] = useState(null); // "correct" | "early"
  const goTimeRef = useRef(null);
  const delayTimerRef = useRef(null);
  const mountedRef = useRef(true);
  const resolvedRef = useRef(false);

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const startRound = useCallback(() => {
    if (!mountedRef.current) return;
    resolvedRef.current = false;
    setPhase("waiting");
    setReactionMs(null);
    setLastResult(null);

    const delay = randInt(800, 3000);
    delayTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      goTimeRef.current = performance.now();
      setPhase("ready");
    }, delay);
  }, []);

  // Start first round
  useEffect(() => {
    if (!isActive) return;
    startRound();
    return () => clearTimeout(delayTimerRef.current);
  }, [isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTap = useCallback(() => {
    if (!isActive || resolvedRef.current) return;

    if (phase === "waiting") {
      // Tapped too early!
      resolvedRef.current = true;
      clearTimeout(delayTimerRef.current);
      setLastResult("early");
      setPhase("result");
      onWrong();
      setTimeout(() => { if (mountedRef.current) startRound(); }, 1200);
    } else if (phase === "ready") {
      // Good tap!
      resolvedRef.current = true;
      const ms = Math.round(performance.now() - goTimeRef.current);
      setReactionMs(ms);
      setLastResult("correct");
      setPhase("result");
      // Speed bonus: faster reaction = more bonus (max 200 bonus for <150ms)
      const bonus = Math.max(0, Math.round(200 * (1 - Math.min(ms, 600) / 600)));
      onCorrect({ bonus });
      setTimeout(() => { if (mountedRef.current) startRound(); }, 1200);
    }
  }, [isActive, phase, onCorrect, onWrong, startRound]);

  // Keyboard support
  useEffect(() => {
    function handleKey(e) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleTap();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleTap]);

  const bgColor = phase === "waiting"
    ? "bg-pixel-pink/20 border-pixel-pink/40"
    : phase === "ready"
      ? "bg-pixel-green/20 border-pixel-green/40"
      : lastResult === "correct"
        ? "bg-pixel-green/10 border-pixel-green/30"
        : "bg-pixel-pink/10 border-pixel-pink/30";

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 gap-6">
      <div
        className={`w-64 h-48 md:w-80 md:h-56 rounded-[8px] border-[3px] ${bgColor} flex flex-col items-center justify-center cursor-pointer select-none transition-colors duration-100`}
        onClick={handleTap}
        style={{ touchAction: "manipulation" }}
      >
        <AnimatePresence mode="wait">
          {phase === "waiting" && (
            <motion.div
              key="wait"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <p className="font-pixel-label text-lg text-pixel-pink">WAIT...</p>
              <p className="font-pixel-label text-[7px] text-pixel-cream/30 mt-2">DON'T TAP YET</p>
            </motion.div>
          )}
          {phase === "ready" && (
            <motion.div
              key="go"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <p className="font-pixel-label text-2xl text-pixel-green">GO!</p>
              <p className="font-pixel-label text-[7px] text-pixel-cream/30 mt-2">TAP NOW!</p>
            </motion.div>
          )}
          {phase === "result" && (
            <motion.div
              key="result"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              {lastResult === "correct" ? (
                <>
                  <p className="font-pixel-label text-sm text-pixel-green mb-2">NICE!</p>
                  <p className="font-pixel-label text-2xl text-pixel-cream">{reactionMs}ms</p>
                  <p className="font-pixel-label text-[7px] text-pixel-cream/40 mt-1">
                    {reactionMs < 200 ? "LIGHTNING FAST!" : reactionMs < 350 ? "GREAT REFLEXES!" : "GOOD!"}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-pixel-label text-sm text-pixel-pink mb-2">TOO EARLY!</p>
                  <p className="font-pixel-label text-[8px] text-pixel-cream/40">WAIT FOR GREEN</p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="font-pixel-label text-[7px] text-pixel-cream/25">
        TAP / PRESS SPACE
      </p>
    </div>
  );
}
