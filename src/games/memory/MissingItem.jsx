import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { shuffle, pick, randInt } from "../../lib/helpers";

/**
 * MissingItem — 6-9 pixel icons shown briefly, then hidden.
 * They reappear with one slot empty. Player picks the missing icon from 4 options.
 * Options = missing one + 3 never-shown icons.
 */

const ALL_ICONS = [
  { label: "Star",     symbol: "★", color: "#ffd23f" },
  { label: "Heart",    symbol: "♥", color: "#ff5c8a" },
  { label: "Diamond",  symbol: "♦", color: "#5b7cfa" },
  { label: "Club",     symbol: "♣", color: "#4cd964" },
  { label: "Spade",    symbol: "♠", color: "#c13cff" },
  { label: "Circle",   symbol: "●", color: "#ffa62b" },
  { label: "Square",   symbol: "■", color: "#5b7cfa" },
  { label: "Triangle", symbol: "▲", color: "#ff5c8a" },
  { label: "Moon",     symbol: "☾", color: "#ffd23f" },
  { label: "Sun",      symbol: "☀", color: "#ffa62b" },
  { label: "Note",     symbol: "♪", color: "#c13cff" },
  { label: "Bolt",     symbol: "⚡", color: "#ffd23f" },
  { label: "Crown",    symbol: "♛", color: "#ffa62b" },
  { label: "Flower",   symbol: "✿", color: "#ff5c8a" },
  { label: "Drop",     symbol: "💧", color: "#5b7cfa" },
  { label: "Flame",    symbol: "🔥", color: "#ffa62b" },
];

function generateRound(level) {
  const itemCount = Math.min(6 + Math.floor(level / 2), 9);
  const shuffled = shuffle(ALL_ICONS);
  const shown = shuffled.slice(0, itemCount);
  const notShown = shuffled.slice(itemCount);

  // Pick which one will be missing
  const missingIdx = randInt(0, shown.length - 1);
  const missing = shown[missingIdx];

  // Build visible items (with one slot empty)
  const visibleItems = shown.map((item, i) => ({
    ...item,
    isEmpty: i === missingIdx,
  }));

  // Options: the missing one + 3 from never-shown
  const wrongOptions = shuffle(notShown).slice(0, 3);
  const options = shuffle([missing, ...wrongOptions]);

  return {
    shown,
    visibleItems,
    missing,
    options,
    showTime: Math.max(1500, 3000 - level * 200),
  };
}

export default function MissingItem({ level, onCorrect, onWrong, isActive }) {
  const [round, setRound] = useState(() => generateRound(level));
  const [phase, setPhase] = useState("memorize"); // "memorize" | "answer"
  const [answered, setAnswered] = useState(false);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);
  const levelRef = useRef(level);

  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  // Memorize phase timer
  useEffect(() => {
    if (!isActive || phase !== "memorize") return;
    timerRef.current = setTimeout(() => {
      if (mountedRef.current) setPhase("answer");
    }, round.showTime);
    return () => clearTimeout(timerRef.current);
  }, [isActive, phase, round]);

  const handleAnswer = useCallback((icon) => {
    if (!isActive || answered || phase !== "answer") return;
    setAnswered(true);

    if (icon.label === round.missing.label) {
      onCorrect();
    } else {
      onWrong();
    }

    setTimeout(() => {
      if (mountedRef.current) {
        setRound(generateRound(levelRef.current));
        setPhase("memorize");
        setAnswered(false);
      }
    }, 400);
  }, [isActive, answered, phase, round.missing, onCorrect, onWrong]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-4">
      <p className="font-pixel-label text-[9px] text-pixel-cream/50">
        {phase === "memorize" ? "MEMORIZE THESE ICONS" : "WHICH ONE IS MISSING?"}
      </p>

      {/* Icons display */}
      <div className="flex flex-wrap gap-3 justify-center max-w-xs">
        {phase === "memorize"
          ? round.shown.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="w-12 h-12 md:w-14 md:h-14 bg-pixel-purple/60 border-[2px] border-pixel-cream/20 rounded-[4px] flex items-center justify-center text-xl md:text-2xl select-none"
                style={{ color: item.color }}
              >
                {item.symbol}
              </motion.div>
            ))
          : round.visibleItems.map((item, i) => (
              <div
                key={i}
                className={`w-12 h-12 md:w-14 md:h-14 rounded-[4px] border-[2px] flex items-center justify-center text-xl md:text-2xl select-none ${
                  item.isEmpty
                    ? "border-pixel-pink/40 border-dashed bg-pixel-pink/10"
                    : "border-pixel-cream/20 bg-pixel-purple/60"
                }`}
                style={{ color: item.isEmpty ? undefined : item.color }}
              >
                {item.isEmpty ? "?" : item.symbol}
              </div>
            ))
        }
      </div>

      {/* Answer options */}
      {phase === "answer" && (
        <div className="flex gap-3 flex-wrap justify-center">
          {round.options.map((opt) => (
            <motion.button
              key={opt.label}
              onClick={() => handleAnswer(opt)}
              whileTap={{ scale: 0.9 }}
              className="w-14 h-14 md:w-16 md:h-16 bg-pixel-purple/60 border-[3px] border-pixel-cream/20 rounded-[4px] shadow-[3px_3px_0px_0px_#1a1030] hover:border-pixel-cream/40 active:shadow-none active:translate-x-[3px] active:translate-y-[3px] select-none flex items-center justify-center text-2xl"
              disabled={!isActive || answered}
              style={{ color: opt.color, touchAction: "manipulation" }}
            >
              {opt.symbol}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
