
CREATE TABLE IF NOT EXISTS public.gyms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gyms TO anon, authenticated;
GRANT ALL ON public.gyms TO service_role;
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
CREATE POLICY gyms_select_all ON public.gyms FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.gym_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  gym_id uuid NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gym_invites TO anon, authenticated;
GRANT ALL ON public.gym_invites TO service_role;
ALTER TABLE public.gym_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY gym_invites_select_all ON public.gym_invites FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.gym_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  gym_id uuid NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active',
  UNIQUE (user_id, gym_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gym_members TO authenticated;
GRANT ALL ON public.gym_members TO service_role;
ALTER TABLE public.gym_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY gym_members_select_own ON public.gym_members FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY gym_members_insert_own ON public.gym_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY gym_members_update_own ON public.gym_members FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY gym_members_delete_own ON public.gym_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

WITH g AS (
  INSERT INTO public.gyms (name) VALUES ('Iron Forge')
  ON CONFLICT DO NOTHING RETURNING id
)
INSERT INTO public.gym_invites (code, gym_id)
SELECT 'ironforge2024', id FROM g
UNION ALL
SELECT 'ironforge2024', id FROM public.gyms WHERE name = 'Iron Forge' AND NOT EXISTS (SELECT 1 FROM g)
ON CONFLICT (code) DO NOTHING;
