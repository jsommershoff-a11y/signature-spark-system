-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE public.slot_status AS ENUM ('free', 'held', 'booked', 'blocked', 'cancelled');
CREATE TYPE public.slot_source AS ENUM ('manual', 'google_busy', 'recurring');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'cancelled_by_organizer', 'no_show', 'completed');

-- ============================================================
-- google_calendar_accounts
-- ============================================================
CREATE TABLE public.google_calendar_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE,
  google_sub TEXT,
  email TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  scope TEXT,
  primary_calendar_id TEXT NOT NULL DEFAULT 'primary',
  sync_token TEXT,
  watch_channel_id TEXT,
  watch_resource_id TEXT,
  watch_expires_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  last_sync_error TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gca_profile ON public.google_calendar_accounts(profile_id);
CREATE INDEX idx_gca_channel ON public.google_calendar_accounts(watch_channel_id) WHERE watch_channel_id IS NOT NULL;
CREATE INDEX idx_gca_watch_expires ON public.google_calendar_accounts(watch_expires_at) WHERE is_active;

ALTER TABLE public.google_calendar_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can read own gcal account"
  ON public.google_calendar_accounts FOR SELECT
  USING (profile_id = public.get_user_profile_id(auth.uid()));

CREATE POLICY "Owner can update own gcal account"
  ON public.google_calendar_accounts FOR UPDATE
  USING (profile_id = public.get_user_profile_id(auth.uid()));

CREATE POLICY "Owner can delete own gcal account"
  ON public.google_calendar_accounts FOR DELETE
  USING (profile_id = public.get_user_profile_id(auth.uid()));

CREATE POLICY "Admin full access gcal accounts"
  ON public.google_calendar_accounts FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_gca_updated_at BEFORE UPDATE ON public.google_calendar_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- availability_slots
-- ============================================================
CREATE TABLE public.availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status public.slot_status NOT NULL DEFAULT 'free',
  source public.slot_source NOT NULL DEFAULT 'manual',
  google_event_id TEXT,
  google_calendar_id TEXT,
  google_event_summary TEXT,
  conflict_reason TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_slot_time CHECK (end_at > start_at)
);

CREATE INDEX idx_slots_profile_time ON public.availability_slots(profile_id, start_at, end_at);
CREATE INDEX idx_slots_status ON public.availability_slots(status);
CREATE INDEX idx_slots_google_event ON public.availability_slots(google_event_id) WHERE google_event_id IS NOT NULL;
CREATE UNIQUE INDEX uq_slots_google_event ON public.availability_slots(profile_id, google_event_id) WHERE google_event_id IS NOT NULL;

ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can read own slots"
  ON public.availability_slots FOR SELECT
  USING (profile_id = public.get_user_profile_id(auth.uid()));

CREATE POLICY "Owner can insert own slots"
  ON public.availability_slots FOR INSERT
  WITH CHECK (profile_id = public.get_user_profile_id(auth.uid()));

CREATE POLICY "Owner can update own slots"
  ON public.availability_slots FOR UPDATE
  USING (profile_id = public.get_user_profile_id(auth.uid()));

CREATE POLICY "Owner can delete own slots"
  ON public.availability_slots FOR DELETE
  USING (profile_id = public.get_user_profile_id(auth.uid()));

CREATE POLICY "Staff can read team slots"
  ON public.availability_slots FOR SELECT
  USING (public.has_min_role(auth.uid(), 'teamleiter'::app_role));

CREATE POLICY "Admin full access slots"
  ON public.availability_slots FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_slots_updated_at BEFORE UPDATE ON public.availability_slots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- slot_bookings
