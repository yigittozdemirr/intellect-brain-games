import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

let particleId = 0;

/**
 * Pixel-square particle burst effect.
 * Call spawnBurst(x, y, color) to create particles.
 * Renders as an overlay of animated pixel squares.
 */
export function useParticles() {
  const [particles, setParticles] = useState([]);

  const spawnBurst = useCallback((x, y, color = "#ffd23f", count = 8) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 40 + Math.random() * 60;
      newParticles.push({
        id: ++particleId,
        x,
        y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed - 30, // slight upward bias
        size: 3 + Math.random() * 4,
        color,
        life: 400 + Math.random() * 200,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
    // Auto cleanup
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.includes(p)));
    }, 700);
  }, []);

  const spawnConfetti = useCallback((centerX, centerY) => {
    const colors = ["#ffa62b", "#ffd23f", "#c13cff", "#5b7cfa", "#ff5c8a", "#4cd964", "#fff3d6"];
    const newParticles = [];
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100;
      newParticles.push({
        id: ++particleId,
        x: centerX,
        y: centerY,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed - 60,
        size: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 600 + Math.random() * 400,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.includes(p)));
    }, 1100);
  }, []);

  return { particles, spawnBurst, spawnConfetti };
}

export function ParticleLayer({ particles }) {
  // Check reduced motion preference
  const prefersReduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches,
    []
  );

  if (prefersReduced || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute"
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              imageRendering: "pixelated",
            }}
            initial={{ opacity: 1, x: 0, y: 0 }}
            animate={{ opacity: 0, x: p.dx, y: p.dy }}
            exit={{ opacity: 0 }}
            transition={{ duration: p.life / 1000, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
