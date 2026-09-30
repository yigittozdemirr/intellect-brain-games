import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pick } from "../../lib/helpers";

/**
 * WordFlip — a word is shown; rule alternates every 4-5 rounds between
 * "Is it an ANIMAL?" and "Does it have MORE THAN 5 LETTERS?"
 * Unambiguous word lists only.
 */

// Unambiguous animals (no bat, crane, seal, etc.)
const ANIMALS = [
  "cat","dog","horse","tiger","lion","elephant","giraffe","penguin",
  "dolphin","rabbit","mouse","chicken","monkey","parrot","cobra",
  "lobster","hamster","panda","falcon","leopard","buffalo","gorilla",
];

// Non-animals (clearly not animals)
const NON_ANIMALS = [
  "table","chair","book","pencil","window","garden","bridge","castle",
  "hammer","guitar","mirror","basket","candle","bottle","jacket",
  "pillow","blanket","ladder","bicycle","compass","diamond","kitchen",
];

const ALL_WORDS = [...ANIMALS, ...NON_ANIMALS];
const ANIMAL_SET = new Set(ANIMALS);

const RULES = ["ANIMAL", "LETTERS"];

function generateRound(rule) {
  const word = pick(ALL_WORDS);
  let correctAnswer;
  if (rule === "ANIMAL") {
    correctAnswer = ANIMAL_SET.has(word) ? "YES" : "NO";
  } else {
    correctAnswer = word.length > 5 ? "YES" : "NO";
  }
  return { word, correctAnswer };
}

export default function WordFlip({ level, onCorrect, onWrong, isActive }) {
  const [rule, setRule] = useState(RULES[0]);
  const [roundNum, setRoundNum] = useState(0);
  const [round, setRound] = useState(() => generateRound(RULES[0]));
  const [answered, setAnswered] = useState(false);
  const [showSwitch, setShowSwitch] = useState(false);
  const mountedRef = useRef(true);
  const switchEvery = Math.max(3, 5 - Math.floor(level / 3));

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
      let newRule = rule;

      if (newRoundNum % switchEvery === 0) {
        newRule = rule === "ANIMAL" ? "LETTERS" : "ANIMAL";
        setShowSwitch(true);
        setTimeout(() => { if (mountedRef.current) setShowSwitch(false); }, 600);
      }

      setRule(newRule);
      setRoundNum(newRoundNum);
      setRound(generateRound(newRule));
      setAnswered(false);
    }, 300);
  }, [isActive, answered, round.correctAnswer, roundNum, switchEvery, rule, onCorrect, onWrong]);

  // Keyboard support
  useEffect(() => {
    function handleKey(e) {
      if (!isActive || answered) return;
      if (e.key === "y" || e.key === "Y" || e.key === "ArrowLeft") handleAnswer("YES");
      if (e.key === "n" || e.key === "N" || e.key === "ArrowRight") handleAnswer("NO");
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isActive, answered, handleAnswer]);

  const ruleText = rule === "ANIMAL" ? "IS IT AN ANIMAL?" : "MORE THAN 5 LETTERS?";

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
            rule === "ANIMAL"
              ? "bg-pixel-green/20 border-pixel-green/40 text-pixel-green"
              : "bg-pixel-blue/20 border-pixel-blue/40 text-pixel-blue"
          }`}
        >
          {ruleText}
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

      {/* Word display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${round.word}-${roundNum}`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="font-pixel-label text-2xl md:text-4xl text-pixel-cream tracking-wider uppercase"
        >
          {round.word}
        </motion.div>
      </AnimatePresence>

      {/* YES / NO buttons */}
      <div className="flex gap-4">
        <motion.button
          onClick={() => handleAnswer("YES")}
          whileTap={{ scale: 0.9 }}
          className="font-pixel-label text-sm bg-pixel-green/20 text-pixel-green border-[3px] border-pixel-green/40 rounded-[4px] px-8 py-3 shadow-[3px_3px_0px_0px_#1a1030] hover:bg-pixel-green/30 active:shadow-none active:translate-x-[3px] active:translate-y-[3px] select-none min-w-[90px]"
          disabled={!isActive || answered}
          style={{ touchAction: "manipulation" }}
        >
          YES
        </motion.button>
        <motion.button
          onClick={() => handleAnswer("NO")}
          whileTap={{ scale: 0.9 }}
          className="font-pixel-label text-sm bg-pixel-pink/20 text-pixel-pink border-[3px] border-pixel-pink/40 rounded-[4px] px-8 py-3 shadow-[3px_3px_0px_0px_#1a1030] hover:bg-pixel-pink/30 active:shadow-none active:translate-x-[3px] active:translate-y-[3px] select-none min-w-[90px]"
          disabled={!isActive || answered}
          style={{ touchAction: "manipulation" }}
        >
          NO
        </motion.button>
      </div>
    </div>
  );
}
