import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { shuffle, randInt } from "../../lib/helpers";

/**
 * SumTarget — a target number and 6-8 numbers are shown. Player taps numbers to
 * select/deselect. Selected sum equals target = correct. Exceeding target = wrong
 * and selection resets. Target is always reachable (generated from a random subset).
 */

function generateRound(level) {
  const count = Math.min(6 + Math.floor(level / 2), 8);
  const maxVal = Math.min(5 + level * 3, 30);

  // Generate numbers
  const numbers = [];
  for (let i = 0; i < count; i++) {
    numbers.push(randInt(1, maxVal));
  }

  // Pick a random subset (2-4 numbers) to form the target
  const subsetSize = randInt(2, Math.min(4, count));
  const indices = shuffle(Array.from({ length: count }, (_, i) => i)).slice(0, subsetSize);
  const target = indices.reduce((sum, idx) => sum + numbers[idx], 0);

  return { numbers, target };
}

export default function SumTarget({ level, onCorrect, onWrong, isActive }) {
  const [round, setRound] = useState(() => generateRound(level));
  const [selected, setSelected] = useState(new Set());
  const mountedRef = useRef(true);
  const levelRef = useRef(level);
  const resolvedRef = useRef(false);

  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const currentSum = [...selected].reduce((sum, idx) => sum + round.numbers[idx], 0);

  const startNewRound = useCallback(() => {
    setRound(generateRound(levelRef.current));
    setSelected(new Set());
    resolvedRef.current = false;
  }, []);

  const handleTap = useCallback((idx) => {
    if (!isActive || resolvedRef.current) return;

    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx); // deselect
        return next;
      }

      next.add(idx);
      const newSum = [...next].reduce((sum, i) => sum + round.numbers[i], 0);

      if (newSum === round.target) {
        // Correct!
        resolvedRef.current = true;
        onCorrect();
        setTimeout(() => { if (mountedRef.current) startNewRound(); }, 500);
      } else if (newSum > round.target) {
        // Exceeded — wrong, reset selection
        resolvedRef.current = true;
        onWrong();
        setTimeout(() => {
          if (mountedRef.current) {
            setSelected(new Set());
            resolvedRef.current = false;
          }
        }, 400);
        return new Set(); // immediate visual reset
      }

      return next;
    });
  }, [isActive, round, onCorrect, onWrong, startNewRound]);

  const isOver = currentSum > round.target;

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 gap-4">
      {/* Target */}
      <div className="flex items-center gap-3">
        <span className="font-pixel-label text-[9px] text-pixel-cream/50">TARGET:</span>
        <span className="font-pixel-label text-2xl text-pixel-yellow">{round.target}</span>
      </div>

      {/* Current sum */}
      <div className="flex items-center gap-2">
        <span className="font-pixel-label text-[8px] text-pixel-cream/40">SUM:</span>
        <span className={`font-pixel-label text-lg ${
          currentSum === round.target ? "text-pixel-green" : currentSum > round.target ? "text-pixel-pink" : "text-pixel-cream"
        }`}>
          {currentSum}
        </span>
      </div>

      {/* Number grid */}
      <div className="flex flex-wrap gap-2 justify-center max-w-sm">
        {round.numbers.map((num, i) => {
          const isSel = selected.has(i);
          return (
            <motion.button
              key={i}
              onClick={() => handleTap(i)}
              whileTap={{ scale: 0.9 }}
              className={`
                w-14 h-14 md:w-16 md:h-16 rounded-[4px] border-[3px] flex items-center justify-center
                font-pixel-label text-sm md:text-base select-none transition-all duration-100
                ${isSel
                  ? "bg-pixel-green/20 border-pixel-green/50 text-pixel-green"
                  : "bg-pixel-purple/60 border-pixel-cream/20 text-pixel-cream hover:border-pixel-cream/40 cursor-pointer"
                }
                shadow-[3px_3px_0px_0px_#1a1030] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]
              `}
              disabled={!isActive}
              style={{ touchAction: "manipulation" }}
            >
              {num}
            </motion.button>
          );
        })}
      </div>

      <p className="font-pixel-label text-[7px] text-pixel-cream/25">
        TAP TO SELECT / DESELECT
      </p>
    </div>
  );
}
