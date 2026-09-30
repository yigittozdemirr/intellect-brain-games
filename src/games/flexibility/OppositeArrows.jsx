import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pick } from "../../lib/helpers";

const DIRECTIONS = [
  { name: "UP", arrow: "↑", key: "ArrowUp", opposite: "DOWN" },
  { name: "DOWN", arrow: "↓", key: "ArrowDown", opposite: "UP" },
  { name: "LEFT", arrow: "←", key: "ArrowLeft", opposite: "RIGHT" },
  { name: "RIGHT", arrow: "→", key: "ArrowRight", opposite: "LEFT" },
];

export default function OppositeArrows({ level, onCorrect, onWrong, isActive }) {
  const [mode, setMode] = useState("SAME"); // SAME or OPPOSITE
  const [dir, setDir] = useState(() => pick(DIRECTIONS));
  const [roundNum, setRoundNum] = useState(0);
  const [answered, setAnswered] = useState(false);
  const mountedRef = useRef(true);
  const switchEvery = Math.max(2, 5 - Math.floor(level / 2));

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const getCorrectAnswer = useCallback(() => {
    if (mode === "SAME") return dir.name;
    return dir.opposite;
  }, [mode, dir]);

  const handleAnswer = useCallback((dirName) => {
    if (!isActive || answered) return;
    setAnswered(true);

    if (dirName === getCorrectAnswer()) {
      onCorrect();
    } else {
      onWrong();
    }

    setTimeout(() => {
      if (!mountedRef.current) return;
      const newRoundNum = roundNum + 1;
      const newMode = newRoundNum % switchEvery === 0 ? (mode === "SAME" ? "OPPOSITE" : "SAME") : mode;
      setMode(newMode);
      setDir(pick(DIRECTIONS));
      setRoundNum(newRoundNum);
      setAnswered(false);
    }, 250);
  }, [isActive, answered, getCorrectAnswer, roundNum, switchEvery, mode, onCorrect, onWrong]);

  // Keyboard support
  useEffect(() => {
    function handleKey(e) {
      if (!isActive || answered) return;
      const d = DIRECTIONS.find((d) => d.key === e.key);
      if (d) {
        e.preventDefault();
        handleAnswer(d.name);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isActive, answered, handleAnswer]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 gap-5">
      {/* Mode banner */}
      <motion.div
        key={mode}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className={`font-pixel-label text-xs px-4 py-2 rounded-[4px] border-[2px] ${
          mode === "SAME"
            ? "bg-pixel-green/20 border-pixel-green/40 text-pixel-green"
            : "bg-pixel-pink/20 border-pixel-pink/40 text-pixel-pink"
        }`}
      >
        PRESS: {mode}
      </motion.div>

      {/* Arrow */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${dir.name}-${roundNum}`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="font-pixel-label text-7xl md:text-9xl text-pixel-cream select-none"
        >
          {dir.arrow}
        </motion.div>
      </AnimatePresence>

      {/* Direction buttons */}
      <div className="grid grid-cols-3 gap-2 w-[180px]">
        <div />
        <motion.button
          onClick={() => handleAnswer("UP")}
          whileTap={{ scale: 0.85 }}
          className="aspect-square rounded-[4px] border-[2px] border-pixel-cream/20 bg-pixel-purple/60 flex items-center justify-center text-xl text-pixel-cream hover:border-pixel-cream/40 select-none"
          disabled={!isActive || answered}
          style={{ touchAction: "manipulation" }}
        >↑</motion.button>
        <div />
        <motion.button
          onClick={() => handleAnswer("LEFT")}
          whileTap={{ scale: 0.85 }}
          className="aspect-square rounded-[4px] border-[2px] border-pixel-cream/20 bg-pixel-purple/60 flex items-center justify-center text-xl text-pixel-cream hover:border-pixel-cream/40 select-none"
          disabled={!isActive || answered}
          style={{ touchAction: "manipulation" }}
        >←</motion.button>
        <motion.button
          onClick={() => handleAnswer("DOWN")}
          whileTap={{ scale: 0.85 }}
          className="aspect-square rounded-[4px] border-[2px] border-pixel-cream/20 bg-pixel-purple/60 flex items-center justify-center text-xl text-pixel-cream hover:border-pixel-cream/40 select-none"
          disabled={!isActive || answered}
          style={{ touchAction: "manipulation" }}
        >↓</motion.button>
        <motion.button
          onClick={() => handleAnswer("RIGHT")}
          whileTap={{ scale: 0.85 }}
          className="aspect-square rounded-[4px] border-[2px] border-pixel-cream/20 bg-pixel-purple/60 flex items-center justify-center text-xl text-pixel-cream hover:border-pixel-cream/40 select-none"
          disabled={!isActive || answered}
          style={{ touchAction: "manipulation" }}
        >→</motion.button>
      </div>
    </div>
  );
}
