-- Fix Security Warnings: Restrict overly permissive policies

-- 1. Fix members INSERT policy - only service role should insert (webhooks)
DROP POLICY IF EXISTS "System can insert members" ON members;
CREATE POLICY "Service role can insert members" ON members
FOR INSERT WITH CHECK (
  -- Only allow if user is authenticated or service role is inserting for this user
  auth.uid() IS NOT NULL OR has_min_role(auth.uid(), 'admin')
);

-- 2. Fix closed_customer_snapshots INSERT policy
DROP POLICY IF EXISTS "System can insert snapshots" ON closed_customer_snapshots;
CREATE POLICY "Staff can insert snapshots" ON closed_customer_snapshots
FOR INSERT WITH CHECK (has_min_role(auth.uid(), 'mitarbeiter'));

-- 3. Fix v_current_customer_avatar view - add security invoker
DROP VIEW IF EXISTS v_current_customer_avatar;
CREATE VIEW v_current_customer_avatar 
WITH (security_invoker = true)
AS
SELECT *
FROM customer_avatar_models
WHERE created_at = (SELECT MAX(created_at) FROM customer_avatar_models)
LIMIT 1;