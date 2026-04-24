-- Enum für Slot-Kategorien
DO $$ BEGIN
  CREATE TYPE public.slot_category AS ENUM (
    'discovery_call',
    'closing',
    'strategy',
    'demo',
    'onboarding',
    'internal',
    'personal',
    'blocker',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Spalten an availability_slots
ALTER TABLE public.availability_slots
  ADD COLUMN IF NOT EXISTS slot_category public.slot_category,
  ADD COLUMN IF NOT EXISTS matched_rule_id uuid,
  ADD COLUMN IF NOT EXISTS auto_classified boolean NOT NULL DEFAULT false;

-- Klassifizierungsregeln
CREATE TABLE IF NOT EXISTS public.slot_classification_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category public.slot_category NOT NULL,
  keywords text[] NOT NULL DEFAULT '{}',
  priority integer NOT NULL DEFAULT 100,
  is_active boolean NOT NULL DEFAULT true,
  applies_to_source text NOT NULL DEFAULT 'google_busy',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.slot_classification_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage classification rules" ON public.slot_classification_rules;
CREATE POLICY "Admins manage classification rules"
  ON public.slot_classification_rules
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Staff read classification rules" ON public.slot_classification_rules;
CREATE POLICY "Staff read classification rules"
  ON public.slot_classification_rules
  FOR SELECT
  USING (public.has_min_role(auth.uid(), 'mitarbeiter'::app_role));

-- Updated-At-Trigger
DROP TRIGGER IF EXISTS trg_slot_rules_updated_at ON public.slot_classification_rules;
CREATE TRIGGER trg_slot_rules_updated_at
  BEFORE UPDATE ON public.slot_classification_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Default-Regeln
INSERT INTO public.slot_classification_rules (name, category, keywords, priority, applies_to_source) VALUES
  ('Discovery / Erstgespräch', 'discovery_call', ARRAY['discovery','erstgespräch','kennenlern','intro call','qualifizierung','strategiegespräch'], 200, 'google_busy'),
  ('Closing / Abschluss', 'closing', ARRAY['closing','abschluss','vertragsgespräch','signing'], 190, 'google_busy'),
  ('Strategie / Beratung', 'strategy', ARRAY['strategie','beratung','consulting','workshop'], 150, 'google_busy'),
  ('Demo / Präsentation', 'demo', ARRAY['demo','präsentation','walkthrough','showcase'], 140, 'google_busy'),
  ('Onboarding', 'onboarding', ARRAY['onboarding','kickoff','kick-off','setup','einarbeitung'], 130, 'google_busy'),
  ('Intern / Team', 'internal', ARRAY['intern','team','meeting','daily','standup','jour fixe','retro','planning'], 110, 'google_busy'),
  ('Privat / Urlaub', 'personal', ARRAY['privat','urlaub','arzt','frei','vacation','holiday','dentist'], 120, 'google_busy'),
  ('Blocker / Fokus', 'blocker', ARRAY['fokus','focus','deep work','blocker','do not disturb','dnd'], 100, 'google_busy')
ON CONFLICT DO NOTHING;

-- Klassifizierungs-Funktion
CREATE OR REPLACE FUNCTION public.classify_slot_event(
  _title text,
  _description text,
  _source text
)
RETURNS TABLE (category public.slot_category, rule_id uuid)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  haystack text;
  rule_record record;
  kw text;
BEGIN
  haystack := lower(coalesce(_title,'') || ' ' || coalesce(_description,''));

  FOR rule_record IN
    SELECT id, category, keywords
    FROM public.slot_classification_rules
    WHERE is_active = true
      AND applies_to_source = _source
    ORDER BY priority DESC, created_at ASC
  LOOP
    FOREACH kw IN ARRAY rule_record.keywords LOOP
      IF kw IS NOT NULL AND length(trim(kw)) > 0 AND haystack LIKE '%' || lower(kw) || '%' THEN
        category := rule_record.category;
        rule_id := rule_record.id;
        RETURN NEXT;
        RETURN;
      END IF;
    END LOOP;
  END LOOP;

  category := 'other'::public.slot_category;
  rule_id := NULL;
  RETURN NEXT;
END;
$$;

-- Trigger-Funktion: nur für google_busy automatisch
CREATE OR REPLACE FUNCTION public.tg_auto_classify_slot()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result record;
BEGIN
  IF NEW.source = 'google_busy'::slot_source
     AND (NEW.slot_category IS NULL OR NEW.auto_classified = true) THEN
    SELECT category, rule_id INTO result
      FROM public.classify_slot_event(NEW.google_event_summary, NEW.notes, 'google_busy')
      LIMIT 1;
    NEW.slot_category := result.category;
    NEW.matched_rule_id := result.rule_id;
    NEW.auto_classified := true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_classify_slot ON public.availability_slots;
CREATE TRIGGER trg_auto_classify_slot
  BEFORE INSERT OR UPDATE OF google_event_summary, notes, source
  ON public.availability_slots
  FOR EACH ROW EXECUTE FUNCTION public.tg_auto_classify_slot();

-- Index für Filterung nach Kategorie
CREATE INDEX IF NOT EXISTS idx_avail_slots_category ON public.availability_slots(profile_id, slot_category);
