export type MuscleId =
  | "chest"
  | "shoulders_front"
  | "shoulders_rear"
  | "biceps"
  | "triceps"
  | "forearms"
  | "abs"
  | "quads"
  | "hamstrings"
  | "calves"
  | "upper_back"
  | "lats"
  | "lower_back"
  | "glutes";

export const MUSCLE_LABELS: Record<MuscleId, string> = {
  chest: "Chest",
  shoulders_front: "Shoulders (Front)",
  shoulders_rear: "Shoulders (Rear)",
  biceps: "Biceps",
  triceps: "Triceps",
  forearms: "Forearms",
  abs: "Abs",
  quads: "Quadriceps",
  hamstrings: "Hamstrings",
  calves: "Calves",
  upper_back: "Upper Back",
  lats: "Lats",
  lower_back: "Lower Back",
  glutes: "Glutes",
};

// Match keywords in a focus name (e.g. "Push — Chest, Shoulders, Triceps")
// to muscle group IDs.
export function muscleIdsFromFocus(focus: string): MuscleId[] {
  const f = focus.toLowerCase();
  const hits = new Set<MuscleId>();

  const add = (...ids: MuscleId[]) => ids.forEach((i) => hits.add(i));

  // Direct keyword hits
  if (/\bchest\b|pec/.test(f)) add("chest");
  if (/\bshoulder|\bdelt/.test(f)) add("shoulders_front", "shoulders_rear");
  if (/\bbicep/.test(f)) add("biceps");
  if (/\btricep/.test(f)) add("triceps");
  if (/\bforearm|\bgrip\b/.test(f)) add("forearms");
  if (/\bab\b|\babs\b|\bcore\b/.test(f)) add("abs");
  if (/\bquad/.test(f)) add("quads");
  if (/\bhamstring|\bham\b/.test(f)) add("hamstrings");
  if (/\bcalf|\bcalves/.test(f)) add("calves");
  if (/\bupper back|\btrap|\brhomboid/.test(f)) add("upper_back");
  if (/\blat\b|\blats\b/.test(f)) add("lats");
  if (/\blower back|\berector/.test(f)) add("lower_back");
  if (/\bglute|\bbutt\b/.test(f)) add("glutes");

  // Split-pattern shortcuts
  if (/\bpush\b/.test(f)) add("chest", "shoulders_front", "triceps");
  if (/\bpull\b/.test(f)) add("upper_back", "lats", "biceps", "shoulders_rear");
  if (/\bleg/.test(f)) add("quads", "hamstrings", "calves", "glutes");
  if (/\bback\b/.test(f)) add("upper_back", "lats", "lower_back");
  if (/\bupper\b/.test(f) && !/back/.test(f))
    add("chest", "shoulders_front", "shoulders_rear", "biceps", "triceps", "upper_back", "lats");
  if (/\blower\b/.test(f) && !/back/.test(f))
    add("quads", "hamstrings", "calves", "glutes");
  if (/full body/.test(f))
    add(
      "chest",
      "shoulders_front",
      "shoulders_rear",
      "biceps",
      "triceps",
      "quads",
      "hamstrings",
      "calves",
      "glutes",
      "upper_back",
      "lats",
      "abs",
    );

  return Array.from(hits);
}

export function isRestFocus(focus: string, exerciseCount: number): boolean {
  if (exerciseCount === 0) return true;
  return /\brest\b|recovery|off day/i.test(focus);
}
