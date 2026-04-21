
-- 1) Prevent users from changing their own team_id (privilege escalation via get_team_member_ids)
CREATE OR REPLACE FUNCTION public.prevent_self_team_id_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow if caller is admin/teamleiter or higher
  IF public.has_min_role(auth.uid(), 'teamleiter'::app_role) THEN
    RETURN NEW;
  END IF;

  -- For self-updates, lock down team_id and assigned_to
  IF NEW.user_id = auth.uid() THEN
    IF NEW.team_id IS DISTINCT FROM OLD.team_id THEN
      RAISE EXCEPTION 'Not allowed to change team_id';
    END IF;
    IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to THEN
      RAISE EXCEPTION 'Not allowed to change assigned_to';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_self_team_id_change ON public.profiles;
CREATE TRIGGER trg_prevent_self_team_id_change
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_self_team_id_change();

-- 2) Restrict Realtime channel subscriptions to staff only
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'realtime' AND tablename = 'messages'
      AND policyname = 'Authenticated can receive realtime'
  ) THEN
    EXECUTE 'DROP POLICY "Authenticated can receive realtime" ON realtime.messages';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'realtime' AND tablename = 'messages'
      AND policyname = 'Staff can receive realtime'
  ) THEN
    EXECUTE 'DROP POLICY "Staff can receive realtime" ON realtime.messages';
  END IF;
END $$;

CREATE POLICY "Staff can receive realtime"
ON realtime.messages
FOR SELECT
TO authenticated
USING (public.has_min_role(auth.uid(), 'mitarbeiter'::app_role));

-- 3) Remove broad public UPDATE policy on offers; acceptance must go through accept_offer_by_token RPC
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'offers'
      AND policyname = 'Public can accept via token'
  ) THEN
    EXECUTE 'DROP POLICY "Public can accept via token" ON public.offers';
  END IF;
END $$;

-- 4) Add explicit UPDATE policy for lead-imports bucket (staff only)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Staff can update lead-imports objects'
  ) THEN
    EXECUTE 'DROP POLICY "Staff can update lead-imports objects" ON storage.objects';
  END IF;
END $$;

CREATE POLICY "Staff can update lead-imports objects"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'lead-imports' AND public.has_min_role(auth.uid(), 'mitarbeiter'::app_role))
WITH CHECK (bucket_id = 'lead-imports' AND public.has_min_role(auth.uid(), 'mitarbeiter'::app_role));
