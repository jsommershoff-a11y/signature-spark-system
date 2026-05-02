
CREATE TABLE public.follow_up_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.follow_up_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users read active templates"
  ON public.follow_up_templates FOR SELECT
  TO authenticated
  USING (is_active = true OR public.has_min_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins insert templates"
  ON public.follow_up_templates FOR INSERT
  TO authenticated
  WITH CHECK (public.has_min_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update templates"
  ON public.follow_up_templates FOR UPDATE
  TO authenticated
  USING (public.has_min_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_min_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete templates"
  ON public.follow_up_templates FOR DELETE
  TO authenticated
  USING (public.has_min_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_follow_up_templates_updated_at
  BEFORE UPDATE ON public.follow_up_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.follow_up_templates (template_key, label, description, subject, body, sort_order) VALUES
('confirm', 'Bestätigung', 'Termin bestätigen & Agenda teilen',
 'Bestätigung & nächste Schritte – {{when}}',
E'Hallo {{greeting_name}},\n\nvielen Dank für die Zusage zu unserem Termin am {{when}}.\n\nDamit wir die Zeit optimal nutzen, hier kurz, was dich erwartet:\n• Kurze Bestandsaufnahme deiner aktuellen Situation\n• Konkrete nächste Schritte für deinen Engpass\n• Klare Empfehlung, ob & wie wir zusammenarbeiten\n\n{{context_line}}\n\nFalls sich etwas ändert, gib mir bitte kurz Bescheid.\n\nBeste Grüße',
 10),
('reschedule', 'Reschedule', 'Höflich neuen Termin vorschlagen',
 'Neuer Termin statt {{when}}?',
E'Hallo {{greeting_name}},\n\nbei mir ist kurzfristig etwas dazwischengekommen – ich muss unseren Termin am {{when}} leider verschieben.\n\nDrei Alternativen, die bei mir passen würden:\n• Vorschlag 1: ___\n• Vorschlag 2: ___\n• Vorschlag 3: ___\n\nSag mir kurz, was bei dir am besten passt – oder schick mir gern selbst zwei Slots.\n\n{{context_line}}\n\nDanke dir & beste Grüße',
 20),
('no_show', 'Absage-Folgefrage', 'Nach No-Show / Absage nachfassen',
 'Schade, dass es am {{when}} nicht geklappt hat',
E'Hallo {{greeting_name}},\n\nwir hatten {{when}} einen Termin – leider konnten wir nicht sprechen.\n\nKurz & ehrlich: Ist das Thema bei dir aktuell noch relevant?\n• Ja → ich schick dir gern zwei neue Slots\n• Gerade nicht → kein Problem, dann lassen wir es ruhen\n• Passt nicht mehr → kurzes „nein danke" reicht völlig\n\n{{context_line}}\n\nBeste Grüße',
 30);
