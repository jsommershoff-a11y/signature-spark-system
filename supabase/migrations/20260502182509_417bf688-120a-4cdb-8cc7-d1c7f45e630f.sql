ALTER TABLE public.follow_up_templates
  ADD COLUMN IF NOT EXISTS active_from timestamptz,
  ADD COLUMN IF NOT EXISTS active_until timestamptz;

CREATE INDEX IF NOT EXISTS idx_follow_up_templates_active_window
  ON public.follow_up_templates (is_active, active_from, active_until);