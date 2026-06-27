import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Props {
  userId: string;
  planId: string | null;
}

function formatDuration(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function SessionTimer({ userId, planId }: Props) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [lastDuration, setLastDuration] = useState<number | null>(null);
  const [lastDate, setLastDate] = useState<string | null>(null);
  const [completed, setCompleted] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const startRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("workout_sessions")
        .select("duration_seconds, session_date")
        .eq("user_id", userId)
        .order("session_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!cancelled && data) {
        setLastDuration(data.duration_seconds);
        setLastDate(data.session_date);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      if (startRef.current) {
        setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
      }
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const start = () => {
    setCompleted(null);
    setElapsed(0);
    startRef.current = Date.now();
    setRunning(true);
  };

  const finish = async () => {
    if (!startRef.current) return;
    const total = Math.floor((Date.now() - startRef.current) / 1000);
    setRunning(false);
    setElapsed(total);
    setCompleted(total);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSaving(true);
    try {
      const nowIso = new Date().toISOString();
      const { error } = await supabase.from("workout_sessions").insert({
        user_id: userId,
        plan_id: planId,
        duration_seconds: total,
        session_date: nowIso,
      });
      if (error) throw error;
      setLastDuration(total);
      setLastDate(nowIso);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Failed to save session");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">
          Workout Session
        </p>
        {lastDuration !== null && (
          <p className="text-xs text-muted-foreground">
            Last session: <span className="text-foreground font-mono">{formatDuration(lastDuration)}</span>
            {lastDate && (
              <span className="ml-2 opacity-70">
                {new Date(lastDate).toLocaleDateString()}
              </span>
            )}
          </p>
        )}
      </div>

      <div className="font-mono text-5xl md:text-6xl tracking-wider text-foreground tabular-nums">
        {formatDuration(elapsed)}
      </div>

      {completed !== null && !running && (
        <div className="fade-slide-in rounded-md border border-primary/40 bg-primary/10 px-4 py-3">
          <p className="text-sm uppercase tracking-wider text-primary">Session Complete</p>
          <p className="text-foreground mt-1">
            Total duration: <span className="font-mono">{formatDuration(completed)}</span>
          </p>
        </div>
      )}

      <button
        onClick={running ? finish : start}
        disabled={saving}
        className={cn(
          "inline-flex items-center gap-3 rounded-md px-6 py-3.5 font-display text-lg uppercase tracking-wider transition-all",
          saving
            ? "bg-muted text-muted-foreground cursor-wait"
            : running
            ? "bg-destructive text-destructive-foreground hover:scale-[1.02]"
            : "bg-primary text-primary-foreground hover:scale-[1.02] hover:shadow-[0_0_30px_-5px_var(--primary)]"
        )}
      >
        {saving ? "Saving…" : running ? "■ Finish Workout" : "▶ Start Workout"}
      </button>
    </div>
  );
}
