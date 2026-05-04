ALTER TABLE public.newsletter_signups
  ADD COLUMN IF NOT EXISTS confirm_token TEXT,
  ADD COLUMN IF NOT EXISTS confirmation_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS confirmation_ip TEXT,
  ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_signups_confirm_token
  ON public.newsletter_signups (confirm_token)
  WHERE confirm_token IS NOT NULL;