import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { randInt } from "../../lib/helpers";

/**
 * PixelWhack — 3×3 grid of holes. Moles pop up briefly → tap = correct.
 * Bombs pop up → tap = wrong. Escaped moles are ignored (no penalty).
 * Tapping empty holes does nothing. Pop speed and frequency grow with level.
 */

function createEmptyGrid() {
  return Array(9).fill(null); // null = empty, "mole" = mole, "bomb" = bomb
}

export default function PixelWhack({ level, onCorrect, onWrong, isActive }) {
  const [grid, setGrid] = useState(createEmptyGrid);
  const spawnTimerRef = useRef(null);
  const cellTimersRef = useRef({});
  const mountedRef = useRef(true);
  const levelRef = useRef(level);
  const gridRef = useRef(grid);

  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const popDuration = Math.max(400, 1200 - level * 80);
  const spawnInterval = Math.max(300, 900 - level * 50);
  const bombChance = Math.min(0.15 + level * 0.03, 0.35);

  const clearCell = useCallback((idx) => {
    if (!mountedRef.current) return;
    setGrid((prev) => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
    clearTimeout(cellTimersRef.current[idx]);
    delete cellTimersRef.current[idx];
  }, []);

  const spawnCreature = useCallback(() => {
    if (!mountedRef.current) return;
    const currentGrid = gridRef.current;
    // Find empty holes
    const empties = [];
    for (let i = 0; i < 9; i++) {
      if (currentGrid[i] === null) empties.push(i);
    }
    if (empties.length === 0) return;

    const idx = empties[randInt(0, empties.length - 1)];
    const type = Math.random() < bombChance ? "bomb" : "mole";

    setGrid((prev) => {
      const next = [...prev];
      next[idx] = type;
      return next;
    });

    // Auto-despawn after duration (moles escape, bombs fizzle)
    cellTimersRef.current[idx] = setTimeout(() => {
      clearCell(idx);
    }, popDuration);
  }, [bombChance, popDuration, clearCell]);

  // Spawn loop
  useEffect(() => {
    if (!isActive) return;

    const doSpawn = () => {
      spawnCreature();
      spawnTimerRef.current = setTimeout(doSpawn, spawnInterval + randInt(-100, 100));
    };

    // Initial spawn
    spawnTimerRef.current = setTimeout(doSpawn, 300);

    return () => {
      clearTimeout(spawnTimerRef.current);
      Object.values(cellTimersRef.current).forEach(clearTimeout);
      cellTimersRef.current = {};
    };
  }, [isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTap = useCallback((idx) => {
    if (!isActive) return;
    const cellValue = grid[idx];
    if (cellValue === null) return; // Empty hole, ignore

    clearTimeout(cellTimersRef.current[idx]);
    delete cellTimersRef.current[idx];

    if (cellValue === "mole") {
      onCorrect();
    } else if (cellValue === "bomb") {
      onWrong();
    }

    // Clear the cell
    setGrid((prev) => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
  }, [isActive, grid, onCorrect, onWrong]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <p className="font-pixel-label text-[9px] text-pixel-cream/50">
        WHACK 🐹 MOLES — AVOID 💣 BOMBS
      </p>

      <div className="grid grid-cols-3 gap-2 md:gap-3">
        {grid.map((cell, i) => (
          <motion.button
            key={i}
            onClick={() => handleTap(i)}
            whileTap={cell ? { scale: 0.85 } : {}}
            className={`
              w-20 h-20 md:w-24 md:h-24 rounded-[6px] border-[3px] flex items-center justify-center
              select-none transition-colors duration-75
              ${cell === "mole"
                ? "bg-pixel-orange/20 border-pixel-orange/40 cursor-pointer"
                : cell === "bomb"
                  ? "bg-pixel-pink/20 border-pixel-pink/40 cursor-pointer"
                  : "bg-pixel-dark/40 border-pixel-cream/10"
              }
            `}
            style={{ touchAction: "manipulation" }}
          >
            <AnimatePresence mode="wait">
              {cell === "mole" && (
                <motion.span
                  key={`mole-${i}`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="text-3xl md:text-4xl"
                >
                  🐹
                </motion.span>
              )}
              {cell === "bomb" && (
                <motion.span
                  key={`bomb-${i}`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="text-3xl md:text-4xl"
                >
                  💣
                </motion.span>
              )}
              {cell === null && (
                <motion.div
                  key={`hole-${i}`}
                  className="w-8 h-3 bg-pixel-cream/5 rounded-full"
                />
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
