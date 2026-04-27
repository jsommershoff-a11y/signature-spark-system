REVOKE EXECUTE ON FUNCTION public.start_member_trial() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_member_trial() TO authenticated;