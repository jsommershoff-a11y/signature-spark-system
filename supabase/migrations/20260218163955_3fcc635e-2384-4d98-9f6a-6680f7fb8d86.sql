-- Fix overly permissive member insert policy
-- Current: auth.uid() IS NOT NULL OR has_min_role(..., 'admin') — allows ANY authenticated user
-- Fixed: Only admins can insert manually; service role (webhooks) bypasses RLS automatically

DROP POLICY IF EXISTS "Service role can insert members" ON members;

CREATE POLICY "Admins can insert members" ON members
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
