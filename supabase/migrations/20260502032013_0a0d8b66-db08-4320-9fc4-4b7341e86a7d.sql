-- =========================================================================
-- Helper: trigger_send_push (asynchroner HTTP-Call an send-push)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.trigger_send_push(
  _user_id uuid,
  _category text,
  _title text,
  _body text DEFAULT NULL,
  _link text DEFAULT NULL,
  _data jsonb DEFAULT '{}'::jsonb,
  _force boolean DEFAULT false
) RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  _request_id bigint;
  _url text := 'https://onbxoflsgrwdszjltnge.supabase.co/functions/v1/send-push';
  _anon text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYnhvZmxzZ3J3ZHN6amx0bmdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzOTc4NDIsImV4cCI6MjA4NTk3Mzg0Mn0.5ZsfdmpwROPn_DRYKAR0PseLdfH_Ur9Zho4lmeXmDfU';
BEGIN
  IF _user_id IS NULL THEN RETURN NULL; END IF;

  SELECT net.http_post(
    url := _url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || _anon
    ),
    body := jsonb_build_object(
      'user_id', _user_id,
      'category', _category,
      'title', _title,
      'body', _body,
      'link', _link,
      'data', _data,
      'force', _force
    )
  ) INTO _request_id;

  RETURN _request_id;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'trigger_send_push failed: %', SQLERRM;
  RETURN NULL;
END;
$$;

-- =========================================================================
-- 1) Neuer Lead (crm_leads INSERT) -> Admins (admin_alerts)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.push_on_new_lead()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin uuid;
  v_name text;
BEGIN
  v_name := COALESCE(NULLIF(trim(concat_ws(' ', NEW.first_name, NEW.last_name)), ''), NEW.email, 'Neuer Lead');
  FOR v_admin IN
    SELECT user_id FROM user_roles WHERE role = 'admin'::app_role
  LOOP
    PERFORM trigger_send_push(
      v_admin,
      'admin_alerts',
      'Neuer Lead: ' || v_name,
      COALESCE(NEW.company, NEW.email),
      '/app/leads',
      jsonb_build_object('lead_id', NEW.id)
    );
  END LOOP;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_push_on_new_lead ON public.crm_leads;
CREATE TRIGGER trg_push_on_new_lead
AFTER INSERT ON public.crm_leads
FOR EACH ROW EXECUTE FUNCTION public.push_on_new_lead();

-- =========================================================================
-- 2) Neue bezahlte Bestellung (orders.status -> paid) -> Admins
-- =========================================================================
CREATE OR REPLACE FUNCTION public.push_on_order_paid()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin uuid;
  v_amount text;
BEGIN
  IF NEW.status::text <> 'paid' THEN RETURN NEW; END IF;
  IF OLD.status::text = 'paid' THEN RETURN NEW; END IF;

  v_amount := to_char((COALESCE(NEW.amount_cents,0)::numeric / 100), 'FM999G999D00') || ' ' || COALESCE(NEW.currency,'EUR');

  FOR v_admin IN
    SELECT user_id FROM user_roles WHERE role = 'admin'::app_role
  LOOP
    PERFORM trigger_send_push(
      v_admin,
      'admin_alerts',
      'Zahlung eingegangen: ' || v_amount,
      'Order ' || COALESCE(NEW.provider_order_id, NEW.id::text),
      '/app/coo',
      jsonb_build_object('order_id', NEW.id, 'lead_id', NEW.lead_id)
    );
  END LOOP;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_push_on_order_paid ON public.orders;
CREATE TRIGGER trg_push_on_order_paid
AFTER UPDATE OF status ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.push_on_order_paid();

-- =========================================================================
-- 3) Neue Slot-Buchung -> zuständiger Mitarbeiter (member_alerts)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.push_on_slot_booked()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user uuid;
  v_start timestamptz;
BEGIN
  -- profile_id im slot_bookings ist der zuständige Mitarbeiter
  SELECT user_id INTO v_user FROM profiles WHERE id = NEW.profile_id;
  SELECT start_at INTO v_start FROM availability_slots WHERE id = NEW.slot_id;

  IF v_user IS NOT NULL THEN
    PERFORM trigger_send_push(
      v_user,
      'member_alerts',
      'Neue Buchung: ' || COALESCE(NEW.contact_name, NEW.contact_email, 'Termin'),
      'Termin am ' || to_char(COALESCE(v_start, now()) AT TIME ZONE 'Europe/Berlin', 'DD.MM.YYYY HH24:MI'),
      '/app/calls',
      jsonb_build_object('booking_id', NEW.id, 'slot_id', NEW.slot_id, 'lead_id', NEW.lead_id)
    );
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_push_on_slot_booked ON public.slot_bookings;
CREATE TRIGGER trg_push_on_slot_booked
AFTER INSERT ON public.slot_bookings
FOR EACH ROW EXECUTE FUNCTION public.push_on_slot_booked();

-- =========================================================================
-- 4) Eingehender Sipgate-Anruf -> Lead-Owner (incoming_calls)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.push_on_incoming_call()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_owner_profile uuid;
  v_owner_user uuid;
  v_phone text;
  v_name text;
  v_direction text;
