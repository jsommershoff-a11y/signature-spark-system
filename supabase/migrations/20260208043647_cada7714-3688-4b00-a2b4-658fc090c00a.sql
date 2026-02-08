-- ============================================
-- CRM Core Schema Migration
-- ============================================

-- 1. Create Enums
-- ============================================

-- Lead Source Types
CREATE TYPE lead_source_type AS ENUM (
  'inbound_paid',
  'inbound_organic', 
  'referral',
  'outbound_ai',
  'outbound_manual',
  'partner'
);

-- Lead Discovery Method
CREATE TYPE lead_discovered_by AS ENUM (
  'daily_ai',
  'manual',
  'inbound'
);

-- Lead Status
CREATE TYPE lead_status AS ENUM (
  'new',
  'qualified',
  'unqualified'
);

-- Pipeline Stages
CREATE TYPE pipeline_stage AS ENUM (
  'new_lead',
  'setter_call_scheduled',
  'setter_call_done',
  'analysis_ready',
  'offer_draft',
  'offer_sent',
  'payment_unlocked',
  'won',
  'lost'
);

-- Task Types
CREATE TYPE task_type AS ENUM (
  'call',
  'followup',
  'review_offer',
  'intervention'
);

-- Task Status
CREATE TYPE task_status AS ENUM (
  'open',
  'done',
  'blocked'
);

-- 2. Add team_id to profiles for team-based access
-- ============================================
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES profiles(id);

-- 3. Create CRM Leads Table
-- ============================================
CREATE TABLE crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Source Tracking
  source_type lead_source_type NOT NULL,
  source_detail TEXT,
  source_confidence_score INTEGER CHECK (source_confidence_score >= 0 AND source_confidence_score <= 100),
  source_priority_weight NUMERIC(3,2) CHECK (source_priority_weight >= 0.1 AND source_priority_weight <= 5.0) DEFAULT 1.0,
  discovered_by lead_discovered_by DEFAULT 'manual',
  dedupe_key TEXT UNIQUE,
  
  -- Contact Info
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Company Info
  company TEXT,
  website_url TEXT,
  industry TEXT,
  location TEXT,
  
  -- Scoring
  icp_fit_score INTEGER CHECK (icp_fit_score >= 0 AND icp_fit_score <= 100),
  icp_fit_reason JSONB,
  enrichment_json JSONB,
  
  -- Assignment
  owner_user_id UUID REFERENCES profiles(id),
  
  -- Status
  status lead_status DEFAULT 'new',
  notes TEXT
);

-- 4. Create Pipeline Items Table
-- ============================================
CREATE TABLE pipeline_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  stage pipeline_stage DEFAULT 'new_lead',
  stage_updated_at TIMESTAMPTZ DEFAULT now(),
  pipeline_priority_score INTEGER CHECK (pipeline_priority_score >= 0 AND pipeline_priority_score <= 100),
  
  -- Metadata for scoring
  purchase_readiness INTEGER CHECK (purchase_readiness >= 0 AND purchase_readiness <= 100),
  urgency INTEGER CHECK (urgency >= 0 AND urgency <= 100),
  
  UNIQUE(lead_id)
);

-- 5. Create Tasks Table
-- ============================================
CREATE TABLE crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  assigned_user_id UUID NOT NULL REFERENCES profiles(id),
  lead_id UUID REFERENCES crm_leads(id) ON DELETE SET NULL,
  member_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  type task_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_at TIMESTAMPTZ,
  status task_status DEFAULT 'open',
  meta JSONB
);

-- 6. Enable RLS on all tables
-- ============================================
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_tasks ENABLE ROW LEVEL SECURITY;

-- 7. Create helper function to get user's profile id
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_profile_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM profiles WHERE user_id = _user_id LIMIT 1
$$;

-- 8. Create helper function to get team members
-- ============================================
CREATE OR REPLACE FUNCTION public.get_team_member_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM profiles 
  WHERE team_id = (SELECT id FROM profiles WHERE user_id = _user_id)
$$;

-- 9. CRM Leads RLS Policies
-- ============================================

-- Admin/GF can read all leads
CREATE POLICY "Admin/GF can read all leads"
ON crm_leads FOR SELECT
USING (has_min_role(auth.uid(), 'geschaeftsfuehrung'));

