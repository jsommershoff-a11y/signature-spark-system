-- Round-Robin Auto-Zuweisung Funktion
CREATE OR REPLACE FUNCTION assign_lead_round_robin()
RETURNS TRIGGER AS $$
DECLARE
  next_profile_id UUID;
BEGIN
  -- Nur wenn kein Owner gesetzt ist
  IF NEW.owner_user_id IS NULL THEN
    -- Mitarbeiter/Teamleiter mit wenigsten neuen Leads finden
    SELECT p.id INTO next_profile_id
    FROM profiles p
    JOIN user_roles ur ON ur.user_id = p.user_id
    WHERE ur.role IN ('mitarbeiter', 'teamleiter')
    ORDER BY (
      SELECT COUNT(*) FROM crm_leads 
      WHERE owner_user_id = p.id 
      AND status = 'new'
    ) ASC
    LIMIT 1;
    
    NEW.owner_user_id := next_profile_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger aktivieren
CREATE TRIGGER assign_lead_owner_before_insert
BEFORE INSERT ON crm_leads
FOR EACH ROW
EXECUTE FUNCTION assign_lead_round_robin();

-- 10 Test-Leads einfügen
DO $$
DECLARE
  lead1_id UUID;
  lead2_id UUID;
  lead3_id UUID;
  lead4_id UUID;
  lead5_id UUID;
  lead6_id UUID;
  lead7_id UUID;
  lead8_id UUID;
  lead9_id UUID;
  lead10_id UUID;
