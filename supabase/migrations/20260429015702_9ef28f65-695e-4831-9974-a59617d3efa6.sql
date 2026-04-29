
-- 1) Portal-Login-Events
CREATE TABLE public.portal_login_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text,
  ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_portal_login_events_user ON public.portal_login_events(user_id, created_at DESC);

ALTER TABLE public.portal_login_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own login events"
  ON public.portal_login_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own login events"
  ON public.portal_login_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all login events"
  ON public.portal_login_events FOR SELECT TO authenticated
  USING (public.has_min_role(auth.uid(), 'admin'::app_role));

-- 2) Profil-Spalten für Schnellzugriff
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_login_at timestamptz,
  ADD COLUMN IF NOT EXISTS login_count integer NOT NULL DEFAULT 0;

-- 3) Trigger: Login-Event => profiles aktualisieren
CREATE OR REPLACE FUNCTION public.handle_portal_login_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET last_login_at = NEW.created_at,
      login_count = COALESCE(login_count, 0) + 1
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER tg_portal_login_event_profile
AFTER INSERT ON public.portal_login_events
FOR EACH ROW EXECUTE FUNCTION public.handle_portal_login_event();

-- 4) Trigger: Mail-Öffnungen => activities (für Lead-Timeline)
CREATE OR REPLACE FUNCTION public.handle_email_open_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _lead_id uuid;
  _subject text;
  _exists boolean;
BEGIN
  IF NEW.event_type <> 'opened' THEN
    RETURN NEW;
  END IF;

  SELECT lead_id, subject INTO _lead_id, _subject
  FROM public.email_messages
  WHERE id = NEW.message_id;

  IF _lead_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Dedup: max. 1 'email-opened' Activity pro Nachricht
  SELECT EXISTS (
    SELECT 1 FROM public.activities
    WHERE lead_id = _lead_id
      AND type = 'email'
      AND metadata->>'event' = 'opened'
      AND metadata->>'message_id' = NEW.message_id::text
  ) INTO _exists;

  IF _exists THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.activities (lead_id, type, content, metadata)
  VALUES (
    _lead_id,
    'email'::activity_type,
    'E-Mail geöffnet: ' || COALESCE(_subject, '(ohne Betreff)'),
    jsonb_build_object(
      'event', 'opened',
      'message_id', NEW.message_id,
      'opened_at', NEW.created_at,
      'ip', NEW.metadata->>'ip',
      'user_agent', NEW.metadata->>'user_agent'
    )
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER tg_email_open_activity
AFTER INSERT ON public.email_events
FOR EACH ROW EXECUTE FUNCTION public.handle_email_open_activity();
