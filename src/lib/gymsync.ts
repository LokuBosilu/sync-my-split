export type Goal = "muscle" | "fat" | "endurance" | "general";

export interface UserProfile {
  name: string;
  age: number;
  heightUnit: "cm" | "ftin";
  heightCm?: number;
  heightFt?: number;
  heightIn?: number;
  weightUnit: "kg" | "lbs";
  weight: number;
  goal: Goal | null;
  equipment: string[];
  daysPerWeek: number | null;
  consentGiven?: boolean;
  consentDate?: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  tip: string;
}

export interface PlanDay {
  day_number: number;
  focus: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  split_name: string;
  days: PlanDay[];
}

export const GOALS: { id: Goal; emoji: string; title: string; desc: string }[] = [
  { id: "muscle", emoji: "🏋️", title: "Build Muscle", desc: "Hypertrophy & strength" },
  { id: "fat", emoji: "🔥", title: "Lose Fat", desc: "Burn, cut, define" },
  { id: "endurance", emoji: "⚡", title: "Improve Endurance", desc: "Conditioning & stamina" },
  { id: "general", emoji: "⚖️", title: "General Fitness", desc: "Balanced & sustainable" },
];

export const EQUIPMENT_GROUPS: { group: string; items: string[] }[] = [
  { group: "Free Weights", items: ["Dumbbells", "Barbells", "EZ Curl Bar", "Kettlebells", "Weight Plates"] },
  { group: "Benches & Racks", items: ["Flat Bench", "Incline/Decline Bench", "Squat Rack / Power Rack", "Smith Machine"] },
  { group: "Machines", items: [
    "Leg Press Machine", "Leg Extension Machine", "Leg Curl Machine",
    "Chest Press Machine", "Lat Pulldown Machine", "Seated Row Machine",
    "Shoulder Press Machine", "Cable Crossover Machine", "Pec Deck / Fly Machine",
  ]},
  { group: "Cardio & Other", items: ["Pull-up Bar", "Dip Bars", "Resistance Bands", "Treadmill / Cardio Machines"] },
];

export const ALL_EQUIPMENT = EQUIPMENT_GROUPS.flatMap((g) => g.items);

export function splitForDays(days: number | null): string {
  switch (days) {
    case 2: return "We'll build you a Full Body A/B split";
    case 3: return "We'll build you a Push / Pull / Legs split";
    case 4: return "We'll build you an Upper / Lower split";
    case 5: return "We'll build you a 5-day muscle group split";
    case 6: return "We'll build you a Push / Pull / Legs × 2 split";
    default: return "";
  }
}

export function goalLabel(g: Goal): string {
  return GOALS.find((x) => x.id === g)?.title ?? g;
}

export function formatHeight(p: UserProfile): string {
  if (p.heightUnit === "cm") return `${p.heightCm ?? 0} cm`;
  return `${p.heightFt ?? 0}'${p.heightIn ?? 0}"`;
}

export function formatWeight(p: UserProfile): string {
  return `${p.weight} ${p.weightUnit}`;
}