-- Teamleiter can read team leads
CREATE POLICY "Teamleiter can read team leads"
ON crm_leads FOR SELECT
USING (
  has_role(auth.uid(), 'teamleiter') AND
  owner_user_id IN (SELECT get_team_member_ids(auth.uid()))
);

-- Mitarbeiter can read own leads
CREATE POLICY "Mitarbeiter can read own leads"
ON crm_leads FOR SELECT
USING (
  has_min_role(auth.uid(), 'mitarbeiter') AND
  owner_user_id = get_user_profile_id(auth.uid())
);

-- Admin/GF can insert leads
CREATE POLICY "Admin/GF can insert leads"
ON crm_leads FOR INSERT
WITH CHECK (has_min_role(auth.uid(), 'geschaeftsfuehrung'));

-- Mitarbeiter can insert leads
CREATE POLICY "Mitarbeiter can insert leads"
ON crm_leads FOR INSERT
WITH CHECK (has_min_role(auth.uid(), 'mitarbeiter'));

-- Admin/GF can update all leads
CREATE POLICY "Admin/GF can update all leads"
ON crm_leads FOR UPDATE
USING (has_min_role(auth.uid(), 'geschaeftsfuehrung'));

-- Teamleiter can update team leads
CREATE POLICY "Teamleiter can update team leads"
ON crm_leads FOR UPDATE
USING (
  has_role(auth.uid(), 'teamleiter') AND
  owner_user_id IN (SELECT get_team_member_ids(auth.uid()))
);

-- Mitarbeiter can update own leads
CREATE POLICY "Mitarbeiter can update own leads"
ON crm_leads FOR UPDATE
USING (
  has_min_role(auth.uid(), 'mitarbeiter') AND
  owner_user_id = get_user_profile_id(auth.uid())
);

-- Admin can delete leads
CREATE POLICY "Admin can delete leads"
ON crm_leads FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- 10. Pipeline Items RLS Policies
-- ============================================

-- Admin/GF can read all pipeline items
CREATE POLICY "Admin/GF can read all pipeline items"
ON pipeline_items FOR SELECT
USING (has_min_role(auth.uid(), 'geschaeftsfuehrung'));

-- Teamleiter can read team pipeline items
CREATE POLICY "Teamleiter can read team pipeline items"
ON pipeline_items FOR SELECT
USING (
  has_role(auth.uid(), 'teamleiter') AND
  lead_id IN (
    SELECT id FROM crm_leads 
    WHERE owner_user_id IN (SELECT get_team_member_ids(auth.uid()))
  )
);

-- Mitarbeiter can read own pipeline items
CREATE POLICY "Mitarbeiter can read own pipeline items"
ON pipeline_items FOR SELECT
USING (
  has_min_role(auth.uid(), 'mitarbeiter') AND
  lead_id IN (
    SELECT id FROM crm_leads 
    WHERE owner_user_id = get_user_profile_id(auth.uid())
  )
);

-- Mitarbeiter+ can insert pipeline items
CREATE POLICY "Mitarbeiter can insert pipeline items"
ON pipeline_items FOR INSERT
WITH CHECK (has_min_role(auth.uid(), 'mitarbeiter'));

-- Admin/GF can update all pipeline items
CREATE POLICY "Admin/GF can update all pipeline items"
ON pipeline_items FOR UPDATE
USING (has_min_role(auth.uid(), 'geschaeftsfuehrung'));

-- Teamleiter can update team pipeline items
CREATE POLICY "Teamleiter can update team pipeline items"
ON pipeline_items FOR UPDATE
USING (
  has_role(auth.uid(), 'teamleiter') AND
  lead_id IN (
    SELECT id FROM crm_leads 
    WHERE owner_user_id IN (SELECT get_team_member_ids(auth.uid()))
  )
);

-- Mitarbeiter can update own pipeline items
CREATE POLICY "Mitarbeiter can update own pipeline items"
ON pipeline_items FOR UPDATE
USING (
  has_min_role(auth.uid(), 'mitarbeiter') AND
  lead_id IN (
    SELECT id FROM crm_leads 
    WHERE owner_user_id = get_user_profile_id(auth.uid())
  )
);

-- Admin can delete pipeline items
CREATE POLICY "Admin can delete pipeline items"
ON pipeline_items FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- 11. CRM Tasks RLS Policies
-- ============================================

-- Admin/GF can read all tasks
CREATE POLICY "Admin/GF can read all tasks"
ON crm_tasks FOR SELECT
USING (has_min_role(auth.uid(), 'geschaeftsfuehrung'));

