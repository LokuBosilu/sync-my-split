-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  age INTEGER,
  height_unit TEXT,
  height_cm INTEGER,
  height_ft INTEGER,
  height_in INTEGER,
  weight_unit TEXT,
  weight NUMERIC,
  goal TEXT,
  equipment TEXT[] DEFAULT '{}',
  days_per_week INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Workout plans table
CREATE TABLE public.workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan JSONB NOT NULL,
  plan_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_workout_plans_user ON public.workout_plans(user_id, created_at DESC);

ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plans_select_own" ON public.workout_plans
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "plans_insert_own" ON public.workout_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "plans_update_own" ON public.workout_plans
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "plans_delete_own" ON public.workout_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();