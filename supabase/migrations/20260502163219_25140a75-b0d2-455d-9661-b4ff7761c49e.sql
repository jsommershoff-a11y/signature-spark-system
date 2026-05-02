
-- Versionstabelle
CREATE TABLE public.follow_up_template_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.follow_up_templates(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  template_key text NOT NULL,
  label text NOT NULL,
  description text,
  subject text NOT NULL,
  body text NOT NULL,
  sort_order integer NOT NULL DEFAULT 100,
  is_active boolean NOT NULL DEFAULT true,
  change_type text NOT NULL DEFAULT 'update', -- 'create' | 'update' | 'rollback'
  changed_by uuid,
  change_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (template_id, version_number)
);

CREATE INDEX idx_futv_template ON public.follow_up_template_versions(template_id, version_number DESC);

ALTER TABLE public.follow_up_template_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read template versions"
  ON public.follow_up_template_versions FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admins manage template versions"
  ON public.follow_up_template_versions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Trigger: bei INSERT/UPDATE neue Version anlegen
CREATE OR REPLACE FUNCTION public.snapshot_follow_up_template()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _next_version integer;
  _change_type text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    _change_type := 'create';
  ELSE
    -- Nur Snapshot wenn relevante Felder sich aendern
    IF NEW.template_key IS NOT DISTINCT FROM OLD.template_key
       AND NEW.label IS NOT DISTINCT FROM OLD.label
       AND NEW.description IS NOT DISTINCT FROM OLD.description
       AND NEW.subject IS NOT DISTINCT FROM OLD.subject
       AND NEW.body IS NOT DISTINCT FROM OLD.body
       AND NEW.sort_order IS NOT DISTINCT FROM OLD.sort_order
       AND NEW.is_active IS NOT DISTINCT FROM OLD.is_active THEN
      RETURN NEW;
    END IF;
    _change_type := COALESCE(current_setting('app.template_change_type', true), 'update');
  END IF;

  SELECT COALESCE(MAX(version_number), 0) + 1
    INTO _next_version
  FROM public.follow_up_template_versions
  WHERE template_id = NEW.id;

  INSERT INTO public.follow_up_template_versions (
    template_id, version_number, template_key, label, description,
    subject, body, sort_order, is_active, change_type, changed_by
  ) VALUES (
    NEW.id, _next_version, NEW.template_key, NEW.label, NEW.description,
    NEW.subject, NEW.body, NEW.sort_order, NEW.is_active, _change_type, auth.uid()
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_snapshot_follow_up_template ON public.follow_up_templates;
CREATE TRIGGER trg_snapshot_follow_up_template
AFTER INSERT OR UPDATE ON public.follow_up_templates
FOR EACH ROW EXECUTE FUNCTION public.snapshot_follow_up_template();

-- Rollback-Funktion
CREATE OR REPLACE FUNCTION public.rollback_follow_up_template(_version_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _v public.follow_up_template_versions%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT * INTO _v FROM public.follow_up_template_versions WHERE id = _version_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Version not found';
  END IF;

  PERFORM set_config('app.template_change_type', 'rollback', true);

  UPDATE public.follow_up_templates
  SET label = _v.label,
      description = _v.description,
      subject = _v.subject,
      body = _v.body,
      sort_order = _v.sort_order,
      is_active = _v.is_active,
      updated_at = now()
  WHERE id = _v.template_id;

  PERFORM set_config('app.template_change_type', 'update', true);

  RETURN _v.template_id;
END;
$$;

-- Initial-Snapshot für bestehende Templates (falls schon welche existieren)
INSERT INTO public.follow_up_template_versions (
  template_id, version_number, template_key, label, description,
  subject, body, sort_order, is_active, change_type
)
SELECT t.id, 1, t.template_key, t.label, t.description,
       t.subject, t.body, t.sort_order, t.is_active, 'create'
FROM public.follow_up_templates t
WHERE NOT EXISTS (
  SELECT 1 FROM public.follow_up_template_versions v WHERE v.template_id = t.id
);
