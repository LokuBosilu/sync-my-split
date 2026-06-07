import { MUSCLE_LABELS, type MuscleId } from "@/lib/muscle-map";

interface Props {
  active: MuscleId[];
  restDay?: boolean;
  focus?: string;
}

const ACTIVE_COLOR = "#84cc16";
const MUTED_COLOR = "#2a2a2a";
const STROKE_COLOR = "#3a3a3a";
const BG_COLOR = "#0f0f0f";

function fill(active: Set<MuscleId>, id: MuscleId): string {
  return active.has(id) ? ACTIVE_COLOR : MUTED_COLOR;
}

export function MuscleMap({ active, restDay, focus }: Props) {
  const set = new Set(restDay ? [] : active);

  return (
    <div
      className="rounded-xl border border-border p-6"
      style={{ background: BG_COLOR }}
    >
      <div className="grid grid-cols-2 gap-4">
        <FrontView activeSet={set} />
        <BackView activeSet={set} />
      </div>

      <div className="mt-6 border-t border-border pt-4">
        {restDay ? (
          <p className="text-center text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Rest day — let your muscles recover.
          </p>
        ) : (
          <>
            {focus && (
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Today's focus · <span className="text-foreground">{focus}</span>
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {active.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No muscle groups identified for today.
                </p>
              )}
              {active.map((id) => (
                <span
                  key={id}
                  className="rounded-md px-2.5 py-1 text-xs font-medium uppercase tracking-wider"
                  style={{
                    background: "rgba(132, 204, 22, 0.12)",
                    color: ACTIVE_COLOR,
                    border: `1px solid ${ACTIVE_COLOR}55`,
                  }}
                >
                  {MUSCLE_LABELS[id]}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
      {children}
    </p>
  );
}

/* ------------------------- Front view ------------------------- */

function FrontView({ activeSet }: { activeSet: Set<MuscleId> }) {
  return (
    <div>
      <Caption>Front</Caption>
      <svg
        viewBox="0 0 200 420"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Head */}
        <circle cx="100" cy="30" r="22" fill={MUTED_COLOR} stroke={STROKE_COLOR} />
        {/* Neck */}
        <rect x="92" y="50" width="16" height="14" fill={MUTED_COLOR} stroke={STROKE_COLOR} />

        {/* Torso outline (background) */}
        <path
          d="M60 70 L140 70 L150 160 L140 230 L60 230 L50 160 Z"
          fill={MUTED_COLOR}
          stroke={STROKE_COLOR}
          strokeWidth="1"
        />

        {/* Shoulders (front) */}
        <ellipse
          cx="60" cy="78" rx="18" ry="14"
          fill={fill(activeSet, "shoulders_front")}
          stroke={STROKE_COLOR}
        />
        <ellipse
          cx="140" cy="78" rx="18" ry="14"
          fill={fill(activeSet, "shoulders_front")}
          stroke={STROKE_COLOR}
        />

        {/* Chest (two pecs) */}
        <path
          d="M70 80 Q100 95 100 130 Q90 135 70 130 Z"
          fill={fill(activeSet, "chest")}
          stroke={STROKE_COLOR}
        />
        <path
          d="M130 80 Q100 95 100 130 Q110 135 130 130 Z"
          fill={fill(activeSet, "chest")}
          stroke={STROKE_COLOR}
        />

        {/* Abs */}
        <rect x="86" y="135" width="28" height="80" rx="4"
          fill={fill(activeSet, "abs")}
          stroke={STROKE_COLOR}
        />
        {/* Abs dividers */}
        <line x1="100" y1="138" x2="100" y2="213" stroke={STROKE_COLOR} />
        <line x1="86" y1="160" x2="114" y2="160" stroke={STROKE_COLOR} />
        <line x1="86" y1="180" x2="114" y2="180" stroke={STROKE_COLOR} />
        <line x1="86" y1="200" x2="114" y2="200" stroke={STROKE_COLOR} />

        {/* Biceps */}
        <ellipse cx="42" cy="120" rx="12" ry="28"
          fill={fill(activeSet, "biceps")}
          stroke={STROKE_COLOR}
        />
        <ellipse cx="158" cy="120" rx="12" ry="28"
          fill={fill(activeSet, "biceps")}
          stroke={STROKE_COLOR}
        />

        {/* Forearms */}
        <ellipse cx="36" cy="175" rx="10" ry="26"
          fill={fill(activeSet, "forearms")}
          stroke={STROKE_COLOR}
        />
        <ellipse cx="164" cy="175" rx="10" ry="26"
          fill={fill(activeSet, "forearms")}
          stroke={STROKE_COLOR}
        />

        {/* Hips */}
        <path
          d="M60 230 L140 230 L135 260 L65 260 Z"
          fill={MUTED_COLOR}
          stroke={STROKE_COLOR}
        />

        {/* Quads */}
        <path
          d="M68 260 L98 260 L94 350 L72 350 Z"
          fill={fill(activeSet, "quads")}
          stroke={STROKE_COLOR}
        />
        <path
          d="M102 260 L132 260 L128 350 L106 350 Z"
          fill={fill(activeSet, "quads")}
          stroke={STROKE_COLOR}
        />

        {/* Calves (front: shin/tibialis area) */}
        <ellipse cx="83" cy="385" rx="11" ry="22"
          fill={fill(activeSet, "calves")}
          stroke={STROKE_COLOR}
        />
        <ellipse cx="117" cy="385" rx="11" ry="22"
          fill={fill(activeSet, "calves")}
          stroke={STROKE_COLOR}
        />
      </svg>
    </div>
  );
}

/* ------------------------- Back view ------------------------- */

function BackView({ activeSet }: { activeSet: Set<MuscleId> }) {
  return (
    <div>
      <Caption>Back</Caption>
      <svg
        viewBox="0 0 200 420"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Head */}
        <circle cx="100" cy="30" r="22" fill={MUTED_COLOR} stroke={STROKE_COLOR} />
        {/* Neck */}
        <rect x="92" y="50" width="16" height="14" fill={MUTED_COLOR} stroke={STROKE_COLOR} />

        {/* Torso outline */}
        <path
          d="M60 70 L140 70 L150 160 L140 230 L60 230 L50 160 Z"
          fill={MUTED_COLOR}
          stroke={STROKE_COLOR}
          strokeWidth="1"
        />

        {/* Rear shoulders */}
        <ellipse cx="60" cy="78" rx="18" ry="14"
          fill={fill(activeSet, "shoulders_rear")}
          stroke={STROKE_COLOR}
        />
        <ellipse cx="140" cy="78" rx="18" ry="14"
          fill={fill(activeSet, "shoulders_rear")}
          stroke={STROKE_COLOR}
        />

        {/* Upper back / traps */}
        <path
          d="M75 70 Q100 60 125 70 L120 110 Q100 100 80 110 Z"
          fill={fill(activeSet, "upper_back")}
          stroke={STROKE_COLOR}
        />

        {/* Lats */}
        <path
          d="M70 110 L100 115 L100 180 L75 180 Z"
          fill={fill(activeSet, "lats")}
          stroke={STROKE_COLOR}
        />
        <path
          d="M130 110 L100 115 L100 180 L125 180 Z"
          fill={fill(activeSet, "lats")}
          stroke={STROKE_COLOR}
        />

        {/* Lower back */}
        <rect x="84" y="182" width="32" height="44" rx="4"
          fill={fill(activeSet, "lower_back")}
          stroke={STROKE_COLOR}
        />

        {/* Triceps */}
        <ellipse cx="42" cy="120" rx="12" ry="28"
          fill={fill(activeSet, "triceps")}
          stroke={STROKE_COLOR}
        />
        <ellipse cx="158" cy="120" rx="12" ry="28"
          fill={fill(activeSet, "triceps")}
          stroke={STROKE_COLOR}
        />

        {/* Forearms (back) */}
        <ellipse cx="36" cy="175" rx="10" ry="26"
          fill={fill(activeSet, "forearms")}
          stroke={STROKE_COLOR}
        />
        <ellipse cx="164" cy="175" rx="10" ry="26"
          fill={fill(activeSet, "forearms")}
          stroke={STROKE_COLOR}
        />

        {/* Glutes */}
        <path
          d="M62 230 L100 230 L100 275 Q80 280 62 270 Z"
          fill={fill(activeSet, "glutes")}
          stroke={STROKE_COLOR}
        />
        <path
          d="M138 230 L100 230 L100 275 Q120 280 138 270 Z"
          fill={fill(activeSet, "glutes")}
          stroke={STROKE_COLOR}
        />

        {/* Hamstrings */}
        <path
          d="M68 275 L98 275 L94 355 L72 355 Z"
          fill={fill(activeSet, "hamstrings")}
          stroke={STROKE_COLOR}
        />
        <path
          d="M102 275 L132 275 L128 355 L106 355 Z"
          fill={fill(activeSet, "hamstrings")}
          stroke={STROKE_COLOR}
        />

        {/* Calves (back) */}
        <ellipse cx="83" cy="390" rx="12" ry="24"
          fill={fill(activeSet, "calves")}
          stroke={STROKE_COLOR}
        />
        <ellipse cx="117" cy="390" rx="12" ry="24"
          fill={fill(activeSet, "calves")}
          stroke={STROKE_COLOR}
        />
      </svg>
    </div>
  );
}
