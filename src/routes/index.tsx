import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  splitForDays,
  goalLabel,
  formatHeight,
  formatWeight,
  type Goal,
  type UserProfile,
  type WorkoutPlan,
} from "@/lib/gymsync";
import { StepStats } from "@/components/gymsync/StepStats";
import { StepEquipment } from "@/components/gymsync/StepEquipment";
import { StepSchedule } from "@/components/gymsync/StepSchedule";
import { LoadingState } from "@/components/gymsync/LoadingState";
import { PlanView } from "@/components/gymsync/PlanView";
import { PlanExpiredBanner } from "@/components/gymsync/PlanExpiredBanner";
import { Login } from "@/components/gymsync/Login";
import { AppNav } from "@/components/gymsync/AppNav";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GymSync — Personalized Workout Plan Generator" },
      { name: "description", content: "Get a personalized AI-generated gym workout split based on your stats, goals, equipment and weekly schedule." },
      { property: "og:title", content: "GymSync — Personalized Workout Plan Generator" },
      { property: "og:description", content: "AI-generated training splits, dialled in to your gear and goal." },
    ],
  }),
  component: Index,
});

const initialProfile: UserProfile = {
  name: "",
  age: 0,
  heightUnit: "cm",
  weightUnit: "kg",
  weight: 0,
  goal: null,
  equipment: [],
  daysPerWeek: null,
  consentGiven: false,
};

type Step = "stats" | "equipment" | "schedule" | "loading" | "plan";

const EIGHT_WEEKS_MS = 8 * 7 * 24 * 60 * 60 * 1000;

function rowToProfile(row: any): UserProfile {
  return {
    name: row.name ?? "",
    age: row.age ?? 0,
    heightUnit: (row.height_unit as "cm" | "ftin") ?? "cm",
    heightCm: row.height_cm ?? undefined,
    heightFt: row.height_ft ?? undefined,
    heightIn: row.height_in ?? undefined,
    weightUnit: (row.weight_unit as "kg" | "lbs") ?? "kg",
    weight: row.weight ? Number(row.weight) : 0,
    goal: (row.goal as Goal | null) ?? null,
    equipment: row.equipment ?? [],
    daysPerWeek: row.days_per_week ?? null,
    consentGiven: row.consent_given ?? false,
    consentDate: row.consent_date ?? undefined,
  };
}

function profileToRow(p: UserProfile, userId: string) {
  return {
    user_id: userId,
    name: p.name,
    age: p.age,
    height_unit: p.heightUnit,
    height_cm: p.heightCm ?? null,
    height_ft: p.heightFt ?? null,
    height_in: p.heightIn ?? null,
    weight_unit: p.weightUnit,
    weight: p.weight,
    goal: p.goal,
    equipment: p.equipment,
    days_per_week: p.daysPerWeek,
    consent_given: p.consentGiven ?? false,
    consent_date: p.consentDate ?? null,
  };
}

