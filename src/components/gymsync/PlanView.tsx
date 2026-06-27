import { useState } from "react";
import type { PlanDay, UserProfile, WorkoutPlan } from "@/lib/gymsync";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PlanHistory } from "./PlanHistory";
import { SessionTimer } from "./SessionTimer";

interface Props {
  profile: UserProfile;
  plan: WorkoutPlan;
  onRegenerate: () => void;
  onRestart: () => void;
  regenerating: boolean;
  userId: string;
  planId: string | null;
}

export function PlanView({ profile, plan, onRegenerate, onRestart, regenerating, userId, planId }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [restartOpen, setRestartOpen] = useState(false);

  const handleRegenClick = () => setConfirmOpen(true);
  const confirmRegen = () => {
    setConfirmOpen(false);
    onRegenerate();
  };
  const confirmRestart = () => {
    setRestartOpen(false);
    onRestart();
  };
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

      <SessionTimer userId={userId} planId={planId} />


      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plan.days.map((day) => (
          <DayCard key={day.day_number} day={day} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-border">
        <button
          onClick={handleRegenClick}
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
          onClick={() => setHistoryOpen(true)}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-3 font-display text-sm uppercase tracking-wider text-foreground hover:border-primary/50 hover:text-primary transition-colors"
        >
          View Plan History
        </button>
        <button
          onClick={() => setRestartOpen(true)}
          className="text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          Start over
        </button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl tracking-wide">
              Regenerate Your Plan?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-2">
              This will replace your current plan with a fresh one. Your plan history will be saved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <button
              onClick={() => setConfirmOpen(false)}
              className="rounded-md border border-border bg-background px-5 py-2.5 text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmRegen}
              className="rounded-md bg-primary px-5 py-2.5 font-display text-sm uppercase tracking-wider text-primary-foreground hover:shadow-[0_0_30px_-5px_var(--primary)] transition-all"
            >
              Yes, Regenerate
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={restartOpen} onOpenChange={setRestartOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl tracking-wide">
              Start Over?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-2">
              This will delete your current plan and profile and take you back to the beginning. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <button
              onClick={() => setRestartOpen(false)}
              className="rounded-md border border-border bg-background px-5 py-2.5 text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmRestart}
              className="rounded-md bg-destructive px-5 py-2.5 font-display text-sm uppercase tracking-wider text-destructive-foreground hover:shadow-[0_0_30px_-5px_hsl(var(--destructive))] transition-all"
            >
              Yes, Start Over
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PlanHistory open={historyOpen} onOpenChange={setHistoryOpen} userId={userId} />
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