BEGIN
  -- Lead 1: Max Mustermann - new_lead
  INSERT INTO crm_leads (first_name, last_name, email, phone, company, website_url, industry, location, source_type, source_detail, source_priority_weight, icp_fit_score, status, notes)
  VALUES ('Max', 'Mustermann', 'max@techstart.de', '+49 170 1234567', 'TechStart GmbH', 'https://techstart.de', 'IT/Software', 'Berlin', 'inbound_paid', 'Facebook Ads Kampagne', 2.0, 85, 'new', 'Interesse nach Webinar-Anmeldung. Hat Budget und Entscheidungskompetenz.')
  RETURNING id INTO lead1_id;
  UPDATE pipeline_items SET stage = 'new_lead', pipeline_priority_score = 85 WHERE lead_id = lead1_id;

  -- Lead 2: Anna Schmidt - new_lead
  INSERT INTO crm_leads (first_name, last_name, email, phone, company, website_url, industry, location, source_type, source_detail, source_priority_weight, icp_fit_score, status, notes)
  VALUES ('Anna', 'Schmidt', 'anna@scaleup.de', '+49 151 9876543', 'ScaleUp AG', 'https://scaleup.de', 'E-Commerce', 'Hamburg', 'referral', 'Empfehlung von Peter Schulz', 2.5, 72, 'new', 'Sucht Skalierungslösung für ihr Team.')
  RETURNING id INTO lead2_id;
  UPDATE pipeline_items SET stage = 'new_lead', pipeline_priority_score = 72 WHERE lead_id = lead2_id;

  -- Lead 3: Thomas Weber - setter_call_scheduled
  INSERT INTO crm_leads (first_name, last_name, email, phone, company, website_url, industry, location, source_type, source_detail, source_priority_weight, icp_fit_score, status, notes)
  VALUES ('Thomas', 'Weber', 'thomas@digital-dynamics.de', '+49 176 5554443', 'Digital Dynamics', 'https://digital-dynamics.de', 'Marketing', 'München', 'inbound_organic', 'Google Suche - Coaching', 1.5, 90, 'qualified', 'Sehr motiviert, Call für Montag 10 Uhr geplant.')
  RETURNING id INTO lead3_id;
  UPDATE pipeline_items SET stage = 'setter_call_scheduled', pipeline_priority_score = 90 WHERE lead_id = lead3_id;

  -- Lead 4: Lisa Müller - setter_call_scheduled
  INSERT INTO crm_leads (first_name, last_name, email, phone, company, website_url, industry, location, source_type, source_detail, source_priority_weight, icp_fit_score, status, notes)
  VALUES ('Lisa', 'Müller', 'lisa@growth-factory.de', '+49 162 3332221', 'Growth Factory', 'https://growth-factory.de', 'Beratung', 'Frankfurt', 'outbound_ai', 'AI Lead Gen - LinkedIn', 1.2, 65, 'new', 'Antwort auf Cold Outreach, offen für Gespräch.')
  RETURNING id INTO lead4_id;
  UPDATE pipeline_items SET stage = 'setter_call_scheduled', pipeline_priority_score = 65 WHERE lead_id = lead4_id;

  -- Lead 5: Michael Braun - setter_call_done
  INSERT INTO crm_leads (first_name, last_name, email, phone, company, website_url, industry, location, source_type, source_detail, source_priority_weight, icp_fit_score, status, notes)
  VALUES ('Michael', 'Braun', 'michael@innovate-labs.de', '+49 173 7778889', 'Innovate Labs', 'https://innovate-labs.de', 'Technologie', 'Köln', 'partner', 'Partner: BusinessBoost', 2.2, 78, 'qualified', 'Sehr gutes Erstgespräch, wartet auf Analyse.')
  RETURNING id INTO lead5_id;
  UPDATE pipeline_items SET stage = 'setter_call_done', pipeline_priority_score = 78, purchase_readiness = 70 WHERE lead_id = lead5_id;

  -- Lead 6: Sarah Hoffmann - analysis_ready
  INSERT INTO crm_leads (first_name, last_name, email, phone, company, website_url, industry, location, source_type, source_detail, source_priority_weight, icp_fit_score, status, notes)
  VALUES ('Sarah', 'Hoffmann', 'sarah@consulting-plus.de', '+49 160 1112223', 'Consulting Plus', 'https://consulting-plus.de', 'Unternehmensberatung', 'Düsseldorf', 'inbound_paid', 'Instagram Ads', 2.0, 88, 'qualified', 'Analyse zeigt hohes Potenzial, 6-stelliger Umsatz möglich.')
  RETURNING id INTO lead6_id;
  UPDATE pipeline_items SET stage = 'analysis_ready', pipeline_priority_score = 88, purchase_readiness = 80, urgency = 75 WHERE lead_id = lead6_id;

  -- Lead 7: Markus Fischer - offer_draft
  INSERT INTO crm_leads (first_name, last_name, email, phone, company, website_url, industry, location, source_type, source_detail, source_priority_weight, icp_fit_score, status, notes)
  VALUES ('Markus', 'Fischer', 'markus@startup-hub.de', '+49 155 4445556', 'Startup Hub', 'https://startup-hub.de', 'Venture Capital', 'Berlin', 'referral', 'Empfehlung von Sarah Hoffmann', 2.5, 92, 'qualified', 'Premium-Paket wird vorbereitet, sehr kaufbereit.')
  RETURNING id INTO lead7_id;
  UPDATE pipeline_items SET stage = 'offer_draft', pipeline_priority_score = 92, purchase_readiness = 90, urgency = 85 WHERE lead_id = lead7_id;

  -- Lead 8: Julia Wagner - offer_sent
  INSERT INTO crm_leads (first_name, last_name, email, phone, company, website_url, industry, location, source_type, source_detail, source_priority_weight, icp_fit_score, status, notes)
  VALUES ('Julia', 'Wagner', 'julia@mediaflow.de', '+49 157 6667778', 'MediaFlow', 'https://mediaflow.de', 'Medien', 'Leipzig', 'inbound_organic', 'Podcast Erwähnung', 1.5, 70, 'qualified', 'Angebot versendet, Follow-up in 3 Tagen.')
  RETURNING id INTO lead8_id;
  UPDATE pipeline_items SET stage = 'offer_sent', pipeline_priority_score = 70, purchase_readiness = 65 WHERE lead_id = lead8_id;

  -- Lead 9: Peter Schulz - won
  INSERT INTO crm_leads (first_name, last_name, email, phone, company, website_url, industry, location, source_type, source_detail, source_priority_weight, icp_fit_score, status, notes)
  VALUES ('Peter', 'Schulz', 'peter@success-systems.de', '+49 171 8889990', 'Success Systems', 'https://success-systems.de', 'Coaching', 'Stuttgart', 'referral', 'Bestehender Kunde', 3.0, 95, 'qualified', 'Premium-Paket abgeschlossen, 24.000€ Umsatz.')
  RETURNING id INTO lead9_id;
  UPDATE pipeline_items SET stage = 'won', pipeline_priority_score = 95, purchase_readiness = 100, urgency = 100 WHERE lead_id = lead9_id;

  -- Lead 10: Claudia Becker - lost
  INSERT INTO crm_leads (first_name, last_name, email, phone, company, website_url, industry, location, source_type, source_detail, source_priority_weight, icp_fit_score, status, notes)
  VALUES ('Claudia', 'Becker', 'claudia@old-business.de', '+49 178 2223334', 'Old Business Inc', 'https://old-business.de', 'Traditionelles Handwerk', 'Bremen', 'outbound_manual', 'Kaltakquise Telefon', 0.5, 35, 'unqualified', 'Kein Budget, kein Interesse an digitaler Transformation.')
  RETURNING id INTO lead10_id;
  UPDATE pipeline_items SET stage = 'lost', pipeline_priority_score = 35 WHERE lead_id = lead10_id;
END $$;