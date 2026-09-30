/**
 * Per-user progress storage in localStorage.
 * Keyed by user email so each account has its own data.
 *
 * Storage shape per user:
 * {
 *   totalScore: number,
 *   xp: number,
 *   games: { [gameId]: { bestScore, bestCombo, plays } },
 *   categories: { [category]: { totalScore, plays } },
 *   streak: { count: number, lastPlayedDate: "YYYY-MM-DD" },
 *   recentPlays: [{ gameId, score, date, combo }], // last 10
 *   badges: { [badgeId]: true },
 *   dailyWorkout: { date: "YYYY-MM-DD", completed: [gameId], bonusClaimed: boolean },
 * }
 *
 * The structure handles games that don't exist yet — no hardcoded list.
 */

const PROGRESS_PREFIX = "intellect_progress_";

function getKey(email) {
  return PROGRESS_PREFIX + (email || "anon").toLowerCase();
}

function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function createEmpty() {
  return {
    totalScore: 0,
    xp: 0,
    games: {},
    categories: {},
    streak: { count: 0, lastPlayedDate: null },
    recentPlays: [],
    badges: {},
    dailyWorkout: { date: null, completed: [], bonusClaimed: false },
  };
}

function load(email) {
  try {
    const raw = localStorage.getItem(getKey(email));
    if (!raw) return createEmpty();
    const data = JSON.parse(raw);
    // Merge with defaults for forward compatibility
    return { ...createEmpty(), ...data };
  } catch {
    return createEmpty();
  }
}

function save(email, data) {
  try {
    localStorage.setItem(getKey(email), JSON.stringify(data));
  } catch { /* storage full — silently fail */ }
}

// ─── XP / Level ──────────────────────────────────────────────

/** XP needed for a given level: 500 * level * (level + 1) / 2 */
export function xpForLevel(level) {
  return 500 * level * (level + 1) / 2;
}

/** Current level from XP */
export function levelFromXP(xp) {
  let level = 1;
  while (xpForLevel(level) <= xp) level++;
  return level;
}

/** Progress to next level: { level, current, needed, progress 0-1 } */
export function xpProgress(xp) {
  const level = levelFromXP(xp);
  const prevThreshold = level > 1 ? xpForLevel(level - 1) : 0;
  const nextThreshold = xpForLevel(level);
  const current = xp - prevThreshold;
  const needed = nextThreshold - prevThreshold;
  return { level, current, needed, progress: needed > 0 ? current / needed : 0 };
}

// ─── Streak ──────────────────────────────────────────────────

/** Get current streak count (reads but does not modify storage) */
export function getStreak(email) {
  const data = load(email);
  const { lastPlayedDate, count } = data.streak;
  if (!lastPlayedDate) return 0;
  const today = getToday();
  const yesterday = getYesterday();
  if (lastPlayedDate === today) return count;
  if (lastPlayedDate === yesterday) return count; // still valid, not yet played today
  return 0; // streak broken
}

/** Get the last 7 days of play status (for week tracker) */
export function getWeekTracker(email) {
  const data = load(email);
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const dayLabel = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
    const played = data.recentPlays.some((p) => p.date === dateStr);
    days.push({ date: dateStr, dayLabel, played });
  }
  return days;
}

// ─── Record a game result ────────────────────────────────────

export function recordGame(email, { gameId, category, score, combo, correctCount, wrongCount }) {
  const data = load(email);
  const today = getToday();
  const yesterday = getYesterday();

  // Total score & XP
  data.totalScore += score;
  data.xp += Math.floor(score / 10); // 1 XP per 10 points

  // Per-game stats
  if (!data.games[gameId]) {
    data.games[gameId] = { bestScore: 0, bestCombo: 0, plays: 0 };
  }
  const g = data.games[gameId];
  g.plays++;
  const isNewBest = score > g.bestScore;
  g.bestScore = Math.max(g.bestScore, score);
  g.bestCombo = Math.max(g.bestCombo, combo);

  // Per-category stats
  if (!data.categories[category]) {
    data.categories[category] = { totalScore: 0, plays: 0 };
  }
  data.categories[category].totalScore += score;
  data.categories[category].plays++;

  // Streak
  const { lastPlayedDate, count } = data.streak;
  if (lastPlayedDate === today) {
    // Already played today, no change
  } else if (lastPlayedDate === yesterday) {
    data.streak = { count: count + 1, lastPlayedDate: today };
  } else {
    data.streak = { count: 1, lastPlayedDate: today };
  }

  // Recent plays (keep last 10)
  data.recentPlays.unshift({ gameId, score, date: today, combo });
  if (data.recentPlays.length > 10) data.recentPlays.pop();

  // Daily workout tracking
  if (data.dailyWorkout.date !== today) {
    data.dailyWorkout = { date: today, completed: [gameId], bonusClaimed: false };
  } else if (!data.dailyWorkout.completed.includes(gameId)) {
    data.dailyWorkout.completed.push(gameId);
  }

  // Badges
  checkBadges(data);

  save(email, data);

  return { isNewBest };
}

