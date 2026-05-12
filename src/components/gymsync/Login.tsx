import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export function Login({ initialError }: { initialError?: string | null } = {}) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const sendLink = async () => {
    if (!email.trim()) return;
    setSending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      setSent(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send link");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fade-slide-in max-w-xl space-y-8 pt-12">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Welcome</p>
        <h1 className="text-5xl md:text-7xl font-display leading-none">
          Sign in to<br />build your split.
        </h1>
        <p className="text-muted-foreground max-w-md">
          We'll email you a magic link. No passwords. Your plan stays with you across devices.
        </p>
      </header>

      {initialError && !sent && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
          {initialError}
        </div>
      )}

      {sent ? (
        <div className="rounded-xl border border-primary/40 bg-primary/5 p-6 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Check your inbox</p>
          <p className="text-lg">
            We sent a magic link to <span className="font-medium">{email}</span>. Open it on this device to sign in.
          </p>
          <button
            onClick={() => setSent(false)}
            className="text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground mt-3"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <input
            type="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendLink()}
            placeholder="you@email.com"
            className="w-full bg-[var(--input)] text-foreground border border-border rounded-lg px-4 py-4 text-lg outline-none focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_25%,transparent)]"
          />
          <button
            onClick={sendLink}
            disabled={sending || !email.trim()}
            className={cn(
              "inline-flex items-center gap-3 rounded-md px-7 py-4 font-display text-xl uppercase tracking-wider transition-all",
              sending || !email.trim()
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:scale-[1.02] hover:shadow-[0_0_40px_-5px_var(--primary)]"
            )}
          >
            {sending ? "Sending…" : "Send Magic Link"}
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
}
