import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pick, shuffle } from "../../lib/helpers";

const SHAPES = [
  { name: "Circle", symbol: "●" },
  { name: "Square", symbol: "■" },
  { name: "Triangle", symbol: "▲" },
  { name: "Diamond", symbol: "♦" },
  { name: "Star", symbol: "★" },
];

const COLORS = [
  { name: "Red", hex: "#ff5c8a" },
  { name: "Blue", hex: "#5b7cfa" },
  { name: "Green", hex: "#4cd964" },
  { name: "Yellow", hex: "#ffd23f" },
  { name: "Purple", hex: "#c13cff" },
];

function generateRound(rule, roundNum) {
  const shape = pick(SHAPES);
  const color = pick(COLORS);
  // Generate 3 options, one correct
  let options;
  if (rule === "COLOR") {
    const correct = color.name;
    const wrongs = shuffle(COLORS.filter((c) => c.name !== correct)).slice(0, 2).map((c) => c.name);
    options = shuffle([correct, ...wrongs]);
  } else {
    const correct = shape.name;
    const wrongs = shuffle(SHAPES.filter((s) => s.name !== correct)).slice(0, 2).map((s) => s.name);
    options = shuffle([correct, ...wrongs]);
  }
  return { shape, color, options, correctAnswer: rule === "COLOR" ? color.name : shape.name };
}

export default function RuleSwitch({ level, onCorrect, onWrong, isActive }) {
  const [rule, setRule] = useState("COLOR");
  const [roundNum, setRoundNum] = useState(0);
  const [round, setRound] = useState(() => generateRound("COLOR", 0));
  const [answered, setAnswered] = useState(false);
  const mountedRef = useRef(true);
  const switchEvery = Math.max(2, 5 - Math.floor(level / 2));

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const handleAnswer = useCallback((answer) => {
    if (!isActive || answered) return;
    setAnswered(true);

    if (answer === round.correctAnswer) {
      onCorrect();
    } else {
      onWrong();
    }

    setTimeout(() => {
      if (!mountedRef.current) return;
      const newRoundNum = roundNum + 1;
      const newRule = newRoundNum % switchEvery === 0 ? (rule === "COLOR" ? "SHAPE" : "COLOR") : rule;
      setRoundNum(newRoundNum);
      setRule(newRule);
      setRound(generateRound(newRule, newRoundNum));
      setAnswered(false);
    }, 300);
  }, [isActive, answered, round, rule, roundNum, switchEvery, onCorrect, onWrong]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 gap-5">
      {/* Rule banner */}
      <motion.div
        key={rule}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className={`font-pixel-label text-xs px-4 py-2 rounded-[4px] border-[2px] ${
          rule === "COLOR"
            ? "bg-pixel-blue/20 border-pixel-blue/40 text-pixel-blue"
            : "bg-pixel-orange/20 border-pixel-orange/40 text-pixel-orange"
        }`}
      >
        MATCH BY: {rule}
      </motion.div>

      {/* Stimulus */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${round.shape.name}-${round.color.name}-${roundNum}`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="text-6xl md:text-8xl select-none"
          style={{ color: round.color.hex }}
        >
          {round.shape.symbol}
        </motion.div>
      </AnimatePresence>

      {/* Options */}
      <div className="flex gap-3 flex-wrap justify-center">
        {round.options.map((opt) => (
          <motion.button
            key={opt}
            onClick={() => handleAnswer(opt)}
            whileTap={{ scale: 0.9 }}
            className="font-pixel-label text-[10px] md:text-xs bg-pixel-purple/60 text-pixel-cream border-[3px] border-pixel-cream/20 rounded-[4px] px-4 py-2.5 shadow-[3px_3px_0px_0px_#1a1030] hover:border-pixel-cream/40 active:shadow-none active:translate-x-[3px] active:translate-y-[3px] select-none min-w-[80px]"
            disabled={!isActive || answered}
            style={{ touchAction: "manipulation" }}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
