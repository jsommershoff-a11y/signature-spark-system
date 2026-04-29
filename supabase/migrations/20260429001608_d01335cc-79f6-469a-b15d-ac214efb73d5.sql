-- Realtime aktivieren für offer_drafts, damit das CRM Telegram-Approvals/-Rejects sofort widerspiegelt
ALTER TABLE public.offer_drafts REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'offer_drafts'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.offer_drafts';
  END IF;
END$$;