BEGIN
  IF NEW.provider <> 'sipgate' THEN RETURN NEW; END IF;
  IF NEW.status <> 'in_progress' THEN RETURN NEW; END IF;

  v_direction := COALESCE(NEW.meta->>'direction', '');
  IF v_direction <> 'INCOMING' THEN RETURN NEW; END IF;

  v_phone := COALESCE(NEW.meta->>'source', 'Unbekannt');

  IF NEW.lead_id IS NOT NULL THEN
    SELECT owner_user_id, COALESCE(NULLIF(trim(concat_ws(' ', first_name, last_name)),''), company, email)
      INTO v_owner_profile, v_name
    FROM crm_leads WHERE id = NEW.lead_id;

    IF v_owner_profile IS NOT NULL THEN
      SELECT user_id INTO v_owner_user FROM profiles WHERE id = v_owner_profile;
    END IF;
  END IF;

  -- Fallback: alle Admins
  IF v_owner_user IS NULL THEN
    DECLARE v_admin uuid;
    BEGIN
      FOR v_admin IN SELECT user_id FROM user_roles WHERE role = 'admin'::app_role LOOP
        PERFORM trigger_send_push(
          v_admin, 'incoming_calls',
          'Eingehender Anruf',
          v_phone,
          '/app/calls',
          jsonb_build_object('call_id', NEW.id, 'phone', v_phone)
        );
      END LOOP;
    END;
  ELSE
    PERFORM trigger_send_push(
      v_owner_user, 'incoming_calls',
      'Anruf: ' || COALESCE(v_name, v_phone),
      v_phone,
      '/app/calls/' || NEW.id::text,
      jsonb_build_object('call_id', NEW.id, 'lead_id', NEW.lead_id, 'phone', v_phone)
    );
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_push_on_incoming_call ON public.calls;
CREATE TRIGGER trg_push_on_incoming_call
AFTER INSERT ON public.calls
FOR EACH ROW EXECUTE FUNCTION public.push_on_incoming_call();

-- =========================================================================
-- 5) Angebot akzeptiert (offers.status -> accepted) -> Admins
-- =========================================================================
CREATE OR REPLACE FUNCTION public.push_on_offer_accepted()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin uuid;
  v_lead_name text;
BEGIN
  IF NEW.status::text <> 'accepted' THEN RETURN NEW; END IF;
  IF OLD.status::text = 'accepted' THEN RETURN NEW; END IF;

  SELECT COALESCE(NULLIF(trim(concat_ws(' ', first_name, last_name)),''), company, email)
    INTO v_lead_name FROM crm_leads WHERE id = NEW.lead_id;

  FOR v_admin IN SELECT user_id FROM user_roles WHERE role = 'admin'::app_role LOOP
    PERFORM trigger_send_push(
      v_admin, 'admin_alerts',
      'Angebot angenommen 🎉',
      COALESCE(v_lead_name, 'Ein Kunde hat unterschrieben'),
      '/app/offers/' || NEW.id::text,
      jsonb_build_object('offer_id', NEW.id, 'lead_id', NEW.lead_id)
    );
  END LOOP;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_push_on_offer_accepted ON public.offers;
CREATE TRIGGER trg_push_on_offer_accepted
AFTER UPDATE OF status ON public.offers
FOR EACH ROW EXECUTE FUNCTION public.push_on_offer_accepted();

-- =========================================================================
-- 6) Lifecycle: Trial endet bald (3 Tage) / Past Due
-- =========================================================================
CREATE OR REPLACE FUNCTION public.cron_push_lifecycle()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r RECORD;
  v_days int;
BEGIN
  -- Trial endet in 3 Tagen (einmal pro User pro Trial-Phase: dedup via meta-flag)
  FOR r IN
    SELECT user_id, full_name, trial_ends_at
    FROM profiles
    WHERE subscription_status = 'trialing'
      AND trial_ends_at IS NOT NULL
      AND trial_ends_at > now()
      AND trial_ends_at <= now() + interval '3 days'
      AND (meta IS NULL OR (meta->>'push_trial_warned_at') IS NULL
           OR (meta->>'push_trial_warned_at')::timestamptz < now() - interval '5 days')
  LOOP
    v_days := GREATEST(0, CEIL(EXTRACT(EPOCH FROM (r.trial_ends_at - now())) / 86400))::int;
    PERFORM trigger_send_push(
      r.user_id, 'lifecycle',
      'Deine Testphase endet in ' || v_days || ' Tagen',
      'Sichere dir jetzt deinen Zugang, bevor er ausläuft.',
      '/app/upgrade',
      jsonb_build_object('trial_ends_at', r.trial_ends_at)
    );
    UPDATE profiles
       SET meta = COALESCE(meta,'{}'::jsonb) || jsonb_build_object('push_trial_warned_at', now())
     WHERE user_id = r.user_id;
  END LOOP;

  -- Past due (Zahlung fehlgeschlagen) - max alle 3 Tage
  FOR r IN
    SELECT user_id
    FROM profiles
    WHERE subscription_status = 'past_due'
      AND (meta IS NULL OR (meta->>'push_pastdue_at') IS NULL
           OR (meta->>'push_pastdue_at')::timestamptz < now() - interval '3 days')
  LOOP
    PERFORM trigger_send_push(
      r.user_id, 'lifecycle',
      'Zahlung fehlgeschlagen',
      'Bitte aktualisiere deine Zahlungsmethode, um den Zugang zu behalten.',
      '/app/settings',
      '{}'::jsonb
    );
    UPDATE profiles
       SET meta = COALESCE(meta,'{}'::jsonb) || jsonb_build_object('push_pastdue_at', now())
     WHERE user_id = r.user_id;
  END LOOP;
END $$;

-- Cron: täglich 09:00 UTC (= 10:00 / 11:00 Europe/Berlin)
SELECT cron.unschedule('push-lifecycle-daily')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'push-lifecycle-daily');

SELECT cron.schedule(
  'push-lifecycle-daily',
  '0 9 * * *',
  $cron$ SELECT public.cron_push_lifecycle(); $cron$
);