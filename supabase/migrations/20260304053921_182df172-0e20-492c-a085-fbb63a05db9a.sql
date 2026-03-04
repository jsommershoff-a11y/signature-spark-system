
-- =============================================
-- Social Media Tables
-- =============================================

CREATE TABLE public.social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  platform text NOT NULL,
  content_type text NOT NULL,
  scheduled_at timestamptz,
  status text NOT NULL DEFAULT 'idee',
  hook text,
  caption text,
  assets jsonb DEFAULT '[]'::jsonb,
  notes text,
  metrics jsonb DEFAULT '{}'::jsonb,
  assigned_to uuid REFERENCES public.profiles(id),
  created_by uuid REFERENCES public.profiles(id) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.social_library_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  content text,
  tags text[] DEFAULT '{}',
  industry text,
  created_by uuid REFERENCES public.profiles(id) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.social_strategy_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  posting_frequency jsonb DEFAULT '{}'::jsonb,
  content_pillars jsonb DEFAULT '[]'::jsonb,
  kpi_targets jsonb DEFAULT '{}'::jsonb,
  updated_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- Email Campaign Tables
-- =============================================

CREATE TABLE public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  body_html text NOT NULL DEFAULT '',
  variables text[] DEFAULT '{}',
  created_by uuid REFERENCES public.profiles(id) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.email_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  trigger_type text,
  trigger_config jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  is_preset boolean DEFAULT false,
  created_by uuid REFERENCES public.profiles(id) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.email_sequence_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id uuid REFERENCES public.email_sequences(id) ON DELETE CASCADE NOT NULL,
  step_order integer NOT NULL,
  delay_minutes integer DEFAULT 0,
  template_id uuid REFERENCES public.email_templates(id),
  subject_override text,
  conditions jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.lead_sequence_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.crm_leads(id) NOT NULL,
  sequence_id uuid REFERENCES public.email_sequences(id) NOT NULL,
  status text NOT NULL DEFAULT 'active',
  current_step integer DEFAULT 0,
  enrolled_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.email_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid REFERENCES public.lead_sequence_enrollments(id),
  template_id uuid REFERENCES public.email_templates(id),
  lead_id uuid REFERENCES public.crm_leads(id) NOT NULL,
  subject text NOT NULL,
  body_html text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  sent_at timestamptz,
  message_type text NOT NULL DEFAULT 'sequence',
  broadcast_id uuid,
  resend_message_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES public.email_messages(id) NOT NULL,
  event_type text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.email_broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  template_id uuid REFERENCES public.email_templates(id),
  subject text NOT NULL,
  body_html text,
  segment_filter jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  scheduled_at timestamptz,
  sent_at timestamptz,
  total_recipients integer DEFAULT 0,
  created_by uuid REFERENCES public.profiles(id) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- updated_at triggers
-- =============================================

CREATE TRIGGER set_updated_at_social_posts BEFORE UPDATE ON public.social_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_social_library_items BEFORE UPDATE ON public.social_library_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_social_strategy_settings BEFORE UPDATE ON public.social_strategy_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_email_templates BEFORE UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_email_sequences BEFORE UPDATE ON public.email_sequences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_lead_sequence_enrollments BEFORE UPDATE ON public.lead_sequence_enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_email_broadcasts BEFORE UPDATE ON public.email_broadcasts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- RLS: Enable on all tables
-- =============================================

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_strategy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_sequence_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_broadcasts ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies: Social Media
-- =============================================

-- social_posts
CREATE POLICY "Staff can read social posts" ON public.social_posts FOR SELECT TO authenticated USING (has_min_role(auth.uid(), 'mitarbeiter'));
CREATE POLICY "Staff can insert social posts" ON public.social_posts FOR INSERT TO authenticated WITH CHECK (has_min_role(auth.uid(), 'mitarbeiter') AND created_by = get_user_profile_id(auth.uid()));
CREATE POLICY "Staff can update social posts" ON public.social_posts FOR UPDATE TO authenticated USING (has_min_role(auth.uid(), 'mitarbeiter'));
CREATE POLICY "Admin can delete social posts" ON public.social_posts FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- social_library_items
CREATE POLICY "Staff can read library items" ON public.social_library_items FOR SELECT TO authenticated USING (has_min_role(auth.uid(), 'mitarbeiter'));
CREATE POLICY "Staff can insert library items" ON public.social_library_items FOR INSERT TO authenticated WITH CHECK (has_min_role(auth.uid(), 'mitarbeiter') AND created_by = get_user_profile_id(auth.uid()));
CREATE POLICY "Staff can update library items" ON public.social_library_items FOR UPDATE TO authenticated USING (has_min_role(auth.uid(), 'mitarbeiter'));
CREATE POLICY "Admin can delete library items" ON public.social_library_items FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- social_strategy_settings
CREATE POLICY "Staff can read strategy" ON public.social_strategy_settings FOR SELECT TO authenticated USING (has_min_role(auth.uid(), 'mitarbeiter'));
CREATE POLICY "Admin can manage strategy" ON public.social_strategy_settings FOR ALL TO authenticated USING (has_min_role(auth.uid(), 'teamleiter'));

