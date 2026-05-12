import { useState } from "react";
import { ALL_EQUIPMENT, EQUIPMENT_GROUPS, type UserProfile } from "@/lib/gymsync";
import { cn } from "@/lib/utils";
import { CTA } from "./StepStats";

interface Props {
  profile: UserProfile;
  onBack: () => void;
  onNext: (p: UserProfile) => void;
}

export function StepEquipment({ profile, onBack, onNext }: Props) {
  const [selected, setSelected] = useState<string[]>(profile.equipment);

  const toggle = (item: string) =>
    setSelected((s) => (s.includes(item) ? s.filter((x) => x !== item) : [...s, item]));

  const allSelected = selected.length === ALL_EQUIPMENT.length;
  const selectAll = () => setSelected(allSelected ? [] : ALL_EQUIPMENT);

  return (
    <div className="fade-slide-in space-y-10">
      <header className="space-y-2 flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Step 02 / 03</p>
          <h1 className="text-5xl md:text-7xl font-display leading-none">What does your gym have?</h1>
          <p className="text-muted-foreground max-w-xl mt-2">
            Select everything available. This shapes your entire plan.
          </p>
        </div>
        <button
          onClick={selectAll}
          className="rounded-md border border-border px-4 py-2 text-sm uppercase tracking-wider hover:border-primary hover:text-primary transition-colors"
        >
          {allSelected ? "Clear all" : "Select all"}
        </button>
      </header>

      <div className="space-y-8">
        {EQUIPMENT_GROUPS.map((g) => (
          <div key={g.group} className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{g.group}</h3>
            <div className="flex flex-wrap gap-2">
              {g.items.map((item) => {
                const active = selected.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggle(item)}
                    className={cn(
                      "rounded-full border px-4 py-2.5 text-sm transition-all",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:border-primary/60"
                    )}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          ← Back
        </button>
        <CTA
          disabled={selected.length === 0}
          onClick={() => onNext({ ...profile, equipment: selected })}
        >
          Next — Set Your Schedule
        </CTA>
        <span className="text-sm text-muted-foreground ml-auto">{selected.length} selected</span>
      </div>
    </div>
  );
}
