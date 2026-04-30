
-- Insert-Policy verschärfen: nur authentifizierte Admins dürfen direkt einfügen.
-- (Die Purge-Funktion läuft als SECURITY DEFINER und umgeht RLS ohnehin.)
DROP POLICY IF EXISTS "System can insert audit logs" ON public.admin_audit_logs;

CREATE POLICY "Admins can insert audit logs"
ON public.admin_audit_logs FOR INSERT
TO authenticated
WITH CHECK (public.has_min_role(auth.uid(), 'admin'::app_role));

-- Purge-Funktion: nicht öffentlich ausführbar
REVOKE EXECUTE ON FUNCTION public.purge_old_soft_deleted() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_old_soft_deleted() TO postgres, service_role;
