-- ============================================
-- Phase 1: Neue Enums für LMS und Automation
-- ============================================

-- Member Status
CREATE TYPE member_status AS ENUM ('active', 'paused', 'churned');

-- Membership Product Tier
CREATE TYPE membership_product AS ENUM ('starter', 'growth', 'premium');

-- Membership Status
CREATE TYPE membership_status AS ENUM ('active', 'inactive', 'pending');

-- Lesson Type
CREATE TYPE lesson_type AS ENUM ('video', 'task', 'worksheet', 'quiz');

-- Progress Status
CREATE TYPE progress_status AS ENUM ('not_started', 'in_progress', 'completed');

-- ============================================
-- Phase 2: Mitgliederbereich Tabellen
-- ============================================

-- Members Tabelle
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES crm_leads(id),
  profile_id UUID REFERENCES profiles(id),
  status member_status DEFAULT 'active',
  onboarded_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,
  meta JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id)
);

-- Memberships Tabelle (Entitlements)
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  product membership_product NOT NULL,
  starts_at TIMESTAMPTZ DEFAULT now(),
  ends_at TIMESTAMPTZ,
  status membership_status DEFAULT 'active',
  is_trial BOOLEAN DEFAULT false,
  trial_ends_at TIMESTAMPTZ
);

-- Courses Tabelle
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  version INTEGER DEFAULT 1,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  required_product membership_product,
  sort_order INTEGER DEFAULT 0
);

-- Modules Tabelle
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Lessons Tabelle
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  content_ref TEXT,
  lesson_type lesson_type DEFAULT 'video',
  duration_seconds INTEGER,
  sort_order INTEGER DEFAULT 0,
  meta JSONB DEFAULT '{}'::jsonb
);

-- Lesson Progress Tabelle
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status progress_status DEFAULT 'not_started',
  progress_percent INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  last_position_seconds INTEGER DEFAULT 0,
  UNIQUE(member_id, lesson_id)
);

-- Member KPIs Tabelle
CREATE TABLE member_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  tasks_completion_rate INTEGER DEFAULT 0,
  lesson_completion_rate INTEGER DEFAULT 0,
  revenue_value INTEGER,
  activity_score INTEGER DEFAULT 0,
  risk_score INTEGER DEFAULT 0,
  kpi_json JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  UNIQUE(member_id, week_start_date)
);

-- ============================================
-- Phase 3: Automation Tabellen
-- ============================================

-- Followup Plans
CREATE TABLE followup_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  triggered_by TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'executed')),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  plan_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  executed_at TIMESTAMPTZ,
  execution_result JSONB
);

-- Followup Steps
CREATE TABLE followup_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  plan_id UUID NOT NULL REFERENCES followup_plans(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  step_type TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ,
  content_json JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'skipped', 'failed')),
  executed_at TIMESTAMPTZ,
  result_json JSONB
);

-- Call Queues
CREATE TABLE call_queues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  assigned_to UUID NOT NULL REFERENCES profiles(id),
  date DATE NOT NULL,
  generated_by TEXT DEFAULT 'daily_ai',
  priority_weight NUMERIC DEFAULT 1.0
);

-- Call Queue Items
CREATE TABLE call_queue_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  queue_id UUID NOT NULL REFERENCES call_queues(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES crm_leads(id),
  priority_rank INTEGER NOT NULL,
  reason TEXT,
  context_json JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'called', 'skipped', 'rescheduled')),
  completed_at TIMESTAMPTZ,
  outcome TEXT
);

-- Closed Customer Snapshots
CREATE TABLE closed_customer_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  order_id UUID NOT NULL REFERENCES orders(id),
  lead_id UUID NOT NULL REFERENCES crm_leads(id),
  member_id UUID REFERENCES members(id),
  snapshot_json JSONB NOT NULL
);

-- Customer Avatar Models
CREATE TABLE customer_avatar_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  version INTEGER NOT NULL,
  model_date DATE NOT NULL,
  avatar_json JSONB NOT NULL,
  sample_size INTEGER,
  confidence_score NUMERIC
);

-- View: Aktueller Kunden-Avatar
CREATE OR REPLACE VIEW v_current_customer_avatar AS
SELECT *
FROM customer_avatar_models
WHERE created_at = (SELECT MAX(created_at) FROM customer_avatar_models)
LIMIT 1;

-- ============================================
-- Phase 4: Indizes
-- ============================================

CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_memberships_member_id ON memberships(member_id);
CREATE INDEX idx_memberships_status ON memberships(status);
CREATE INDEX idx_courses_published ON courses(published);
CREATE INDEX idx_modules_course_id ON modules(course_id);
CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_lesson_progress_member_id ON lesson_progress(member_id);
CREATE INDEX idx_member_kpis_member_id ON member_kpis(member_id);
CREATE INDEX idx_followup_plans_lead_id ON followup_plans(lead_id);
CREATE INDEX idx_followup_plans_status ON followup_plans(status);
CREATE INDEX idx_call_queues_date ON call_queues(date);
CREATE INDEX idx_call_queue_items_queue_id ON call_queue_items(queue_id);

