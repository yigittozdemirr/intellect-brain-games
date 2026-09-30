import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { shuffle, randInt } from "../../lib/helpers";

function generateSequence(level) {
  const patternTypes = [
    // Arithmetic: a, a+d, a+2d, ...
    () => {
      const a = randInt(1, 10 + level * 2);
      const d = randInt(1, 3 + level);
      const seq = [];
      for (let i = 0; i < 4; i++) seq.push(a + d * i);
      return { seq, answer: a + d * 4 };
    },
    // Multiply: a, a*r, a*r^2, ...
    () => {
      const a = randInt(1, 5);
      const r = randInt(2, 3);
      const seq = [];
      for (let i = 0; i < 4; i++) seq.push(a * Math.pow(r, i));
      return { seq, answer: a * Math.pow(r, 4) };
    },
    // Add increasing: a, a+1, a+1+2, a+1+2+3, ...
    () => {
      const a = randInt(1, 5);
      let val = a;
      const seq = [val];
      for (let i = 1; i < 4; i++) {
        val += i + (level > 3 ? 1 : 0);
        seq.push(val);
      }
      const nextInc = 4 + (level > 3 ? 1 : 0);
      return { seq, answer: val + nextInc };
    },
    // Fibonacci-like: a, b, a+b, ...
    () => {
      const a = randInt(1, 5);
      const b = randInt(1, 5);
      const seq = [a, b, a + b, b + a + b];
      return { seq, answer: a + b + b + a + b };
    },
  ];

  const pattern = patternTypes[randInt(0, Math.min(patternTypes.length - 1, level))]();

  // Generate wrong options that are close
  const wrongSet = new Set();
  while (wrongSet.size < 3) {
    const w = pattern.answer + randInt(-5, 5);
    if (w !== pattern.answer && w > 0) wrongSet.add(w);
  }

  const options = shuffle([pattern.answer, ...wrongSet]);

  return { sequence: pattern.seq, answer: pattern.answer, options };
}

export default function NumberSequence({ level, onCorrect, onWrong, isActive }) {
  const [puzzle, setPuzzle] = useState(() => generateSequence(level));
  const [answered, setAnswered] = useState(false);
  const mountedRef = useRef(true);
  const levelRef = useRef(level);

  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const handleAnswer = useCallback((val) => {
    if (!isActive || answered) return;
    setAnswered(true);

    if (val === puzzle.answer) {
      onCorrect();
    } else {
      onWrong();
    }

    setTimeout(() => {
      if (mountedRef.current) {
        setPuzzle(generateSequence(levelRef.current));
        setAnswered(false);
      }
    }, 400);
  }, [isActive, answered, puzzle.answer, onCorrect, onWrong]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 gap-5">
      <p className="font-pixel-label text-[9px] text-pixel-cream/50">WHAT COMES NEXT?</p>

      <div className="flex items-center gap-2 md:gap-3">
        {puzzle.sequence.map((n, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="w-12 h-12 md:w-14 md:h-14 bg-pixel-green/15 border-[2px] border-pixel-green/30 rounded-[4px] flex items-center justify-center font-pixel-label text-sm md:text-base text-pixel-cream"
          >
            {n}
          </motion.div>
        ))}
        <div className="w-12 h-12 md:w-14 md:h-14 border-[2px] border-pixel-cream/20 border-dashed rounded-[4px] flex items-center justify-center font-pixel-label text-lg text-pixel-cream/30">
          ?
        </div>
      </div>

      <div className="flex gap-3 flex-wrap justify-center">
        {puzzle.options.map((opt) => (
          <motion.button
            key={opt}
            onClick={() => handleAnswer(opt)}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 md:w-16 md:h-16 font-pixel-label text-sm bg-pixel-purple/60 text-pixel-cream border-[3px] border-pixel-cream/20 rounded-[4px] shadow-[3px_3px_0px_0px_#1a1030] hover:border-pixel-cream/40 active:shadow-none active:translate-x-[3px] active:translate-y-[3px] select-none"
            disabled={!isActive || answered}
            style={{ touchAction: "manipulation" }}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
