import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { shuffle, pick, randInt } from "../../lib/helpers";

/**
 * TwinHunt — a grid of pixel symbols with exactly ONE identical pair.
 * All other symbols are unique. Player taps both twins. Grid grows with level.
 */

const SYMBOLS = ["★","●","■","▲","♦","♥","♣","♠","♪","☀","☁","⚡","✿","☂","♫","⬡","♛","♝","⚙","◆","△","○","□","⬟","✦","⬥","◇","▷","◁","⬠"];
const COLORS = ["#c13cff","#5b7cfa","#ffa62b","#4cd964","#ff5c8a","#ffd23f","#fff3d6"];

function generateRound(level) {
  const gridSize = Math.min(3 + Math.floor(level / 2), 6);
  const totalCells = gridSize * gridSize;
  // Need at least 3 cells (2 for pair + 1 unique)
  const uniqueCount = totalCells - 2;

  // Pick unique symbols (each with a unique symbol+color combo)
  const combos = [];
  for (const sym of SYMBOLS) {
    for (const col of COLORS) {
      combos.push({ symbol: sym, color: col });
    }
  }
  const shuffledCombos = shuffle(combos);

  // Pick the twin pair
  const twin = shuffledCombos[0];

  // Pick unique fillers (none matching the twin)
  const uniqueItems = shuffledCombos
    .slice(1)
    .filter((c) => !(c.symbol === twin.symbol && c.color === twin.color))
    .slice(0, uniqueCount);

  const cells = shuffle([
    { ...twin, isTwin: true, id: 0 },
    { ...twin, isTwin: true, id: 1 },
    ...uniqueItems.map((item, i) => ({ ...item, isTwin: false, id: i + 2 })),
  ]);

  return { gridSize, cells, twinSymbol: twin.symbol, twinColor: twin.color };
}

export default function TwinHunt({ level, onCorrect, onWrong, isActive }) {
  const [round, setRound] = useState(() => generateRound(level));
  const [selected, setSelected] = useState([]);
  const [found, setFound] = useState(false);
  const mountedRef = useRef(true);
  const levelRef = useRef(level);
  const resolvedRef = useRef(false);

  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const startNewRound = useCallback(() => {
    setRound(generateRound(levelRef.current));
    setSelected([]);
    setFound(false);
    resolvedRef.current = false;
  }, []);

  const handleTap = useCallback((cellIdx) => {
    if (!isActive || found || resolvedRef.current) return;
    const cell = round.cells[cellIdx];

    // Don't allow selecting same cell twice
    if (selected.length === 1 && selected[0] === cellIdx) return;

    if (selected.length === 0) {
      setSelected([cellIdx]);
    } else if (selected.length === 1) {
      const first = round.cells[selected[0]];
      const second = cell;

      if (first.symbol === second.symbol && first.color === second.color && first.isTwin && second.isTwin) {
        // Found the twins!
        resolvedRef.current = true;
        setSelected([selected[0], cellIdx]);
        setFound(true);
        onCorrect();
        setTimeout(() => { if (mountedRef.current) startNewRound(); }, 500);
      } else {
        // Wrong pair
        resolvedRef.current = true;
        setSelected([selected[0], cellIdx]);
        onWrong();
        setTimeout(() => { if (mountedRef.current) startNewRound(); }, 600);
      }
    }
  }, [isActive, found, round, selected, onCorrect, onWrong, startNewRound]);

  const { gridSize, cells } = round;

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <p className="font-pixel-label text-[9px] text-pixel-cream/50">FIND THE IDENTICAL PAIR</p>

      <div
        className="grid gap-1.5 md:gap-2"
        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
      >
        {cells.map((cell, i) => {
          const isSelected = selected.includes(i);
          const isFoundTwin = found && cell.isTwin;

          return (
            <motion.button
              key={i}
              onClick={() => handleTap(i)}
              whileTap={isActive ? { scale: 0.9 } : {}}
              animate={isFoundTwin ? { scale: [1, 1.2, 1] } : {}}
              className={`
                aspect-square rounded-[4px] border-[2px] flex items-center justify-center
                text-lg md:text-xl select-none transition-all duration-100
                min-w-[40px] min-h-[40px] max-w-[60px] max-h-[60px]
                ${isFoundTwin
                  ? "bg-pixel-green/20 border-pixel-green/50"
                  : isSelected
                    ? "bg-pixel-orange/20 border-pixel-orange/50"
                    : "bg-pixel-purple/60 border-pixel-cream/15 hover:border-pixel-cream/30 cursor-pointer"
                }
              `}
              disabled={!isActive || found}
              style={{ color: cell.color, touchAction: "manipulation" }}
            >
              {cell.symbol}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
