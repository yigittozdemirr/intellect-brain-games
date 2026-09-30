import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { randInt } from "../../lib/helpers";

/**
 * OddEvenSwitch — a number is shown; a banner alternates every 4-5 rounds
 * between ODD/EVEN and HIGHER/LOWER than a threshold.
 * The number never equals the threshold.
 */

const RULES = ["ODD_EVEN", "HIGHER_LOWER"];

function generateNumber(level, rule, threshold) {
  const maxNum = level >= 4 ? 99 : 9;
  let num;
  do {
    num = randInt(1, maxNum);
  } while (rule === "HIGHER_LOWER" && num === threshold);
  return num;
}

function getThreshold(level) {
  return level >= 4 ? 50 : 5;
}

function getCorrectAnswer(num, rule, threshold) {
  if (rule === "ODD_EVEN") {
    return num % 2 === 0 ? "EVEN" : "ODD";
  }
  return num > threshold ? "HIGHER" : "LOWER";
}

export default function OddEvenSwitch({ level, onCorrect, onWrong, isActive }) {
  const [rule, setRule] = useState(RULES[0]);
  const [roundNum, setRoundNum] = useState(0);
  const [number, setNumber] = useState(() => {
    const t = getThreshold(1);
    return generateNumber(1, RULES[0], t);
  });
  const [answered, setAnswered] = useState(false);
  const [showSwitch, setShowSwitch] = useState(false);
  const mountedRef = useRef(true);
  const levelRef = useRef(level);
  const switchEvery = Math.max(3, 5 - Math.floor(level / 3));

  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const threshold = getThreshold(level);
  const correctAnswer = getCorrectAnswer(number, rule, threshold);

  const handleAnswer = useCallback((answer) => {
    if (!isActive || answered) return;
    setAnswered(true);

    if (answer === correctAnswer) {
      onCorrect();
    } else {
      onWrong();
    }

    setTimeout(() => {
      if (!mountedRef.current) return;
      const newRoundNum = roundNum + 1;
      let newRule = rule;

      if (newRoundNum % switchEvery === 0) {
        newRule = rule === "ODD_EVEN" ? "HIGHER_LOWER" : "ODD_EVEN";
        setShowSwitch(true);
        setTimeout(() => { if (mountedRef.current) setShowSwitch(false); }, 600);
      }

      const t = getThreshold(levelRef.current);
      setRule(newRule);
      setRoundNum(newRoundNum);
      setNumber(generateNumber(levelRef.current, newRule, t));
      setAnswered(false);
    }, 300);
  }, [isActive, answered, correctAnswer, roundNum, switchEvery, rule, onCorrect, onWrong]);

  // Keyboard support
  useEffect(() => {
    function handleKey(e) {
      if (!isActive || answered) return;
      if (rule === "ODD_EVEN") {
        if (e.key === "ArrowLeft" || e.key === "o" || e.key === "O") handleAnswer("ODD");
        if (e.key === "ArrowRight" || e.key === "e" || e.key === "E") handleAnswer("EVEN");
      } else {
        if (e.key === "ArrowLeft" || e.key === "l" || e.key === "L") handleAnswer("LOWER");
        if (e.key === "ArrowRight" || e.key === "h" || e.key === "H") handleAnswer("HIGHER");
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isActive, answered, rule, handleAnswer]);

  const btnA = rule === "ODD_EVEN" ? "ODD" : "LOWER";
  const btnB = rule === "ODD_EVEN" ? "EVEN" : "HIGHER";

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 gap-5">
      {/* Rule banner */}
      <AnimatePresence mode="wait">
        <motion.div
          key={rule}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`font-pixel-label text-[10px] px-4 py-2 rounded-[4px] border-[2px] ${
            rule === "ODD_EVEN"
              ? "bg-pixel-blue/20 border-pixel-blue/40 text-pixel-blue"
              : "bg-pixel-orange/20 border-pixel-orange/40 text-pixel-orange"
          }`}
        >
          {rule === "ODD_EVEN" ? "ODD OR EVEN?" : `HIGHER OR LOWER THAN ${threshold}?`}
        </motion.div>
      </AnimatePresence>

      {/* Switch animation */}
      <AnimatePresence>
        {showSwitch && (
          <motion.div
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute font-pixel-label text-lg text-pixel-yellow z-10"
          >
            SWITCH!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Number display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${number}-${roundNum}`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="font-pixel-label text-5xl md:text-7xl text-pixel-cream"
        >
          {number}
        </motion.div>
      </AnimatePresence>

      {/* Answer buttons */}
      <div className="flex gap-4">
        <motion.button
          onClick={() => handleAnswer(btnA)}
          whileTap={{ scale: 0.9 }}
          className="font-pixel-label text-[10px] md:text-xs bg-pixel-purple/60 text-pixel-cream border-[3px] border-pixel-cream/20 rounded-[4px] px-6 py-3 shadow-[3px_3px_0px_0px_#1a1030] hover:border-pixel-cream/40 active:shadow-none active:translate-x-[3px] active:translate-y-[3px] select-none min-w-[90px]"
          disabled={!isActive || answered}
          style={{ touchAction: "manipulation" }}
        >
          {btnA}
        </motion.button>
        <motion.button
          onClick={() => handleAnswer(btnB)}
          whileTap={{ scale: 0.9 }}
          className="font-pixel-label text-[10px] md:text-xs bg-pixel-purple/60 text-pixel-cream border-[3px] border-pixel-cream/20 rounded-[4px] px-6 py-3 shadow-[3px_3px_0px_0px_#1a1030] hover:border-pixel-cream/40 active:shadow-none active:translate-x-[3px] active:translate-y-[3px] select-none min-w-[90px]"
          disabled={!isActive || answered}
          style={{ touchAction: "manipulation" }}
        >
          {btnB}
        </motion.button>
      </div>
    </div>
  );
}
