import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { shuffle, randInt } from "../../lib/helpers";

/**
 * PatternRecall — cells on a grid light up at once for ~1.2s, then hide.
 * Player taps the same cells. All correct = correct; wrong cell = wrong + new pattern.
 * Grid & lit count grow with level.
 */

function generateRound(level) {
  const gridSize = Math.min(3 + Math.floor(level / 3), 5);
  const totalCells = gridSize * gridSize;
  const litCount = Math.min(2 + level, Math.floor(totalCells * 0.6));
  const indices = shuffle(Array.from({ length: totalCells }, (_, i) => i)).slice(0, litCount);
  return {
    gridSize,
    litCells: new Set(indices),
    totalLit: litCount,
  };
}

export default function PatternRecall({ level, onCorrect, onWrong, isActive }) {
  const [round, setRound] = useState(() => generateRound(level));
  const [phase, setPhase] = useState("showing"); // "showing" | "input"
  const [tapped, setTapped] = useState(new Set());
  const [correctCount, setCorrectCount] = useState(0);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);
  const levelRef = useRef(level);
  const resolvedRef = useRef(false);

  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  // Show pattern for ~1.2s then switch to input
  useEffect(() => {
    if (!isActive || phase !== "showing") return;
    const showTime = Math.max(800, 1200 - level * 30);
    timerRef.current = setTimeout(() => {
      if (mountedRef.current) setPhase("input");
    }, showTime);
    return () => clearTimeout(timerRef.current);
  }, [isActive, phase, level, round]); // round included to restart on new pattern

  const startNewRound = useCallback(() => {
    const newRound = generateRound(levelRef.current);
    setRound(newRound);
    setTapped(new Set());
    setCorrectCount(0);
    setPhase("showing");
    resolvedRef.current = false;
  }, []);

  const handleTap = useCallback((idx) => {
    if (!isActive || phase !== "input" || tapped.has(idx) || resolvedRef.current) return;

    if (round.litCells.has(idx)) {
      // Correct cell
      const newTapped = new Set(tapped);
      newTapped.add(idx);
      setTapped(newTapped);
      const newCount = correctCount + 1;
      setCorrectCount(newCount);

      if (newCount >= round.totalLit) {
        // All cells found!
        resolvedRef.current = true;
        onCorrect();
        setTimeout(() => { if (mountedRef.current) startNewRound(); }, 400);
      }
    } else {
      // Wrong cell
      resolvedRef.current = true;
      onWrong();
      setTimeout(() => { if (mountedRef.current) startNewRound(); }, 500);
    }
  }, [isActive, phase, tapped, round, correctCount, onCorrect, onWrong, startNewRound]);

  const { gridSize, litCells } = round;
  const totalCells = gridSize * gridSize;
  const cellSize = gridSize <= 3 ? "w-16 h-16 md:w-20 md:h-20" : gridSize <= 4 ? "w-14 h-14 md:w-16 md:h-16" : "w-11 h-11 md:w-14 md:h-14";

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <p className="font-pixel-label text-[9px] text-pixel-cream/50">
        {phase === "showing" ? "MEMORIZE THE PATTERN" : `TAP THE CELLS (${correctCount}/${round.totalLit})`}
      </p>

      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
      >
        {Array.from({ length: totalCells }, (_, i) => {
          const isLit = litCells.has(i);
          const wasTapped = tapped.has(i);
          const showLit = phase === "showing" && isLit;
          const showCorrect = phase === "input" && wasTapped;

          return (
            <motion.button
              key={i}
              onClick={() => handleTap(i)}
              whileTap={isActive && phase === "input" ? { scale: 0.9 } : {}}
              animate={showLit ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.3 }}
              className={`
                ${cellSize} rounded-[4px] border-[3px] flex items-center justify-center
                select-none transition-all duration-150 min-h-[44px]
                ${showLit
                  ? "bg-pixel-magenta/40 border-pixel-magenta/60"
                  : showCorrect
                    ? "bg-pixel-green/30 border-pixel-green/50"
                    : "bg-pixel-purple/60 border-pixel-cream/15 hover:border-pixel-cream/30 cursor-pointer"
                }
              `}
              disabled={!isActive || phase !== "input" || wasTapped}
              style={{ touchAction: "manipulation" }}
            >
              {showLit && (
                <div className="w-3 h-3 bg-pixel-magenta rounded-sm" style={{ imageRendering: "pixelated" }} />
              )}
              {showCorrect && (
                <span className="text-pixel-green text-sm">✓</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
