import { useState } from "react";
import { splitForDays, type UserProfile } from "@/lib/gymsync";
import { cn } from "@/lib/utils";
import { CTA } from "./StepStats";

interface Props {
  profile: UserProfile;
  onBack: () => void;
  onGenerate: (p: UserProfile) => void;
}

const OPTIONS = [2, 3, 4, 5, 6];

export function StepSchedule({ profile, onBack, onGenerate }: Props) {
  const [days, setDays] = useState<number | null>(profile.daysPerWeek);

  return (
    <div className="fade-slide-in space-y-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Step 03 / 03</p>
        <h1 className="text-5xl md:text-7xl font-display leading-none">
          How many days a week<br />do you train?
        </h1>
      </header>

      <div className="grid grid-cols-5 gap-3 max-w-2xl">
        {OPTIONS.map((d) => {
          const active = days === d;
          return (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={cn(
                "aspect-square rounded-xl border font-display text-5xl transition-all",
                active
                  ? "border-primary bg-primary text-primary-foreground scale-105 shadow-[0_0_30px_-5px_var(--primary)]"
                  : "border-border bg-card text-foreground hover:border-primary/60"
              )}
            >
              {d}
            </button>
          );
        })}
      </div>

      <div className="min-h-[60px]">
        {days && (
          <div className="fade-slide-in rounded-lg border border-primary/30 bg-primary/5 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.3em] text-primary mb-1">Your split</p>
            <p className="text-xl font-medium">{splitForDays(days)}</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          ← Back
        </button>
        <CTA
          disabled={!days}
          onClick={() => onGenerate({ ...profile, daysPerWeek: days })}
        >
          Generate My Plan
        </CTA>
      </div>
    </div>
  );
}
