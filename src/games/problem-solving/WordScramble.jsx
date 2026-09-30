import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { shuffle, pick } from "../../lib/helpers";
import { getWordsForLevel } from "../../lib/words";

function generatePuzzle(level) {
  const { words } = getWordsForLevel(level);
  const word = pick(words).toUpperCase();
  let scrambled;
  let attempts = 0;
  do {
    scrambled = shuffle(word.split("")).join("");
    attempts++;
  } while (scrambled === word && attempts < 20);
  return { word, scrambled };
}

export default function WordScramble({ level, onCorrect, onWrong, isActive }) {
  const [puzzle, setPuzzle] = useState(() => generatePuzzle(level));
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const mountedRef = useRef(true);
  const levelRef = useRef(level);

  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  useEffect(() => {
    if (isActive) inputRef.current?.focus();
  }, [isActive, puzzle]);

  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    if (!isActive) return;
    if (input.toUpperCase().trim() === puzzle.word) {
      onCorrect();
    } else {
      onWrong();
    }
    setTimeout(() => {
      if (mountedRef.current) {
        setPuzzle(generatePuzzle(levelRef.current));
        setInput("");
      }
    }, 300);
  }, [isActive, input, puzzle.word, onCorrect, onWrong]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 gap-5">
      <p className="font-pixel-label text-[9px] text-pixel-cream/50">UNSCRAMBLE THE WORD</p>

      <AnimatePresence mode="wait">
        <motion.div
          key={puzzle.scrambled}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="flex gap-1.5 md:gap-2"
        >
          {puzzle.scrambled.split("").map((letter, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="w-10 h-12 md:w-12 md:h-14 bg-pixel-pink/15 border-[2px] border-pixel-pink/30 rounded-[4px] flex items-center justify-center font-pixel-label text-base md:text-lg text-pixel-cream"
            >
              {letter}
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3 w-full max-w-xs">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, puzzle.word.length))}
          maxLength={puzzle.word.length}
          placeholder={`${puzzle.word.length} letters`}
          className="w-full text-center font-pixel-label text-xl bg-pixel-dark/80 text-pixel-cream border-[3px] border-pixel-cream/30 rounded-[4px] px-4 py-3 focus:border-pixel-magenta focus:outline-none tracking-[0.2em] uppercase placeholder:text-pixel-cream/20"
          autoComplete="off"
          style={{ touchAction: "manipulation" }}
        />
        <button
          type="submit"
          disabled={input.length !== puzzle.word.length}
          className="font-pixel-body text-sm bg-pixel-orange text-pixel-dark border-[3px] border-pixel-dark rounded-[4px] px-6 py-2 shadow-[3px_3px_0px_0px_#1a1030] hover:bg-pixel-yellow active:shadow-none active:translate-x-[3px] active:translate-y-[3px] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          SUBMIT
        </button>
      </form>
    </div>
  );
}
