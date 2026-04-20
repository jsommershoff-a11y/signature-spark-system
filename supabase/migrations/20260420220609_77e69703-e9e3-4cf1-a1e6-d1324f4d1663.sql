-- 1. Fix has_min_role to include legacy roles used in RLS policies
CREATE OR REPLACE FUNCTION public.has_min_role(_user_id uuid, _min_role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND (
        CASE ur.role::text
          WHEN 'admin' THEN 100
          WHEN 'geschaeftsfuehrung' THEN 80
          WHEN 'teamleiter' THEN 60
          WHEN 'vertriebspartner' THEN 50
          WHEN 'gruppenbetreuer' THEN 50
          WHEN 'mitarbeiter' THEN 40
          WHEN 'member_pro' THEN 30
          WHEN 'member_starter' THEN 20
          WHEN 'member_basic' THEN 10
          WHEN 'kunde' THEN 5
          WHEN 'user' THEN 5
          WHEN 'guest' THEN 0
          ELSE 0
        END
      ) >= (
        CASE _min_role::text
          WHEN 'admin' THEN 100
          WHEN 'geschaeftsfuehrung' THEN 80
          WHEN 'teamleiter' THEN 60
          WHEN 'vertriebspartner' THEN 50
          WHEN 'gruppenbetreuer' THEN 50
          WHEN 'mitarbeiter' THEN 40
          WHEN 'member_pro' THEN 30
          WHEN 'member_starter' THEN 20
          WHEN 'member_basic' THEN 10
          WHEN 'kunde' THEN 5
          WHEN 'user' THEN 5
          WHEN 'guest' THEN 0
          ELSE 999  -- unknown min role => deny
        END
      )
  )
$function$;

-- 2. Lock down offers public read: drop the broad public policy and replace with token-validated RPC
DROP POLICY IF EXISTS "Public can view via token" ON public.offers;

-- RPC to fetch an offer by its public token (validates token per-row, no anonymous SELECT on table)
CREATE OR REPLACE FUNCTION public.get_offer_by_public_token(_token text)
 RETURNS TABLE (
   id uuid,
   lead_id uuid,
   status text,
   offer_json jsonb,
   public_token text,
   payment_unlocked boolean,
   expires_at timestamptz,
   viewed_at timestamptz,
   created_at timestamptz,
   updated_at timestamptz,
   lead_first_name text,
   lead_last_name text,
   lead_email text,
   lead_company text
 )
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT
    o.id, o.lead_id, o.status::text, o.offer_json, o.public_token,
    o.payment_unlocked, o.expires_at, o.viewed_at, o.created_at, o.updated_at,
    l.first_name, l.last_name, l.email, l.company
  FROM public.offers o
  LEFT JOIN public.crm_leads l ON l.id = o.lead_id
  WHERE o.public_token = _token
    AND _token IS NOT NULL
    AND length(_token) >= 16
  LIMIT 1;
$$;

-- RPC to mark as viewed (token-validated)
CREATE OR REPLACE FUNCTION public.mark_offer_viewed(_token text)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  UPDATE public.offers
  SET status = 'viewed', viewed_at = now(), updated_at = now()
  WHERE public_token = _token
    AND _token IS NOT NULL
    AND length(_token) >= 16
    AND status = 'sent';
$$;

-- RPC to accept an offer with signature (token-validated)
CREATE OR REPLACE FUNCTION public.accept_offer_by_token(
  _token text,
  _signer_name text,
  _signature_data text
)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  _offer_id uuid;
BEGIN
  IF _token IS NULL OR length(_token) < 16 THEN
    RAISE EXCEPTION 'Invalid token';
  END IF;
  IF _signer_name IS NULL OR length(trim(_signer_name)) < 2 OR length(_signer_name) > 200 THEN
    RAISE EXCEPTION 'Invalid signer name';
  END IF;
  IF _signature_data IS NULL OR length(_signature_data) < 10 OR length(_signature_data) > 500000 THEN
    RAISE EXCEPTION 'Invalid signature';
  END IF;

  UPDATE public.offers o
  SET
    status = 'accepted',
    offer_json = COALESCE(o.offer_json, '{}'::jsonb) || jsonb_build_object(
      'contract_accepted', true,
      'contract_accepted_at', now(),
      'signer_name', _signer_name,
      'signature_data', _signature_data
    ),
    updated_at = now()
  WHERE o.public_token = _token
    AND o.status IN ('sent', 'viewed')
    AND (o.expires_at IS NULL OR o.expires_at > now())
  RETURNING o.id INTO _offer_id;

  IF _offer_id IS NULL THEN
    RAISE EXCEPTION 'Offer not found, expired, or already accepted';
  END IF;

  RETURN _offer_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_offer_by_public_token(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_offer_viewed(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.accept_offer_by_token(text, text, text) TO anon, authenticated;

-- 3. goal_milestones: restrict reads to milestones of goals the user is permitted to see
DROP POLICY IF EXISTS "Staff can read milestones" ON public.goal_milestones;
DROP POLICY IF EXISTS "Staff can manage milestones" ON public.goal_milestones;

CREATE POLICY "Users can read milestones for accessible goals"
ON public.goal_milestones
FOR SELECT
USING (
  goal_id IN (
    SELECT g.id FROM public.goals g
    WHERE has_role(auth.uid(), 'admin'::app_role)
       OR has_min_role(auth.uid(), 'teamleiter'::app_role)
       OR g.user_id = get_user_profile_id(auth.uid())
       OR g.created_by = get_user_profile_id(auth.uid())
  )
);

CREATE POLICY "Staff can manage milestones for managed goals"
ON public.goal_milestones
FOR ALL
USING (
  has_min_role(auth.uid(), 'teamleiter'::app_role)
  OR goal_id IN (
    SELECT g.id FROM public.goals g
    WHERE g.user_id = get_user_profile_id(auth.uid())
       OR g.created_by = get_user_profile_id(auth.uid())
  )
)
WITH CHECK (
  has_min_role(auth.uid(), 'teamleiter'::app_role)
  OR goal_id IN (
    SELECT g.id FROM public.goals g
    WHERE g.user_id = get_user_profile_id(auth.uid())
       OR g.created_by = get_user_profile_id(auth.uid())
  )
);

-- 4. Realtime channel authorization: restrict realtime.messages to authenticated users only.
-- Default-deny; any user must be authenticated to receive change events. Table-level RLS still
-- filters which rows a user sees on follow-up REST queries.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'realtime' AND tablename = 'messages'
  ) THEN
    EXECUTE 'ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated can receive realtime" ON realtime.messages';
    EXECUTE $p$
      CREATE POLICY "Authenticated can receive realtime"
      ON realtime.messages
      FOR SELECT
      TO authenticated
      USING (true)
    $p$;
  END IF;
END$$;