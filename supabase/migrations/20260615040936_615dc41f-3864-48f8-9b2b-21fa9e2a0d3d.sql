
-- profiles: scope to authenticated
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
DROP POLICY IF EXISTS profiles_delete_own ON public.profiles;

CREATE POLICY profiles_select_own ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY profiles_delete_own ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- workout_plans: scope to authenticated
DROP POLICY IF EXISTS plans_select_own ON public.workout_plans;
DROP POLICY IF EXISTS plans_insert_own ON public.workout_plans;
DROP POLICY IF EXISTS plans_update_own ON public.workout_plans;
DROP POLICY IF EXISTS plans_delete_own ON public.workout_plans;

CREATE POLICY plans_select_own ON public.workout_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY plans_insert_own ON public.workout_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY plans_update_own ON public.workout_plans FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY plans_delete_own ON public.workout_plans FOR DELETE TO authenticated USING (auth.uid() = user_id);
