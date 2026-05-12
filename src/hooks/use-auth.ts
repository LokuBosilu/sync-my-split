import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1) Subscribe FIRST so we don't miss the SIGNED_IN event from URL detection
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!mounted) return;
      setSession(s);
      setLoading(false);
    });

    // 2) Handle magic-link return:
    //    - PKCE flow returns ?code=... in the query string
    //    - Implicit flow returns #access_token=... in the hash
    //    Exchange/parse and then strip from the URL so refreshes are clean.
    (async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const hash = window.location.hash;

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(
            window.location.href
          );
          if (!error && data.session && mounted) {
            setSession(data.session);
          }
          url.searchParams.delete("code");
          url.searchParams.delete("state");
          window.history.replaceState({}, "", url.pathname + url.search + url.hash);
        } else if (hash.includes("access_token")) {
          // supabase-js auto-detects hash session on init; just clean URL after
          const { data } = await supabase.auth.getSession();
          if (data.session && mounted) setSession(data.session);
          window.history.replaceState({}, "", url.pathname + url.search);
        } else {
          const { data } = await supabase.auth.getSession();
          if (mounted) setSession(data.session);
        }
      } catch (e) {
        console.error("[auth] session restore failed", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, user: (session?.user ?? null) as User | null, loading };
}
