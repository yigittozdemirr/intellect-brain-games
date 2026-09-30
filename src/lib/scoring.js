/**
 * Pure scoring / combo / multiplier logic.
 * No side effects — fully testable.
 */

/** Base chips per correct answer */
export const BASE_CHIPS = 100;

/** Max multiplier cap */
export const MAX_MULT = 10;

/** Penalty seconds for wrong answer */
export const WRONG_PENALTY_SECONDS = 3;

/** Combo threshold: mult increases every N correct answers */
export const COMBO_PER_MULT = 3;

/** Input lock duration in ms after each answer */
export const INPUT_LOCK_MS = 150;

/** Default game duration in seconds */
export const GAME_DURATION = 60;

/** Fast mode duration (dev only) */
export const FAST_DURATION = 8;

/** Correct answers per level-up */
export const ANSWERS_PER_LEVEL = 5;

/**
 * Calculate multiplier from combo count.
 * mult = 1 + floor(combo / COMBO_PER_MULT), capped at MAX_MULT
 */
export function getMult(combo) {
  return Math.min(1 + Math.floor(combo / COMBO_PER_MULT), MAX_MULT);
}

/**
 * Calculate points for a single correct answer.
 * @param {number} combo - current combo (BEFORE incrementing)
 * @param {number} bonus - optional speed bonus chips
 * @returns {{ chips: number, mult: number, points: number }}
 */
export function calcPoints(combo, bonus = 0) {
  const chips = BASE_CHIPS + bonus;
  const mult = getMult(combo + 1); // combo is post-increment
  const points = chips * mult;
  return { chips, mult, points };
}

/**
 * Get the color tier for score popups based on mult.
 * cream → yellow → orange → pink → rainbow
 */
export function getScoreTierColor(mult) {
  if (mult <= 1) return "#fff3d6"; // cream
  if (mult <= 3) return "#ffd23f"; // yellow
  if (mult <= 5) return "#ffa62b"; // orange
  if (mult <= 7) return "#ff5c8a"; // pink
  return "rainbow"; // 8+
}

/**
 * Calculate game level from total correct answers in this session.
 */
export function getLevel(correctCount) {
  return 1 + Math.floor(correctCount / ANSWERS_PER_LEVEL);
}

/**
 * Create an initial game state object.
 */
export function createGameState() {
  return {
    score: 0,
    combo: 0,
    bestCombo: 0,
    correctCount: 0,
    wrongCount: 0,
    level: 1,
  };
}

/**
 * Process a correct answer. Returns new state + animation data.
 * Pure function — does not mutate input.
 */
export function processCorrect(state, bonus = 0) {
  const newCombo = state.combo + 1;
  const { chips, mult, points } = calcPoints(state.combo, bonus);
  const prevMult = getMult(state.combo);
  const multUp = mult > prevMult;
  const newCorrectCount = state.correctCount + 1;

  return {
    state: {
      score: state.score + points,
      combo: newCombo,
      bestCombo: Math.max(state.bestCombo, newCombo),
      correctCount: newCorrectCount,
      wrongCount: state.wrongCount,
      level: getLevel(newCorrectCount),
    },
    fx: {
      chips,
      mult,
      points,
      multUp,
      tier: getScoreTierColor(mult),
    },
  };
}

/**
 * Process a wrong answer. Returns new state.
 * Combo resets. No score change (penalty is time-based, handled by GameShell).
 */
export function processWrong(state) {
  return {
    state: {
      ...state,
      combo: 0,
      wrongCount: state.wrongCount + 1,
    },
    fx: {
      comboBreak: state.combo > 0,
      prevCombo: state.combo,
    },
  };
}
