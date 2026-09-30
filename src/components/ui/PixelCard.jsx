import { useState } from "react";
import { motion } from "framer-motion";

const colorMap = {
  magenta: { bg: "bg-pixel-magenta/15", border: "border-pixel-magenta/40", tag: "text-pixel-magenta" },
  orange:  { bg: "bg-pixel-orange/15",  border: "border-pixel-orange/40",  tag: "text-pixel-orange" },
  blue:    { bg: "bg-pixel-blue/15",    border: "border-pixel-blue/40",    tag: "text-pixel-blue" },
  green:   { bg: "bg-pixel-green/15",   border: "border-pixel-green/40",   tag: "text-pixel-green" },
  yellow:  { bg: "bg-pixel-yellow/15",  border: "border-pixel-yellow/40",  tag: "text-pixel-yellow" },
  pink:    { bg: "bg-pixel-pink/15",    border: "border-pixel-pink/40",    tag: "text-pixel-pink" },
};

const icons = {
  "memory-match": (
    <svg width="32" height="32" viewBox="0 0 16 16" shapeRendering="crispEdges" className="pixel-art">
      <rect x="2" y="2" width="5" height="6" fill="#c13cff" />
      <rect x="9" y="2" width="5" height="6" fill="#c13cff" opacity="0.5" />
      <rect x="2" y="9" width="5" height="5" fill="#c13cff" opacity="0.5" />
      <rect x="9" y="9" width="5" height="5" fill="#c13cff" />
      <rect x="4" y="3" width="1" height="1" fill="#fff3d6" />
      <rect x="11" y="10" width="1" height="1" fill="#fff3d6" />
    </svg>
  ),
  "speed-tap": (
    <svg width="32" height="32" viewBox="0 0 16 16" shapeRendering="crispEdges" className="pixel-art">
      <rect x="6" y="1" width="4" height="2" fill="#ffa62b" />
      <rect x="5" y="3" width="6" height="2" fill="#ffa62b" />
      <rect x="7" y="5" width="2" height="6" fill="#ffa62b" />
      <rect x="4" y="11" width="8" height="2" fill="#ffa62b" />
      <rect x="3" y="13" width="10" height="2" fill="#ffd23f" />
    </svg>
  ),
  "focus-finder": (
    <svg width="32" height="32" viewBox="0 0 16 16" shapeRendering="crispEdges" className="pixel-art">
      <rect x="5" y="2" width="6" height="1" fill="#5b7cfa" />
      <rect x="3" y="3" width="2" height="1" fill="#5b7cfa" />
      <rect x="11" y="3" width="2" height="1" fill="#5b7cfa" />
      <rect x="2" y="4" width="1" height="4" fill="#5b7cfa" />
      <rect x="13" y="4" width="1" height="4" fill="#5b7cfa" />
      <rect x="3" y="8" width="2" height="1" fill="#5b7cfa" />
      <rect x="11" y="8" width="2" height="1" fill="#5b7cfa" />
      <rect x="5" y="9" width="6" height="1" fill="#5b7cfa" />
      <rect x="7" y="5" width="2" height="2" fill="#fff3d6" />
      <rect x="10" y="10" width="2" height="2" fill="#5b7cfa" />
      <rect x="12" y="12" width="2" height="2" fill="#5b7cfa" />
    </svg>
  ),
  "number-rush": (
    <svg width="32" height="32" viewBox="0 0 16 16" shapeRendering="crispEdges" className="pixel-art">
      <rect x="3" y="3" width="3" height="1" fill="#4cd964" />
      <rect x="5" y="4" width="1" height="4" fill="#4cd964" />
      <rect x="3" y="8" width="3" height="1" fill="#4cd964" />
      <rect x="8" y="3" width="1" height="1" fill="#fff3d6" />
      <rect x="10" y="3" width="3" height="1" fill="#4cd964" />
      <rect x="12" y="4" width="1" height="2" fill="#4cd964" />
      <rect x="10" y="6" width="3" height="1" fill="#4cd964" />
      <rect x="10" y="7" width="1" height="2" fill="#4cd964" />
      <rect x="10" y="9" width="3" height="1" fill="#4cd964" />
    </svg>
  ),
  "pattern-recall": (
    <svg width="32" height="32" viewBox="0 0 16 16" shapeRendering="crispEdges" className="pixel-art">
      <rect x="2" y="2" width="3" height="3" fill="#ffd23f" />
      <rect x="6" y="2" width="3" height="3" fill="#ffd23f" opacity="0.4" />
      <rect x="10" y="2" width="3" height="3" fill="#ffd23f" />
      <rect x="2" y="6" width="3" height="3" fill="#ffd23f" opacity="0.4" />
      <rect x="6" y="6" width="3" height="3" fill="#ffd23f" />
      <rect x="10" y="6" width="3" height="3" fill="#ffd23f" opacity="0.4" />
      <rect x="2" y="10" width="3" height="3" fill="#ffd23f" />
      <rect x="6" y="10" width="3" height="3" fill="#ffd23f" opacity="0.4" />
      <rect x="10" y="10" width="3" height="3" fill="#ffd23f" />
    </svg>
  ),
  "word-flip": (
    <svg width="32" height="32" viewBox="0 0 16 16" shapeRendering="crispEdges" className="pixel-art">
      <rect x="2" y="4" width="1" height="5" fill="#ff5c8a" />
      <rect x="3" y="4" width="1" height="1" fill="#ff5c8a" />
      <rect x="4" y="5" width="1" height="1" fill="#ff5c8a" />
      <rect x="3" y="6" width="1" height="1" fill="#ff5c8a" />
      <rect x="2" y="9" width="1" height="3" fill="#ff5c8a" />
      <rect x="6" y="3" width="4" height="1" fill="#ff5c8a" />
      <rect x="7" y="4" width="2" height="6" fill="#ff5c8a" />
      <rect x="6" y="10" width="4" height="1" fill="#ff5c8a" />
      <rect x="11" y="4" width="1" height="5" fill="#ff5c8a" />
      <rect x="12" y="4" width="1" height="1" fill="#ff5c8a" />
      <rect x="13" y="5" width="1" height="3" fill="#ff5c8a" />
      <rect x="12" y="8" width="1" height="1" fill="#ff5c8a" />
    </svg>
  ),
};

