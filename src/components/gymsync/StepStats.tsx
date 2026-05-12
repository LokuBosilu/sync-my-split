import { useState } from "react";
import { GOALS, type Goal, type UserProfile } from "@/lib/gymsync";
import { cn } from "@/lib/utils";

interface Props {
  profile: UserProfile;
  onNext: (p: UserProfile) => void;
}

export function StepStats({ profile, onNext }: Props) {
  const [p, setP] = useState<UserProfile>(profile);

  const valid =
    p.name.trim().length > 0 &&
    p.age > 0 &&
    p.weight > 0 &&
    (p.heightUnit === "cm" ? !!p.heightCm : (p.heightFt ?? 0) > 0) &&
    !!p.goal;

  return (
    <div className="fade-slide-in space-y-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Step 01 / 03</p>
        <h1 className="text-5xl md:text-7xl font-display leading-none">Tell us about you.</h1>
        <p className="text-muted-foreground max-w-xl">
          Stats and goals shape every set, rep and rest interval in your plan.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Field label="First name">
          <input
            value={p.name}
            onChange={(e) => setP({ ...p, name: e.target.value })}
            placeholder="Alex"
            className="input-base"
          />
        </Field>

        <Field label="Age">
          <input
            type="number"
            value={p.age || ""}
            onChange={(e) => setP({ ...p, age: Number(e.target.value) })}
            placeholder="28"
            className="input-base"
          />
        </Field>

        <Field
          label="Height"
          right={
            <UnitToggle
              left="cm" right="ft/in"
              active={p.heightUnit === "cm" ? "left" : "right"}
              onChange={(s) => setP({ ...p, heightUnit: s === "left" ? "cm" : "ftin" })}
            />
          }
        >
          {p.heightUnit === "cm" ? (
            <input
              type="number"
              value={p.heightCm || ""}
              onChange={(e) => setP({ ...p, heightCm: Number(e.target.value) })}
              placeholder="178"
              className="input-base"
            />
          ) : (
            <div className="flex gap-2">
              <input
                type="number" value={p.heightFt || ""}
                onChange={(e) => setP({ ...p, heightFt: Number(e.target.value) })}
                placeholder="ft" className="input-base flex-1"
              />
              <input
                type="number" value={p.heightIn || ""}
                onChange={(e) => setP({ ...p, heightIn: Number(e.target.value) })}
                placeholder="in" className="input-base flex-1"
              />
            </div>
          )}
        </Field>

        <Field
          label="Weight"
          right={
            <UnitToggle
              left="kg" right="lbs"
              active={p.weightUnit === "kg" ? "left" : "right"}
              onChange={(s) => setP({ ...p, weightUnit: s === "left" ? "kg" : "lbs" })}
            />
          }
        >
          <input
            type="number"
            value={p.weight || ""}
            onChange={(e) => setP({ ...p, weight: Number(e.target.value) })}
            placeholder={p.weightUnit === "kg" ? "75" : "165"}
            className="input-base"
          />
        </Field>
      </div>

      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Primary goal</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {GOALS.map((g) => {
            const active = p.goal === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setP({ ...p, goal: g.id as Goal })}
                className={cn(
                  "group relative text-left rounded-xl border p-5 transition-all",
                  active
                    ? "border-primary bg-primary/10 shadow-[0_0_0_1px_var(--primary)]"
                    : "border-border bg-card hover:border-primary/40 hover:bg-card/70"
                )}
              >
                <div className="text-3xl mb-3">{g.emoji}</div>
                <div className="font-display text-2xl">{g.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{g.desc}</div>
                {active && <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>
      </div>

      <CTA disabled={!valid} onClick={() => onNext(p)}>Next — Set Up Equipment</CTA>

      <style>{`
        .input-base {
          width: 100%; background: var(--input); color: var(--foreground);
          border: 1px solid var(--border); border-radius: 8px; padding: 14px 16px;
          font-size: 16px; outline: none; transition: border-color .15s, box-shadow .15s;
        }
        .input-base:focus { border-color: var(--primary); box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 25%, transparent); }
        .input-base::placeholder { color: color-mix(in oklab, var(--muted-foreground) 80%, transparent); }
      `}</style>
    </div>
  );
}

function Field({ label, right, children }: { label: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
        {right}
      </div>
      {children}
    </label>
  );
}

function UnitToggle({
  left, right, active, onChange,
}: { left: string; right: string; active: "left" | "right"; onChange: (s: "left" | "right") => void }) {
  return (
    <div className="inline-flex rounded-md border border-border overflow-hidden text-xs">
      <button onClick={() => onChange("left")}
        className={cn("px-2.5 py-1", active === "left" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
        {left}
      </button>
      <button onClick={() => onChange("right")}
        className={cn("px-2.5 py-1", active === "right" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
        {right}
      </button>
    </div>
  );
}

export function CTA({
  children, onClick, disabled,
}: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group inline-flex items-center gap-3 rounded-md px-7 py-4 font-display text-xl uppercase tracking-wider transition-all",
        disabled
          ? "bg-muted text-muted-foreground cursor-not-allowed"
          : "bg-primary text-primary-foreground hover:scale-[1.02] hover:shadow-[0_0_40px_-5px_var(--primary)]"
      )}
    >
      {children}
      <span className="transition-transform group-hover:translate-x-1">→</span>
    </button>
  );
}
