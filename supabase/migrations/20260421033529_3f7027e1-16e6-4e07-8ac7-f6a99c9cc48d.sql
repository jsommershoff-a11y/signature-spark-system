-- Incoming mail table
CREATE TABLE public.incoming_mail (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  sender text,
  subject text,
  received_date date,
  ocr_text text,
  ai_summary text,
  category text,
  priority text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'new',
  lead_id uuid REFERENCES public.crm_leads(id) ON DELETE SET NULL,
  ticket_id uuid REFERENCES public.support_tickets(id) ON DELETE SET NULL,
  task_id uuid REFERENCES public.crm_tasks(id) ON DELETE SET NULL,
  meta jsonb DEFAULT '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_incoming_mail_status ON public.incoming_mail(status);
CREATE INDEX idx_incoming_mail_created_at ON public.incoming_mail(created_at DESC);

ALTER TABLE public.incoming_mail ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all incoming mail"
  ON public.incoming_mail FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert incoming mail"
  ON public.incoming_mail FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update incoming mail"
  ON public.incoming_mail FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete incoming mail"
  ON public.incoming_mail FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_incoming_mail_updated_at
  BEFORE UPDATE ON public.incoming_mail
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for incoming mail scans
INSERT INTO storage.buckets (id, name, public)
VALUES ('incoming-mail', 'incoming-mail', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admins can read incoming mail files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'incoming-mail' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can upload incoming mail files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'incoming-mail' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update incoming mail files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'incoming-mail' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete incoming mail files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'incoming-mail' AND public.has_role(auth.uid(), 'admin'));