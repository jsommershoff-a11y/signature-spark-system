
ALTER TABLE public.follow_up_templates
ADD COLUMN IF NOT EXISTS variants jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.follow_up_template_versions
ADD COLUMN IF NOT EXISTS variants jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Snapshot-Funktion erweitern, damit Variants-Änderungen auch versioniert werden
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
    IF NEW.template_key IS NOT DISTINCT FROM OLD.template_key
       AND NEW.label IS NOT DISTINCT FROM OLD.label
       AND NEW.description IS NOT DISTINCT FROM OLD.description
       AND NEW.subject IS NOT DISTINCT FROM OLD.subject
       AND NEW.body IS NOT DISTINCT FROM OLD.body
       AND NEW.sort_order IS NOT DISTINCT FROM OLD.sort_order
       AND NEW.is_active IS NOT DISTINCT FROM OLD.is_active
       AND NEW.variants IS NOT DISTINCT FROM OLD.variants THEN
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
    subject, body, sort_order, is_active, variants, change_type, changed_by
  ) VALUES (
    NEW.id, _next_version, NEW.template_key, NEW.label, NEW.description,
    NEW.subject, NEW.body, NEW.sort_order, NEW.is_active, NEW.variants, _change_type, auth.uid()
  );

  RETURN NEW;
END;
$$;
