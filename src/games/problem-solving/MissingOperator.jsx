import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { shuffle, randInt } from "../../lib/helpers";

function generatePuzzle(level) {
  const ops = [
    { symbol: "+", fn: (a, b) => a + b },
    { symbol: "-", fn: (a, b) => a - b },
    { symbol: "×", fn: (a, b) => a * b },
  ];

  // Pick the correct operator
  const correctIdx = randInt(0, ops.length - 1);
  const correct = ops[correctIdx];
  const maxNum = Math.min(5 + level * 2, 20);

  let a, b, result;
  if (correct.symbol === "×") {
    a = randInt(1, Math.min(maxNum, 12));
    b = randInt(1, Math.min(maxNum, 12));
  } else if (correct.symbol === "-") {
    a = randInt(2, maxNum);
    b = randInt(1, a);
  } else {
    a = randInt(1, maxNum);
    b = randInt(1, maxNum);
  }
  result = correct.fn(a, b);

  // Only offer operators that DON'T also produce the same result
  const validOptions = ops.filter((op) => {
    if (op.symbol === correct.symbol) return true;
    return op.fn(a, b) !== result;
  });

  // If ambiguous (multiple operators give same result), regenerate
  if (validOptions.length < 3) {
    return generatePuzzle(level);
  }

  return {
    a,
    b,
    result,
    correctSymbol: correct.symbol,
    options: shuffle(ops.map((o) => o.symbol)),
  };
}

export default function MissingOperator({ level, onCorrect, onWrong, isActive }) {
  const [puzzle, setPuzzle] = useState(() => generatePuzzle(level));
  const [answered, setAnswered] = useState(false);
  const mountedRef = useRef(true);
  const levelRef = useRef(level);

  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const handleAnswer = useCallback((op) => {
    if (!isActive || answered) return;
    setAnswered(true);

    if (op === puzzle.correctSymbol) {
      onCorrect();
    } else {
      onWrong();
    }

    setTimeout(() => {
      if (mountedRef.current) {
        setPuzzle(generatePuzzle(levelRef.current));
        setAnswered(false);
      }
    }, 350);
  }, [isActive, answered, puzzle.correctSymbol, onCorrect, onWrong]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 gap-6">
      <p className="font-pixel-label text-[9px] text-pixel-cream/50">FILL IN THE OPERATOR</p>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${puzzle.a}-${puzzle.b}-${puzzle.result}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="flex items-center gap-3 font-pixel-label text-2xl md:text-4xl text-pixel-cream"
        >
          <span>{puzzle.a}</span>
          <span className="w-12 h-12 md:w-14 md:h-14 border-[2px] border-pixel-cream/30 border-dashed rounded-[4px] flex items-center justify-center text-pixel-cream/30">?</span>
          <span>{puzzle.b}</span>
          <span className="text-pixel-cream/50">=</span>
          <span className="text-pixel-green">{puzzle.result}</span>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-4">
        {puzzle.options.map((op) => (
          <motion.button
            key={op}
            onClick={() => handleAnswer(op)}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 md:w-16 md:h-16 font-pixel-label text-xl bg-pixel-purple/60 text-pixel-cream border-[3px] border-pixel-cream/20 rounded-[4px] shadow-[3px_3px_0px_0px_#1a1030] hover:border-pixel-cream/40 active:shadow-none active:translate-x-[3px] active:translate-y-[3px] select-none"
            disabled={!isActive || answered}
            style={{ touchAction: "manipulation" }}
          >
            {op}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
