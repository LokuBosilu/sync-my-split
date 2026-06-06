
-- Remove public read access on gym_invites
DROP POLICY IF EXISTS gym_invites_select_all ON public.gym_invites;
REVOKE SELECT ON public.gym_invites FROM anon;
REVOKE SELECT ON public.gym_invites FROM authenticated;
GRANT ALL ON public.gym_invites TO service_role;

-- Secure redeem function: validates code and inserts membership for the caller
CREATE OR REPLACE FUNCTION public.redeem_gym_invite(_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _gym_id uuid;
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT gym_id INTO _gym_id
  FROM public.gym_invites
  WHERE code = _code
  LIMIT 1;

  IF _gym_id IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.gym_members (user_id, gym_id, status, joined_at)
  VALUES (_uid, _gym_id, 'active', now())
  ON CONFLICT DO NOTHING;

  RETURN _gym_id;
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_gym_invite(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_gym_invite(text) TO authenticated;