function Index() {
  const { user, loading: authLoading, authError } = useAuth();
  const [bootstrapping, setBootstrapping] = useState(true);
  const [step, setStep] = useState<Step>("stats");
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [planNumber, setPlanNumber] = useState(0);
  const [planCreatedAt, setPlanCreatedAt] = useState<Date | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Capture ?invite=CODE from URL on first load (before magic-link redirect strips it)
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const invite = url.searchParams.get("invite");
      if (invite) {
        localStorage.setItem("pendingInviteCode", invite.trim());
        url.searchParams.delete("invite");
        window.history.replaceState({}, "", url.pathname + url.search + url.hash);
      }
    } catch {}
  }, []);

  // After sign-in, redeem any pending invite code → insert gym_members row
  useEffect(() => {
    if (!user) return;
    const code = localStorage.getItem("pendingInviteCode");
    if (!code) return;
    (async () => {
      try {
        const { data: gymId, error } = await supabase.rpc("redeem_gym_invite", { _code: code });
        if (error) throw error;
        if (!gymId) {
          toast.error("Invite code not found");
          localStorage.removeItem("pendingInviteCode");
          return;
        }
        localStorage.removeItem("pendingInviteCode");
        toast.success("Joined gym successfully");
      } catch (e) {
        console.error("[invite] redeem failed", e);
      }
    })();
  }, [user?.id]);

  // Load existing profile + latest plan when user signs in
  useEffect(() => {
    if (!user) {
      setBootstrapping(false);
      return;
    }
    setBootstrapping(true);
    (async () => {
      const [{ data: profRow }, { data: planRow }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase
          .from("workout_plans")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (profRow && profRow.name) {
        setProfile(rowToProfile(profRow));
      }
      if (planRow) {
        setPlan(planRow.plan as unknown as WorkoutPlan);
        setPlanNumber(planRow.plan_number);
        setPlanCreatedAt(new Date(planRow.created_at));
        setStep("plan");
      } else {
        setStep("stats");
      }
      setBootstrapping(false);
    })();
  }, [user?.id]);

  const persistProfileAndPlan = async (
    p: UserProfile,
    newPlan: WorkoutPlan,
    nextPlanNumber: number,
    mode: "insert" | "overwrite"
  ) => {
    if (!user) return;
    const { error: pErr } = await supabase
      .from("profiles")
      .upsert(profileToRow(p, user.id), { onConflict: "user_id" });
    if (pErr) console.error(pErr);

    if (mode === "overwrite") {
      // Find current (most recent) plan row and update it in place
      const { data: current } = await supabase
        .from("workout_plans")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (current?.id) {
        const nowIso = new Date().toISOString();
        const { data: updated, error: updErr } = await supabase
          .from("workout_plans")
          .update({ plan: newPlan as any, created_at: nowIso })
          .eq("id", current.id)
          .select()
          .single();
        if (updErr) console.error(updErr);
        if (updated) setPlanCreatedAt(new Date(updated.created_at));
        return;
      }
      // Fall through to insert if no existing row
    }

    const { data: planRow, error: planErr } = await supabase
      .from("workout_plans")
      .insert({
        user_id: user.id,
        plan: newPlan as any,
        plan_number: nextPlanNumber,
      })
      .select()
      .single();
    if (planErr) console.error(planErr);
    if (planRow) setPlanCreatedAt(new Date(planRow.created_at));
    setPlanNumber(nextPlanNumber);
  };

  const generate = async (
    p: UserProfile,
    opts?: { regen?: boolean; reassessment?: boolean }
  ) => {
    if (opts?.regen) setRegenerating(true);
    else setStep("loading");

    const nextPlanNumber = (planNumber || 0) + 1;

    try {
      const payload = {
        name: p.name,
        age: p.age,
        height: formatHeight(p),
        weight: formatWeight(p),
        goal: p.goal ? goalLabel(p.goal) : "",
        daysPerWeek: p.daysPerWeek,
        suggestedSplit: splitForDays(p.daysPerWeek),
        equipment: p.equipment,
        planNumber: nextPlanNumber,
      };

      const { data, error } = await supabase.functions.invoke("generate-plan", {
        body: { profile: payload },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.plan) throw new Error("No plan returned");

      const newPlan = data.plan as WorkoutPlan;
      setPlan(newPlan);
      setBannerDismissed(false);
      await persistProfileAndPlan(p, newPlan, nextPlanNumber, "insert");
      setStep("plan");
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Failed to generate plan";
      toast.error(msg);
      if (!opts?.regen) setStep("schedule");
    } finally {
      setRegenerating(false);
    }
  };

  const startReassessment = () => {
    setBannerDismissed(true);
    setStep("stats");
  };

  const startOver = async () => {
    if (user) {
      await Promise.all([
        supabase.from("workout_plans").delete().eq("user_id", user.id),
        supabase.from("profiles").delete().eq("user_id", user.id),
      ]);
    }
    setProfile(initialProfile);
    setPlan(null);
    setPlanNumber(0);
    setPlanCreatedAt(null);
    setBannerDismissed(false);
    setStep("stats");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(initialProfile);
    setPlan(null);
    setPlanNumber(0);
    setPlanCreatedAt(null);
    setStep("stats");
  };

  const planExpired =
    !!planCreatedAt && Date.now() - planCreatedAt.getTime() >= EIGHT_WEEKS_MS;

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
        {user && step === "plan" && <AppNav />}
        {user ? (
          <button
            onClick={signOut}
            className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        ) : (
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground hidden sm:inline">
            Personal Training, Programmed
          </span>
        )}
      </header>

      <main className="px-6 md:px-10 pb-24 max-w-6xl mx-auto">
        {authLoading || bootstrapping ? (
          <div className="pt-24"><LoadingState /></div>
        ) : !user ? (
          <Login initialError={authError} />
        ) : (
          <>
            {step === "stats" && (
              <StepStats
                profile={profile}
                onNext={(p) => { setProfile(p); setStep("equipment"); }}
              />
            )}
            {step === "equipment" && (
              <StepEquipment
                profile={profile}
                onBack={() => setStep("stats")}
                onNext={(p) => { setProfile(p); setStep("schedule"); }}
              />
            )}
            {step === "schedule" && (
              <StepSchedule
                profile={profile}
                onBack={() => setStep("equipment")}
                onGenerate={(p) => {
                  setProfile(p);
                  generate(p, { reassessment: planNumber > 0 });
                }}
              />
            )}
            {step === "loading" && <LoadingState />}
            {step === "plan" && plan && (
              <div className="space-y-8">
                {planExpired && !bannerDismissed && (
                  <PlanExpiredBanner
                    onReassess={startReassessment}
                    onKeep={() => setBannerDismissed(true)}
                  />
                )}
                <PlanView
                  userId={user.id}
                  profile={profile}
                  plan={plan}
                  regenerating={regenerating}
                  onRegenerate={() => generate(profile, { regen: true })}
                  onRestart={startOver}
                />
              </div>
            )}
          </>
        )}
      </main>

      <Toaster />
    </div>
  );
}
