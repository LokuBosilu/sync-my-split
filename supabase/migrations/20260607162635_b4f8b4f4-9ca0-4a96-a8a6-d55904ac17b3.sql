CREATE TABLE public.weight_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  weight numeric NOT NULL,
  unit text NOT NULL,
  logged_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.weight_logs TO authenticated;
GRANT ALL ON public.weight_logs TO service_role;

ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "weight_logs_select_own" ON public.weight_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "weight_logs_insert_own" ON public.weight_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "weight_logs_update_own" ON public.weight_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "weight_logs_delete_own" ON public.weight_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX weight_logs_user_logged_idx ON public.weight_logs (user_id, logged_at DESC);