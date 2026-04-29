-- Storage bucket for offer draft preview PDFs/HTMLs (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('offer-draft-previews', 'offer-draft-previews', false)
ON CONFLICT (id) DO NOTHING;

-- Only service role + admins can read; signed URLs used for sharing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Admins can read offer draft previews'
  ) THEN
    CREATE POLICY "Admins can read offer draft previews"
      ON storage.objects FOR SELECT
      TO authenticated
      USING (bucket_id = 'offer-draft-previews' AND public.has_role(auth.uid(), 'admin'));
  END IF;
END$$;

-- Track preview path on offer_drafts
ALTER TABLE public.offer_drafts
  ADD COLUMN IF NOT EXISTS preview_pdf_path text,
  ADD COLUMN IF NOT EXISTS preview_generated_at timestamptz;