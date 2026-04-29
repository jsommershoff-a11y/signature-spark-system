-- Add restrictive admin-only policy for telegram_bot_state (only service role / admins)
CREATE POLICY "Admins can manage telegram bot state"
ON public.telegram_bot_state
FOR ALL
TO authenticated
USING (public.has_min_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_min_role(auth.uid(), 'admin'::app_role));

-- Revoke EXECUTE on internal trigger/helper functions that should not be callable via PostgREST
REVOKE EXECUTE ON FUNCTION public.assign_default_role() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.assign_lead_round_robin() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_slot_conflict() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_pipeline_item_for_lead() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enroll_lead_in_sequences() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_email_open_activity() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_offer_draft_approval() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_portal_login_event() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.mark_live_call_used() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_admins_on_new_lead() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_user(uuid, text, text, text, text, jsonb) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_self_team_id_change() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_auto_classify_slot() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_pipeline_after_analysis() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_pipeline_after_offer() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_pipeline_after_payment() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_pipeline_on_offer_draft() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_pipeline_on_offer_draft_created() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_pipeline_on_payment_unlock() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_pipeline_on_slot_booking() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_stripe_subscription(text, text, text, timestamptz, timestamptz, timestamptz, timestamptz, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.release_slot_for_google_event(uuid, text, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_slot_for_google_event(uuid, text, timestamptz, timestamptz, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.classify_slot_event(text, text, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_referral_code() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM anon, authenticated;

-- Revoke anon access on functions that should require login
REVOKE EXECUTE ON FUNCTION public.get_customers() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_team_member_ids(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_profile_id(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_team_id(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_view_profile(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_book_live_call(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_active_member(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_min_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_email_consent(text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.match_lead_by_phone(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_live_call_eligibility(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_upgrade_funnel_stats(timestamptz, timestamptz) FROM anon;
REVOKE EXECUTE ON FUNCTION public.approve_offer_draft(uuid) FROM anon;