import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { WorkoutPlan, PlanDay } from "@/lib/gymsync";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface PlanRow {
  id: string;
  plan: WorkoutPlan;
  plan_number: number;
  created_at: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function PlanHistory({ open, onOpenChange, userId }: Props) {
  const [rows, setRows] = useState<PlanRow[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setRows(null);
    setExpanded(null);
    (async () => {
      const { data, error } = await supabase
        .from("workout_plans")
        .select("id, plan, plan_number, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) {
        console.error(error);
        setRows([]);
        return;
      }
      setRows((data ?? []) as unknown as PlanRow[]);
    })();
  }, [open, userId]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl bg-card border-border overflow-y-auto"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="font-display text-3xl tracking-wide">
            Plan History
          </SheetTitle>
          <SheetDescription>
            All your workout plans, newest first.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-4">
          {rows === null && (
            <p className="text-sm text-muted-foreground">Loading…</p>
          )}
          {rows && rows.length === 0 && (
            <p className="text-sm text-muted-foreground border border-dashed border-border rounded-lg p-6 text-center">
              Your future plans will appear here as you progress.
            </p>
          )}
          {rows && rows.length > 0 && rows.map((r) => {
            const isOpen = expanded === r.id;
            const date = new Date(r.created_at).toLocaleDateString(undefined, {
              year: "numeric", month: "long", day: "numeric",
            });
            return (
              <div
                key={r.id}
                className="rounded-xl border border-border bg-background/50"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                  className="w-full text-left p-5"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-primary">
                        Plan #{r.plan_number}
                      </p>
                      <h3 className="font-display text-2xl mt-1">
                        {r.plan.split_name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-2">
                        Created {date}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "text-primary text-2xl transition-transform",
                        isOpen && "rotate-180"
                      )}
                    >
                      ⌄
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-border p-5 space-y-5">
                    {r.plan.days.map((d) => (
                      <DayBlock key={d.day_number} day={d} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DayBlock({ day }: { day: PlanDay }) {
  const isRest = day.exercises.length === 0;
  return (
    <div className="space-y-2">
      <div>
        <p className={cn(
          "text-[10px] uppercase tracking-[0.3em]",
          isRest ? "text-muted-foreground" : "text-primary"
        )}>
          Day {day.day_number}
        </p>
        <h4 className={cn(
          "font-display text-lg",
          isRest && "text-muted-foreground"
        )}>
          {day.focus}
        </h4>
      </div>
      {!isRest && (
        <div className="space-y-2 pl-3 border-l border-border">
          {day.exercises.map((ex, i) => (
            <div key={i} className="text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-foreground">{ex.name}</span>
                <span className="text-primary font-mono text-xs whitespace-nowrap">
                  {ex.sets} × {ex.reps}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Rest {ex.rest}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
