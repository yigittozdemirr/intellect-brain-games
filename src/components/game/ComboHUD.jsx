import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatNumber } from "../../lib/helpers";
import { COMBO_PER_MULT, MAX_MULT } from "../../lib/scoring";

/**
 * Combo HUD — Balatro-style chips x mult display.
 * Shows: combo counter, chips badge, mult badge, score popups, total score.
 */
export default function ComboHUD({ gameState, lastFx, totalScore }) {
  const [displayScore, setDisplayScore] = useState(totalScore);
  const [popups, setPopups] = useState([]);
  const popupId = useRef(0);

  // Rolling score counter
  useEffect(() => {
    if (displayScore === totalScore) return;
    const diff = totalScore - displayScore;
    const step = Math.max(1, Math.ceil(Math.abs(diff) / 15));
    const timer = setTimeout(() => {
      setDisplayScore((prev) => {
        if (Math.abs(totalScore - prev) <= step) return totalScore;
        return prev + (diff > 0 ? step : -step);
      });
    }, 20);
    return () => clearTimeout(timer);
  }, [displayScore, totalScore]);

  // Score popup when fx fires
  useEffect(() => {
    if (!lastFx || !lastFx.points) return;
    const id = ++popupId.current;
    setPopups((prev) => [...prev, { id, ...lastFx }]);
    const timer = setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== id));
    }, 1200);
    return () => clearTimeout(timer);
  }, [lastFx]);

  const combo = gameState.combo;
  const mult = lastFx?.mult || 1;
  const comboProgress = (combo % COMBO_PER_MULT) / COMBO_PER_MULT;
  const isOnFire = combo >= 9;

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      {/* Chips x Mult badges */}
      <div className="flex items-center gap-2">
        {/* Chips badge */}
        <motion.div
          key={`chips-${lastFx?.chips}`}
          animate={lastFx?.chips ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.2 }}
          className="bg-pixel-blue border-2 border-pixel-dark rounded-[3px] px-2.5 py-1 shadow-[2px_2px_0px_0px_#1a1030]"
        >
          <span className="font-pixel-label text-[9px] md:text-[10px] text-pixel-cream">
            {lastFx?.chips || 100}
          </span>
        </motion.div>

        <span className="font-pixel-label text-xs text-pixel-cream/60">×</span>

        {/* Mult badge */}
        <motion.div
          key={`mult-${mult}`}
          animate={lastFx?.multUp ? { scale: [1, 1.3, 1], rotate: [0, -3, 3, 0] } : { scale: [1, 1.1, 1] }}
          transition={{ duration: 0.3 }}
          className="bg-pixel-orange border-2 border-pixel-dark rounded-[3px] px-2.5 py-1 shadow-[2px_2px_0px_0px_#1a1030] relative"
        >
          <span className="font-pixel-label text-[9px] md:text-[10px] text-pixel-dark">
            x{mult}
          </span>
          {/* MULT UP flash */}
          <AnimatePresence>
            {lastFx?.multUp && (
              <motion.div
                initial={{ opacity: 1, y: 0, scale: 0.8 }}
                animate={{ opacity: 0, y: -20, scale: 1.2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-pixel-label text-[8px] text-pixel-yellow"
              >
                MULT UP!
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Combo counter + mult progress bar */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <motion.span
            key={combo}
            animate={combo > 0 ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.15 }}
            className={`font-pixel-label text-[9px] ${isOnFire ? "text-pixel-orange" : "text-pixel-cream/70"}`}
          >
            {isOnFire && "🔥"} COMBO {combo}
          </motion.span>
        </div>
        {/* Mult progress bar */}
        <div className="w-16 h-2 bg-pixel-dark/60 border border-pixel-cream/20 rounded-sm overflow-hidden">
          <motion.div
            className="h-full bg-pixel-magenta"
            animate={{ width: `${comboProgress * 100}%` }}
            transition={{ duration: 0.15 }}
          />
        </div>
        <span className="font-pixel-label text-[8px] text-pixel-cream/40">
          x{Math.min(mult + 1, MAX_MULT)}
        </span>
      </div>

      {/* Total score */}
      <motion.div
        animate={lastFx?.points ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.2 }}
        className="font-pixel-label text-lg md:text-xl text-pixel-cream"
      >
        {formatNumber(displayScore)}
      </motion.div>

      {/* Score popups */}
      <div className="relative h-0">
        <AnimatePresence>
          {popups.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, y: 0, scale: 0.8 }}
              animate={{ opacity: 0, y: -40, scale: 1.1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-pixel-label text-xs"
              style={{
                color: p.tier === "rainbow" ? "#c13cff" : p.tier,
                textShadow: p.tier === "rainbow" ? "0 0 8px #c13cff" : "none",
              }}
            >
              +{formatNumber(p.points)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
