import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { LoadingState } from "@/components/gymsync/LoadingState";
import { Login } from "@/components/gymsync/Login";
import { MuscleMap } from "@/components/gymsync/MuscleMap";
import { WeightTracker } from "@/components/gymsync/WeightTracker";
import { AppNav } from "@/components/gymsync/AppNav";
import { Toaster } from "@/components/ui/sonner";
import {
  muscleIdsFromFocus,
  isRestFocus,
  type MuscleId,
} from "@/lib/muscle-map";
import type { WorkoutPlan } from "@/lib/gymsync";

export const Route = createFileRoute("/body")({
  head: () => ({
    meta: [
      { title: "My Body — GymSync" },
      { name: "description", content: "See today's targeted muscles and track your weight over time." },
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
      if (planRow?.plan) setPlan(planRow.plan as unknown as WorkoutPlan);
      setBootstrapping(false);
    })();
  }, [user?.id]);

  // Determine today's day in plan based on JS day-of-week (0=Sun..6=Sat).
  // Map sequentially: plan day 1 = Monday.
  const today = (() => {
    if (!plan) return null;
    const jsDay = new Date().getDay(); // 0..6
    // Monday-first index (0=Mon..6=Sun)
    const idx = (jsDay + 6) % 7;
    return plan.days[idx % plan.days.length] ?? null;
  })();

  const restDay = today ? isRestFocus(today.focus, today.exercises.length) : true;
  const activeMuscles: MuscleId[] = today && !restDay ? muscleIdsFromFocus(today.focus) : [];

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
                Today's Muscle Map
              </h1>
              <p className="text-muted-foreground">
                {plan
                  ? restDay
                    ? "No training scheduled — recovery is part of the work."
                    : `Working ${activeMuscles.length} muscle group${activeMuscles.length === 1 ? "" : "s"} today.`
                  : "Generate a workout plan to see today's targeted muscles."}
              </p>
            </header>

            <MuscleMap
              active={activeMuscles}
              restDay={restDay}
              focus={today?.focus}
            />

            <WeightTracker userId={user.id} defaultUnit={defaultUnit} />
          </div>
        )}
      </main>

      <Toaster />
    </div>
  );
}
