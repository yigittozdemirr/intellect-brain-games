/**
 * Web Audio SFX — generated in code, no audio files.
 * Sound only plays after user interaction (browser policy).
 * Mute state persisted in localStorage.
 */

const MUTE_KEY = "intellect_muted";

let audioCtx = null;
let muted = false;

// Load persisted mute state
try { muted = localStorage.getItem(MUTE_KEY) === "1"; } catch { /* noop */ }

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function isMuted() { return muted; }

export function toggleMute() {
  muted = !muted;
  try { localStorage.setItem(MUTE_KEY, muted ? "1" : "0"); } catch { /* noop */ }
  return muted;
}

function playTone(freq, duration, type = "square", volume = 0.15) {
  if (muted) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch { /* audio not available */ }
}

/** Correct answer blip — pitch rises with combo */
export function playCorrect(combo = 0) {
  const baseFreq = 440 + Math.min(combo, 15) * 30;
  playTone(baseFreq, 0.1, "square", 0.12);
  // Second harmonic for richness
  setTimeout(() => playTone(baseFreq * 1.5, 0.06, "square", 0.06), 30);
}

/** Wrong answer buzz */
export function playWrong() {
  playTone(150, 0.2, "sawtooth", 0.15);
  setTimeout(() => playTone(120, 0.15, "sawtooth", 0.1), 50);
}

/** Mult-up jingle */
export function playMultUp() {
  playTone(523, 0.08, "square", 0.12);
  setTimeout(() => playTone(659, 0.08, "square", 0.12), 80);
  setTimeout(() => playTone(784, 0.12, "square", 0.15), 160);
}

/** Countdown tick */
export function playTick() {
  playTone(800, 0.05, "square", 0.08);
}

/** GO sound */
export function playGo() {
  playTone(1047, 0.15, "square", 0.15);
}

/** Results fanfare */
export function playFanfare() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.15, "square", 0.12), i * 120);
  });
}

/** New best celebration */
export function playNewBest() {
  const notes = [523, 659, 784, 1047, 1319, 1568];
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.12, "square", 0.1), i * 80);
  });
}
