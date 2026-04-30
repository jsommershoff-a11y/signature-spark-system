
-- 1. Admin Audit Log Tabelle
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  source TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  affected_count INTEGER DEFAULT 0,
  performed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON public.admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_logs FOR SELECT
USING (public.has_min_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert audit logs"
ON public.admin_audit_logs FOR INSERT
WITH CHECK (true);

-- 2. Purge-Funktion: löscht endgültig nach 30 Tagen Soft-Delete
CREATE OR REPLACE FUNCTION public.purge_old_soft_deleted()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _cutoff timestamptz := now() - interval '30 days';
  _deleted_leads jsonb;
  _deleted_profiles jsonb;
  _lead_count int := 0;
  _profile_count int := 0;
BEGIN
  -- crm_leads endgültig löschen
  WITH deleted AS (
    DELETE FROM public.crm_leads
    WHERE deleted_at IS NOT NULL AND deleted_at < _cutoff
    RETURNING id, email, first_name, last_name, deleted_at, deleted_by
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(deleted)), '[]'::jsonb), COUNT(*)
  INTO _deleted_leads, _lead_count
  FROM deleted;

  -- profiles endgültig löschen
  WITH deleted AS (
    DELETE FROM public.profiles
    WHERE deleted_at IS NOT NULL AND deleted_at < _cutoff
    RETURNING id, email, full_name, deleted_at, deleted_by
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(deleted)), '[]'::jsonb), COUNT(*)
  INTO _deleted_profiles, _profile_count
  FROM deleted;

  -- Im Audit-Log protokollieren (immer, auch bei 0)
  INSERT INTO public.admin_audit_logs (action, source, details, affected_count, performed_by)
  VALUES (
    'purge_soft_deleted',
    'cron',
    jsonb_build_object(
      'cutoff', _cutoff,
      'crm_leads_purged', _lead_count,
      'profiles_purged', _profile_count,
      'crm_leads', _deleted_leads,
      'profiles', _deleted_profiles
    ),
    _lead_count + _profile_count,
    NULL
  );

  RETURN jsonb_build_object(
    'cutoff', _cutoff,
    'crm_leads_purged', _lead_count,
    'profiles_purged', _profile_count,
    'total', _lead_count + _profile_count
  );
END;
$$;

-- 3. Cron-Job: täglich um 03:15 UTC
SELECT cron.unschedule('purge-soft-deleted-daily')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purge-soft-deleted-daily');

SELECT cron.schedule(
  'purge-soft-deleted-daily',
  '15 3 * * *',
  $$ SELECT public.purge_old_soft_deleted(); $$
);
