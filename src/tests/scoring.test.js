import { describe, it, expect } from "vitest";
import {
  getMult,
  calcPoints,
  getLevel,
  createGameState,
  processCorrect,
  processWrong,
  MAX_MULT,
  COMBO_PER_MULT,
} from "../lib/scoring";
import { xpForLevel, levelFromXP, xpProgress } from "../lib/progress";

describe("scoring", () => {
  it("getMult returns 1 for combo 0-2", () => {
    expect(getMult(0)).toBe(1);
    expect(getMult(1)).toBe(1);
    expect(getMult(2)).toBe(1);
  });

  it("getMult increases every COMBO_PER_MULT", () => {
    expect(getMult(3)).toBe(2);
    expect(getMult(6)).toBe(3);
    expect(getMult(9)).toBe(4);
  });

  it("getMult caps at MAX_MULT", () => {
    expect(getMult(100)).toBe(MAX_MULT);
    expect(getMult(999)).toBe(MAX_MULT);
  });

  it("calcPoints computes chips x mult", () => {
    const result = calcPoints(0, 0); // combo=0, bonus=0 → post-inc combo=1
    expect(result.chips).toBe(100);
    expect(result.mult).toBe(1);
    expect(result.points).toBe(100);
  });

  it("calcPoints includes bonus", () => {
    const result = calcPoints(0, 50);
    expect(result.chips).toBe(150);
    expect(result.points).toBe(150);
  });

  it("getLevel starts at 1 and increases every 5 correct", () => {
    expect(getLevel(0)).toBe(1);
    expect(getLevel(4)).toBe(1);
    expect(getLevel(5)).toBe(2);
    expect(getLevel(10)).toBe(3);
  });

  it("processCorrect increments combo and score", () => {
    const state = createGameState();
    const { state: next, fx } = processCorrect(state);
    expect(next.combo).toBe(1);
    expect(next.score).toBe(100);
    expect(next.correctCount).toBe(1);
    expect(fx.chips).toBe(100);
  });

  it("processWrong resets combo to 0", () => {
    let state = createGameState();
    state = processCorrect(state).state;
    state = processCorrect(state).state;
    expect(state.combo).toBe(2);

    const { state: afterWrong, fx } = processWrong(state);
    expect(afterWrong.combo).toBe(0);
    expect(afterWrong.wrongCount).toBe(1);
    expect(afterWrong.correctCount).toBe(2); // preserved
    expect(fx.comboBreak).toBe(true);
  });

  it("mult cap is enforced through many correct answers", () => {
    let state = createGameState();
    for (let i = 0; i < 100; i++) {
      const result = processCorrect(state);
      state = result.state;
      expect(result.fx.mult).toBeLessThanOrEqual(MAX_MULT);
    }
  });
});

describe("XP / Level", () => {
  it("xpForLevel returns increasing thresholds", () => {
    expect(xpForLevel(1)).toBe(500);
    expect(xpForLevel(2)).toBe(1500);
    expect(xpForLevel(3)).toBe(3000);
  });

  it("levelFromXP returns correct level", () => {
    expect(levelFromXP(0)).toBe(1);
    expect(levelFromXP(499)).toBe(1);
    expect(levelFromXP(500)).toBe(2);
    expect(levelFromXP(1499)).toBe(2);
    expect(levelFromXP(1500)).toBe(3);
  });

  it("xpProgress returns correct progress", () => {
    const p = xpProgress(750);
    expect(p.level).toBe(2);
    expect(p.current).toBe(250); // 750 - 500
    expect(p.needed).toBe(1000); // 1500 - 500
    expect(p.progress).toBeCloseTo(0.25);
  });
});
