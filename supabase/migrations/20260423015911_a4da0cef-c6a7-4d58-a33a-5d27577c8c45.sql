ALTER TABLE public.live_events
ADD COLUMN IF NOT EXISTS external_calendar_id text,
ADD COLUMN IF NOT EXISTS external_event_id text,
ADD COLUMN IF NOT EXISTS sync_source text,
ADD COLUMN IF NOT EXISTS sync_status text,
ADD COLUMN IF NOT EXISTS last_synced_at timestamp with time zone;

CREATE UNIQUE INDEX IF NOT EXISTS live_events_google_event_unique_idx
ON public.live_events (sync_source, external_event_id)
WHERE external_event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS live_events_sync_source_idx
ON public.live_events (sync_source, event_date);

CREATE INDEX IF NOT EXISTS live_events_last_synced_at_idx
ON public.live_events (last_synced_at);