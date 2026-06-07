import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  userId: string;
  defaultUnit: "kg" | "lbs";
}

interface Entry {
  id: string;
  weight: number;
  unit: string;
  logged_at: string;
}

export function WeightTracker({ userId, defaultUnit }: Props) {
  const [unit, setUnit] = useState<"kg" | "lbs">(defaultUnit);
  const [weight, setWeight] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("weight_logs")
        .select("*")
        .eq("user_id", userId)
        .order("logged_at", { ascending: true });
      if (error) {
        console.error(error);
        toast.error("Could not load weight history");
      } else {
        setEntries((data ?? []) as Entry[]);
      }
      setLoading(false);
    })();
  }, [userId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = Number(weight);
    if (!w || w <= 0) {
      toast.error("Enter a valid weight");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("weight_logs")
      .insert({ user_id: userId, weight: w, unit })
      .select()
      .single();
    setSaving(false);
    if (error) {
      console.error(error);
      toast.error("Could not save entry");
      return;
    }
    setEntries((prev) => [...prev, data as Entry]);
    setWeight("");
    toast.success("Weight logged");
  };

  // Normalize to selected display unit
  const normalized = entries.map((e) => {
    let w = Number(e.weight);
    if (e.unit !== unit) {
      w = e.unit === "kg" ? w * 2.2046226218 : w / 2.2046226218;
    }
    return {
      date: new Date(e.logged_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      weight: Number(w.toFixed(1)),
      iso: e.logged_at,
    };
  });

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-6">
      <div>
        <h2 className="font-display text-3xl tracking-wide">Weight Progress</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Log regularly to track trends over time.
        </p>
      </div>

      <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
            Current weight
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 78.5"
            className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex rounded-md border border-border bg-background p-1">
          {(["kg", "lbs"] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={
                "px-3 py-1.5 text-xs uppercase tracking-wider rounded transition-colors " +
                (unit === u
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {u}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-primary px-5 py-2.5 font-display text-sm uppercase tracking-wider text-primary-foreground hover:shadow-[0_0_30px_-5px_var(--primary)] transition-all disabled:opacity-60"
        >
          {saving ? "Saving…" : "Log"}
        </button>
      </form>

      <div className="border-t border-border pt-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : normalized.length < 2 ? (
          <p className="text-sm text-muted-foreground italic">
            Log your weight regularly to see your progress here.
          </p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={normalized} margin={{ top: 10, right: 16, bottom: 0, left: -10 }}>
                <CartesianGrid stroke="#2a2a2a" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  stroke="#71717a"
                  tick={{ fill: "#a1a1aa", fontSize: 11 }}
                />
                <YAxis
                  stroke="#71717a"
                  tick={{ fill: "#a1a1aa", fontSize: 11 }}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0f0f0f",
                    border: "1px solid #2a2a2a",
                    borderRadius: 8,
                    color: "#fafafa",
                  }}
                  labelStyle={{ color: "#a1a1aa" }}
                  formatter={(v: number) => [`${v} ${unit}`, "Weight"]}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#84cc16"
                  strokeWidth={2.5}
                  dot={{ fill: "#84cc16", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