-- ============================================
-- Phase 5: RLS Policies
-- ============================================

-- Members
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own member record" ON members
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Staff can read all members" ON members
FOR SELECT USING (has_min_role(auth.uid(), 'mitarbeiter'));

CREATE POLICY "System can insert members" ON members
FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can update members" ON members
FOR UPDATE USING (has_min_role(auth.uid(), 'mitarbeiter'));

CREATE POLICY "Admin can delete members" ON members
FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Memberships
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members see own memberships" ON memberships
FOR SELECT USING (
  member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
);

CREATE POLICY "Staff can read all memberships" ON memberships
FOR SELECT USING (has_min_role(auth.uid(), 'mitarbeiter'));

CREATE POLICY "Staff can manage memberships" ON memberships
FOR ALL USING (has_min_role(auth.uid(), 'teamleiter'));

-- Courses
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published courses visible" ON courses
FOR SELECT USING (
  published = true OR has_min_role(auth.uid(), 'mitarbeiter')
);

CREATE POLICY "Staff can manage courses" ON courses
FOR ALL USING (has_min_role(auth.uid(), 'teamleiter'));

-- Modules
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Modules follow course visibility" ON modules
FOR SELECT USING (
  course_id IN (
    SELECT id FROM courses 
    WHERE published = true OR has_min_role(auth.uid(), 'mitarbeiter')
  )
);

CREATE POLICY "Staff can manage modules" ON modules
FOR ALL USING (has_min_role(auth.uid(), 'teamleiter'));

-- Lessons
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lessons follow module visibility" ON lessons
FOR SELECT USING (
  module_id IN (
    SELECT m.id FROM modules m
    JOIN courses c ON m.course_id = c.id
    WHERE c.published = true OR has_min_role(auth.uid(), 'mitarbeiter')
  )
);

CREATE POLICY "Staff can manage lessons" ON lessons
FOR ALL USING (has_min_role(auth.uid(), 'teamleiter'));

-- Lesson Progress
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members manage own progress" ON lesson_progress
FOR ALL USING (
  member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
);

CREATE POLICY "Staff can read progress" ON lesson_progress
FOR SELECT USING (has_min_role(auth.uid(), 'mitarbeiter'));

-- Member KPIs
ALTER TABLE member_kpis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members see own KPIs" ON member_kpis
FOR SELECT USING (
  member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
);

CREATE POLICY "Staff can manage KPIs" ON member_kpis
FOR ALL USING (has_min_role(auth.uid(), 'mitarbeiter'));

-- Followup Plans
ALTER TABLE followup_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read followup plans" ON followup_plans
FOR SELECT USING (has_min_role(auth.uid(), 'mitarbeiter'));

CREATE POLICY "Staff can manage followup plans" ON followup_plans
FOR ALL USING (has_min_role(auth.uid(), 'mitarbeiter'));

-- Followup Steps
ALTER TABLE followup_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read followup steps" ON followup_steps
FOR SELECT USING (has_min_role(auth.uid(), 'mitarbeiter'));

CREATE POLICY "Staff can manage followup steps" ON followup_steps
FOR ALL USING (has_min_role(auth.uid(), 'mitarbeiter'));

-- Call Queues
ALTER TABLE call_queues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own call queues" ON call_queues
FOR SELECT USING (assigned_to = get_user_profile_id(auth.uid()));

CREATE POLICY "Staff can read all call queues" ON call_queues
FOR SELECT USING (has_min_role(auth.uid(), 'teamleiter'));

CREATE POLICY "System can manage call queues" ON call_queues
FOR ALL USING (has_min_role(auth.uid(), 'mitarbeiter'));

-- Call Queue Items
ALTER TABLE call_queue_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own queue items" ON call_queue_items
FOR SELECT USING (
  queue_id IN (SELECT id FROM call_queues WHERE assigned_to = get_user_profile_id(auth.uid()))
);

CREATE POLICY "Staff can read all queue items" ON call_queue_items
FOR SELECT USING (has_min_role(auth.uid(), 'teamleiter'));

CREATE POLICY "Staff can manage queue items" ON call_queue_items
FOR ALL USING (has_min_role(auth.uid(), 'mitarbeiter'));

-- Closed Customer Snapshots
ALTER TABLE closed_customer_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read snapshots" ON closed_customer_snapshots
FOR SELECT USING (has_min_role(auth.uid(), 'mitarbeiter'));

CREATE POLICY "System can insert snapshots" ON closed_customer_snapshots
FOR INSERT WITH CHECK (true);

-- Customer Avatar Models
ALTER TABLE customer_avatar_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read avatar models" ON customer_avatar_models
FOR SELECT USING (has_min_role(auth.uid(), 'mitarbeiter'));

CREATE POLICY "System can manage avatar models" ON customer_avatar_models
FOR ALL USING (has_min_role(auth.uid(), 'geschaeftsfuehrung'));

-- ============================================
-- Phase 6: Trigger für updated_at
-- ============================================

CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at
  BEFORE UPDATE ON memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at
  BEFORE UPDATE ON lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_followup_plans_updated_at
  BEFORE UPDATE ON followup_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();