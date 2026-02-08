-- =============================================
-- CALL & ANALYSE BEREICH - Vollständige Migration
-- =============================================

-- 1. ENUMS erstellen
-- =============================================

-- Call Provider
CREATE TYPE call_provider AS ENUM (
  'zoom',
  'twilio',
  'sipgate',
  'manual'
);

-- Call Typ
CREATE TYPE call_type AS ENUM (
  'phone',
  'zoom',
  'teams',
  'other'
);

-- Call Status
CREATE TYPE call_status AS ENUM (
  'scheduled',
  'in_progress',
  'completed',
  'recording_ready',
  'transcribed',
  'analyzed',
  'failed'
);

-- Transcript Status
CREATE TYPE transcript_status AS ENUM (
  'pending',
  'processing',
  'done',
  'failed'
);

-- Structogram Typen (Persönlichkeitsfarben)
CREATE TYPE structogram_type AS ENUM (
  'red',
  'green',
  'blue',
  'mixed',
  'unknown'
);

-- 2. TABELLEN erstellen
-- =============================================

-- Calls Tabelle
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Beziehungen
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  conducted_by UUID REFERENCES profiles(id),
  
  -- Provider & Typ
  provider call_provider DEFAULT 'manual',
  call_type call_type DEFAULT 'phone',
  
  -- Zeitplanung
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  -- Recording
  recording_url TEXT,
  storage_path TEXT,
  
  -- Status
  status call_status DEFAULT 'scheduled',
  
  -- Metadaten
  notes TEXT,
  external_id TEXT,
  meta JSONB
);

-- Transcripts Tabelle
CREATE TABLE transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Beziehung
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  
  -- Provider & Sprache
  provider TEXT DEFAULT 'whisper',
  language TEXT DEFAULT 'de',
  
  -- Inhalt
  text TEXT,
  segments JSONB,
  
  -- Status
  status transcript_status DEFAULT 'pending',
  error_message TEXT,
  
  -- Metadaten
  word_count INTEGER,
  confidence_score NUMERIC(5,4)
);

-- AI Analyses Tabelle
CREATE TABLE ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Beziehungen
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES crm_leads(id),
  
  -- KI-Analyse Ergebnisse (strukturiertes JSON)
  analysis_json JSONB NOT NULL,
  
  -- Scoring
  purchase_readiness INTEGER CHECK (purchase_readiness >= 0 AND purchase_readiness <= 100),
  success_probability INTEGER CHECK (success_probability >= 0 AND success_probability <= 100),
  
  -- Structogram Typisierung
  primary_type structogram_type DEFAULT 'unknown',
  secondary_type structogram_type,
  
  -- Analyse-Version
  model_version TEXT DEFAULT 'v1',
  
  -- Status
  status TEXT DEFAULT 'completed'
);

-- Indizes
CREATE INDEX idx_calls_lead_id ON calls(lead_id);
CREATE INDEX idx_calls_conducted_by ON calls(conducted_by);
CREATE INDEX idx_calls_status ON calls(status);
CREATE INDEX idx_calls_scheduled_at ON calls(scheduled_at);
CREATE INDEX idx_transcripts_call_id ON transcripts(call_id);
CREATE INDEX idx_ai_analyses_lead_id ON ai_analyses(lead_id);
CREATE INDEX idx_ai_analyses_call_id ON ai_analyses(call_id);

-- 3. UPDATED_AT TRIGGER
-- =============================================

CREATE TRIGGER update_calls_updated_at
BEFORE UPDATE ON calls
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transcripts_updated_at
BEFORE UPDATE ON transcripts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_analyses_updated_at
BEFORE UPDATE ON ai_analyses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 4. RLS AKTIVIEREN
-- =============================================

ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES für CALLS
-- =============================================

-- SELECT Policies
CREATE POLICY "Admin/GF can read all calls" ON calls
FOR SELECT USING (has_min_role(auth.uid(), 'geschaeftsfuehrung'));

CREATE POLICY "Teamleiter can read team calls" ON calls
FOR SELECT USING (
  has_role(auth.uid(), 'teamleiter') AND
  lead_id IN (
    SELECT id FROM crm_leads 
    WHERE owner_user_id IN (SELECT get_team_member_ids(auth.uid()))
  )
);

CREATE POLICY "Mitarbeiter can read own calls" ON calls
FOR SELECT USING (
  has_min_role(auth.uid(), 'mitarbeiter') AND (
    conducted_by = get_user_profile_id(auth.uid()) OR
    lead_id IN (
      SELECT id FROM crm_leads 
      WHERE owner_user_id = get_user_profile_id(auth.uid())
    )
  )
);

-- INSERT Policies
CREATE POLICY "Mitarbeiter can insert calls" ON calls
FOR INSERT WITH CHECK (has_min_role(auth.uid(), 'mitarbeiter'));

-- UPDATE Policies
CREATE POLICY "Admin/GF can update all calls" ON calls
FOR UPDATE USING (has_min_role(auth.uid(), 'geschaeftsfuehrung'));

CREATE POLICY "Teamleiter can update team calls" ON calls
FOR UPDATE USING (
  has_role(auth.uid(), 'teamleiter') AND
  lead_id IN (
    SELECT id FROM crm_leads 
    WHERE owner_user_id IN (SELECT get_team_member_ids(auth.uid()))
  )
);

