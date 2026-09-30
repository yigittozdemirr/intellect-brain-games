import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { shuffle, randInt } from "../../lib/helpers";

function generateNumbers(level) {
  const count = Math.min(4 + level * 2, 20);
  const nums = [];
  for (let i = 1; i <= count; i++) {
    nums.push({
      value: i,
      x: randInt(5, 85),
      y: randInt(8, 80),
    });
  }
  return shuffle(nums);
}

export default function NumberRush({ level, onCorrect, onWrong, isActive }) {
  const [numbers, setNumbers] = useState(() => generateNumbers(level));
  const [nextExpected, setNextExpected] = useState(1);
  const [tapped, setTapped] = useState(new Set());
  const levelRef = useRef(level);

  useEffect(() => { levelRef.current = level; }, [level]);

  const startNewRound = useCallback(() => {
    setNumbers(generateNumbers(levelRef.current));
    setNextExpected(1);
    setTapped(new Set());
  }, []);

  const handleTap = useCallback((value) => {
    if (!isActive) return;
    if (value === nextExpected) {
      onCorrect();
      setTapped((prev) => new Set([...prev, value]));
      const newNext = nextExpected + 1;
      if (newNext > numbers.length) {
        // All numbers tapped — new round
        setTimeout(startNewRound, 400);
      } else {
        setNextExpected(newNext);
      }
    } else {
      onWrong();
    }
  }, [isActive, nextExpected, numbers.length, onCorrect, onWrong, startNewRound]);

  return (
    <div className="relative w-full h-full" style={{ touchAction: "manipulation" }}>
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <span className="font-pixel-label text-[9px] text-pixel-cream/50">NEXT:</span>
        <span className="font-pixel-label text-sm text-pixel-orange">{nextExpected}</span>
      </div>
      {numbers.map((num) => (
        <motion.button
          key={num.value}
          onClick={() => handleTap(num.value)}
          whileTap={{ scale: 0.85 }}
          animate={{
            scale: tapped.has(num.value) ? 0 : 1,
            opacity: tapped.has(num.value) ? 0 : 1,
          }}
          className={`
            absolute w-10 h-10 md:w-12 md:h-12 rounded-[4px] border-[2px] flex items-center justify-center
            font-pixel-label text-sm select-none transition-colors
            ${num.value === nextExpected
              ? "border-pixel-orange/60 bg-pixel-orange/20 text-pixel-orange"
              : "border-pixel-cream/20 bg-pixel-purple/60 text-pixel-cream hover:border-pixel-cream/40"
            }
          `}
          style={{
            left: `${num.x}%`,
            top: `${num.y}%`,
            touchAction: "manipulation",
          }}
          disabled={!isActive || tapped.has(num.value)}
        >
          {num.value}
        </motion.button>
      ))}
    </div>
  );
}
