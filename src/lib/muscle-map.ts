import type { PlanDay } from "./gymsync";

export type Muscle =
  | "trapezius"
  | "upper-back"
  | "lower-back"
  | "chest"
  | "biceps"
  | "triceps"
  | "forearm"
  | "back-deltoids"
  | "front-deltoids"
  | "abs"
  | "obliques"
  | "adductor"
  | "abductors"
  | "hamstring"
  | "quadriceps"
  | "calves"
  | "gluteal";

export const MUSCLE_LABELS: Record<Muscle, string> = {
  trapezius: "Trapezius",
  "upper-back": "Upper Back",
  "lower-back": "Lower Back",
  chest: "Chest",
  biceps: "Biceps",
  triceps: "Triceps",
  forearm: "Forearms",
  "back-deltoids": "Rear Delts",
  "front-deltoids": "Front Delts",
  abs: "Abs",
  obliques: "Obliques",
  adductor: "Adductors",
  abductors: "Abductors",
  hamstring: "Hamstrings",
  quadriceps: "Quadriceps",
  calves: "Calves",
  gluteal: "Glutes",
};

function matchText(text: string): Muscle[] {
  const f = text.toLowerCase();
  const hits = new Set<Muscle>();
  const add = (...ids: Muscle[]) => ids.forEach((i) => hits.add(i));

  if (/\bchest\b|pec|bench press|push[- ]?up|fly\b|flyes/.test(f)) add("chest");
  if (/\bshoulder|\bdelt|overhead press|ohp|military press/.test(f))
    add("front-deltoids", "back-deltoids");
  if (/front delt|front-delt/.test(f)) add("front-deltoids");
  if (/rear delt|rear-delt|face pull|reverse fly/.test(f)) add("back-deltoids");
  if (/\bbicep|curl\b|chin[- ]?up/.test(f)) add("biceps");
  if (/\btricep|dip\b|skull crusher|pushdown|push-down|kickback/.test(f)) add("triceps");
  if (/\bforearm|\bgrip\b|wrist curl/.test(f)) add("forearm");
  if (/\bab\b|\babs\b|\bcore\b|crunch|plank|sit[- ]?up|leg raise/.test(f)) add("abs");
  if (/oblique|russian twist|side bend/.test(f)) add("obliques");
  if (/\bquad|squat|leg extension|lunge/.test(f)) add("quadriceps");
  if (/\bhamstring|\bham\b|deadlift|leg curl|rdl|romanian/.test(f)) add("hamstring");
  if (/\bcalf|\bcalves|calf raise/.test(f)) add("calves");
  if (/\btrap\b|\btraps\b|shrug/.test(f)) add("trapezius");
  if (/upper back|rhomboid|row\b|rows\b|pulldown|pull-down|pull[- ]?up/.test(f))
    add("upper-back");
  if (/\blat\b|\blats\b|lat pulldown|pullover/.test(f)) add("upper-back");
  if (/lower back|erector|hyperextension|good morning/.test(f)) add("lower-back");
  if (/\bglute|hip thrust|\bbutt\b/.test(f)) add("gluteal");
  if (/adductor|inner thigh/.test(f)) add("adductor");
  if (/abductor|outer thigh|hip abduction/.test(f)) add("abductors");

  // Split shortcuts
  if (/\bpush\b/.test(f)) add("chest", "front-deltoids", "triceps");
  if (/\bpull\b/.test(f)) add("upper-back", "biceps", "back-deltoids");
  if (/\bleg/.test(f)) add("quadriceps", "hamstring", "calves", "gluteal");
  if (/\bback\b/.test(f)) add("upper-back", "lower-back");
  if (/\bupper\b/.test(f) && !/back/.test(f))
    add("chest", "front-deltoids", "back-deltoids", "biceps", "triceps", "upper-back");
  if (/\blower\b/.test(f) && !/back/.test(f))
    add("quadriceps", "hamstring", "calves", "gluteal");
  if (/full body/.test(f))
    add(
      "chest",
      "front-deltoids",
      "back-deltoids",
      "biceps",
      "triceps",
      "quadriceps",
      "hamstring",
      "calves",
      "gluteal",
      "upper-back",
      "abs",
    );

  return Array.from(hits);
}

export function musclesForDay(day: PlanDay): Muscle[] {
  const all = new Set<Muscle>();
  matchText(day.focus).forEach((m) => all.add(m));
  for (const ex of day.exercises) {
    matchText(ex.name).forEach((m) => all.add(m));
  }
  return Array.from(all);
}

export function isRestDay(day: PlanDay): boolean {
  if (day.exercises.length === 0) return true;
  return /\brest\b|recovery|off day/i.test(day.focus);
}

export function todayPlanIndex(dayCount: number): number {
  const jsDay = new Date().getDay(); // 0..6 (Sun..Sat)
  const monIdx = (jsDay + 6) % 7;
  return Math.min(monIdx, Math.max(0, dayCount - 1));
}
