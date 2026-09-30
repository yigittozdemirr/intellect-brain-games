import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { randInt } from "../../lib/helpers";

/**
 * StopOrGo — GREEN = tap before it disappears; RED = do NOT tap.
 * Tapping green in time = correct. Tapping red = wrong.
 * Missing a green = wrong. Correctly ignoring red = correct.
 * Each signal resolves exactly once. Window shrinks with level.
 */

export default function StopOrGo({ level, onCorrect, onWrong, isActive }) {
  const [signal, setSignal] = useState(null); // { type: "green"|"red", id }
  const [reacted, setReacted] = useState(false);
  const [feedback, setFeedback] = useState(null); // "correct" | "wrong" | null
  const signalTimerRef = useRef(null);
  const delayTimerRef = useRef(null);
  const mountedRef = useRef(true);
  const levelRef = useRef(level);
  const resolvedRef = useRef(false);

  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const signalDuration = Math.max(600, 1800 - level * 100);

  const showFeedback = useCallback((type) => {
    setFeedback(type);
    setTimeout(() => {
      if (mountedRef.current) setFeedback(null);
    }, 300);
  }, []);

  const spawnSignal = useCallback(() => {
    if (!mountedRef.current) return;
    resolvedRef.current = false;
    setReacted(false);

    const delay = randInt(500, 1500);
    delayTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      const type = Math.random() > 0.35 ? "green" : "red";
      const id = Date.now();
      setSignal({ type, id });

      // Auto-resolve after duration
      signalTimerRef.current = setTimeout(() => {
        if (!mountedRef.current || resolvedRef.current) return;
        resolvedRef.current = true;

        if (type === "green") {
          // Missed a green = wrong
          onWrong();
          showFeedback("wrong");
        } else {
          // Correctly ignored red = correct
          onCorrect();
          showFeedback("correct");
        }
        setSignal(null);
        spawnSignal();
      }, signalDuration);
    }, delay);
  }, [signalDuration, onCorrect, onWrong, showFeedback]);

  // Start on active
  useEffect(() => {
    if (!isActive) return;
    spawnSignal();
    return () => {
      clearTimeout(signalTimerRef.current);
      clearTimeout(delayTimerRef.current);
    };
  }, [isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTap = useCallback(() => {
    if (!isActive || !signal || resolvedRef.current) return;
    resolvedRef.current = true;
    setReacted(true);
    clearTimeout(signalTimerRef.current);

    if (signal.type === "green") {
      onCorrect();
      showFeedback("correct");
    } else {
      onWrong();
      showFeedback("wrong");
    }

    setTimeout(() => {
      if (mountedRef.current) {
        setSignal(null);
        spawnSignal();
      }
    }, 350);
  }, [isActive, signal, onCorrect, onWrong, showFeedback, spawnSignal]);

  // Keyboard support (space or enter to tap)
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

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 gap-6">
      <p className="font-pixel-label text-[9px] text-pixel-cream/50">
        TAP 🟢 GREEN — IGNORE 🔴 RED
      </p>

      {/* Signal area */}
      <div
        className="relative w-48 h-48 md:w-56 md:h-56 rounded-[8px] border-[3px] border-pixel-cream/15 bg-pixel-dark/60 flex items-center justify-center cursor-pointer select-none"
        onClick={handleTap}
        style={{ touchAction: "manipulation" }}
      >
        <AnimatePresence mode="wait">
          {signal ? (
            <motion.div
              key={signal.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.15 }}
              className="w-28 h-28 md:w-32 md:h-32 rounded-full"
              style={{
                backgroundColor: signal.type === "green" ? "#4cd964" : "#ff5c8a",
                boxShadow: `0 0 30px ${signal.type === "green" ? "#4cd96480" : "#ff5c8a80"}, 0 0 60px ${signal.type === "green" ? "#4cd96440" : "#ff5c8a40"}`,
              }}
            />
          ) : (
            <motion.p
              key="wait"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-pixel-label text-xs text-pixel-cream/30"
            >
              WAIT...
            </motion.p>
          )}
        </AnimatePresence>

        {/* Feedback overlay */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0.5, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 rounded-[8px] flex items-center justify-center ${
                feedback === "correct" ? "bg-pixel-green/20" : "bg-pixel-pink/20"
              }`}
            >
              <span className={`font-pixel-label text-lg ${
                feedback === "correct" ? "text-pixel-green" : "text-pixel-pink"
              }`}>
                {feedback === "correct" ? "✓" : "✗"}
              </span>
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
