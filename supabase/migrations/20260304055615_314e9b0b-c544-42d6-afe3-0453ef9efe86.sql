
-- Step 01: Add missing scheduled_at to email_messages
ALTER TABLE public.email_messages 
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;

-- Verify all RLS is enabled (idempotent)
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_strategy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_sequence_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_broadcasts ENABLE ROW LEVEL SECURITY;
