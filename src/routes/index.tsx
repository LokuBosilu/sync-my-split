import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { splitForDays, goalLabel, formatHeight, formatWeight, type UserProfile, type WorkoutPlan } from "@/lib/gymsync";
import { StepStats } from "@/components/gymsync/StepStats";
import { StepEquipment } from "@/components/gymsync/StepEquipment";
import { StepSchedule } from "@/components/gymsync/StepSchedule";
import { LoadingState } from "@/components/gymsync/LoadingState";
import { PlanView } from "@/components/gymsync/PlanView";
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
};

type Step = "stats" | "equipment" | "schedule" | "loading" | "plan";

function Index() {
  const [step, setStep] = useState<Step>("stats");
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  const generate = async (p: UserProfile, opts?: { regen?: boolean }) => {
    if (opts?.regen) setRegenerating(true);
    else setStep("loading");

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
      };

      const { data, error } = await supabase.functions.invoke("generate-plan", {
        body: { profile: payload },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.plan) throw new Error("No plan returned");

      setPlan(data.plan as WorkoutPlan);
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

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ambient backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <header className="px-6 md:px-10 pt-8 pb-4 flex items-center justify-between">
        <button
          onClick={() => { setStep("stats"); setProfile(initialProfile); setPlan(null); }}
          className="flex items-center gap-2.5 group"
        >
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary group-hover:rotate-45 transition-transform" />
          <span className="font-display text-2xl tracking-widest">GYMSYNC</span>
        </button>
        <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground hidden sm:inline">
          Personal Training, Programmed
        </span>
      </header>

      <main className="px-6 md:px-10 pb-24 max-w-6xl mx-auto">
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
            onGenerate={(p) => { setProfile(p); generate(p); }}
          />
        )}
        {step === "loading" && <LoadingState />}
        {step === "plan" && plan && (
          <PlanView
            profile={profile}
            plan={plan}
            regenerating={regenerating}
            onRegenerate={() => generate(profile, { regen: true })}
            onRestart={() => { setStep("stats"); setProfile(initialProfile); setPlan(null); }}
          />
        )}
      </main>

      <Toaster />
    </div>
  );
}
