ALTER TABLE public.pipeline_items
  ADD COLUMN IF NOT EXISTS last_followup_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_followup_template_id text,
  ADD COLUMN IF NOT EXISTS last_followup_variant_id text;

CREATE INDEX IF NOT EXISTS idx_pipeline_items_last_followup_at
  ON public.pipeline_items (last_followup_at DESC);