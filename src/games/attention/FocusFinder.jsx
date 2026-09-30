import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { shuffle, pick } from "../../lib/helpers";

const SYMBOL_SETS = [
  { normal: "●", odd: "■" },
  { normal: "▲", odd: "▼" },
  { normal: "♥", odd: "♦" },
  { normal: "★", odd: "☆" },
  { normal: "◆", odd: "◇" },
  { normal: "✦", odd: "✧" },
];

function getGridSize(level) {
  return Math.min(9 + level * 3, 36);
}

function generatePuzzle(level) {
  const set = pick(SYMBOL_SETS);
  const size = getGridSize(level);
  const oddIdx = Math.floor(Math.random() * size);
  const items = [];
  for (let i = 0; i < size; i++) {
    items.push({
      id: i,
      symbol: i === oddIdx ? set.odd : set.normal,
      isOdd: i === oddIdx,
    });
  }
  return shuffle(items);
}

function getGridCols(count) {
  if (count <= 9) return 3;
  if (count <= 16) return 4;
  if (count <= 25) return 5;
  return 6;
}

export default function FocusFinder({ level, onCorrect, onWrong, isActive }) {
  const [items, setItems] = useState(() => generatePuzzle(level));
  const levelRef = useRef(level);

  useEffect(() => { levelRef.current = level; }, [level]);

  const handleTap = useCallback((item) => {
    if (!isActive) return;
    if (item.isOdd) {
      onCorrect();
    } else {
      onWrong();
    }
    setItems(generatePuzzle(levelRef.current));
  }, [isActive, onCorrect, onWrong]);

  const cols = getGridCols(items.length);

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <p className="font-pixel-label text-[9px] text-pixel-cream/50">FIND THE ODD ONE</p>
      <div
        className="grid gap-2 max-w-md w-full"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {items.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => handleTap(item)}
            whileTap={isActive ? { scale: 0.85 } : {}}
            className="aspect-square rounded-[4px] border-[2px] border-pixel-cream/15 bg-pixel-purple/60 flex items-center justify-center text-lg md:text-xl font-pixel-body text-pixel-cream hover:border-pixel-cream/30 transition-colors min-h-[40px] select-none"
            style={{ touchAction: "manipulation" }}
            disabled={!isActive}
          >
            {item.symbol}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
