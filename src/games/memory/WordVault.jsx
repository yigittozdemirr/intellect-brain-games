import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { shuffle, pick, randInt } from "../../lib/helpers";

/**
 * WordVault — memorize a list of words, then answer YES/NO for each probe.
 * List grows with level. ~Half probes from the list, ~half new.
 */

const WORD_POOL = [
  "apple","bread","chair","dance","eagle","flame","grape","honey","ivory","jewel",
  "knife","lemon","maple","night","ocean","pearl","queen","river","stone","tiger",
  "umbra","vivid","wheat","yacht","zebra","arrow","bloom","coral","delta","ember",
  "frost","globe","haven","index","jolly","karma","lunar","metal","nexus","oasis",
  "prism","quest","reign","solar","tempo","unity","vault","wrath","xenon","yield",
];

function generateList(level) {
  const wordCount = Math.min(3 + level, 8);
  const listWords = shuffle(WORD_POOL).slice(0, wordCount);
  return listWords;
}

function generateProbe(listWords, allUsed) {
  // ~50% chance it's from the list
  const fromList = Math.random() < 0.5;
  if (fromList && listWords.length > 0) {
    return { word: pick(listWords), inList: true };
  }
  // Pick a word NOT in the list and NOT already used as a probe
  const pool = WORD_POOL.filter((w) => !listWords.includes(w) && !allUsed.has(w));
  if (pool.length === 0) return { word: pick(listWords), inList: true };
  return { word: pick(pool), inList: false };
}

export default function WordVault({ level, onCorrect, onWrong, isActive }) {
  const [listWords, setListWords] = useState(() => generateList(level));
  const [phase, setPhase] = useState("memorize"); // "memorize" | "test"
  const [probe, setProbe] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [probeCount, setProbeCount] = useState(0);
  const usedProbesRef = useRef(new Set());
  const timerRef = useRef(null);
  const mountedRef = useRef(true);
  const levelRef = useRef(level);

  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const showTime = Math.max(1500, 3500 - level * 250);
  const probesPerRound = Math.min(listWords.length + 2, 8);

  // Memorize phase timer
  useEffect(() => {
    if (!isActive || phase !== "memorize") return;
    timerRef.current = setTimeout(() => {
      if (mountedRef.current) {
        const p = generateProbe(listWords, usedProbesRef.current);
        usedProbesRef.current.add(p.word);
        setProbe(p);
        setPhase("test");
      }
    }, showTime);
    return () => clearTimeout(timerRef.current);
  }, [isActive, phase, listWords, showTime]);

  const handleAnswer = useCallback((answer) => {
    if (!isActive || answered || !probe) return;
    setAnswered(true);

    const correct = (answer === "yes") === probe.inList;
    if (correct) {
      onCorrect();
    } else {
      onWrong();
    }

    setTimeout(() => {
      if (!mountedRef.current) return;
      setAnswered(false);
      const newCount = probeCount + 1;

      if (newCount >= probesPerRound) {
        // New list
        const newList = generateList(levelRef.current);
        setListWords(newList);
        usedProbesRef.current = new Set();
        setProbeCount(0);
        setPhase("memorize");
        setProbe(null);
      } else {
        // Next probe
        const p = generateProbe(listWords, usedProbesRef.current);
        usedProbesRef.current.add(p.word);
        setProbe(p);
        setProbeCount(newCount);
      }
    }, 300);
  }, [isActive, answered, probe, probeCount, probesPerRound, listWords, onCorrect, onWrong]);

  // Keyboard support
  useEffect(() => {
    function handleKey(e) {
      if (!isActive || answered || phase !== "test") return;
      if (e.key === "y" || e.key === "Y" || e.key === "ArrowLeft") handleAnswer("yes");
      if (e.key === "n" || e.key === "N" || e.key === "ArrowRight") handleAnswer("no");
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isActive, answered, phase, handleAnswer]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 gap-5">
      {phase === "memorize" ? (
        <>
          <p className="font-pixel-label text-[9px] text-pixel-cream/50">MEMORIZE THESE WORDS</p>
          <div className="flex flex-wrap gap-2 justify-center max-w-sm">
            {listWords.map((word, i) => (
              <motion.div
                key={word}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className="bg-pixel-magenta/15 border-[2px] border-pixel-magenta/30 rounded-[4px] px-3 py-2"
              >
                <span className="font-pixel-label text-[10px] text-pixel-cream uppercase">{word}</span>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="font-pixel-label text-[9px] text-pixel-cream/50">WAS THIS WORD IN THE LIST?</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={probe?.word}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="font-pixel-label text-2xl md:text-3xl text-pixel-cream tracking-wider uppercase"
            >
              {probe?.word}
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-4">
            <motion.button
              onClick={() => handleAnswer("yes")}
              whileTap={{ scale: 0.9 }}
              className="font-pixel-label text-sm bg-pixel-green/20 text-pixel-green border-[3px] border-pixel-green/40 rounded-[4px] px-8 py-3 shadow-[3px_3px_0px_0px_#1a1030] hover:bg-pixel-green/30 active:shadow-none active:translate-x-[3px] active:translate-y-[3px] select-none min-w-[90px]"
              disabled={!isActive || answered}
              style={{ touchAction: "manipulation" }}
            >
              YES
            </motion.button>
            <motion.button
              onClick={() => handleAnswer("no")}
              whileTap={{ scale: 0.9 }}
              className="font-pixel-label text-sm bg-pixel-pink/20 text-pixel-pink border-[3px] border-pixel-pink/40 rounded-[4px] px-8 py-3 shadow-[3px_3px_0px_0px_#1a1030] hover:bg-pixel-pink/30 active:shadow-none active:translate-x-[3px] active:translate-y-[3px] select-none min-w-[90px]"
              disabled={!isActive || answered}
              style={{ touchAction: "manipulation" }}
            >
              NO
            </motion.button>
          </div>

          <p className="font-pixel-label text-[7px] text-pixel-cream/30">
            {probeCount + 1} / {probesPerRound}
          </p>
        </>
      )}
    </div>
  );
}