CREATE POLICY "Mitarbeiter can update own calls" ON calls
FOR UPDATE USING (
  has_min_role(auth.uid(), 'mitarbeiter') AND (
    conducted_by = get_user_profile_id(auth.uid()) OR
    lead_id IN (
      SELECT id FROM crm_leads 
      WHERE owner_user_id = get_user_profile_id(auth.uid())
    )
  )
);

-- DELETE Policy
CREATE POLICY "Admin can delete calls" ON calls
FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- 6. RLS POLICIES für TRANSCRIPTS (via call_id)
-- =============================================

CREATE POLICY "Admin/GF can read all transcripts" ON transcripts
FOR SELECT USING (has_min_role(auth.uid(), 'geschaeftsfuehrung'));

CREATE POLICY "Teamleiter can read team transcripts" ON transcripts
FOR SELECT USING (
  has_role(auth.uid(), 'teamleiter') AND
  call_id IN (
    SELECT c.id FROM calls c
    JOIN crm_leads l ON c.lead_id = l.id
    WHERE l.owner_user_id IN (SELECT get_team_member_ids(auth.uid()))
  )
);

CREATE POLICY "Mitarbeiter can read own transcripts" ON transcripts
FOR SELECT USING (
  has_min_role(auth.uid(), 'mitarbeiter') AND
  call_id IN (
    SELECT c.id FROM calls c
    LEFT JOIN crm_leads l ON c.lead_id = l.id
    WHERE c.conducted_by = get_user_profile_id(auth.uid())
       OR l.owner_user_id = get_user_profile_id(auth.uid())
  )
);

CREATE POLICY "Mitarbeiter can insert transcripts" ON transcripts
FOR INSERT WITH CHECK (has_min_role(auth.uid(), 'mitarbeiter'));

CREATE POLICY "Admin/GF can update transcripts" ON transcripts
FOR UPDATE USING (has_min_role(auth.uid(), 'geschaeftsfuehrung'));

CREATE POLICY "Mitarbeiter can update own transcripts" ON transcripts
FOR UPDATE USING (
  has_min_role(auth.uid(), 'mitarbeiter') AND
  call_id IN (
    SELECT c.id FROM calls c
    LEFT JOIN crm_leads l ON c.lead_id = l.id
    WHERE c.conducted_by = get_user_profile_id(auth.uid())
       OR l.owner_user_id = get_user_profile_id(auth.uid())
  )
);

CREATE POLICY "Admin can delete transcripts" ON transcripts
FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- 7. RLS POLICIES für AI_ANALYSES
-- =============================================

CREATE POLICY "Admin/GF can read all analyses" ON ai_analyses
FOR SELECT USING (has_min_role(auth.uid(), 'geschaeftsfuehrung'));

CREATE POLICY "Teamleiter can read team analyses" ON ai_analyses
FOR SELECT USING (
  has_role(auth.uid(), 'teamleiter') AND
  lead_id IN (
    SELECT id FROM crm_leads 
    WHERE owner_user_id IN (SELECT get_team_member_ids(auth.uid()))
  )
);

CREATE POLICY "Mitarbeiter can read own analyses" ON ai_analyses
FOR SELECT USING (
  has_min_role(auth.uid(), 'mitarbeiter') AND
  lead_id IN (
    SELECT id FROM crm_leads 
    WHERE owner_user_id = get_user_profile_id(auth.uid())
  )
);

CREATE POLICY "Mitarbeiter can insert analyses" ON ai_analyses
FOR INSERT WITH CHECK (has_min_role(auth.uid(), 'mitarbeiter'));

CREATE POLICY "Admin/Teamleiter can update analyses" ON ai_analyses
FOR UPDATE USING (has_min_role(auth.uid(), 'teamleiter'));

CREATE POLICY "Admin can delete analyses" ON ai_analyses
FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- 8. PIPELINE TRIGGER nach Analyse
-- =============================================

CREATE OR REPLACE FUNCTION update_pipeline_after_analysis()
RETURNS TRIGGER AS $$
BEGIN
  -- Pipeline-Item aktualisieren wenn Analyse erstellt wird
  UPDATE pipeline_items
  SET 
    stage = 'analysis_ready',
    stage_updated_at = now(),
    purchase_readiness = NEW.purchase_readiness,
    urgency = CASE 
      WHEN NEW.success_probability > 70 THEN 80
      WHEN NEW.success_probability > 40 THEN 50
      ELSE 30
    END,
    pipeline_priority_score = calculate_pipeline_priority(
      (SELECT icp_fit_score FROM crm_leads WHERE id = NEW.lead_id),
      (SELECT source_priority_weight FROM crm_leads WHERE id = NEW.lead_id),
      NEW.purchase_readiness,
      CASE 
        WHEN NEW.success_probability > 70 THEN 80
        WHEN NEW.success_probability > 40 THEN 50
        ELSE 30
      END
    )
  WHERE lead_id = NEW.lead_id
    AND stage IN ('setter_call_done', 'setter_call_scheduled');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_pipeline_after_analysis
AFTER INSERT ON ai_analyses
FOR EACH ROW
EXECUTE FUNCTION update_pipeline_after_analysis();