/**
 * Utility helpers: shuffle, random, seeded random, safe timers.
 */

/** Fisher-Yates shuffle (returns new array) */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Random integer in [min, max] inclusive */
export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Pick a random element from an array */
export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Pick N unique random elements from an array */
export function pickN(arr, n) {
  return shuffle(arr).slice(0, n);
}

/**
 * Simple seeded PRNG (mulberry32). Useful for deterministic daily picks.
 * Returns a function that yields floats in [0, 1).
 */
export function seededRandom(seed) {
  let t = seed | 0;
  return function () {
    t = (t + 0x6d2b79f5) | 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Get a date seed for daily deterministic picks.
 * Based on local YYYY-MM-DD string converted to a number.
 */
export function getDateSeed(date = new Date()) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return y * 10000 + m * 100 + d;
}

/**
 * Format a number with commas: 1234567 → "1,234,567"
 */
export function formatNumber(n) {
  return n.toLocaleString("en-US");
}

/**
 * Clamp a value between min and max.
 */
export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
