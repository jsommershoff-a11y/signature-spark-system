CREATE POLICY "Staff can view portal logins"
ON public.portal_login_events
FOR SELECT
TO authenticated
USING (public.has_min_role(auth.uid(), 'mitarbeiter'::app_role));