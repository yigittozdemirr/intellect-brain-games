import { useRef, useEffect, useState, useCallback } from "react";

/**
 * Returns a ref that is `true` while the component is mounted,
 * `false` after unmount. Works correctly under React StrictMode
 * because the setup function explicitly sets it to true on each mount.
 */
export function useMounted() {
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  return mounted;
}

/**
 * Robust countdown hook: counts from `start` down to 0.
 *
 * - `active`: countdown only runs while true.
 * - `onFinish`: called once when count reaches 0.
 * - `tickMs`: interval between ticks (default 700ms).
 * - Returns `{ count, reset }`.
 * - Safe under StrictMode: uses refs for callbacks, cleanup on unmount.
 */
export function useCountdown(start, active, onFinish, tickMs = 700) {
  const [count, setCount] = useState(start);
  const onFinishRef = useRef(onFinish);
  const firedRef = useRef(false);

  // Keep callback ref fresh (no dependency needed)
  useEffect(() => { onFinishRef.current = onFinish; });

  useEffect(() => {
    if (!active) return;
    if (count <= 0) {
      if (!firedRef.current) {
        firedRef.current = true;
        onFinishRef.current?.();
      }
      return;
    }
    firedRef.current = false;
    const id = setTimeout(() => {
      setCount((c) => c - 1);
    }, tickMs);
    return () => clearTimeout(id);
  }, [active, count, tickMs]);

  const reset = useCallback((val) => {
    setCount(val ?? start);
    firedRef.current = false;
  }, [start]);

  return { count, reset };
}

/**
 * Robust game timer hook: ticks every `intervalMs` while `active`.
 *
 * - `duration`: initial time in seconds.
 * - `active`: timer runs only while true (pause-friendly).
 * - `onFinish`: called once when time reaches 0.
 * - Returns `{ timeLeft, setTimeLeft, reset }`.
 * - Safe under StrictMode.
 */
export function useGameTimer(duration, active, onFinish, intervalMs = 1000) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const onFinishRef = useRef(onFinish);
  const firedRef = useRef(false);

  useEffect(() => { onFinishRef.current = onFinish; });

  useEffect(() => {
    if (!active) return;
    if (timeLeft <= 0) {
      if (!firedRef.current) {
        firedRef.current = true;
        onFinishRef.current?.();
      }
      return;
    }
    firedRef.current = false;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        const next = t - 1;
        if (next <= 0) {
          clearInterval(id);
          // Schedule onFinish for next tick to avoid setState-in-setState
          Promise.resolve().then(() => {
            if (!firedRef.current) {
              firedRef.current = true;
              onFinishRef.current?.();
            }
          });
          return 0;
        }
        return next;
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]); // eslint-disable-line react-hooks/exhaustive-deps
  // Note: timeLeft is intentionally NOT a dependency — the interval
  // uses the functional updater `setTimeLeft(t => ...)` so it always
  // has the latest value without needing to re-create the interval.

  const reset = useCallback((val) => {
    setTimeLeft(val ?? duration);
    firedRef.current = false;
  }, [duration]);

  return { timeLeft, setTimeLeft, reset };
}
