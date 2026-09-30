import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { shuffle, pick, randInt } from "../../lib/helpers";

/**
 * ArrowStorm — five arrows in a row; player presses the direction of the CENTER arrow.
 * Flanker arrows may point differently. Conflicting flankers grow with level.
 */

const DIRS = [
  { name: "LEFT",  arrow: "←", key: "ArrowLeft" },
  { name: "RIGHT", arrow: "→", key: "ArrowRight" },
  { name: "UP",    arrow: "↑", key: "ArrowUp" },
  { name: "DOWN",  arrow: "↓", key: "ArrowDown" },
];

function generateRound(level) {
  const center = pick(DIRS);
  // Chance of conflicting flankers increases with level
  const conflictChance = Math.min(0.3 + level * 0.08, 0.85);

  const arrows = [];
  for (let i = 0; i < 5; i++) {
    if (i === 2) {
      arrows.push(center);
    } else {
      if (Math.random() < conflictChance) {
        // Pick a different direction
        const others = DIRS.filter((d) => d.name !== center.name);
        arrows.push(pick(others));
      } else {
        arrows.push(center);
      }
    }
  }

  return { arrows, correct: center };
}

export default function ArrowStorm({ level, onCorrect, onWrong, isActive }) {
  const [round, setRound] = useState(() => generateRound(level));
  const [answered, setAnswered] = useState(false);
  const mountedRef = useRef(true);
  const levelRef = useRef(level);

  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const handleAnswer = useCallback((dirName) => {
    if (!isActive || answered) return;
    setAnswered(true);

    if (dirName === round.correct.name) {
      onCorrect();
    } else {
      onWrong();
    }

    setTimeout(() => {
      if (mountedRef.current) {
        setRound(generateRound(levelRef.current));
        setAnswered(false);
      }
    }, 250);
  }, [isActive, answered, round.correct.name, onCorrect, onWrong]);

  // Keyboard support
  useEffect(() => {
    function handleKey(e) {
      if (!isActive || answered) return;
      const d = DIRS.find((d) => d.key === e.key);
      if (d) {
        e.preventDefault();
        handleAnswer(d.name);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isActive, answered, handleAnswer]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 gap-6">
      <p className="font-pixel-label text-[9px] text-pixel-cream/50">PRESS THE CENTER ARROW</p>

      {/* Arrow row */}
      <AnimatePresence mode="wait">
        <motion.div
          key={round.arrows.map((a) => a.name).join("-") + Date.now()}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-2 md:gap-3"
        >
          {round.arrows.map((a, i) => (
            <span
              key={i}
              className={`font-pixel-label text-3xl md:text-5xl select-none ${
                i === 2 ? "text-pixel-orange" : "text-pixel-cream/50"
              }`}
            >
              {a.arrow}
            </span>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Direction buttons */}
      <div className="grid grid-cols-3 gap-2 w-[180px]">
        <div />
        <motion.button
          onClick={() => handleAnswer("UP")}
          whileTap={{ scale: 0.85 }}
          className="aspect-square rounded-[4px] border-[2px] border-pixel-cream/20 bg-pixel-purple/60 flex items-center justify-center text-xl text-pixel-cream hover:border-pixel-cream/40 select-none min-h-[48px]"
          disabled={!isActive || answered}
          style={{ touchAction: "manipulation" }}
        >↑</motion.button>
        <div />
        <motion.button
          onClick={() => handleAnswer("LEFT")}
          whileTap={{ scale: 0.85 }}
          className="aspect-square rounded-[4px] border-[2px] border-pixel-cream/20 bg-pixel-purple/60 flex items-center justify-center text-xl text-pixel-cream hover:border-pixel-cream/40 select-none min-h-[48px]"
          disabled={!isActive || answered}
          style={{ touchAction: "manipulation" }}
        >←</motion.button>
        <motion.button
          onClick={() => handleAnswer("DOWN")}
          whileTap={{ scale: 0.85 }}
          className="aspect-square rounded-[4px] border-[2px] border-pixel-cream/20 bg-pixel-purple/60 flex items-center justify-center text-xl text-pixel-cream hover:border-pixel-cream/40 select-none min-h-[48px]"
          disabled={!isActive || answered}
          style={{ touchAction: "manipulation" }}
        >↓</motion.button>
        <motion.button
          onClick={() => handleAnswer("RIGHT")}
          whileTap={{ scale: 0.85 }}
          className="aspect-square rounded-[4px] border-[2px] border-pixel-cream/20 bg-pixel-purple/60 flex items-center justify-center text-xl text-pixel-cream hover:border-pixel-cream/40 select-none min-h-[48px]"
          disabled={!isActive || answered}
          style={{ touchAction: "manipulation" }}
        >→</motion.button>
      </div>
    </div>
  );
}