export default function PixelCard({ game, isLoggedIn }) {
  const [shaking, setShaking] = useState(false);
  const c = colorMap[game.color] || colorMap.magenta;

  function handleClick() {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  }

  return (
    <motion.button
      onClick={handleClick}
      animate={shaking ? { x: [0, -4, 4, -4, 4, -2, 2, 0] } : {}}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      className={`
        relative text-left w-full
        ${c.bg} border-[3px] ${c.border} rounded-[6px]
        p-4 md:p-5
        shadow-[4px_4px_0px_0px_rgba(26,16,48,0.6)]
        hover:shadow-[6px_6px_0px_0px_rgba(26,16,48,0.6)]
        transition-shadow duration-150
        cursor-pointer select-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pixel-magenta
      `}
    >
      {/* Badge */}
      <div className="absolute top-2 right-2 font-pixel-label text-[8px] md:text-[9px] bg-pixel-dark/70 text-pixel-cream/80 border border-pixel-cream/20 rounded px-1.5 py-0.5 flex items-center gap-1">
        {isLoggedIn ? (
          <>✦ Coming soon</>
        ) : (
          <>🔒 Log in to play</>
        )}
      </div>

      {/* Icon */}
      <div className="mb-3">{icons[game.id]}</div>

      {/* Name */}
      <h3 className="font-pixel-label text-xs md:text-sm text-pixel-cream mb-1">
        {game.name}
      </h3>

      {/* Description */}
      <p className="font-pixel-body text-xs text-pixel-cream/60 mb-3 leading-relaxed">
        {game.description}
      </p>

      {/* Skill tag */}
      <span
        className={`font-pixel-label text-[9px] md:text-[10px] ${c.tag} border ${c.border} rounded px-2 py-0.5`}
      >
        {game.skill}
      </span>
    </motion.button>
  );
}
