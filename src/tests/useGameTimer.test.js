import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMounted, useCountdown, useGameTimer } from "../lib/useGameTimer";

describe("useMounted", () => {
  it("is true after mount", () => {
    const { result } = renderHook(() => useMounted());
    expect(result.current.current).toBe(true);
  });

  it("is false after unmount", () => {
    const { result, unmount } = renderHook(() => useMounted());
    const ref = result.current;
    unmount();
    expect(ref.current).toBe(false);
  });
});

describe("useCountdown", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it("counts 3 → 2 → 1 → 0 then calls onFinish", () => {
    const onFinish = vi.fn();
    const { result } = renderHook(() => useCountdown(3, true, onFinish, 700));

    expect(result.current.count).toBe(3);

    act(() => { vi.advanceTimersByTime(700); });
    expect(result.current.count).toBe(2);

    act(() => { vi.advanceTimersByTime(700); });
    expect(result.current.count).toBe(1);

    act(() => { vi.advanceTimersByTime(700); });
    expect(result.current.count).toBe(0);
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it("does not tick when not active", () => {
    const onFinish = vi.fn();
    const { result } = renderHook(() => useCountdown(3, false, onFinish, 700));

    act(() => { vi.advanceTimersByTime(5000); });
    expect(result.current.count).toBe(3);
    expect(onFinish).not.toHaveBeenCalled();
  });

  it("pauses and resumes correctly", () => {
    const onFinish = vi.fn();
    let active = true;
    const { result, rerender } = renderHook(
      () => useCountdown(3, active, onFinish, 700)
    );

    // Tick once
    act(() => { vi.advanceTimersByTime(700); });
    expect(result.current.count).toBe(2);

    // Pause
    active = false;
    rerender();
    act(() => { vi.advanceTimersByTime(5000); });
    expect(result.current.count).toBe(2); // still 2

    // Resume
    active = true;
    rerender();
    act(() => { vi.advanceTimersByTime(700); });
    expect(result.current.count).toBe(1);

    act(() => { vi.advanceTimersByTime(700); });
    expect(result.current.count).toBe(0);
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it("does not double-tick", () => {
    const onFinish = vi.fn();
    const { result } = renderHook(() => useCountdown(3, true, onFinish, 700));

    // Advance many timers at once
    act(() => { vi.advanceTimersByTime(2100); });
    expect(result.current.count).toBe(0);
    expect(onFinish).toHaveBeenCalledTimes(1); // exactly 1, not 2+
  });

  it("resets correctly", () => {
    const onFinish = vi.fn();
    const { result } = renderHook(() => useCountdown(3, true, onFinish, 700));

    act(() => { vi.advanceTimersByTime(1400); }); // down to 1
    expect(result.current.count).toBe(1);

    // Reset
    act(() => { result.current.reset(3); });
    expect(result.current.count).toBe(3);

    act(() => { vi.advanceTimersByTime(2100); });
    expect(result.current.count).toBe(0);
  });

  it("cleans up on unmount", () => {
    const onFinish = vi.fn();
    const { unmount } = renderHook(() => useCountdown(3, true, onFinish, 700));

    act(() => { vi.advanceTimersByTime(700); });
    unmount();
    // No errors thrown, onFinish should not fire after unmount
    act(() => { vi.advanceTimersByTime(5000); });
    expect(onFinish).not.toHaveBeenCalled();
  });
});

describe("useGameTimer", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it("ticks down and calls onFinish at 0", () => {
    const onFinish = vi.fn();
    const { result } = renderHook(() => useGameTimer(5, true, onFinish, 1000));

    expect(result.current.timeLeft).toBe(5);

    act(() => { vi.advanceTimersByTime(3000); });
    expect(result.current.timeLeft).toBe(2);

    act(() => { vi.advanceTimersByTime(2000); });
    expect(result.current.timeLeft).toBe(0);
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it("pauses when active becomes false", () => {
    const onFinish = vi.fn();
    let active = true;
    const { result, rerender } = renderHook(
      () => useGameTimer(10, active, onFinish, 1000)
    );

    act(() => { vi.advanceTimersByTime(3000); });
    expect(result.current.timeLeft).toBe(7);

    active = false;
    rerender();
    act(() => { vi.advanceTimersByTime(5000); });
    expect(result.current.timeLeft).toBe(7); // paused

    active = true;
    rerender();
    act(() => { vi.advanceTimersByTime(2000); });
    expect(result.current.timeLeft).toBe(5);
  });

  it("allows setTimeLeft for time penalties", () => {
    const onFinish = vi.fn();
    const { result } = renderHook(() => useGameTimer(60, true, onFinish, 1000));

    act(() => { vi.advanceTimersByTime(5000); });
    expect(result.current.timeLeft).toBe(55);

    // Penalty: subtract 3 seconds
    act(() => { result.current.setTimeLeft((t) => Math.max(0, t - 3)); });
    expect(result.current.timeLeft).toBe(52);
  });
});
