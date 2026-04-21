-- Settings table for OneDrive mail sync configuration (admin-scoped)
CREATE TABLE IF NOT EXISTS public.mail_sync_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  provider TEXT NOT NULL DEFAULT 'onedrive',
  source_folder_path TEXT NOT NULL DEFAULT '/Posteingang',
  processed_folder_path TEXT NOT NULL DEFAULT '/Posteingang/Verarbeitet',
  sort_by_category BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  last_sync_count INTEGER DEFAULT 0,
  last_sync_error TEXT,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mail_sync_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage their own mail sync settings"
ON public.mail_sync_settings
FOR ALL
USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_mail_sync_settings_updated_at
BEFORE UPDATE ON public.mail_sync_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Track which OneDrive item IDs we already imported to prevent duplicates
ALTER TABLE public.incoming_mail
ADD COLUMN IF NOT EXISTS source_provider TEXT,
ADD COLUMN IF NOT EXISTS source_item_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS incoming_mail_source_unique
ON public.incoming_mail(source_provider, source_item_id)
WHERE source_item_id IS NOT NULL;