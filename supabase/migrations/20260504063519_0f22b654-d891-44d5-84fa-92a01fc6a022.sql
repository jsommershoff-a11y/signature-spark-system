
CREATE TABLE public.inbound_email_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  local_part text NOT NULL,
  reply_domain text NOT NULL,
  default_priority text NOT NULL DEFAULT 'normal' CHECK (default_priority IN ('low','normal','high')),
  is_default boolean NOT NULL DEFAULT false,
  enabled boolean NOT NULL DEFAULT true,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (local_part, reply_domain)
);

CREATE UNIQUE INDEX inbound_email_config_only_one_default
  ON public.inbound_email_config ((1)) WHERE is_default = true;

ALTER TABLE public.inbound_email_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage inbound routes"
  ON public.inbound_email_config FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_inbound_email_config_updated_at
  BEFORE UPDATE ON public.inbound_email_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