-- ============================================================
CREATE TABLE public.slot_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES public.availability_slots(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL,
  lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
  contact_email TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT,
  topic TEXT,
  status public.booking_status NOT NULL DEFAULT 'pending',
  google_event_id TEXT,
  google_calendar_id TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  notification_sent_at TIMESTAMPTZ,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_slot ON public.slot_bookings(slot_id);
CREATE INDEX idx_bookings_profile ON public.slot_bookings(profile_id);
CREATE INDEX idx_bookings_lead ON public.slot_bookings(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX idx_bookings_google_event ON public.slot_bookings(google_event_id) WHERE google_event_id IS NOT NULL;
CREATE INDEX idx_bookings_status ON public.slot_bookings(status);

ALTER TABLE public.slot_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can read own bookings"
  ON public.slot_bookings FOR SELECT
  USING (profile_id = public.get_user_profile_id(auth.uid()));

CREATE POLICY "Owner can update own bookings"
  ON public.slot_bookings FOR UPDATE
  USING (profile_id = public.get_user_profile_id(auth.uid()));

CREATE POLICY "Staff can read team bookings"
  ON public.slot_bookings FOR SELECT
  USING (public.has_min_role(auth.uid(), 'teamleiter'::app_role));

CREATE POLICY "Admin full access bookings"
  ON public.slot_bookings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON public.slot_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- CONFLICT-DETECTION-TRIGGER
-- Verhindert: 2 Slots desselben Mitarbeiters überschneiden sich,
-- wenn mindestens einer 'booked' oder 'blocked' ist.
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_slot_conflict()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conflict_count INT;
BEGIN
  -- Nur prüfen wenn Slot belegt ist
  IF NEW.status NOT IN ('booked', 'blocked', 'held') THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO conflict_count
  FROM public.availability_slots s
  WHERE s.profile_id = NEW.profile_id
    AND s.id != NEW.id
    AND s.status IN ('booked', 'blocked', 'held')
    AND tstzrange(s.start_at, s.end_at, '[)') && tstzrange(NEW.start_at, NEW.end_at, '[)');

  IF conflict_count > 0 THEN
    RAISE EXCEPTION 'Slot-Konflikt: Es existiert bereits ein belegter Slot in diesem Zeitraum (profile_id=%, %-%).',
      NEW.profile_id, NEW.start_at, NEW.end_at
      USING ERRCODE = '23P01';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_slot_conflict
  BEFORE INSERT OR UPDATE OF start_at, end_at, status, profile_id
  ON public.availability_slots
  FOR EACH ROW EXECUTE FUNCTION public.check_slot_conflict();

-- ============================================================
-- RPC: list_free_slots_public
-- Öffentliche freie Slots für Buchungsseite
-- ============================================================
CREATE OR REPLACE FUNCTION public.list_free_slots_public(
  _profile_id UUID,
  _from TIMESTAMPTZ DEFAULT now(),
  _to TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days')
)
RETURNS TABLE (
  id UUID,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id, s.start_at, s.end_at
  FROM public.availability_slots s
  WHERE s.profile_id = _profile_id
    AND s.status = 'free'
    AND s.start_at >= _from
    AND s.start_at <= _to
    AND s.start_at > now()
  ORDER BY s.start_at
  LIMIT 200;
$$;

GRANT EXECUTE ON FUNCTION public.list_free_slots_public(UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO anon, authenticated;

-- ============================================================
-- RPC: book_slot_public
-- Anonyme Buchung mit atomarem Lock
-- ============================================================
CREATE OR REPLACE FUNCTION public.book_slot_public(
  _slot_id UUID,
  _contact_name TEXT,
  _contact_email TEXT,
  _contact_phone TEXT DEFAULT NULL,
  _topic TEXT DEFAULT NULL,
  _lead_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _slot RECORD;
  _booking_id UUID;
BEGIN
  -- Validierung
  IF _contact_name IS NULL OR length(trim(_contact_name)) < 2 OR length(_contact_name) > 200 THEN
    RAISE EXCEPTION 'Invalid contact_name';
  END IF;
  IF _contact_email IS NULL OR _contact_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' OR length(_contact_email) > 320 THEN
    RAISE EXCEPTION 'Invalid contact_email';
  END IF;
  IF _topic IS NOT NULL AND length(_topic) > 1000 THEN
    RAISE EXCEPTION 'Topic too long';
  END IF;

  -- Atomar locken
  SELECT * INTO _slot
  FROM public.availability_slots
  WHERE id = _slot_id AND status = 'free' AND start_at > now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Slot nicht mehr verfügbar';
  END IF;

  -- Slot belegen
  UPDATE public.availability_slots
  SET status = 'booked', updated_at = now()
  WHERE id = _slot_id;

  -- Buchung anlegen
  INSERT INTO public.slot_bookings (
    slot_id, profile_id, lead_id, contact_email, contact_name,
    contact_phone, topic, status
  ) VALUES (
    _slot_id, _slot.profile_id, _lead_id, lower(trim(_contact_email)),
    trim(_contact_name), _contact_phone, _topic, 'pending'
  )
  RETURNING id INTO _booking_id;

  RETURN _booking_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.book_slot_public(UUID, TEXT, TEXT, TEXT, TEXT, UUID) TO anon, authenticated;

-- ============================================================
-- RPC: release_slot_for_google_event
-- Wird vom Sync aufgerufen wenn Google-Event gelöscht wurde.
-- Setzt Slot wieder auf 'free' und markiert Buchung.
-- ============================================================
CREATE OR REPLACE FUNCTION public.release_slot_for_google_event(
  _profile_id UUID,
  _google_event_id TEXT,
  _reason TEXT DEFAULT 'Google-Termin wurde gelöscht'
)
RETURNS TABLE (
  slot_id UUID,
  booking_id UUID,
  contact_email TEXT,
  contact_name TEXT,
  start_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _slot RECORD;
  _booking RECORD;
BEGIN
  -- Slot finden (kann manueller Block oder Lead-Buchung sein)
  SELECT * INTO _slot
  FROM public.availability_slots
  WHERE profile_id = _profile_id AND google_event_id = _google_event_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Zugehörige Buchung suchen
  SELECT * INTO _booking
  FROM public.slot_bookings
  WHERE slot_id = _slot.id
  ORDER BY created_at DESC
  LIMIT 1;

  -- Slot freigeben (oder löschen, wenn nur durch google_busy blockiert)
  IF _slot.source = 'google_busy' AND _booking IS NULL THEN
    DELETE FROM public.availability_slots WHERE id = _slot.id;
  ELSE
    UPDATE public.availability_slots
    SET status = 'free',
        google_event_id = NULL,
        google_calendar_id = NULL,
        google_event_summary = NULL,
        conflict_reason = _reason,
        updated_at = now()
    WHERE id = _slot.id;
  END IF;

  -- Buchung als storniert markieren
  IF _booking IS NOT NULL THEN
    UPDATE public.slot_bookings
    SET status = 'cancelled_by_organizer',
        cancellation_reason = _reason,
        cancelled_at = now(),
        updated_at = now()
    WHERE id = _booking.id;
  END IF;

  RETURN QUERY SELECT
    _slot.id, _booking.id, _booking.contact_email, _booking.contact_name, _slot.start_at;
END;
$$;

-- ============================================================
-- RPC: update_slot_for_google_event
-- Bei Verschiebung eines Google-Termins
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_slot_for_google_event(
  _profile_id UUID,
  _google_event_id TEXT,
  _new_start TIMESTAMPTZ,
  _new_end TIMESTAMPTZ,
  _summary TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _slot_id UUID;
BEGIN
  UPDATE public.availability_slots
  SET start_at = _new_start,
      end_at = _new_end,
      google_event_summary = COALESCE(_summary, google_event_summary),
      updated_at = now()
  WHERE profile_id = _profile_id AND google_event_id = _google_event_id
  RETURNING id INTO _slot_id;

  RETURN _slot_id;
END;
$$;