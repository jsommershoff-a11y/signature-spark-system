-- Email consent tracking for GDPR-compliant double opt-in

CREATE TYPE public.email_consent_status AS ENUM ('pending', 'confirmed', 'revoked');

CREATE TABLE public.email_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'notifications',
  source TEXT,
  status public.email_consent_status NOT NULL DEFAULT 'pending',
  confirmation_token TEXT NOT NULL DEFAULT encode(extensions.gen_random_bytes(32), 'hex'),
  requested_ip TEXT,
  requested_user_agent TEXT,
  confirmed_at TIMESTAMPTZ,
  confirmed_ip TEXT,
  revoked_at TIMESTAMPTZ,
  revoked_ip TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_email_consents_email_purpose_active
  ON public.email_consents (lower(email), purpose)
  WHERE status IN ('pending', 'confirmed');

CREATE INDEX idx_email_consents_token ON public.email_consents (confirmation_token);
CREATE INDEX idx_email_consents_status ON public.email_consents (status);

ALTER TABLE public.email_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access email_consents"
  ON public.email_consents
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow public (anon + authenticated) to request a new consent (initial opt-in submission)
CREATE POLICY "Public can request consent"
  ON public.email_consents
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND confirmed_at IS NULL
    AND revoked_at IS NULL
  );

CREATE TRIGGER update_email_consents_updated_at
  BEFORE UPDATE ON public.email_consents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Helper function for edge functions / send pipeline to check active consent
CREATE OR REPLACE FUNCTION public.has_email_consent(_email TEXT, _purpose TEXT DEFAULT 'notifications')
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.email_consents
    WHERE lower(email) = lower(_email)
      AND purpose = _purpose
      AND status = 'confirmed'
  );
$$;