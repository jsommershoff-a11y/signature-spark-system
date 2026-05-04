
-- Thread/messages for support tickets
CREATE TABLE public.support_ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  from_email TEXT,
  from_name TEXT,
  to_email TEXT,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  message_id TEXT,
  in_reply_to TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stm_ticket ON public.support_ticket_messages(ticket_id, created_at DESC);
CREATE INDEX idx_stm_message_id ON public.support_ticket_messages(message_id);

ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- Admin / mitarbeiter can read
CREATE POLICY "staff read messages"
ON public.support_ticket_messages FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'mitarbeiter'::app_role)
);

CREATE POLICY "staff insert messages"
ON public.support_ticket_messages FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'mitarbeiter'::app_role)
);
