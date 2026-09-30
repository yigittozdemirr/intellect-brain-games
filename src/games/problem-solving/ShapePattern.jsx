import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { shuffle, pick, randInt } from "../../lib/helpers";

/**
 * ShapePattern — a sequence of colored pixel shapes follows a repeating unit
 * (ABAB, ABCABC, color+shape at higher levels) with the last element missing.
 * Player picks the next one from 4 options; exactly one is consistent.
 */

const SHAPES = ["●", "■", "▲", "♦", "★", "♥"];
const COLORS = ["#ff5c8a", "#5b7cfa", "#4cd964", "#ffd23f", "#c13cff", "#ffa62b"];

function generatePattern(level) {
  // Determine pattern length (AB, ABC, ABCD at higher levels)
  const unitLen = level >= 5 ? randInt(2, 4) : level >= 3 ? randInt(2, 3) : 2;

  // Build the repeating unit
  const unit = [];
  const usedCombos = new Set();
  for (let i = 0; i < unitLen; i++) {
    let shape, color, key;
    do {
      shape = pick(SHAPES);
      color = level >= 3 ? pick(COLORS) : COLORS[0]; // At low levels, only vary shape
      key = `${shape}-${color}`;
    } while (usedCombos.has(key));
    usedCombos.add(key);
    unit.push({ shape, color });
  }

  // Repeat to get visible sequence (at least 2 full cycles + 1 missing)
  const repeatCount = unitLen === 2 ? 3 : 2;
  const fullSeq = [];
  for (let r = 0; r < repeatCount; r++) {
    for (const item of unit) {
      fullSeq.push({ ...item });
    }
  }
  // Add the beginning of the next cycle (the answer)
  fullSeq.push({ ...unit[0] });

  // The answer is the last element
  const answer = fullSeq[fullSeq.length - 1];
  const visible = fullSeq.slice(0, -1);

  // Generate wrong options (different from the answer)
  const wrongOptions = [];
  const answerKey = `${answer.shape}-${answer.color}`;
  const attempts = new Set([answerKey]);
  while (wrongOptions.length < 3) {
    const s = pick(SHAPES);
    const c = level >= 3 ? pick(COLORS) : COLORS[randInt(0, 2)];
    const k = `${s}-${c}`;
    if (!attempts.has(k)) {
      attempts.add(k);
      wrongOptions.push({ shape: s, color: c });
    }
  }

  const options = shuffle([answer, ...wrongOptions]);

  return { visible, answer, options, answerKey };
}

export default function ShapePattern({ level, onCorrect, onWrong, isActive }) {
  const [puzzle, setPuzzle] = useState(() => generatePattern(level));
  const [answered, setAnswered] = useState(false);
  const mountedRef = useRef(true);
  const levelRef = useRef(level);

  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const handleAnswer = useCallback((opt) => {
    if (!isActive || answered) return;
    setAnswered(true);

    const optKey = `${opt.shape}-${opt.color}`;
    if (optKey === puzzle.answerKey) {
      onCorrect();
    } else {
      onWrong();
    }

    setTimeout(() => {
      if (mountedRef.current) {
        setPuzzle(generatePattern(levelRef.current));
        setAnswered(false);
      }
    }, 400);
  }, [isActive, answered, puzzle.answerKey, onCorrect, onWrong]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 gap-5">
      <p className="font-pixel-label text-[9px] text-pixel-cream/50">WHAT COMES NEXT?</p>

      {/* Pattern sequence */}
      <div className="flex items-center gap-1.5 md:gap-2 flex-wrap justify-center">
        {puzzle.visible.map((item, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="w-10 h-10 md:w-12 md:h-12 bg-pixel-purple/40 border-[2px] border-pixel-cream/15 rounded-[4px] flex items-center justify-center text-xl md:text-2xl select-none"
            style={{ color: item.color }}
          >
            {item.shape}
          </motion.div>
        ))}
        {/* Missing slot */}
        <div className="w-10 h-10 md:w-12 md:h-12 border-[2px] border-pixel-cream/20 border-dashed rounded-[4px] flex items-center justify-center font-pixel-label text-lg text-pixel-cream/30">
          ?
        </div>
      </div>

      {/* Options */}
      <div className="flex gap-3 flex-wrap justify-center">
        {puzzle.options.map((opt, i) => (
          <motion.button
            key={`${opt.shape}-${opt.color}-${i}`}
            onClick={() => handleAnswer(opt)}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 md:w-16 md:h-16 bg-pixel-purple/60 border-[3px] border-pixel-cream/20 rounded-[4px] shadow-[3px_3px_0px_0px_#1a1030] hover:border-pixel-cream/40 active:shadow-none active:translate-x-[3px] active:translate-y-[3px] select-none flex items-center justify-center text-2xl md:text-3xl"
            disabled={!isActive || answered}
            style={{ color: opt.color, touchAction: "manipulation" }}
          >
            {opt.shape}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
