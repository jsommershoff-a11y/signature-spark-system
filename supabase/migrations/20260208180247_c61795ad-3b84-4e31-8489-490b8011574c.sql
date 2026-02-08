-- =============================================
-- Phase 1: Neue Enums erstellen
-- =============================================

-- Offer Status
CREATE TYPE offer_status AS ENUM (
  'draft',
  'pending_review',
  'approved',
  'sent',
  'viewed',
  'expired'
);

-- Order Status
CREATE TYPE order_status AS ENUM (
  'pending',
  'paid',
  'failed',
  'refunded',
  'cancelled'
);

-- Payment Provider
CREATE TYPE payment_provider AS ENUM (
  'stripe',
  'copecart',
  'bank_transfer',
  'manual'
);

-- =============================================
-- Phase 2: offers Tabelle
-- =============================================

CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Beziehungen
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES ai_analyses(id),
  created_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  
  -- Status
  status offer_status NOT NULL DEFAULT 'draft',
  approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Angebots-Inhalt (KI-generiert oder manuell)
  offer_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Öffentlicher Zugang
  public_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  
  -- Zahlungssteuerung
  payment_unlocked BOOLEAN NOT NULL DEFAULT false,
  payment_unlocked_at TIMESTAMPTZ,
  payment_unlocked_by UUID REFERENCES profiles(id),
  
  -- Metadaten
  notes TEXT,
  version INTEGER NOT NULL DEFAULT 1
);

-- Indizes für offers
CREATE INDEX idx_offers_lead_id ON offers(lead_id);
CREATE INDEX idx_offers_public_token ON offers(public_token);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_offers_created_by ON offers(created_by);

-- Updated_at Trigger für offers
CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Phase 3: orders Tabelle
-- =============================================

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Beziehungen
  offer_id UUID REFERENCES offers(id),
  lead_id UUID NOT NULL REFERENCES crm_leads(id),
  member_id UUID REFERENCES profiles(id),
  
  -- Payment Provider
  provider payment_provider NOT NULL,
  provider_order_id TEXT,
  provider_customer_id TEXT,
  
  -- Betrag
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  
  -- Status
  status order_status NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  
  -- Metadaten
  metadata JSONB DEFAULT '{}'::jsonb,
  error_message TEXT
);

-- Indizes für orders
CREATE INDEX idx_orders_lead_id ON orders(lead_id);
CREATE INDEX idx_orders_offer_id ON orders(offer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_provider_order_id ON orders(provider_order_id);

-- Updated_at Trigger für orders
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Phase 4: RLS Policies für offers
-- =============================================

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Admin/GF können alle Offers sehen
CREATE POLICY "Admin/GF can read all offers" ON offers
FOR SELECT USING (has_min_role(auth.uid(), 'geschaeftsfuehrung'));

-- Teamleiter können Team-Offers sehen
CREATE POLICY "Teamleiter can read team offers" ON offers
FOR SELECT USING (
  has_role(auth.uid(), 'teamleiter') AND
  lead_id IN (
    SELECT id FROM crm_leads 
    WHERE owner_user_id IN (SELECT get_team_member_ids(auth.uid()))
  )
);

-- Mitarbeiter können eigene Offers sehen
CREATE POLICY "Mitarbeiter can read own offers" ON offers
FOR SELECT USING (
  has_min_role(auth.uid(), 'mitarbeiter') AND (
    created_by = get_user_profile_id(auth.uid()) OR
    lead_id IN (
      SELECT id FROM crm_leads 
      WHERE owner_user_id = get_user_profile_id(auth.uid())
    )
  )
);

-- Öffentlicher Zugang via Token (für Angebotsseite)
CREATE POLICY "Public can view via token" ON offers
FOR SELECT USING (
  public_token IS NOT NULL AND 
  status IN ('sent', 'viewed')
);

-- Mitarbeiter können Offers erstellen
CREATE POLICY "Mitarbeiter can insert offers" ON offers
FOR INSERT WITH CHECK (has_min_role(auth.uid(), 'mitarbeiter'));

-- Teamleiter können Offers aktualisieren (approve)
CREATE POLICY "Teamleiter can update offers" ON offers
FOR UPDATE USING (has_min_role(auth.uid(), 'teamleiter'));

-- Admin kann Offers löschen
CREATE POLICY "Admin can delete offers" ON offers
FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- Phase 5: RLS Policies für orders
-- =============================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Admin/GF können alle Orders sehen
CREATE POLICY "Admin/GF can read all orders" ON orders
FOR SELECT USING (has_min_role(auth.uid(), 'geschaeftsfuehrung'));

-- Teamleiter können Team-Orders sehen
CREATE POLICY "Teamleiter can read team orders" ON orders
FOR SELECT USING (
  has_role(auth.uid(), 'teamleiter') AND
  lead_id IN (
    SELECT id FROM crm_leads 
    WHERE owner_user_id IN (SELECT get_team_member_ids(auth.uid()))
  )
);

-- Mitarbeiter können eigene Orders sehen
CREATE POLICY "Mitarbeiter can read own orders" ON orders
FOR SELECT USING (
  has_min_role(auth.uid(), 'mitarbeiter') AND
  lead_id IN (
    SELECT id FROM crm_leads 
    WHERE owner_user_id = get_user_profile_id(auth.uid())
  )
);

-- System/Admin kann Orders erstellen (Webhooks)
CREATE POLICY "System can insert orders" ON orders
FOR INSERT WITH CHECK (has_min_role(auth.uid(), 'teamleiter'));

-- Admin kann Orders aktualisieren
CREATE POLICY "Admin can update orders" ON orders
FOR UPDATE USING (has_min_role(auth.uid(), 'geschaeftsfuehrung'));

-- Admin kann Orders löschen
CREATE POLICY "Admin can delete orders" ON orders
FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- Phase 6: Trigger für Pipeline-Update bei Payment
-- =============================================

CREATE OR REPLACE FUNCTION update_pipeline_after_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Wenn Order bezahlt wird
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    -- Pipeline auf 'won' setzen
    UPDATE pipeline_items
    SET 
      stage = 'won',
      stage_updated_at = now()
    WHERE lead_id = NEW.lead_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_pipeline_on_payment
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_pipeline_after_payment();