// ─── Daily Workout ───────────────────────────────────────────

export function getDailyWorkout(email) {
  const data = load(email);
  const today = getToday();
  if (data.dailyWorkout.date !== today) {
    return { completed: [], bonusClaimed: false };
  }
  return {
    completed: data.dailyWorkout.completed,
    bonusClaimed: data.dailyWorkout.bonusClaimed,
  };
}

export function claimDailyBonus(email) {
  const data = load(email);
  const today = getToday();
  if (data.dailyWorkout.date !== today) return false;
  if (data.dailyWorkout.bonusClaimed) return false;
  data.dailyWorkout.bonusClaimed = true;
  data.totalScore += 1000;
  data.xp += 100;
  save(email, data);
  return true;
}

// ─── Readers ─────────────────────────────────────────────────

export function getProgress(email) {
  return load(email);
}

export function getGameStats(email, gameId) {
  const data = load(email);
  return data.games[gameId] || { bestScore: 0, bestCombo: 0, plays: 0 };
}

export function getTotalPlays(email) {
  const data = load(email);
  return Object.values(data.games).reduce((sum, g) => sum + g.plays, 0);
}

// ─── Rules modal "don't show again" ─────────────────────────

const RULES_KEY = "intellect_rules_seen";

export function hasSeenRules(gameId) {
  try {
    const seen = JSON.parse(localStorage.getItem(RULES_KEY)) || {};
    return !!seen[gameId];
  } catch { return false; }
}

export function markRulesSeen(gameId) {
  try {
    const seen = JSON.parse(localStorage.getItem(RULES_KEY)) || {};
    seen[gameId] = true;
    localStorage.setItem(RULES_KEY, JSON.stringify(seen));
  } catch { /* noop */ }
}

// ─── Badges ──────────────────────────────────────────────────

export const BADGE_DEFS = [
  { id: "first-game",   name: "First Game",   desc: "Play your first game",         icon: "🎮" },
  { id: "streak-3",     name: "3-Day Streak", desc: "Play 3 days in a row",         icon: "🔥" },
  { id: "streak-7",     name: "7-Day Streak", desc: "Play 7 days in a row",         icon: "💪" },
  { id: "combo-5",      name: "x5 Combo",     desc: "Reach a 5x multiplier",        icon: "⚡" },
  { id: "combo-10",     name: "x10 Combo",    desc: "Reach the maximum multiplier", icon: "🌟" },
  { id: "plays-10",     name: "Play 10",      desc: "Play 10 games total",          icon: "🏅" },
  { id: "plays-50",     name: "Play 50",      desc: "Play 50 games total",          icon: "🏆" },
  { id: "score-10k",    name: "10K Score",    desc: "Reach 10,000 total score",     icon: "💎" },
  { id: "score-100k",   name: "100K Score",   desc: "Reach 100,000 total score",    icon: "👑" },
  { id: "explorer",     name: "Explorer",     desc: "Play 10 different games",      icon: "🧭" },
  { id: "completionist",name: "Completionist",desc: "Play all 30 games",            icon: "🌈" },
];

function checkBadges(data) {
  const totalPlays = Object.values(data.games).reduce((s, g) => s + g.plays, 0);
  const maxCombo = Object.values(data.games).reduce((s, g) => Math.max(s, g.bestCombo), 0);
  const uniqueGamesPlayed = Object.keys(data.games).length;

  if (totalPlays >= 1) data.badges["first-game"] = true;
  if (totalPlays >= 10) data.badges["plays-10"] = true;
  if (totalPlays >= 50) data.badges["plays-50"] = true;
  if (data.streak.count >= 3) data.badges["streak-3"] = true;
  if (data.streak.count >= 7) data.badges["streak-7"] = true;
  if (maxCombo >= 15) data.badges["combo-5"] = true; // combo 15 = x5 mult
  if (maxCombo >= 27) data.badges["combo-10"] = true; // combo 27 = x10 mult
  if (data.totalScore >= 10000) data.badges["score-10k"] = true;
  if (data.totalScore >= 100000) data.badges["score-100k"] = true;
  if (uniqueGamesPlayed >= 10) data.badges["explorer"] = true;
  if (uniqueGamesPlayed >= 30) data.badges["completionist"] = true;
}

