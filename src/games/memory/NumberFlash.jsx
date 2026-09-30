import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { randInt } from "../../lib/helpers";

function getDigitCount(level) {
  return Math.min(2 + level, 9);
}

function generateNumber(digits) {
  let n = "";
  n += randInt(1, 9).toString();
  for (let i = 1; i < digits; i++) {
    n += randInt(0, 9).toString();
  }
  return n;
}

export default function NumberFlash({ level, onCorrect, onWrong, isActive }) {
  const [phase, setPhase] = useState("flash"); // flash | input | feedback
  const [number, setNumber] = useState(() => generateNumber(getDigitCount(level)));
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null);
  const inputRef = useRef(null);
  const mountedRef = useRef(true);
  const levelRef = useRef(level);

  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  // Flash the number then hide it
  useEffect(() => {
    if (phase !== "flash" || !isActive) return;
    const showTime = Math.max(400, 1500 - level * 100);
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        setPhase("input");
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    }, showTime);
    return () => clearTimeout(timer);
  }, [phase, isActive, level, number]);

  const startNewRound = useCallback(() => {
    const n = generateNumber(getDigitCount(levelRef.current));
    setNumber(n);
    setInput("");
    setFeedback(null);
    setPhase("flash");
  }, []);

  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    if (!isActive || phase !== "input") return;
    if (input.trim() === number) {
      onCorrect();
      setFeedback("correct");
    } else {
      onWrong();
      setFeedback("wrong");
    }
    setTimeout(() => {
      if (mountedRef.current) startNewRound();
    }, 500);
  }, [isActive, phase, input, number, onCorrect, onWrong, startNewRound]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 gap-6">
      <AnimatePresence mode="wait">
        {phase === "flash" && (
          <motion.div
            key="flash"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="font-pixel-label text-3xl md:text-5xl text-pixel-yellow tracking-[0.2em]"
          >
            {number}
          </motion.div>
        )}

        {phase === "input" && (
          <motion.form
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-4 w-full max-w-xs"
          >
            <p className="font-pixel-label text-[10px] text-pixel-cream/60">TYPE THE NUMBER</p>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={input}
              onChange={(e) => setInput(e.target.value.replace(/\D/g, ""))}
              className="w-full text-center font-pixel-label text-2xl bg-pixel-dark/80 text-pixel-cream border-[3px] border-pixel-cream/30 rounded-[4px] px-4 py-3 focus:border-pixel-magenta focus:outline-none"
              autoComplete="off"
              style={{ touchAction: "manipulation" }}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="font-pixel-body text-sm bg-pixel-orange text-pixel-dark border-[3px] border-pixel-dark rounded-[4px] px-6 py-2 shadow-[3px_3px_0px_0px_#1a1030] hover:bg-pixel-yellow active:shadow-none active:translate-x-[3px] active:translate-y-[3px] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              SUBMIT
            </button>
          </motion.form>
        )}

        {feedback && (
          <motion.div
            key="feedback"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className={`font-pixel-label text-sm ${feedback === "correct" ? "text-pixel-green" : "text-pixel-pink"}`}
          >
            {feedback === "correct" ? "✓ CORRECT!" : `✗ It was ${number}`}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
