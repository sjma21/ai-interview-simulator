import { useReducer, useEffect, useRef, useCallback } from "react";

interface UseTimerOptions {
  duration: number | null;
  active: boolean;
  onExpire: () => void;
}

type State = { timeLeft: number; snapDuration: number | null };
type Action = { type: "reset"; d: number | null } | { type: "tick" };

function timerReducer(s: State, a: Action): State {
  if (a.type === "reset") return { timeLeft: a.d ?? 0, snapDuration: a.d };
  if (a.type === "tick")  return { ...s, timeLeft: Math.max(0, s.timeLeft - 1) };
  return s;
}

export function useTimer({ duration, active, onExpire }: UseTimerOptions) {
  const [{ timeLeft, snapDuration }, dispatch] = useReducer(timerReducer, {
    timeLeft: duration ?? 0,
    snapDuration: duration,
  });

  const onExpireRef = useRef(onExpire);
  const firedRef    = useRef(false);

  // Keep onExpire ref fresh (inside effect = safe)
  useEffect(() => { onExpireRef.current = onExpire; });

  // Reset state when duration changes — React "derived state during render" pattern
  // dispatch from useReducer is intentionally exempt from react-hooks/set-state-in-effect
  if (snapDuration !== duration) {
    dispatch({ type: "reset", d: duration });
  }

  // Reset fired flag whenever duration changes (inside effect = ref mutation is safe)
  useEffect(() => {
    firedRef.current = false;
  }, [duration]);

  // Count down
  useEffect(() => {
    if (!duration || !active) return;
    const id = setInterval(() => dispatch({ type: "tick" }), 1000);
    return () => clearInterval(id);
  }, [duration, active]);

  // Fire onExpire once when countdown reaches zero
  useEffect(() => {
    if (!duration || timeLeft !== 0 || firedRef.current) return;
    firedRef.current = true;
    setTimeout(() => onExpireRef.current(), 0);
  }, [timeLeft, duration]);

  const reset = useCallback(() => {
    dispatch({ type: "reset", d: duration });
    firedRef.current = false;
  }, [duration]);

  const pct = duration && timeLeft > 0 ? (timeLeft / duration) * 100 : 0;
  const urgency: "safe" | "warning" | "danger" =
    pct > 50 ? "safe" : pct > 20 ? "warning" : "danger";

  return { timeLeft, pct, urgency, reset, enabled: !!duration };
}
