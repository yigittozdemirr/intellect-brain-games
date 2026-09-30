import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { shuffle, randInt } from "../../lib/helpers";

/**
 * HeadCount — colored blobs bounce around for ~3s. Player counts blobs of the
 * TARGET color, then picks the count from 4 options. More blobs and distractor
 * colors with level.
 */

const BLOB_COLORS = [
  { name: "RED",    hex: "#ff5c8a" },
  { name: "BLUE",   hex: "#5b7cfa" },
  { name: "GREEN",  hex: "#4cd964" },
  { name: "YELLOW", hex: "#ffd23f" },
  { name: "PURPLE", hex: "#c13cff" },
];

function generateRound(level) {
  const colorCount = Math.min(2 + Math.floor(level / 2), BLOB_COLORS.length);
  const usedColors = shuffle(BLOB_COLORS).slice(0, colorCount);
  const targetColor = usedColors[0];

  const targetCount = randInt(2, Math.min(3 + level, 8));
  const distractorTotal = randInt(2, Math.min(3 + level * 2, 12));

  const blobs = [];
  // Target blobs
  for (let i = 0; i < targetCount; i++) {
    blobs.push({
      id: i,
      color: targetColor,
      x: randInt(10, 80),
      y: randInt(10, 70),
      dx: (Math.random() - 0.5) * 2,
      dy: (Math.random() - 0.5) * 2,
    });
  }
  // Distractor blobs
  const distractorColors = usedColors.slice(1);
  for (let i = 0; i < distractorTotal; i++) {
    const col = distractorColors[i % distractorColors.length];
    blobs.push({
      id: targetCount + i,
      color: col,
      x: randInt(10, 80),
      y: randInt(10, 70),
      dx: (Math.random() - 0.5) * 2,
      dy: (Math.random() - 0.5) * 2,
    });
  }

  // Generate options (always include correct answer)
  const optionSet = new Set([targetCount]);
  while (optionSet.size < 4) {
    const off = randInt(1, 3);
    const candidate = Math.random() > 0.5 ? targetCount + off : Math.max(0, targetCount - off);
    optionSet.add(candidate);
  }
  const options = shuffle([...optionSet]);

  const watchTime = Math.max(2000, 3500 - level * 150);

  return { blobs: shuffle(blobs), targetColor, targetCount, options, watchTime };
}

export default function HeadCount({ level, onCorrect, onWrong, isActive }) {
  const [round, setRound] = useState(() => generateRound(level));
  const [phase, setPhase] = useState("watch"); // "watch" | "answer"
  const [answered, setAnswered] = useState(false);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);
  const levelRef = useRef(level);

  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  // Watch phase timer
  useEffect(() => {
    if (!isActive || phase !== "watch") return;
    timerRef.current = setTimeout(() => {
      if (mountedRef.current) setPhase("answer");
    }, round.watchTime);
    return () => clearTimeout(timerRef.current);
  }, [isActive, phase, round]);

  const handleAnswer = useCallback((val) => {
    if (!isActive || answered || phase !== "answer") return;
    setAnswered(true);

    if (val === round.targetCount) {
      onCorrect();
    } else {
      onWrong();
    }

    setTimeout(() => {
      if (mountedRef.current) {
        setRound(generateRound(levelRef.current));
        setPhase("watch");
        setAnswered(false);
      }
    }, 400);
  }, [isActive, answered, phase, round.targetCount, onCorrect, onWrong]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      {/* Target indicator */}
      <div className="flex items-center gap-2 bg-pixel-dark/60 border border-pixel-cream/20 rounded px-3 py-1.5">
        <span className="font-pixel-label text-[9px] text-pixel-cream/50">COUNT:</span>
        <span className="text-lg" style={{ color: round.targetColor.hex }}>●</span>
        <span className="font-pixel-label text-[9px]" style={{ color: round.targetColor.hex }}>
          {round.targetColor.name}
        </span>
      </div>

      {phase === "watch" ? (
        /* Blob arena */
        <div className="relative w-full max-w-sm h-48 md:h-64 bg-pixel-dark/40 border-[2px] border-pixel-cream/10 rounded-[6px] overflow-hidden">
          {round.blobs.map((blob) => (
            <motion.div
              key={blob.id}
              initial={{ x: `${blob.x}%`, y: `${blob.y}%` }}
              animate={{
                x: [`${blob.x}%`, `${(blob.x + blob.dx * 30 + 100) % 80 + 5}%`, `${(blob.x + blob.dx * 15 + 100) % 80 + 5}%`, `${blob.x}%`],
                y: [`${blob.y}%`, `${(blob.y + blob.dy * 25 + 100) % 70 + 5}%`, `${(blob.y + blob.dy * 40 + 100) % 70 + 5}%`, `${blob.y}%`],
              }}
              transition={{ duration: round.watchTime / 1000, ease: "linear", repeat: 0 }}
              className="absolute w-6 h-6 md:w-8 md:h-8 rounded-full"
              style={{
                backgroundColor: blob.color.hex,
                boxShadow: `0 0 8px ${blob.color.hex}60`,
              }}
            />
          ))}
        </div>
      ) : (
        /* Answer phase */
        <>
          <p className="font-pixel-label text-[9px] text-pixel-cream/50">
            HOW MANY <span style={{ color: round.targetColor.hex }}>{round.targetColor.name}</span> BLOBS?
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            {round.options.map((opt) => (
              <motion.button
                key={opt}
                onClick={() => handleAnswer(opt)}
                whileTap={{ scale: 0.9 }}
                className="w-16 h-16 md:w-18 md:h-18 font-pixel-label text-lg bg-pixel-purple/60 text-pixel-cream border-[3px] border-pixel-cream/20 rounded-[4px] shadow-[3px_3px_0px_0px_#1a1030] hover:border-pixel-cream/40 active:shadow-none active:translate-x-[3px] active:translate-y-[3px] select-none"
                disabled={!isActive || answered}
                style={{ touchAction: "manipulation" }}
              >
                {opt}
              </motion.button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
