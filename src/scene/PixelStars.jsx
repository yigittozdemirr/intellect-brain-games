import { useMemo } from "react";

export default function PixelStars() {
  const stars = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 40; i++) {
      arr.push({
        x: Math.random() * 100,
        y: Math.random() * 55,
        size: Math.random() > 0.7 ? 3 : 2,
        delay: Math.random() * 4,
        duration: 1.5 + Math.random() * 2,
      });
    }
    return arr;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute bg-pixel-cream rounded-none animate-twinkle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            imageRendering: "pixelated",
          }}
        />
      ))}
    </div>
  );
}
