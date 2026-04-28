ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS invite_link text,
  ADD COLUMN IF NOT EXISTS email_provider text,
  ADD COLUMN IF NOT EXISTS email_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_error text,
  ADD COLUMN IF NOT EXISTS tried_providers text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS last_attempt_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_invitations_email_created_at
  ON public.invitations (lower(email), created_at DESC);