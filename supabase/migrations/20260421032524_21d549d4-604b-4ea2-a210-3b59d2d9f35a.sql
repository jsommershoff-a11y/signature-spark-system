-- Enums
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'waiting', 'closed');
CREATE TYPE public.ticket_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE public.ticket_source AS ENUM ('email', 'mail', 'manual', 'phone');

-- Tabelle
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  body TEXT,
  status public.ticket_status NOT NULL DEFAULT 'open',
  priority public.ticket_priority NOT NULL DEFAULT 'normal',
  source public.ticket_source NOT NULL DEFAULT 'manual',
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
  email_message_id TEXT,
  sender_email TEXT,
  sender_name TEXT,
  ai_summary TEXT,
  internal_notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_assigned_to ON public.support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_lead_id ON public.support_tickets(lead_id);
CREATE INDEX idx_support_tickets_email_message_id ON public.support_tickets(email_message_id);

-- updated_at Trigger
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Admins: Vollzugriff
CREATE POLICY "Admins full access on tickets"
  ON public.support_tickets
  FOR ALL
  TO authenticated
  USING (public.has_min_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_min_role(auth.uid(), 'admin'::app_role));

-- Zugewiesene Mitarbeiter: lesen + status updaten
CREATE POLICY "Assignees can view their tickets"
  ON public.support_tickets
  FOR SELECT
  TO authenticated
  USING (assigned_to = public.get_user_profile_id(auth.uid()));

CREATE POLICY "Assignees can update their tickets"
  ON public.support_tickets
  FOR UPDATE
  TO authenticated
  USING (assigned_to = public.get_user_profile_id(auth.uid()))
  WITH CHECK (assigned_to = public.get_user_profile_id(auth.uid()));