import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import PixelButton from "../components/ui/PixelButton";
import PixelPanel from "../components/ui/PixelPanel";
import { SITE_NAME } from "../constants";
import { useAuth } from "../context/AuthContext";
import { GAME_REGISTRY, CATEGORIES } from "../games/registry";
import {
  getProgress,
  getStreak,
  getWeekTracker,
  getDailyWorkout,
  claimDailyBonus,
  xpProgress,
  BADGE_DEFS,
} from "../lib/progress";
import { formatNumber, seededRandom, getDateSeed } from "../lib/helpers";

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

function CountUp({ target, duration = 800 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) { setVal(0); return; }
    let start = 0;
    const step = Math.max(1, Math.ceil(target / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{formatNumber(val)}</>;
}

function getDailyGames(date = new Date()) {
  const seed = getDateSeed(date);
  const rng = seededRandom(seed);
  // Pick 3 games from different categories
  const cats = [...CATEGORIES].sort(() => rng() - 0.5).slice(0, 3);
  return cats.map((cat) => {
    const gamesInCat = GAME_REGISTRY.filter((g) => g.category === cat.id);
    const idx = Math.floor(rng() * gamesInCat.length);
    return gamesInCat[idx];
  }).filter(Boolean);
}

export default function HomeScreen({ onNavigate }) {
  const { user, logout } = useAuth();
  const [bonusClaimed, setBonusClaimed] = useState(false);

  const progress = useMemo(() => getProgress(user?.email), [user]);
  const streak = useMemo(() => getStreak(user?.email), [user]);
  const weekTracker = useMemo(() => getWeekTracker(user?.email), [user]);
  const xp = useMemo(() => xpProgress(progress.xp), [progress.xp]);
  const dailyGames = useMemo(() => getDailyGames(), []);
  const dailyWorkout = useMemo(() => getDailyWorkout(user?.email), [user]);

  const earnedBadges = useMemo(() =>
    BADGE_DEFS.filter((b) => progress.badges[b.id]),
    [progress.badges]
  );

  const allDailyDone = dailyGames.every((g) => dailyWorkout.completed.includes(g.id));

  const handleClaimBonus = useCallback(() => {
    if (!user || bonusClaimed || dailyWorkout.bonusClaimed) return;
    const ok = claimDailyBonus(user.email);
    if (ok) setBonusClaimed(true);
  }, [user, bonusClaimed, dailyWorkout.bonusClaimed]);

  function handleLogout() {
    logout();
    onNavigate("welcome");
  }

  // Category skill bars
  const skillBars = useMemo(() =>
    CATEGORIES.map((cat) => {
      const catGames = GAME_REGISTRY.filter((g) => g.category === cat.id);
      const total = catGames.reduce((s, g) => {
        const gs = progress.games[g.id];
        return s + (gs ? gs.bestScore : 0);
      }, 0);
      const max = catGames.length * 5000; // rough max for bar display
      return { ...cat, score: total, pct: Math.min(100, (total / max) * 100) };
    }),
    [progress.games]
  );

  return (
    <motion.div
      className="min-h-screen px-4 py-6 md:py-10"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <div className="max-w-3xl mx-auto space-y-4 md:space-y-5">
        {/* Greeting + Level */}
        <motion.div variants={fadeUp}>
          <PixelPanel className="text-center">
            <p className="font-pixel-body text-xs text-pixel-cream/50 mb-1">Welcome back to {SITE_NAME}</p>
            <h2 className="font-pixel-label text-lg md:text-xl text-pixel-cream mb-3">{user?.username}</h2>
            <div className="flex items-center gap-3 justify-center">
              <span className="font-pixel-label text-[10px] text-pixel-magenta">LVL {xp.level}</span>
              <div className="w-32 h-2.5 bg-pixel-dark/60 border border-pixel-cream/15 rounded-sm overflow-hidden">
                <motion.div
                  className="h-full bg-pixel-magenta"
                  initial={{ width: 0 }}
                  animate={{ width: `${xp.progress * 100}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
              <span className="font-pixel-label text-[8px] text-pixel-cream/40">
                {formatNumber(xp.current)}/{formatNumber(xp.needed)} XP
              </span>
            </div>
          </PixelPanel>
        </motion.div>

        {/* Streak + Score row */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 md:gap-4">
          <PixelPanel className="text-center p-4">
            <p className="font-pixel-label text-[9px] text-pixel-orange mb-2">🔥 STREAK</p>
            <p className="font-pixel-label text-2xl text-pixel-cream mb-3">
              <CountUp target={streak} />
            </p>
            {/* Week tracker */}
            <div className="flex gap-1 justify-center">
              {weekTracker.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <div className={`w-4 h-4 rounded-sm border ${day.played ? "bg-pixel-orange border-pixel-orange/50" : "bg-pixel-dark/40 border-pixel-cream/10"}`} />
                  <span className="font-pixel-label text-[6px] text-pixel-cream/30">{day.dayLabel[0]}</span>
                </div>
              ))}
            </div>
          </PixelPanel>

          <PixelPanel className="text-center p-4">
            <p className="font-pixel-label text-[9px] text-pixel-blue mb-2">⭐ TOTAL SCORE</p>
            <p className="font-pixel-label text-2xl text-pixel-cream">
              <CountUp target={progress.totalScore} />
            </p>
          </PixelPanel>
        </motion.div>

        {/* Daily Workout */}
        <motion.div variants={fadeUp}>
          <PixelPanel>
            <h3 className="font-pixel-label text-[10px] text-pixel-yellow mb-3">📋 DAILY WORKOUT</h3>
            <div className="space-y-2">
              {dailyGames.map((game) => {
                const done = dailyWorkout.completed.includes(game.id);
                return (
                  <div key={game.id} className="flex items-center justify-between bg-pixel-dark/30 border border-pixel-cream/10 rounded-[4px] px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${done ? "opacity-50" : ""}`}>{game.icon}</span>
                      <span className={`font-pixel-label text-[9px] ${done ? "text-pixel-green line-through" : "text-pixel-cream"}`}>
                        {game.name}
                      </span>
                    </div>
                    {done ? (
                      <span className="font-pixel-label text-[9px] text-pixel-green">✓</span>
                    ) : (
                      <button
                        onClick={() => onNavigate("play", { gameId: game.id })}
                        className="font-pixel-label text-[8px] text-pixel-orange border border-pixel-orange/30 rounded px-2 py-0.5 hover:bg-pixel-orange/10 transition-colors"
                      >
                        START
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {allDailyDone && !(dailyWorkout.bonusClaimed || bonusClaimed) && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-3 text-center"
              >
                <PixelButton variant="orange" onClick={handleClaimBonus} className="text-xs">
                  🎉 CLAIM +1000 BONUS
                </PixelButton>
              </motion.div>
            )}
            {(dailyWorkout.bonusClaimed || bonusClaimed) && (
              <p className="font-pixel-label text-[8px] text-pixel-green text-center mt-3">✓ Daily bonus claimed!</p>
            )}
          </PixelPanel>
        </motion.div>

        {/* Skill Bars */}
        <motion.div variants={fadeUp}>
          <PixelPanel>
            <h3 className="font-pixel-label text-[10px] text-pixel-cream/70 mb-3">📊 SKILL BARS</h3>
            <div className="space-y-2.5">
              {skillBars.map((cat) => (
                <div key={cat.id}>
                  <div className="flex justify-between mb-1">
                    <span className="font-pixel-label text-[8px] text-pixel-cream/60">{cat.icon} {cat.id}</span>
                    <span className="font-pixel-label text-[8px] text-pixel-cream/40">{formatNumber(cat.score)}</span>
                  </div>
                  <div className="w-full h-2 bg-pixel-dark/50 border border-pixel-cream/10 rounded-sm overflow-hidden">
                    <motion.div
                      className={`h-full bg-pixel-${cat.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.pct}%` }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </PixelPanel>
        </motion.div>

        {/* Badges */}
        <motion.div variants={fadeUp}>
          <PixelPanel>
            <h3 className="font-pixel-label text-[10px] text-pixel-cream/70 mb-3">🏅 BADGES</h3>
            <div className="flex flex-wrap gap-2">
              {BADGE_DEFS.map((badge) => {
                const earned = progress.badges[badge.id];
                return (
                  <div
                    key={badge.id}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] border ${
                      earned
                        ? "bg-pixel-yellow/10 border-pixel-yellow/30"
                        : "bg-pixel-dark/30 border-pixel-cream/10 opacity-40"
                    }`}
                    title={badge.desc}
                  >
                    <span className="text-sm">{badge.icon}</span>
                    <span className={`font-pixel-label text-[7px] ${earned ? "text-pixel-cream" : "text-pixel-cream/40"}`}>
                      {badge.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </PixelPanel>
        </motion.div>

        {/* Recent Plays */}
        {progress.recentPlays.length > 0 && (
          <motion.div variants={fadeUp}>
            <PixelPanel>
              <h3 className="font-pixel-label text-[10px] text-pixel-cream/70 mb-3">🕹️ RECENT PLAYS</h3>
              <div className="space-y-1.5">
                {progress.recentPlays.slice(0, 5).map((play, i) => {
                  const game = GAME_REGISTRY.find((g) => g.id === play.gameId);
                  return (
                    <div key={i} className="flex items-center justify-between bg-pixel-dark/30 border border-pixel-cream/8 rounded px-3 py-1.5">
                      <span className="font-pixel-label text-[8px] text-pixel-cream/60">
                        {game?.icon} {game?.name || play.gameId}
                      </span>
                      <span className="font-pixel-label text-[8px] text-pixel-cream/40">
                        {formatNumber(play.score)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </PixelPanel>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center pb-8">
          <PixelButton variant="orange" onClick={() => onNavigate("games")} className="min-w-[140px]">
            PLAY GAMES
          </PixelButton>
          <PixelButton variant="ghost" onClick={handleLogout} className="min-w-[140px]">
            LOGOUT
          </PixelButton>
        </motion.div>
      </div>
    </motion.div>
  );
}
