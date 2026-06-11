import Model from "react-body-highlighter";
import type { Muscle } from "@/lib/muscle-map";
import { MUSCLE_LABELS } from "@/lib/muscle-map";

interface Props {
  active: Muscle[];
  restDay?: boolean;
  focus?: string;
}

const ACTIVE = "#84cc16";
const BODY = "#1f1f1f";

export function MuscleMap({ active, restDay, focus }: Props) {
  const data = active.length
    ? [{ name: focus ?? "Today", muscles: active }]
    : [];

  return (
    <div className="rounded-xl border border-border bg-[#0f0f0f] p-6">
      {restDay ? (
        <div className="py-16 text-center">
          <p className="font-display text-3xl tracking-wide text-foreground">
            Rest Day
          </p>
          <p className="mt-3 text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Recovery is part of the work
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 place-items-center">
            <div className="w-full max-w-[240px]">
              <p className="mb-2 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Front
              </p>
              <Model
                type="anterior"
                data={data}
                bodyColor={BODY}
                highlightedColors={[ACTIVE]}
                style={{ width: "100%", padding: 0 }}
              />
            </div>
            <div className="w-full max-w-[240px]">
              <p className="mb-2 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Back
              </p>
              
              <Model
                type="posterior"
                data={data}
                bodyColor={BODY}
                highlightedColors={[ACTIVE]}
                style={{ width: "100%", padding: 0 }}
              />
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-4">
            {focus && (
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Focus · <span className="text-foreground">{focus}</span>
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {active.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No muscle groups identified.
                </p>
              ) : (
                active.map((id) => (
                  <span
                    key={id}
                    className="rounded-md px-2.5 py-1 text-xs font-medium uppercase tracking-wider"
                    style={{
                      background: "rgba(132, 204, 22, 0.12)",
                      color: ACTIVE,
                      border: `1px solid ${ACTIVE}55`,
                    }}
                  >
                    {MUSCLE_LABELS[id]}
                  </span>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
