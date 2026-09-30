import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { randInt } from "../../lib/helpers";

function generateEquation(level) {
  const ops = ["+", "-", "×"];
  const op = ops[randInt(0, ops.length - 1)];
  const maxNum = Math.min(5 + level * 3, 50);

  let a, b, correctResult;
  if (op === "+") {
    a = randInt(1, maxNum);
    b = randInt(1, maxNum);
    correctResult = a + b;
  } else if (op === "-") {
    a = randInt(1, maxNum);
    b = randInt(1, a); // ensure non-negative
    correctResult = a - b;
  } else {
    a = randInt(1, Math.min(maxNum, 12));
    b = randInt(1, Math.min(maxNum, 12));
    correctResult = a * b;
  }

  // 50% chance to show correct, 50% chance to show wrong
  const isTrue = Math.random() > 0.5;
  let displayResult;
  if (isTrue) {
    displayResult = correctResult;
  } else {
    // Create a wrong answer that's close but different
    const offset = randInt(1, Math.max(1, Math.floor(correctResult * 0.3) + 1));
    displayResult = Math.random() > 0.5 ? correctResult + offset : Math.max(0, correctResult - offset);
    if (displayResult === correctResult) displayResult = correctResult + 1;
  }

  return {
    text: `${a} ${op} ${b} = ${displayResult}`,
    isTrue,
  };
}

export default function QuickMath({ level, onCorrect, onWrong, isActive }) {
  const [equation, setEquation] = useState(() => generateEquation(level));
  const [answered, setAnswered] = useState(false);
  const mountedRef = useRef(true);
  const levelRef = useRef(level);

  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const handleAnswer = useCallback((answer) => {
    if (!isActive || answered) return;
    setAnswered(true);
    const correct = (answer === "true") === equation.isTrue;
    if (correct) {
      onCorrect();
    } else {
      onWrong();
    }
    setTimeout(() => {
      if (mountedRef.current) {
        setEquation(generateEquation(levelRef.current));
        setAnswered(false);
      }
    }, 250);
  }, [isActive, answered, equation, onCorrect, onWrong]);

  // Keyboard support
  useEffect(() => {
    function handleKey(e) {
      if (!isActive || answered) return;
      if (e.key === "ArrowLeft" || e.key === "t" || e.key === "T") handleAnswer("true");
      if (e.key === "ArrowRight" || e.key === "f" || e.key === "F") handleAnswer("false");
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isActive, answered, handleAnswer]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 gap-8">
      <p className="font-pixel-label text-[9px] text-pixel-cream/50">TRUE OR FALSE?</p>

      <AnimatePresence mode="wait">
        <motion.div
          key={equation.text}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="font-pixel-label text-2xl md:text-4xl text-pixel-cream tracking-wider"
        >
          {equation.text}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-4">
        <motion.button
          onClick={() => handleAnswer("true")}
          whileTap={{ scale: 0.9 }}
          className="font-pixel-label text-sm bg-pixel-green/20 text-pixel-green border-[3px] border-pixel-green/40 rounded-[4px] px-8 py-3 shadow-[3px_3px_0px_0px_#1a1030] hover:bg-pixel-green/30 active:shadow-none active:translate-x-[3px] active:translate-y-[3px] select-none min-w-[90px]"
          disabled={!isActive || answered}
          style={{ touchAction: "manipulation" }}
        >
          TRUE
        </motion.button>
        <motion.button
          onClick={() => handleAnswer("false")}
          whileTap={{ scale: 0.9 }}
          className="font-pixel-label text-sm bg-pixel-pink/20 text-pixel-pink border-[3px] border-pixel-pink/40 rounded-[4px] px-8 py-3 shadow-[3px_3px_0px_0px_#1a1030] hover:bg-pixel-pink/30 active:shadow-none active:translate-x-[3px] active:translate-y-[3px] select-none min-w-[90px]"
          disabled={!isActive || answered}
          style={{ touchAction: "manipulation" }}
        >
          FALSE
        </motion.button>
      </div>
    </div>
  );
}
