import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import PixelButton from "../components/ui/PixelButton";
import { GAME_REGISTRY, CATEGORIES } from "../games/registry";
import { useAuth } from "../context/AuthContext";
import { getGameStats } from "../lib/progress";
import { SITE_NAME } from "../constants";
import GameCard from "../components/ui/GameCard";

const ALL_TAB = { id: "All", color: "cream", icon: "🎮" };
const TABS = [ALL_TAB, ...CATEGORIES];

export default function GamesScreen({ onNavigate }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("All");

  const filteredGames = useMemo(() => {
    if (activeTab === "All") return GAME_REGISTRY;
    return GAME_REGISTRY.filter((g) => g.category === activeTab);
  }, [activeTab]);

  return (
    <motion.div
      className="min-h-screen px-4 py-6 md:py-10"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="font-pixel-label text-sm md:text-lg text-pixel-cream">
              {SITE_NAME} GAMES
            </h2>
            <p className="font-pixel-body text-xs text-pixel-cream/50 mt-1">
              {user ? `${GAME_REGISTRY.length} brain challenges` : "Log in to unlock games"}
            </p>
          </div>
          <PixelButton
            variant="ghost"
            onClick={() => onNavigate(user ? "home" : "welcome")}
            className="text-xs"
          >
            ← Back
          </PixelButton>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 mb-5 overflow-x-auto pb-2 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                font-pixel-label text-[8px] md:text-[9px] whitespace-nowrap
                px-3 py-1.5 rounded-[3px] border-[2px] transition-all duration-100 select-none
                ${activeTab === tab.id
                  ? `bg-pixel-${tab.color}/20 border-pixel-${tab.color}/50 text-pixel-${tab.color === "cream" ? "cream" : tab.color}`
                  : "bg-transparent border-pixel-cream/15 text-pixel-cream/40 hover:border-pixel-cream/30 hover:text-pixel-cream/60"
                }
              `}
            >
              {tab.icon} {tab.id.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Game grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {filteredGames.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <GameCard
                game={game}
                isLoggedIn={!!user}
                stats={user ? getGameStats(user.email, game.id) : null}
                onPlay={() => onNavigate("play", { gameId: game.id })}
                onLogin={() => onNavigate("login", { intent: "games" })}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
