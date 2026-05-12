import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!mounted) return;
      setSession(s);
      setLoading(false);
    });

    (async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const queryError =
          url.searchParams.get("error_code") || url.searchParams.get("error");
        const hash = window.location.hash.startsWith("#")
          ? window.location.hash.slice(1)
          : window.location.hash;
        const hashParams = new URLSearchParams(hash);
        const hashError =
          hashParams.get("error_code") || hashParams.get("error");

        const friendly = (err: string | null) => {
          if (!err) return null;
          if (err === "otp_expired" || err === "access_denied") {
            return "Your login link expired — enter your email to get a new one.";
          }
          return `Login error: ${err.replace(/_/g, " ")}`;
        };

        const cleanUrl = () => {
          url.searchParams.delete("code");
          url.searchParams.delete("state");
          url.searchParams.delete("error");
          url.searchParams.delete("error_code");
          url.searchParams.delete("error_description");
          window.history.replaceState({}, "", url.pathname + url.search);
        };

        if (hashError || queryError) {
          if (mounted) setAuthError(friendly(hashError || queryError));
          cleanUrl();
        } else if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(
            window.location.href
          );
          if (error) {
            if (mounted) setAuthError(friendly(error.message) || error.message);
          } else if (data.session && mounted) {
            setSession(data.session);
          }
          cleanUrl();
        } else if (hashParams.get("access_token")) {
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

  return {
    session,
    user: (session?.user ?? null) as User | null,
    loading,
    authError,
    clearAuthError: () => setAuthError(null),
  };
}
