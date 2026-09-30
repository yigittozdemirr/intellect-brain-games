import { motion } from "framer-motion";
import { formatNumber } from "../../lib/helpers";

const colorMap = {
  magenta: { bg: "bg-pixel-magenta/10", border: "border-pixel-magenta/30", tag: "text-pixel-magenta", tagBorder: "border-pixel-magenta/30" },
  orange:  { bg: "bg-pixel-orange/10",  border: "border-pixel-orange/30",  tag: "text-pixel-orange",  tagBorder: "border-pixel-orange/30" },
  blue:    { bg: "bg-pixel-blue/10",    border: "border-pixel-blue/30",    tag: "text-pixel-blue",    tagBorder: "border-pixel-blue/30" },
  green:   { bg: "bg-pixel-green/10",   border: "border-pixel-green/30",   tag: "text-pixel-green",   tagBorder: "border-pixel-green/30" },
  yellow:  { bg: "bg-pixel-yellow/10",  border: "border-pixel-yellow/30",  tag: "text-pixel-yellow",  tagBorder: "border-pixel-yellow/30" },
  pink:    { bg: "bg-pixel-pink/10",    border: "border-pixel-pink/30",    tag: "text-pixel-pink",    tagBorder: "border-pixel-pink/30" },
};

/**
 * Game card for the Games screen.
 * Shows icon, name, description, skill tag, best score or NEW badge.
 * Logged out: lock badge, clicking navigates to Login.
 * Logged in: playable, clicking opens the game.
 */
export default function GameCard({ game, isLoggedIn, stats, onPlay, onLogin }) {
  const c = colorMap[game.color] || colorMap.magenta;
  const hasBest = stats && stats.bestScore > 0;

  function handleClick() {
    if (isLoggedIn) {
      onPlay();
    } else {
      onLogin();
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ y: -4 }}
      whileTap={{ y: 1 }}
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
          hasBest ? (
            <>⭐ {formatNumber(stats.bestScore)}</>
          ) : (
            <span className="text-pixel-yellow">✦ NEW</span>
          )
        ) : (
          <>🔒 Log in to play</>
        )}
      </div>

      {/* Icon */}
      <div className="text-2xl mb-2">{game.icon}</div>

      {/* Name */}
      <h3 className="font-pixel-label text-[10px] md:text-xs text-pixel-cream mb-1">
        {game.name}
      </h3>

      {/* Description */}
      <p className="font-pixel-body text-[11px] text-pixel-cream/55 mb-3 leading-relaxed">
        {game.description}
      </p>

      {/* Skill tag */}
      <span
        className={`font-pixel-label text-[8px] md:text-[9px] ${c.tag} border ${c.tagBorder} rounded px-2 py-0.5`}
      >
        {game.category}
      </span>
    </motion.button>
  );
}
