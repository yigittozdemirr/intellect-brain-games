import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { randInt } from "../../lib/helpers";

const COLORS = ["#c13cff", "#5b7cfa", "#ffa62b", "#4cd964", "#ff5c8a", "#ffd23f"];

export default function SpeedTap({ level, onCorrect, onWrong, isActive }) {
  const [target, setTarget] = useState(null);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const spawnTarget = useCallback(() => {
    const x = randInt(10, 80);
    const y = randInt(10, 75);
    const size = Math.max(40, 70 - level * 3);
    const color = COLORS[randInt(0, COLORS.length - 1)];
    const lifespan = Math.max(500, 2000 - level * 120);

    setTarget({ x, y, size, color, id: Date.now() });

    // Auto-expire if not tapped
    timerRef.current = setTimeout(() => {
      if (mountedRef.current) {
        onWrong();
        spawnTarget();
      }
    }, lifespan);
  }, [level, onWrong]);

  useEffect(() => {
    if (!isActive) return;
    spawnTarget();
    return () => clearTimeout(timerRef.current);
  }, [isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTap = useCallback(() => {
    if (!isActive || !target) return;
    clearTimeout(timerRef.current);
    onCorrect();
    spawnTarget();
  }, [isActive, target, onCorrect, spawnTarget]);

  return (
    <div className="relative w-full h-full" style={{ touchAction: "manipulation" }}>
      <p className="absolute top-3 left-1/2 -translate-x-1/2 font-pixel-label text-[9px] text-pixel-cream/50">
        TAP THE SQUARE!
      </p>
      <AnimatePresence mode="wait">
        {target && isActive && (
          <motion.button
            key={target.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleTap}
            className="absolute rounded-[4px] border-[3px] border-pixel-dark cursor-pointer shadow-[3px_3px_0px_0px_#1a1030] hover:brightness-110 active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
            style={{
              left: `${target.x}%`,
              top: `${target.y}%`,
              width: target.size,
              height: target.size,
              backgroundColor: target.color,
              touchAction: "manipulation",
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
