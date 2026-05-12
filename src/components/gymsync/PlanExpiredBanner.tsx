import { cn } from "@/lib/utils";

export function PlanExpiredBanner({
  onReassess,
  onKeep,
}: {
  onReassess: () => void;
  onKeep: () => void;
}) {
  return (
    <div className="fade-slide-in rounded-xl border border-primary/50 bg-primary/10 p-6 md:p-7 space-y-4 shadow-[0_0_40px_-15px_var(--primary)]">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">8-week block complete</p>
        <p className="font-display text-2xl md:text-3xl leading-snug">
          Your 8-week plan is complete — time to level up. Ready for a new plan?
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onReassess}
          className={cn(
            "inline-flex items-center gap-2 rounded-md px-5 py-3 font-display text-base uppercase tracking-wider",
            "bg-primary text-primary-foreground hover:scale-[1.02] transition-transform"
          )}
        >
          Start Re-Assessment →
        </button>
        <button
          onClick={onKeep}
          className="inline-flex items-center gap-2 rounded-md px-5 py-3 font-display text-base uppercase tracking-wider border border-border hover:border-primary/60 transition-colors"
        >
          Keep Current Plan
        </button>
      </div>
    </div>
  );
}
