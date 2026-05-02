ALTER TABLE public.follow_up_templates
  ADD COLUMN IF NOT EXISTS stages text[] NOT NULL DEFAULT '{}'::text[];

ALTER TABLE public.follow_up_template_versions
  ADD COLUMN IF NOT EXISTS stages text[] NOT NULL DEFAULT '{}'::text[];

CREATE INDEX IF NOT EXISTS idx_follow_up_templates_stages
  ON public.follow_up_templates USING GIN (stages);