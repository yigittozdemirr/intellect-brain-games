import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pick, shuffle, randInt } from "../../lib/helpers";

/**
 * BinFlip — an item appears in center; two bins LEFT and RIGHT are labeled with
 * categories. Player sends the item to the correct bin. Every few rounds the
 * bin labels swap sides with a clear "SWAP!" animation.
 */

const CATEGORY_PAIRS = [
  {
    a: "FRUIT", b: "TOOL",
    itemsA: [
      { label: "Apple", icon: "🍎" }, { label: "Banana", icon: "🍌" },
      { label: "Cherry", icon: "🍒" }, { label: "Grape", icon: "🍇" },
      { label: "Orange", icon: "🍊" }, { label: "Lemon", icon: "🍋" },
      { label: "Pear", icon: "🍐" }, { label: "Melon", icon: "🍈" },
    ],
    itemsB: [
      { label: "Hammer", icon: "🔨" }, { label: "Wrench", icon: "🔧" },
      { label: "Saw", icon: "🪚" }, { label: "Drill", icon: "🪛" },
      { label: "Pliers", icon: "🔩" }, { label: "Ruler", icon: "📏" },
      { label: "Scissors", icon: "✂️" }, { label: "Brush", icon: "🖌️" },
    ],
  },
  {
    a: "ANIMAL", b: "VEHICLE",
    itemsA: [
      { label: "Cat", icon: "🐱" }, { label: "Dog", icon: "🐶" },
      { label: "Fish", icon: "🐟" }, { label: "Bird", icon: "🐦" },
      { label: "Horse", icon: "🐴" }, { label: "Rabbit", icon: "🐰" },
      { label: "Frog", icon: "🐸" }, { label: "Turtle", icon: "🐢" },
    ],
    itemsB: [
      { label: "Car", icon: "🚗" }, { label: "Bus", icon: "🚌" },
      { label: "Plane", icon: "✈️" }, { label: "Boat", icon: "⛵" },
      { label: "Train", icon: "🚆" }, { label: "Bike", icon: "🚲" },
      { label: "Truck", icon: "🚛" }, { label: "Rocket", icon: "🚀" },
    ],
  },
  {
    a: "FOOD", b: "SPORT",
    itemsA: [
      { label: "Pizza", icon: "🍕" }, { label: "Burger", icon: "🍔" },
      { label: "Cake", icon: "🎂" }, { label: "Bread", icon: "🍞" },
      { label: "Taco", icon: "🌮" }, { label: "Rice", icon: "🍚" },
      { label: "Cookie", icon: "🍪" }, { label: "Donut", icon: "🍩" },
    ],
    itemsB: [
      { label: "Soccer", icon: "⚽" }, { label: "Tennis", icon: "🎾" },
      { label: "Hockey", icon: "🏒" }, { label: "Boxing", icon: "🥊" },
      { label: "Golf", icon: "⛳" }, { label: "Rugby", icon: "🏉" },
      { label: "Surfing", icon: "🏄" }, { label: "Skiing", icon: "⛷️" },
    ],
  },
];

function generateRound(catPair, swapped) {
  // Pick an item from either category
  const fromA = Math.random() > 0.5;
  const item = fromA ? pick(catPair.itemsA) : pick(catPair.itemsB);
  const correctBin = fromA ? catPair.a : catPair.b;

  // If swapped, left = b, right = a; else left = a, right = b
  const leftLabel = swapped ? catPair.b : catPair.a;
  const rightLabel = swapped ? catPair.a : catPair.b;

  const correctSide = correctBin === leftLabel ? "LEFT" : "RIGHT";

  return { item, leftLabel, rightLabel, correctSide };
}

export default function BinFlip({ level, onCorrect, onWrong, isActive }) {
  const [catPair] = useState(() => pick(CATEGORY_PAIRS));
  const [swapped, setSwapped] = useState(false);
  const [roundNum, setRoundNum] = useState(0);
  const [round, setRound] = useState(() => generateRound(catPair, false));
  const [answered, setAnswered] = useState(false);
  const [showSwap, setShowSwap] = useState(false);
  const mountedRef = useRef(true);
  const swapEvery = Math.max(3, 5 - Math.floor(level / 3));

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const handleAnswer = useCallback((side) => {
    if (!isActive || answered) return;
    setAnswered(true);

    if (side === round.correctSide) {
      onCorrect();
    } else {
      onWrong();
    }

    setTimeout(() => {
      if (!mountedRef.current) return;
      const newRoundNum = roundNum + 1;
      let newSwapped = swapped;

      if (newRoundNum % swapEvery === 0) {
        newSwapped = !swapped;
        setSwapped(newSwapped);
        setShowSwap(true);
        setTimeout(() => { if (mountedRef.current) setShowSwap(false); }, 700);
      }

      setRoundNum(newRoundNum);
      setRound(generateRound(catPair, newSwapped));
      setAnswered(false);
    }, 300);
  }, [isActive, answered, round.correctSide, roundNum, swapEvery, swapped, catPair, onCorrect, onWrong]);

  // Keyboard support
  useEffect(() => {
    function handleKey(e) {
      if (!isActive || answered) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); handleAnswer("LEFT"); }
      if (e.key === "ArrowRight") { e.preventDefault(); handleAnswer("RIGHT"); }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isActive, answered, handleAnswer]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 gap-4">
      <p className="font-pixel-label text-[9px] text-pixel-cream/50">SORT INTO THE CORRECT BIN</p>

      {/* Swap animation */}
      <AnimatePresence>
        {showSwap && (
          <motion.div
            initial={{ scale: 2, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute font-pixel-label text-xl text-pixel-yellow z-10"
          >
            SWAP! 🔄
          </motion.div>
        )}
      </AnimatePresence>

      {/* Item display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${round.item.label}-${roundNum}`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-4xl md:text-5xl">{round.item.icon}</span>
          <span className="font-pixel-label text-[10px] text-pixel-cream">{round.item.label.toUpperCase()}</span>
        </motion.div>
      </AnimatePresence>

      {/* Bins */}
      <div className="flex gap-4 md:gap-8 w-full max-w-sm justify-center">
        <motion.button
          onClick={() => handleAnswer("LEFT")}
          whileTap={{ scale: 0.9 }}
          layout
          className="flex-1 max-w-[160px] bg-pixel-blue/15 border-[3px] border-pixel-blue/30 rounded-[6px] py-4 px-3 shadow-[3px_3px_0px_0px_#1a1030] hover:border-pixel-blue/50 active:shadow-none active:translate-x-[3px] active:translate-y-[3px] select-none text-center"
          disabled={!isActive || answered}
          style={{ touchAction: "manipulation" }}
        >
          <span className="font-pixel-label text-[10px] text-pixel-blue">← {round.leftLabel}</span>
        </motion.button>
        <motion.button
          onClick={() => handleAnswer("RIGHT")}
          whileTap={{ scale: 0.9 }}
          layout
          className="flex-1 max-w-[160px] bg-pixel-orange/15 border-[3px] border-pixel-orange/30 rounded-[6px] py-4 px-3 shadow-[3px_3px_0px_0px_#1a1030] hover:border-pixel-orange/50 active:shadow-none active:translate-x-[3px] active:translate-y-[3px] select-none text-center"
          disabled={!isActive || answered}
          style={{ touchAction: "manipulation" }}
        >
          <span className="font-pixel-label text-[10px] text-pixel-orange">{round.rightLabel} →</span>
        </motion.button>
      </div>
    </div>
  );
}
