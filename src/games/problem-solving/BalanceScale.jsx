import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { shuffle, randInt } from "../../lib/helpers";

/**
 * BalanceScale — two pans each show a small sum. Player chooses LEFT heavier,
 * RIGHT heavier, or EQUAL (~25% of rounds). Animate scale tilting. Terms and
 * numbers grow with level.
 */

function generateRound(level) {
  const termCount = level >= 5 ? 3 : 2;
  const maxVal = Math.min(5 + level * 3, 30);
  const forceEqual = Math.random() < 0.25;

  // Generate left side
  const leftTerms = [];
  for (let i = 0; i < termCount; i++) {
    leftTerms.push(randInt(1, maxVal));
  }
  const leftSum = leftTerms.reduce((a, b) => a + b, 0);

  // Generate right side
  let rightTerms;
  if (forceEqual) {
    // Make right side equal
    rightTerms = [];
    let remaining = leftSum;
    for (let i = 0; i < termCount - 1; i++) {
      const val = randInt(1, Math.max(1, remaining - (termCount - 1 - i)));
      rightTerms.push(val);
      remaining -= val;
    }
    rightTerms.push(Math.max(1, remaining));
  } else {
    rightTerms = [];
    for (let i = 0; i < termCount; i++) {
      rightTerms.push(randInt(1, maxVal));
    }
    // Make sure they're NOT equal
    const rightSum = rightTerms.reduce((a, b) => a + b, 0);
    if (rightSum === leftSum) {
      rightTerms[0] += (Math.random() > 0.5 ? 1 : -1);
      if (rightTerms[0] < 1) rightTerms[0] = 2;
    }
  }

  const rightSum = rightTerms.reduce((a, b) => a + b, 0);
  const correctAnswer = leftSum > rightSum ? "LEFT" : leftSum < rightSum ? "RIGHT" : "EQUAL";

  return {
    leftTerms,
    rightTerms,
    leftSum,
    rightSum,
    correctAnswer,
    leftExpr: leftTerms.join(" + "),
    rightExpr: rightTerms.join(" + "),
  };
}

export default function BalanceScale({ level, onCorrect, onWrong, isActive }) {
  const [round, setRound] = useState(() => generateRound(level));
  const [answered, setAnswered] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const mountedRef = useRef(true);
  const levelRef = useRef(level);

  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const handleAnswer = useCallback((answer) => {
    if (!isActive || answered) return;
    setAnswered(true);
    setShowResult(true);

    if (answer === round.correctAnswer) {
      onCorrect();
    } else {
      onWrong();
    }

    setTimeout(() => {
      if (mountedRef.current) {
        setRound(generateRound(levelRef.current));
        setAnswered(false);
        setShowResult(false);
      }
    }, 800);
  }, [isActive, answered, round.correctAnswer, onCorrect, onWrong]);

  // Keyboard support
  useEffect(() => {
    function handleKey(e) {
      if (!isActive || answered) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); handleAnswer("LEFT"); }
      if (e.key === "ArrowRight") { e.preventDefault(); handleAnswer("RIGHT"); }
      if (e.key === "ArrowDown" || e.key === "=" || e.key === "e" || e.key === "E") {
        e.preventDefault();
        handleAnswer("EQUAL");
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isActive, answered, handleAnswer]);

  // Scale tilt angle for animation
  const tiltAngle = showResult
    ? round.correctAnswer === "LEFT" ? -8 : round.correctAnswer === "RIGHT" ? 8 : 0
    : 0;

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 gap-4">
      <p className="font-pixel-label text-[9px] text-pixel-cream/50">WHICH SIDE IS HEAVIER?</p>

      {/* Balance scale visual */}
      <div className="relative w-full max-w-sm">
        {/* Beam */}
        <motion.div
          animate={{ rotate: tiltAngle }}
          transition={{ duration: 0.4, type: "spring" }}
          className="flex items-end justify-between px-2"
          style={{ transformOrigin: "center bottom" }}
        >
          {/* Left pan */}
          <div className="flex-1 mr-2">
            <div className="bg-pixel-blue/15 border-[2px] border-pixel-blue/30 rounded-[4px] p-3 text-center">
              <span className="font-pixel-label text-base md:text-lg text-pixel-cream">{round.leftExpr}</span>
            </div>
            <div className="h-8 w-[2px] bg-pixel-cream/20 mx-auto" />
          </div>

          {/* Fulcrum */}
          <div className="flex flex-col items-center mx-1">
            <div className="w-3 h-3 bg-pixel-cream/30 rotate-45 mb-1" />
            <div className="w-6 h-1 bg-pixel-cream/20" />
          </div>

          {/* Right pan */}
          <div className="flex-1 ml-2">
            <div className="bg-pixel-orange/15 border-[2px] border-pixel-orange/30 rounded-[4px] p-3 text-center">
              <span className="font-pixel-label text-base md:text-lg text-pixel-cream">{round.rightExpr}</span>
            </div>
            <div className="h-8 w-[2px] bg-pixel-cream/20 mx-auto" />
          </div>
        </motion.div>

        {/* Base */}
        <div className="w-16 h-2 bg-pixel-cream/15 rounded-sm mx-auto" />
      </div>

      {/* Answer buttons */}
      <div className="flex gap-3 flex-wrap justify-center">
        <motion.button
          onClick={() => handleAnswer("LEFT")}
          whileTap={{ scale: 0.9 }}
          className="font-pixel-label text-[10px] md:text-xs bg-pixel-blue/15 text-pixel-blue border-[3px] border-pixel-blue/30 rounded-[4px] px-5 py-2.5 shadow-[3px_3px_0px_0px_#1a1030] hover:border-pixel-blue/50 active:shadow-none active:translate-x-[3px] active:translate-y-[3px] select-none min-w-[80px]"
          disabled={!isActive || answered}
          style={{ touchAction: "manipulation" }}
        >
          ← LEFT
        </motion.button>
        <motion.button
          onClick={() => handleAnswer("EQUAL")}
          whileTap={{ scale: 0.9 }}
          className="font-pixel-label text-[10px] md:text-xs bg-pixel-yellow/15 text-pixel-yellow border-[3px] border-pixel-yellow/30 rounded-[4px] px-5 py-2.5 shadow-[3px_3px_0px_0px_#1a1030] hover:border-pixel-yellow/50 active:shadow-none active:translate-x-[3px] active:translate-y-[3px] select-none min-w-[80px]"
          disabled={!isActive || answered}
          style={{ touchAction: "manipulation" }}
        >
          = EQUAL
        </motion.button>
        <motion.button
          onClick={() => handleAnswer("RIGHT")}
          whileTap={{ scale: 0.9 }}
          className="font-pixel-label text-[10px] md:text-xs bg-pixel-orange/15 text-pixel-orange border-[3px] border-pixel-orange/30 rounded-[4px] px-5 py-2.5 shadow-[3px_3px_0px_0px_#1a1030] hover:border-pixel-orange/50 active:shadow-none active:translate-x-[3px] active:translate-y-[3px] select-none min-w-[80px]"
          disabled={!isActive || answered}
          style={{ touchAction: "manipulation" }}
        >
          RIGHT →
        </motion.button>
      </div>
    </div>
  );
}
