import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { shuffle, pick, randInt } from "../../lib/helpers";

const SHAPES = ["●", "■", "▲", "♦", "★", "♥"];
const COLORS = ["#c13cff", "#5b7cfa", "#ffa62b", "#4cd964", "#ff5c8a", "#ffd23f"];

function generateRound(level) {
  const targetShape = pick(SHAPES);
  const targetColor = pick(COLORS);
  const count = Math.min(4 + level * 2, 16);
  const matchCount = randInt(1, Math.max(1, Math.floor(count / 3)));

  const items = [];
  // Add matches
  for (let i = 0; i < matchCount; i++) {
    items.push({ id: i, shape: targetShape, color: targetColor, isTarget: true, tapped: false });
  }
  // Add distractors
  for (let i = matchCount; i < count; i++) {
    let shape, color;
    do {
      shape = pick(SHAPES);
      color = pick(COLORS);
    } while (shape === targetShape && color === targetColor);
    items.push({ id: i, shape, color, isTarget: false, tapped: false });
  }

  return {
    target: { shape: targetShape, color: targetColor },
    items: shuffle(items),
    remaining: matchCount,
  };
}

export default function TargetTap({ level, onCorrect, onWrong, isActive }) {
  const [round, setRound] = useState(() => generateRound(level));
  const levelRef = useRef(level);

  useEffect(() => { levelRef.current = level; }, [level]);

  const handleTap = useCallback((item) => {
    if (!isActive || item.tapped) return;

    if (item.isTarget) {
      onCorrect();
      setRound((prev) => {
        const newItems = prev.items.map((it) => it.id === item.id ? { ...it, tapped: true } : it);
        const newRemaining = prev.remaining - 1;
        if (newRemaining <= 0) {
          // All targets found, new round
          setTimeout(() => setRound(generateRound(levelRef.current)), 400);
        }
        return { ...prev, items: newItems, remaining: newRemaining };
      });
    } else {
      onWrong();
    }
  }, [isActive, onCorrect, onWrong]);

  const cols = round.items.length <= 8 ? 4 : round.items.length <= 12 ? 4 : 4;

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      {/* Target indicator */}
      <div className="flex items-center gap-2 bg-pixel-dark/60 border border-pixel-cream/20 rounded px-3 py-1.5">
        <span className="font-pixel-label text-[9px] text-pixel-cream/50">TARGET:</span>
        <span className="text-xl" style={{ color: round.target.color }}>{round.target.shape}</span>
        <span className="font-pixel-label text-[9px] text-pixel-cream/40">({round.remaining} left)</span>
      </div>

      <div
        className="grid gap-2 max-w-md w-full"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        <AnimatePresence>
          {round.items.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => handleTap(item)}
              whileTap={isActive ? { scale: 0.85 } : {}}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: item.tapped ? 0.5 : 1,
                opacity: item.tapped ? 0.3 : 1,
              }}
              transition={{ duration: 0.2 }}
              className={`
                aspect-square rounded-[4px] border-[2px] flex items-center justify-center
                text-xl md:text-2xl select-none transition-colors min-h-[44px]
                ${item.tapped
                  ? "border-pixel-green/30 bg-pixel-green/10"
                  : "border-pixel-cream/15 bg-pixel-purple/60 hover:border-pixel-cream/30 cursor-pointer"
                }
              `}
              disabled={!isActive || item.tapped}
              style={{ color: item.color, touchAction: "manipulation" }}
            >
              {item.shape}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
