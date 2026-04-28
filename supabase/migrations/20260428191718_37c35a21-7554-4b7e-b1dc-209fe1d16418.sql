-- Sync-Status pro Google Sheet
CREATE TABLE IF NOT EXISTS public.drive_sync_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sheet_id text NOT NULL UNIQUE,
  sheet_title text,
  tab_name text NOT NULL DEFAULT 'Leads',
  enabled boolean NOT NULL DEFAULT true,
  last_sync_at timestamptz,
  last_status text,
  last_error text,
  total_inserted integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.drive_sync_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read sync state"
  ON public.drive_sync_state FOR SELECT
  USING (public.has_min_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_drive_sync_state_updated
  BEFORE UPDATE ON public.drive_sync_state
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Run-Historie
CREATE TABLE IF NOT EXISTS public.drive_sync_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sheet_id text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  triggered_by text NOT NULL DEFAULT 'cron',
  inserted integer NOT NULL DEFAULT 0,
  skipped_dedupe integer NOT NULL DEFAULT 0,
  skipped_invalid integer NOT NULL DEFAULT 0,
  rows_total integer NOT NULL DEFAULT 0,
  errors jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'running'
);

CREATE INDEX IF NOT EXISTS idx_drive_sync_runs_sheet_started
  ON public.drive_sync_runs(sheet_id, started_at DESC);

ALTER TABLE public.drive_sync_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read sync runs"
  ON public.drive_sync_runs FOR SELECT
  USING (public.has_min_role(auth.uid(), 'admin'::app_role));

-- Initial-Eintrag für die globale Leadliste
INSERT INTO public.drive_sync_state (sheet_id, sheet_title, tab_name, enabled)
VALUES ('14wfNDBU85hyZjVYZBOmo7iX3-ErdVW_fqI6eF55Y3cE', 'Globale Leadliste Akquise Köln Bonn', 'Leads', true)
ON CONFLICT (sheet_id) DO NOTHING;