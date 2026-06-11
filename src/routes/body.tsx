import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { LoadingState } from "@/components/gymsync/LoadingState";
import { Login } from "@/components/gymsync/Login";
import { MuscleMap } from "@/components/gymsync/MuscleMap";
import { WeightTracker } from "@/components/gymsync/WeightTracker";
import { AppNav } from "@/components/gymsync/AppNav";
import { Toaster } from "@/components/ui/sonner";
import { musclesForDay, isRestDay, todayPlanIndex } from "@/lib/muscle-map";
import type { WorkoutPlan } from "@/lib/gymsync";

export const Route = createFileRoute("/body")({
  head: () => ({
    meta: [
      { title: "My Body — GymSync" },
      { name: "description", content: "See targeted muscles per training day and track weight progress." },
    ],
  }),
  component: BodyPage,
});

function BodyPage() {
  const { user, loading: authLoading, authError } = useAuth();
  const navigate = useNavigate();
  const [bootstrapping, setBootstrapping] = useState(true);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [defaultUnit, setDefaultUnit] = useState<"kg" | "lbs">("kg");
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    if (!user) {
      setBootstrapping(false);
      return;
    }
    setBootstrapping(true);
    (async () => {
      const [{ data: profRow }, { data: planRow }] = await Promise.all([
        supabase.from("profiles").select("weight_unit").eq("user_id", user.id).maybeSingle(),
        supabase
          .from("workout_plans")
          .select("plan")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      if (profRow?.weight_unit === "lbs") setDefaultUnit("lbs");
      if (planRow?.plan) {
        const p = planRow.plan as unknown as WorkoutPlan;
        setPlan(p);
        setSelectedIdx(todayPlanIndex(p.days.length));
      }
      setBootstrapping(false);
    })();
  }, [user?.id]);

  const day = plan?.days[selectedIdx] ?? null;
  const rest = day ? isRestDay(day) : true;
  const active = useMemo(() => (day && !rest ? musclesForDay(day) : []), [day, rest]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <header className="px-6 md:px-10 pt-8 pb-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" />
          <span className="font-display text-2xl tracking-widest">GYMSYNC</span>
        </div>
        {user && <AppNav />}
        {user && (
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/" });
            }}
            className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        )}
      </header>

      <main className="px-6 md:px-10 pb-24 max-w-6xl mx-auto">
        {authLoading || bootstrapping ? (
          <div className="pt-24"><LoadingState /></div>
        ) : !user ? (
          <Login initialError={authError} />
        ) : (
          <div className="space-y-10 fade-slide-in">
            <header className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-primary">My Body</p>
              <h1 className="text-5xl md:text-6xl font-display leading-none">
                Muscle Map
              </h1>
              <p className="text-muted-foreground">
                {plan
                  ? "Pick a training day to see which muscles you're targeting."
                  : "Generate a workout plan to see your targeted muscles."}
              </p>
            </header>

            {plan && (
              <div className="flex flex-wrap gap-2">
                {plan.days.map((d, i) => {
                  const selected = i === selectedIdx;
                  const isToday = i === todayPlanIndex(plan.days.length);
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedIdx(i)}
                      className={
                        "rounded-md border px-4 py-2 text-xs uppercase tracking-wider transition-all " +
                        (selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40")
                      }
                    >
                      <span className="font-display tracking-widest">Day {d.day_number}</span>
                      {isToday && (
                        <span
                          className={
                            "ml-2 text-[9px] uppercase tracking-[0.2em] " +
                            (selected ? "opacity-80" : "text-primary")
                          }
                        >
                          Today
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <MuscleMap active={active} restDay={rest} focus={day?.focus} />

            <WeightTracker userId={user.id} defaultUnit={defaultUnit} />
          </div>
        )}
      </main>

      <Toaster />
    </div>
  );
}
