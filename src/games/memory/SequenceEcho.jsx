import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const PAD_COLORS = ["#c13cff", "#5b7cfa", "#ffa62b", "#4cd964", "#ff5c8a", "#ffd23f"];

function getSequenceLength(level) {
  return Math.min(2 + level, 10);
}

function generateSequence(length) {
  const seq = [];
  for (let i = 0; i < length; i++) {
    seq.push(Math.floor(Math.random() * 4));
  }
  return seq;
}

export default function SequenceEcho({ level, onCorrect, onWrong, isActive }) {
  const [phase, setPhase] = useState("showing"); // showing | input | success
  const [sequence, setSequence] = useState(() => generateSequence(getSequenceLength(level)));
  const [activeIdx, setActiveIdx] = useState(-1);
  const [inputIdx, setInputIdx] = useState(0);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);
  const levelRef = useRef(level);

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  // Show sequence
  useEffect(() => {
    if (phase !== "showing" || !isActive) return;
    let i = 0;
    const show = () => {
      if (!mountedRef.current) return;
      if (i >= sequence.length) {
        setActiveIdx(-1);
        setPhase("input");
        return;
      }
      setActiveIdx(sequence[i]);
      timerRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        setActiveIdx(-1);
        i++;
        timerRef.current = setTimeout(show, 200);
      }, Math.max(300, 600 - level * 30));
    };
    timerRef.current = setTimeout(show, 400);
    return () => clearTimeout(timerRef.current);
  }, [phase, sequence, isActive, level]);

  const startNewRound = useCallback(() => {
    const len = getSequenceLength(levelRef.current);
    setSequence(generateSequence(len));
    setInputIdx(0);
    setPhase("showing");
  }, []);

  useEffect(() => { levelRef.current = level; }, [level]);

  const handlePad = useCallback((padIdx) => {
    if (!isActive || phase !== "input") return;

    if (padIdx === sequence[inputIdx]) {
      // Correct pad
      setActiveIdx(padIdx);
      setTimeout(() => mountedRef.current && setActiveIdx(-1), 150);

      if (inputIdx + 1 >= sequence.length) {
        // Full sequence completed
        onCorrect();
        setPhase("success");
        setTimeout(() => {
          if (mountedRef.current) startNewRound();
        }, 500);
      } else {
        setInputIdx((prev) => prev + 1);
      }
    } else {
      onWrong();
      startNewRound();
    }
  }, [isActive, phase, sequence, inputIdx, onCorrect, onWrong, startNewRound]);

  const padColors = PAD_COLORS.slice(0, 4);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 gap-4">
      <p className="font-pixel-label text-[9px] text-pixel-cream/50">
        {phase === "showing" ? "WATCH..." : phase === "input" ? "YOUR TURN!" : "CORRECT!"}
      </p>
      <div className="grid grid-cols-2 gap-3 max-w-[240px] w-full">
        {padColors.map((color, i) => (
          <motion.button
            key={i}
            onClick={() => handlePad(i)}
            whileTap={phase === "input" ? { scale: 0.9 } : {}}
            className="aspect-square rounded-[6px] border-[3px] border-pixel-dark transition-all duration-100 min-h-[60px]"
            style={{
              backgroundColor: activeIdx === i ? color : `${color}33`,
              borderColor: activeIdx === i ? color : "#1a103066",
              boxShadow: activeIdx === i ? `0 0 15px ${color}66` : "3px 3px 0px 0px #1a1030",
              touchAction: "manipulation",
            }}
            disabled={phase !== "input" || !isActive}
          />
        ))}
      </div>
      {/* Progress dots */}
      <div className="flex gap-1.5">
        {sequence.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-sm ${
              i < inputIdx ? "bg-pixel-green" :
              i === inputIdx && phase === "input" ? "bg-pixel-cream" :
              "bg-pixel-cream/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
