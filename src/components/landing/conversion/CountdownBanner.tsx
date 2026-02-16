import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export const CountdownBanner = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      return {
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      };
    };
    setTimeLeft(calc());
    const id = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="bg-foreground text-background py-3 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 text-sm md:text-base">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary animate-pulse" />
          <span className="font-semibold">Angebot endet in:</span>
          <span className="font-mono font-bold text-primary text-lg">
            {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
          </span>
        </div>
        <span className="hidden sm:inline text-muted-foreground/60">|</span>
        <span>
          Nur noch <span className="font-bold text-destructive">2</span> von 3 Plätzen diese Woche verfügbar
        </span>
      </div>
    </div>
  );
};
