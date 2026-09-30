import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pick } from "../../lib/helpers";

const COLORS = [
  { name: "RED", hex: "#ff5c8a" },
  { name: "BLUE", hex: "#5b7cfa" },
  { name: "GREEN", hex: "#4cd964" },
  { name: "YELLOW", hex: "#ffd23f" },
  { name: "ORANGE", hex: "#ffa62b" },
  { name: "PURPLE", hex: "#c13cff" },
];

function generateRound() {
  const wordColor = pick(COLORS);
  const isMatch = Math.random() > 0.5;
  let inkColor;
  if (isMatch) {
    inkColor = wordColor;
  } else {
    do { inkColor = pick(COLORS); } while (inkColor.name === wordColor.name);
  }
  return { word: wordColor.name, ink: inkColor, isMatch };
}

export default function ColorClash({ level, onCorrect, onWrong, isActive }) {
  const [round, setRound] = useState(generateRound);
  const [answered, setAnswered] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const handleAnswer = useCallback((answer) => {
    if (!isActive || answered) return;
    setAnswered(true);
    const correct = (answer === "yes") === round.isMatch;
    if (correct) {
      onCorrect();
    } else {
      onWrong();
    }
    setTimeout(() => {
      if (mountedRef.current) {
        setRound(generateRound());
        setAnswered(false);
      }
    }, 300);
  }, [isActive, answered, round, onCorrect, onWrong]);

  // Keyboard support
  useEffect(() => {
    function handleKey(e) {
      if (!isActive || answered) return;
      if (e.key === "ArrowLeft" || e.key === "y" || e.key === "Y") handleAnswer("yes");
      if (e.key === "ArrowRight" || e.key === "n" || e.key === "N") handleAnswer("no");
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isActive, answered, handleAnswer]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 gap-8">
      <p className="font-pixel-label text-[9px] text-pixel-cream/50">DOES THE WORD MATCH ITS COLOR?</p>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${round.word}-${round.ink.name}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="font-pixel-label text-3xl md:text-5xl select-none"
          style={{ color: round.ink.hex }}
        >
          {round.word}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-4">
        <motion.button
          onClick={() => handleAnswer("yes")}
          whileTap={{ scale: 0.9 }}
          className="font-pixel-label text-sm bg-pixel-green/20 text-pixel-green border-[3px] border-pixel-green/40 rounded-[4px] px-8 py-3 shadow-[3px_3px_0px_0px_#1a1030] hover:bg-pixel-green/30 active:shadow-none active:translate-x-[3px] active:translate-y-[3px] select-none min-w-[80px]"
          disabled={!isActive || answered}
          style={{ touchAction: "manipulation" }}
        >
          YES
        </motion.button>
        <motion.button
          onClick={() => handleAnswer("no")}
          whileTap={{ scale: 0.9 }}
          className="font-pixel-label text-sm bg-pixel-pink/20 text-pixel-pink border-[3px] border-pixel-pink/40 rounded-[4px] px-8 py-3 shadow-[3px_3px_0px_0px_#1a1030] hover:bg-pixel-pink/30 active:shadow-none active:translate-x-[3px] active:translate-y-[3px] select-none min-w-[80px]"
          disabled={!isActive || answered}
          style={{ touchAction: "manipulation" }}
        >
          NO
        </motion.button>
      </div>
    </div>
  );
}
