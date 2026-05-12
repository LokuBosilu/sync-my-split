import { useState } from "react";
import type { PlanDay, UserProfile, WorkoutPlan } from "@/lib/gymsync";
import { cn } from "@/lib/utils";

interface Props {
  profile: UserProfile;
  plan: WorkoutPlan;
  onRegenerate: () => void;
  onRestart: () => void;
  regenerating: boolean;
}

export function PlanView({ profile, plan, onRegenerate, onRestart, regenerating }: Props) {
  return (
    <div className="fade-slide-in space-y-10">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Your plan</p>
        <h1 className="text-5xl md:text-7xl font-display leading-none">
          {profile.name}'s Workout Plan
        </h1>
        <p className="text-muted-foreground text-lg">
          <span className="text-foreground font-medium">{plan.split_name}</span>
          {" — "}
          {plan.days.filter((d) => d.exercises.length > 0).length} training days · {plan.days.filter((d) => d.exercises.length === 0).length} rest
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plan.days.map((day) => (
          <DayCard key={day.day_number} day={day} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-border">
        <button
          onClick={onRegenerate}
          disabled={regenerating}
          className={cn(
            "inline-flex items-center gap-3 rounded-md px-6 py-3.5 font-display text-lg uppercase tracking-wider transition-all",
            regenerating
              ? "bg-muted text-muted-foreground cursor-wait"
              : "bg-primary text-primary-foreground hover:scale-[1.02] hover:shadow-[0_0_30px_-5px_var(--primary)]"
          )}
        >
          {regenerating ? "Regenerating…" : "↻ Regenerate Plan"}
        </button>
        <button
          onClick={onRestart}
          className="text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          Start over
        </button>
      </div>
    </div>
  );
}

function DayCard({ day }: { day: PlanDay }) {
  const [open, setOpen] = useState(false);
  const isRest = day.exercises.length === 0;

  return (
    <div
      className={cn(
        "rounded-xl border transition-all",
        isRest
          ? "border-dashed border-border/60 bg-card/30"
          : "border-border bg-card hover:border-primary/40"
      )}
    >
      <button
        onClick={() => !isRest && setOpen((o) => !o)}
        className={cn("w-full text-left p-5", isRest && "cursor-default")}
      >
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <p className={cn(
              "text-xs uppercase tracking-[0.3em]",
              isRest ? "text-muted-foreground" : "text-primary"
            )}>
              Day {day.day_number}
            </p>
            <h3 className={cn(
              "font-display text-2xl md:text-3xl mt-1",
              isRest && "text-muted-foreground"
            )}>
              {day.focus}
            </h3>
          </div>
          {!isRest && (
            <span
              className={cn(
                "text-primary text-2xl transition-transform",
                open && "rotate-180"
              )}
            >
              ⌄
            </span>
          )}
        </div>
        {!isRest && (
          <p className="text-xs text-muted-foreground mt-2">
            {day.exercises.length} exercises
          </p>
        )}
      </button>

      {open && !isRest && (
        <div className="border-t border-border px-5 py-4 space-y-4">
          {day.exercises.map((ex, i) => (
            <div key={i} className="fade-slide-in space-y-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-medium text-foreground">{ex.name}</span>
                <span className="text-sm text-primary font-mono whitespace-nowrap">
                  {ex.sets} × {ex.reps}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Rest {ex.rest}
              </div>
              <p className="text-sm text-muted-foreground italic border-l-2 border-primary/40 pl-3">
                {ex.tip}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
