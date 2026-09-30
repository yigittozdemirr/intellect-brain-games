import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { shuffle } from "../../lib/helpers";

const SYMBOLS = ["♠","♥","♦","♣","★","●","▲","■","♪","☀","☁","⚡","✿","☂","♫","⬡"];

function generateBoard(level) {
  const pairCount = Math.min(3 + level, 12);
  const syms = shuffle(SYMBOLS).slice(0, pairCount);
  const cards = shuffle([...syms, ...syms].map((sym, i) => ({
    id: i,
    symbol: sym,
    flipped: false,
    matched: false,
  })));
  return cards;
}

function getGridCols(count) {
  if (count <= 8) return 4;
  if (count <= 12) return 4;
  if (count <= 16) return 4;
  if (count <= 20) return 5;
  return 6;
}

export default function MemoryMatch({ level, onCorrect, onWrong, isActive }) {
  const [cards, setCards] = useState(() => generateBoard(level));
  const [selected, setSelected] = useState([]);
  const checking = useRef(false);
  const levelRef = useRef(level);

  // Reset board when level changes
  useEffect(() => {
    if (level !== levelRef.current) {
      levelRef.current = level;
      setCards(generateBoard(level));
      setSelected([]);
      checking.current = false;
    }
  }, [level]);

  // All matched → new board
  useEffect(() => {
    if (cards.length > 0 && cards.every((c) => c.matched)) {
      const timer = setTimeout(() => {
        setCards(generateBoard(levelRef.current));
        setSelected([]);
        checking.current = false;
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [cards]);

  const handleFlip = useCallback((cardId) => {
    if (!isActive || checking.current) return;
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.flipped || card.matched) return;

    const newCards = cards.map((c) => c.id === cardId ? { ...c, flipped: true } : c);
    const newSelected = [...selected, cardId];
    setCards(newCards);
    setSelected(newSelected);

    if (newSelected.length === 2) {
      checking.current = true;
      const [a, b] = newSelected.map((id) => newCards.find((c) => c.id === id));
      if (a.symbol === b.symbol) {
        // Match!
        setTimeout(() => {
          setCards((prev) => prev.map((c) =>
            c.id === a.id || c.id === b.id ? { ...c, matched: true } : c
          ));
          setSelected([]);
          checking.current = false;
          onCorrect();
        }, 300);
      } else {
        // Mismatch
        setTimeout(() => {
          setCards((prev) => prev.map((c) =>
            c.id === a.id || c.id === b.id ? { ...c, flipped: false } : c
          ));
          setSelected([]);
          checking.current = false;
          onWrong();
        }, 600);
      }
    }
  }, [isActive, cards, selected, onCorrect, onWrong]);

  const cols = getGridCols(cards.length);

  return (
    <div className="flex items-center justify-center h-full p-3">
      <div
        className="grid gap-2 max-w-md w-full"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {cards.map((card) => (
          <motion.button
            key={card.id}
            onClick={() => handleFlip(card.id)}
            whileTap={isActive ? { scale: 0.9 } : {}}
            className={`
              aspect-square rounded-[4px] border-[3px] flex items-center justify-center
              text-lg md:text-xl font-pixel-body select-none
              transition-colors duration-150 min-h-[44px]
              ${card.matched
                ? "bg-pixel-green/20 border-pixel-green/40 text-pixel-green"
                : card.flipped
                  ? "bg-pixel-magenta/20 border-pixel-magenta/50 text-pixel-cream"
                  : "bg-pixel-purple/80 border-pixel-cream/20 text-transparent hover:border-pixel-cream/40 cursor-pointer"
              }
            `}
            disabled={!isActive || card.flipped || card.matched}
            style={{ touchAction: "manipulation" }}
          >
            {card.flipped || card.matched ? card.symbol : "?"}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
