CREATE TABLE IF NOT EXISTS public.newsletter_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  whatsapp TEXT NOT NULL,
  source TEXT,
  trial_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  user_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  consent_marketing BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'new',
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_newsletter_signups_email ON public.newsletter_signups (lower(email));

ALTER TABLE public.newsletter_signups ENABLE ROW LEVEL SECURITY;

-- Public can NOT select (PII protection); inserts only via edge function (service role)
CREATE POLICY "Admins can view newsletter signups"
ON public.newsletter_signups
FOR SELECT
TO authenticated
USING (public.has_min_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update newsletter signups"
ON public.newsletter_signups
FOR UPDATE
TO authenticated
USING (public.has_min_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_newsletter_signups_updated_at
BEFORE UPDATE ON public.newsletter_signups
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();