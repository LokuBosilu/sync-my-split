import { useEffect, useState } from "react";

const STAGES = [
  "Building your split…",
  "Selecting exercises…",
  "Dialling in sets & reps…",
  "Finalising your plan…",
];

export function LoadingState() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % STAGES.length), 1400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fade-slide-in flex flex-col items-center justify-center py-32 space-y-10">
      <div className="flex gap-2">
        {[0, 1, 2].map((n) => (
          <span
            key={n}
            className="pulse-dot inline-block h-3 w-3 rounded-full bg-primary"
            style={{ animationDelay: `${n * 0.18}s` }}
          />
        ))}
      </div>
      <div className="text-center space-y-3">
        <p className="text-xs uppercase tracking-[0.4em] text-primary">Generating</p>
        <p key={i} className="fade-slide-in font-display text-3xl md:text-5xl text-glow">
          {STAGES[i]}
        </p>
      </div>
    </div>
  );
}