-- =============================================
-- RLS Policies: Email Campaign
-- =============================================

-- email_templates
CREATE POLICY "Staff can read email templates" ON public.email_templates FOR SELECT TO authenticated USING (has_min_role(auth.uid(), 'mitarbeiter'));
CREATE POLICY "Staff can insert email templates" ON public.email_templates FOR INSERT TO authenticated WITH CHECK (has_min_role(auth.uid(), 'mitarbeiter') AND created_by = get_user_profile_id(auth.uid()));
CREATE POLICY "Staff can update email templates" ON public.email_templates FOR UPDATE TO authenticated USING (has_min_role(auth.uid(), 'mitarbeiter'));
CREATE POLICY "Admin can delete email templates" ON public.email_templates FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- email_sequences
CREATE POLICY "Staff can read sequences" ON public.email_sequences FOR SELECT TO authenticated USING (has_min_role(auth.uid(), 'mitarbeiter'));
CREATE POLICY "Staff can insert sequences" ON public.email_sequences FOR INSERT TO authenticated WITH CHECK (has_min_role(auth.uid(), 'mitarbeiter') AND created_by = get_user_profile_id(auth.uid()));
CREATE POLICY "Staff can update sequences" ON public.email_sequences FOR UPDATE TO authenticated USING (has_min_role(auth.uid(), 'mitarbeiter'));
CREATE POLICY "Admin can delete sequences" ON public.email_sequences FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- email_sequence_steps
CREATE POLICY "Staff can read sequence steps" ON public.email_sequence_steps FOR SELECT TO authenticated USING (has_min_role(auth.uid(), 'mitarbeiter'));
CREATE POLICY "Staff can insert sequence steps" ON public.email_sequence_steps FOR INSERT TO authenticated WITH CHECK (has_min_role(auth.uid(), 'mitarbeiter'));
CREATE POLICY "Staff can update sequence steps" ON public.email_sequence_steps FOR UPDATE TO authenticated USING (has_min_role(auth.uid(), 'mitarbeiter'));
CREATE POLICY "Admin can delete sequence steps" ON public.email_sequence_steps FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- lead_sequence_enrollments
CREATE POLICY "Staff can read enrollments" ON public.lead_sequence_enrollments FOR SELECT TO authenticated USING (has_min_role(auth.uid(), 'mitarbeiter'));
CREATE POLICY "Staff can insert enrollments" ON public.lead_sequence_enrollments FOR INSERT TO authenticated WITH CHECK (has_min_role(auth.uid(), 'mitarbeiter'));
CREATE POLICY "Staff can update enrollments" ON public.lead_sequence_enrollments FOR UPDATE TO authenticated USING (has_min_role(auth.uid(), 'mitarbeiter'));
CREATE POLICY "Admin can delete enrollments" ON public.lead_sequence_enrollments FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- email_messages
CREATE POLICY "Staff can read messages" ON public.email_messages FOR SELECT TO authenticated USING (has_min_role(auth.uid(), 'mitarbeiter'));
CREATE POLICY "Staff can insert messages" ON public.email_messages FOR INSERT TO authenticated WITH CHECK (has_min_role(auth.uid(), 'mitarbeiter'));
CREATE POLICY "Staff can update messages" ON public.email_messages FOR UPDATE TO authenticated USING (has_min_role(auth.uid(), 'mitarbeiter'));
CREATE POLICY "Admin can delete messages" ON public.email_messages FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- email_events
CREATE POLICY "Staff can read events" ON public.email_events FOR SELECT TO authenticated USING (has_min_role(auth.uid(), 'mitarbeiter'));
CREATE POLICY "Staff can insert events" ON public.email_events FOR INSERT TO authenticated WITH CHECK (has_min_role(auth.uid(), 'mitarbeiter'));
CREATE POLICY "Public can insert tracking events" ON public.email_events FOR INSERT TO anon WITH CHECK (true);

-- email_broadcasts
CREATE POLICY "Staff can read broadcasts" ON public.email_broadcasts FOR SELECT TO authenticated USING (has_min_role(auth.uid(), 'mitarbeiter'));
CREATE POLICY "Staff can insert broadcasts" ON public.email_broadcasts FOR INSERT TO authenticated WITH CHECK (has_min_role(auth.uid(), 'mitarbeiter') AND created_by = get_user_profile_id(auth.uid()));
CREATE POLICY "Staff can update broadcasts" ON public.email_broadcasts FOR UPDATE TO authenticated USING (has_min_role(auth.uid(), 'mitarbeiter'));
CREATE POLICY "Admin can delete broadcasts" ON public.email_broadcasts FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));
