import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { randInt } from "../../lib/helpers";

function getLength(level) {
  return Math.min(3 + level, 9);
}

function generateSequence(length) {
  return Array.from({ length }, () => randInt(0, 9));
}

export default function ReverseRecall({ level, onCorrect, onWrong, isActive }) {
  const [phase, setPhase] = useState("show"); // show | input
  const [sequence, setSequence] = useState(() => generateSequence(getLength(level)));
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const mountedRef = useRef(true);
  const levelRef = useRef(level);

  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  useEffect(() => {
    if (phase !== "show" || !isActive) return;
    const showTime = Math.max(800, 2000 - level * 100) + sequence.length * 200;
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        setPhase("input");
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    }, showTime);
    return () => clearTimeout(timer);
  }, [phase, isActive, level, sequence]);

  const startNewRound = useCallback(() => {
    const seq = generateSequence(getLength(levelRef.current));
    setSequence(seq);
    setInput("");
    setPhase("show");
  }, []);

  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    if (!isActive || phase !== "input") return;
    const reversed = [...sequence].reverse().join("");
    if (input.trim() === reversed) {
      onCorrect();
    } else {
      onWrong();
    }
    setTimeout(() => {
      if (mountedRef.current) startNewRound();
    }, 400);
  }, [isActive, phase, input, sequence, onCorrect, onWrong, startNewRound]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 gap-5">
      <AnimatePresence mode="wait">
        {phase === "show" && (
          <motion.div
            key="show"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <p className="font-pixel-label text-[9px] text-pixel-cream/50">MEMORIZE THIS</p>
            <div className="flex gap-2">
              {sequence.map((d, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.15 }}
                  className="w-10 h-12 md:w-12 md:h-14 bg-pixel-magenta/20 border-[2px] border-pixel-magenta/40 rounded-[4px] flex items-center justify-center font-pixel-label text-lg text-pixel-cream"
                >
                  {d}
                </motion.div>
              ))}
            </div>
            <p className="font-pixel-label text-[8px] text-pixel-pink mt-2">ENTER IN REVERSE ←</p>
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
            <p className="font-pixel-label text-[10px] text-pixel-cream/60">
              TYPE BACKWARDS ({sequence.length} digits)
            </p>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={input}
              onChange={(e) => setInput(e.target.value.replace(/\D/g, "").slice(0, sequence.length))}
              maxLength={sequence.length}
              className="w-full text-center font-pixel-label text-2xl bg-pixel-dark/80 text-pixel-cream border-[3px] border-pixel-cream/30 rounded-[4px] px-4 py-3 focus:border-pixel-magenta focus:outline-none tracking-[0.3em]"
              autoComplete="off"
              style={{ touchAction: "manipulation" }}
            />
            <button
              type="submit"
              disabled={input.length !== sequence.length}
              className="font-pixel-body text-sm bg-pixel-orange text-pixel-dark border-[3px] border-pixel-dark rounded-[4px] px-6 py-2 shadow-[3px_3px_0px_0px_#1a1030] hover:bg-pixel-yellow active:shadow-none active:translate-x-[3px] active:translate-y-[3px] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              SUBMIT
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
