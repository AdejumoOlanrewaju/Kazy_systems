import { useEffect, useState } from "react";

export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

// Shared countdown logic — used by the deals hero panel and the per-card badge.
export const useCountdown = (endsAt?: number | null): CountdownParts | null => {
  const [parts, setParts] = useState<CountdownParts | null>(null);

  useEffect(() => {
    if (!endsAt) {
      setParts(null);
      return;
    }

    const tick = () => {
      const diff = endsAt - Date.now();
      if (diff <= 0) {
        setParts({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      setParts({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        expired: false,
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  return parts;
};