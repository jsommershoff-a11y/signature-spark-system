-- Create private storage bucket for lead imports
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('lead-imports', 'lead-imports', false, 5242880);

-- RLS: Only mitarbeiter+ can upload
CREATE POLICY "Staff can upload lead imports"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'lead-imports'
  AND has_min_role(auth.uid(), 'mitarbeiter'::app_role)
);

-- RLS: Only mitarbeiter+ can read
CREATE POLICY "Staff can read lead imports"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'lead-imports'
  AND has_min_role(auth.uid(), 'mitarbeiter'::app_role)
);

-- RLS: Only mitarbeiter+ can delete
CREATE POLICY "Staff can delete lead imports"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'lead-imports'
  AND has_min_role(auth.uid(), 'mitarbeiter'::app_role)
);