-- Teamleiter can read team tasks
CREATE POLICY "Teamleiter can read team tasks"
ON crm_tasks FOR SELECT
USING (
  has_role(auth.uid(), 'teamleiter') AND
  assigned_user_id IN (SELECT get_team_member_ids(auth.uid()))
);

-- Users can read own assigned tasks
CREATE POLICY "Users can read own tasks"
ON crm_tasks FOR SELECT
USING (assigned_user_id = get_user_profile_id(auth.uid()));

-- Mitarbeiter+ can insert tasks
CREATE POLICY "Mitarbeiter can insert tasks"
ON crm_tasks FOR INSERT
WITH CHECK (has_min_role(auth.uid(), 'mitarbeiter'));

-- Kunden can insert own tasks
CREATE POLICY "Kunden can insert own tasks"
ON crm_tasks FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'kunde') AND
  assigned_user_id = get_user_profile_id(auth.uid())
);

-- Admin/GF can update all tasks
CREATE POLICY "Admin/GF can update all tasks"
ON crm_tasks FOR UPDATE
USING (has_min_role(auth.uid(), 'geschaeftsfuehrung'));

-- Teamleiter can update team tasks
CREATE POLICY "Teamleiter can update team tasks"
ON crm_tasks FOR UPDATE
USING (
  has_role(auth.uid(), 'teamleiter') AND
  assigned_user_id IN (SELECT get_team_member_ids(auth.uid()))
);

-- Users can update own tasks
CREATE POLICY "Users can update own tasks"
ON crm_tasks FOR UPDATE
USING (assigned_user_id = get_user_profile_id(auth.uid()));

-- Admin can delete tasks
CREATE POLICY "Admin can delete tasks"
ON crm_tasks FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Users can delete own tasks
CREATE POLICY "Users can delete own tasks"
ON crm_tasks FOR DELETE
USING (assigned_user_id = get_user_profile_id(auth.uid()));

-- 12. Create updated_at triggers
-- ============================================
CREATE TRIGGER update_crm_leads_updated_at
BEFORE UPDATE ON crm_leads
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pipeline_items_updated_at
BEFORE UPDATE ON pipeline_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_tasks_updated_at
BEFORE UPDATE ON crm_tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 13. Create function to calculate pipeline priority
-- ============================================
CREATE OR REPLACE FUNCTION public.calculate_pipeline_priority(
  _icp_score INTEGER,
  _source_weight NUMERIC,
  _purchase_readiness INTEGER,
  _urgency INTEGER
) RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN LEAST(100, GREATEST(0, 
    COALESCE(_icp_score, 0) * 0.3 +
    COALESCE(_source_weight, 1) * 10 +
    COALESCE(_purchase_readiness, 0) * 0.3 +
    COALESCE(_urgency, 0) * 0.3
  )::INTEGER);
END;
$$;

-- 14. Create function to auto-create pipeline item on lead creation
-- ============================================
CREATE OR REPLACE FUNCTION public.create_pipeline_item_for_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO pipeline_items (lead_id, stage, pipeline_priority_score)
  VALUES (
    NEW.id, 
    'new_lead',
    calculate_pipeline_priority(NEW.icp_fit_score, NEW.source_priority_weight, NULL, NULL)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_pipeline_item_on_lead_insert
AFTER INSERT ON crm_leads
FOR EACH ROW
EXECUTE FUNCTION create_pipeline_item_for_lead();

-- 15. Create indexes for performance
-- ============================================
CREATE INDEX idx_crm_leads_owner ON crm_leads(owner_user_id);
CREATE INDEX idx_crm_leads_status ON crm_leads(status);
CREATE INDEX idx_crm_leads_source_type ON crm_leads(source_type);
CREATE INDEX idx_crm_leads_created_at ON crm_leads(created_at DESC);
CREATE INDEX idx_pipeline_items_stage ON pipeline_items(stage);
CREATE INDEX idx_pipeline_items_priority ON pipeline_items(pipeline_priority_score DESC);
CREATE INDEX idx_crm_tasks_assigned_user ON crm_tasks(assigned_user_id);
CREATE INDEX idx_crm_tasks_due_at ON crm_tasks(due_at);
CREATE INDEX idx_crm_tasks_status ON crm_tasks(status);
CREATE INDEX idx_crm_tasks_lead ON crm_tasks(lead_id);