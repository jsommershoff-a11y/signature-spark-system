
# Umfassende System-Erweiterung: Mitgliederbereich, Automatisierung & Checkout-Vervollstaendigung

## Uebersicht

Diese Implementierung erweitert das bestehende CRM-System um drei Hauptbereiche:
1. **Mitgliederbereich (LMS MVP)** - Kurse, Fortschritt, KPIs
2. **Automatisierungs-Infrastruktur** - Edge Functions fuer n8n
3. **Checkout-Flow Vervollstaendigung** - Member-Erstellung nach Payment

---

## Was bereits existiert

Die Analyse zeigt, dass folgende Komponenten bereits implementiert sind:

| Bereich | Status |
|---------|--------|
| `offers` Tabelle | Vorhanden mit RLS |
| `orders` Tabelle | Vorhanden mit RLS |
| `useOffers` Hook | Funktional |
| `webhook-payment` Edge Function | Grundlegend implementiert |
| Dashboard Widgets | TopLeads, Analysen, Pipeline |
| Courses Seite | Platzhalter vorhanden |

---

## Phase 1: Datenbank-Schema - Mitgliederbereich

### 1.1 Neue Enums

```sql
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
```

### 1.2 Neue Tabelle: members

```sql
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Beziehungen
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES crm_leads(id),
  profile_id UUID REFERENCES profiles(id),
  
  -- Status
  status member_status DEFAULT 'active',
  
  -- Onboarding
  onboarded_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,
  
  -- Metadaten
  meta JSONB DEFAULT '{}'::jsonb,
  
  UNIQUE(user_id)
);
```

### 1.3 Neue Tabelle: memberships (Entitlements)

```sql
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Beziehung
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  
  -- Produkt
  product membership_product NOT NULL,
  
  -- Laufzeit
  starts_at TIMESTAMPTZ DEFAULT now(),
  ends_at TIMESTAMPTZ,
  
  -- Status
  status membership_status DEFAULT 'active',
  
  -- Zahlungs-Info
  is_trial BOOLEAN DEFAULT false,
  trial_ends_at TIMESTAMPTZ
);
```

### 1.4 Neue Tabelle: courses

```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Inhalt
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  
  -- Versionierung
  version INTEGER DEFAULT 1,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  
  -- Zugang
  required_product membership_product,
  
  -- Ordnung
  sort_order INTEGER DEFAULT 0
);
```

### 1.5 Neue Tabelle: modules

```sql
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Beziehung
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Inhalt
  name TEXT NOT NULL,
  description TEXT,
  
  -- Ordnung
  sort_order INTEGER DEFAULT 0
);
```

### 1.6 Neue Tabelle: lessons

```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Beziehung
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  
  -- Inhalt
  name TEXT NOT NULL,
  description TEXT,
  content_ref TEXT,  -- Video URL, Worksheet URL, etc.
  
  -- Typ
  lesson_type lesson_type DEFAULT 'video',
  
  -- Dauer (fuer Videos)
  duration_seconds INTEGER,
  
  -- Ordnung
  sort_order INTEGER DEFAULT 0,
  
  -- Meta
  meta JSONB DEFAULT '{}'::jsonb
);
```

### 1.7 Neue Tabelle: lesson_progress

```sql
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Beziehungen
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  
  -- Fortschritt
  status progress_status DEFAULT 'not_started',
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  
  -- Zeitstempel
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  
  -- Video-spezifisch
  last_position_seconds INTEGER DEFAULT 0,
  
  UNIQUE(member_id, lesson_id)
);
```

### 1.8 Neue Tabelle: member_kpis

```sql
CREATE TABLE member_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Beziehung
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  
  -- Zeitraum
  week_start_date DATE NOT NULL,
  
  -- Metriken
  tasks_completion_rate INTEGER DEFAULT 0 CHECK (tasks_completion_rate >= 0 AND tasks_completion_rate <= 100),
  lesson_completion_rate INTEGER DEFAULT 0 CHECK (lesson_completion_rate >= 0 AND lesson_completion_rate <= 100),
  revenue_value INTEGER,  -- Optional: Umsatz in Cent
  activity_score INTEGER DEFAULT 0 CHECK (activity_score >= 0 AND activity_score <= 100),
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  
  -- Detaillierte Daten
  kpi_json JSONB DEFAULT '{}'::jsonb,
  
  -- Notizen
  notes TEXT,
  
  UNIQUE(member_id, week_start_date)
);
```

---

## Phase 2: Datenbank-Schema - Automatisierung

### 2.1 Neue Tabellen fuer n8n Workflows

```sql
-- Followup Plans (KI-generierte Nachfass-Plaene)
CREATE TABLE followup_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Beziehung
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  triggered_by TEXT,  -- event type that triggered
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'executed')),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  
  -- Plan-Inhalt
  plan_json JSONB NOT NULL,
  
  -- Ausfuehrung
  executed_at TIMESTAMPTZ,
  execution_result JSONB
);

-- Followup Steps (einzelne Schritte)
CREATE TABLE followup_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Beziehung
  plan_id UUID NOT NULL REFERENCES followup_plans(id) ON DELETE CASCADE,
  
  -- Step-Details
  step_order INTEGER NOT NULL,
  step_type TEXT NOT NULL,  -- 'email', 'whatsapp', 'call', 'task'
  scheduled_at TIMESTAMPTZ,
  content_json JSONB,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'skipped', 'failed')),
  executed_at TIMESTAMPTZ,
  result_json JSONB
);

-- Call Queues (fuer Morgen-Dashboard)
CREATE TABLE call_queues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Zuweisung
  assigned_to UUID NOT NULL REFERENCES profiles(id),
  date DATE NOT NULL,
  
  -- Metadaten
  generated_by TEXT DEFAULT 'daily_ai',
  priority_weight NUMERIC DEFAULT 1.0
);

-- Call Queue Items
CREATE TABLE call_queue_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Beziehungen
  queue_id UUID NOT NULL REFERENCES call_queues(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES crm_leads(id),
  
  -- Prioritaet & Kontext
  priority_rank INTEGER NOT NULL,
  reason TEXT,
  context_json JSONB,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'called', 'skipped', 'rescheduled')),
  completed_at TIMESTAMPTZ,
  outcome TEXT
);

-- Closed Customer Snapshots (fuer PCA)
CREATE TABLE closed_customer_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Beziehung
  order_id UUID NOT NULL REFERENCES orders(id),
  lead_id UUID NOT NULL REFERENCES crm_leads(id),
  member_id UUID REFERENCES members(id),
  
  -- Snapshot-Daten (zum Zeitpunkt des Kaufs)
  snapshot_json JSONB NOT NULL
);

-- Customer Avatar Models (PCA Recalculations)
CREATE TABLE customer_avatar_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Versioning
  version INTEGER NOT NULL,
  model_date DATE NOT NULL,
  
  -- Model-Daten
  avatar_json JSONB NOT NULL,
  
  -- Meta
  sample_size INTEGER,
  confidence_score NUMERIC
);

-- View: Aktueller Kunden-Avatar
CREATE OR REPLACE VIEW v_current_customer_avatar AS
SELECT *
FROM customer_avatar_models
WHERE created_at = (SELECT MAX(created_at) FROM customer_avatar_models)
LIMIT 1;
```

---

## Phase 3: RLS Policies

### 3.1 Members & Memberships

```sql
-- Members: Jeder sieht nur sich selbst, Staff sieht alle
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own member record" ON members
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Staff can read all members" ON members
FOR SELECT USING (has_min_role(auth.uid(), 'mitarbeiter'));

CREATE POLICY "System can insert members" ON members
FOR INSERT WITH CHECK (true);  -- Webhook darf einfuegen

CREATE POLICY "Staff can update members" ON members
FOR UPDATE USING (has_min_role(auth.uid(), 'mitarbeiter'));

-- Memberships: Aehnliche Logik
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members see own memberships" ON memberships
FOR SELECT USING (
  member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
);

CREATE POLICY "Staff can read all memberships" ON memberships
FOR SELECT USING (has_min_role(auth.uid(), 'mitarbeiter'));
```

### 3.2 Courses & Lessons

```sql
-- Courses: Published sichtbar fuer alle, Draft nur Staff
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published courses visible to members" ON courses
FOR SELECT USING (
  published = true OR
  has_min_role(auth.uid(), 'mitarbeiter')
);

CREATE POLICY "Staff can manage courses" ON courses
FOR ALL USING (has_min_role(auth.uid(), 'teamleiter'));

-- Modules & Lessons erben vom Kurs
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Modules follow course visibility" ON modules
FOR SELECT USING (
  course_id IN (
    SELECT id FROM courses 
    WHERE published = true OR has_min_role(auth.uid(), 'mitarbeiter')
  )
);

CREATE POLICY "Lessons follow course visibility" ON lessons
FOR SELECT USING (
  module_id IN (
    SELECT id FROM modules WHERE course_id IN (
      SELECT id FROM courses 
      WHERE published = true OR has_min_role(auth.uid(), 'mitarbeiter')
    )
  )
);
```

### 3.3 Lesson Progress & KPIs

```sql
-- Progress: Nur eigene Daten, Staff kann lesen
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members manage own progress" ON lesson_progress
FOR ALL USING (
  member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
);

CREATE POLICY "Staff can read progress" ON lesson_progress
FOR SELECT USING (has_min_role(auth.uid(), 'mitarbeiter'));

-- KPIs: Aehnlich
ALTER TABLE member_kpis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members see own KPIs" ON member_kpis
FOR SELECT USING (
  member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
);

CREATE POLICY "Staff can manage KPIs" ON member_kpis
FOR ALL USING (has_min_role(auth.uid(), 'mitarbeiter'));
```

---

## Phase 4: Webhook-Payment Erweiterung

### 4.1 Member-Erstellung nach Payment

```typescript
// webhook-payment/index.ts - Erweiterung

// Nach erfolgreicher Zahlung:
// 1. Member erstellen (falls nicht vorhanden)
// 2. Membership erstellen
// 3. Closed Customer Snapshot speichern
// 4. Rolle 'kunde' zuweisen (falls noch nicht)

async function createMemberFromPayment(
  supabase: SupabaseClient,
  leadId: string,
  orderId: string,
  product: 'starter' | 'growth' | 'premium'
) {
  // 1. Lead-Daten laden
  const { data: lead } = await supabase
    .from('crm_leads')
    .select('*, profiles!inner(*)')
    .eq('id', leadId)
    .single();

  // 2. Auth-User erstellen oder finden
  // (ueber Einladungs-Email oder vorhandenen Account)

  // 3. Member-Record erstellen
  const { data: member } = await supabase
    .from('members')
    .insert({
      user_id: userId,
      lead_id: leadId,
      profile_id: profileId,
      status: 'active'
    })
    .select()
    .single();

  // 4. Membership erstellen
  await supabase
    .from('memberships')
    .insert({
      member_id: member.id,
      order_id: orderId,
      product: product,
      starts_at: new Date().toISOString(),
      status: 'active'
    });

  // 5. Snapshot speichern
  await supabase
    .from('closed_customer_snapshots')
    .insert({
      order_id: orderId,
      lead_id: leadId,
      member_id: member.id,
      snapshot_json: { lead, order, timestamp: new Date().toISOString() }
    });

  // 6. Rolle 'kunde' zuweisen
  await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role: 'kunde'
    })
    .onConflict('user_id, role')
    .ignore();

  return member;
}
```

---

## Phase 5: Edge Functions fuer n8n

### 5.1 prospecting_daily_run

```typescript
// supabase/functions/prospecting_daily_run/index.ts
// Taeglich: Neue Leads + Tasks + Call Queues generieren

serve(async (req) => {
  // 1. KI-Prospecting: Neue Leads aus Quellen
  // 2. Tasks fuer neue Leads erstellen
  // 3. Call Queues fuer Mitarbeiter generieren
  //    - Priorisiert nach Pipeline Priority Score
  //    - Verteilt auf Mitarbeiter
});
```

### 5.2 generate_followup_plan

```typescript
// supabase/functions/generate_followup_plan/index.ts
// Bei Events: KI-generierter Nachfass-Plan

serve(async (req) => {
  const { lead_id, trigger_event } = await req.json();
  
  // 1. Lead-Historie laden (Calls, Analysen, etc.)
  // 2. KI-Prompt mit Kontext
  // 3. Plan mit Steps generieren
  // 4. In followup_plans speichern
  // 5. Notification an zustaendigen Mitarbeiter
});
```

### 5.3 approve_followup_plan

```typescript
// supabase/functions/approve_followup_plan/index.ts
// 1-Klick Approval in UI

serve(async (req) => {
  const { plan_id, approve } = await req.json();
  
  if (approve) {
    // Plan auf 'approved' setzen
    // Steps als Tasks/Calls erstellen
  } else {
    // Plan auf 'rejected' setzen
  }
});
```

### 5.4 avatar_daily_recalc

```typescript
// supabase/functions/avatar_daily_recalc/index.ts
// Taeglich: PCA Update basierend auf Closed Customers

serve(async (req) => {
  // 1. Alle closed_customer_snapshots laden
  // 2. Clustering/Analyse durchfuehren
  // 3. Neues Avatar-Modell speichern
  // 4. Version incrementieren
});
```

### 5.5 channel_event_ingest

```typescript
// supabase/functions/channel_event_ingest/index.ts
// Email/WhatsApp/Phone Events verarbeiten

serve(async (req) => {
  const { channel, event_type, lead_id, payload } = await req.json();
  
  // 1. Event validieren
  // 2. Lead-Activity aktualisieren
  // 3. Optional: Followup-Plan triggern
});
```

### 5.6 config.toml erweitern

```toml
[functions.prospecting_daily_run]
verify_jwt = false

[functions.generate_followup_plan]
verify_jwt = false

[functions.approve_followup_plan]
verify_jwt = true

[functions.avatar_daily_recalc]
verify_jwt = false

[functions.channel_event_ingest]
verify_jwt = false
```

---

## Phase 6: TypeScript Types

### 6.1 Neue Typen: members.ts

```typescript
// src/types/members.ts

export type MemberStatus = 'active' | 'paused' | 'churned';
export type MembershipProduct = 'starter' | 'growth' | 'premium';
export type MembershipStatus = 'active' | 'inactive' | 'pending';
export type LessonType = 'video' | 'task' | 'worksheet' | 'quiz';
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface Member {
  id: string;
  user_id: string;
  lead_id?: string;
  profile_id?: string;
  status: MemberStatus;
  onboarded_at?: string;
  last_active_at?: string;
  created_at: string;
  // Joined
  profile?: Profile;
  memberships?: Membership[];
}

export interface Membership {
  id: string;
  member_id: string;
  order_id?: string;
  product: MembershipProduct;
  starts_at: string;
  ends_at?: string;
  status: MembershipStatus;
  is_trial: boolean;
  trial_ends_at?: string;
}

export interface Course {
  id: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
  version: number;
  published: boolean;
  required_product?: MembershipProduct;
  sort_order: number;
  // Joined
  modules?: Module[];
}

export interface Module {
  id: string;
  course_id: string;
  name: string;
  description?: string;
  sort_order: number;
  // Joined
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  name: string;
  description?: string;
  content_ref?: string;
  lesson_type: LessonType;
  duration_seconds?: number;
  sort_order: number;
  // Joined (fuer Member)
  progress?: LessonProgress;
}

export interface LessonProgress {
  id: string;
  member_id: string;
  lesson_id: string;
  status: ProgressStatus;
  progress_percent: number;
  started_at?: string;
  completed_at?: string;
  last_seen_at?: string;
  last_position_seconds?: number;
}

export interface MemberKPI {
  id: string;
  member_id: string;
  week_start_date: string;
  tasks_completion_rate: number;
  lesson_completion_rate: number;
  revenue_value?: number;
  activity_score: number;
  risk_score: number;
  kpi_json: Record<string, unknown>;
  notes?: string;
}

// UI Labels
export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  active: 'Aktiv',
  paused: 'Pausiert',
  churned: 'Gekuendigt',
};

export const PRODUCT_LABELS: Record<MembershipProduct, string> = {
  starter: 'Starter',
  growth: 'Growth',
  premium: 'Premium',
};

export const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  video: 'Video',
  task: 'Aufgabe',
  worksheet: 'Arbeitsblatt',
  quiz: 'Quiz',
};
```

---

## Phase 7: React Hooks

### 7.1 useMember Hook (fuer Kunden)

```typescript
// src/hooks/useMember.ts
// Funktionen:
- getMemberProfile() - Eigenes Member-Profil laden
- getMemberships() - Aktive Memberships
- getCourses() - Verfuegbare Kurse basierend auf Membership
- getLessonProgress(lessonId) - Fortschritt laden
- updateProgress(lessonId, data) - Fortschritt speichern
- getKPIs() - Eigene KPIs
```

### 7.2 useCourses Hook

```typescript
// src/hooks/useCourses.ts
// Funktionen:
- fetchCourses() - Alle (published) Kurse
- fetchCourse(id) - Kurs mit Modulen und Lektionen
- fetchModules(courseId) - Module eines Kurses
- fetchLessons(moduleId) - Lektionen eines Moduls
```

### 7.3 useAdminMembers Hook (fuer Staff)

```typescript
// src/hooks/useAdminMembers.ts
// Funktionen:
- fetchAllMembers() - Alle Members mit Stats
- getMemberDetails(id) - Detailansicht
- getMemberKPIs(id) - KPI-Historie
- getTopPerformers() - Top 5 nach Activity Score
- getAtRiskMembers() - Members mit Risk Score > 70
```

### 7.4 useCallQueue Hook

```typescript
// src/hooks/useCallQueue.ts
// Funktionen:
- getTodaysQueue() - Heutige Call Queue fuer User
- markAsCalled(itemId, outcome) - Item als erledigt
- skipItem(itemId, reason) - Item ueberspringen
- rescheduleItem(itemId, date) - Verschieben
```

### 7.5 useFollowupPlans Hook

```typescript
// src/hooks/useFollowupPlans.ts
// Funktionen:
- getPendingPlans() - Ausstehende Approvals
- approvePlan(id) - Plan genehmigen
- rejectPlan(id, reason) - Plan ablehnen
- getPlanDetails(id) - Plan mit Steps
```

---

## Phase 8: UI-Komponenten

### 8.1 Mitgliederbereich (Kunden-Sicht)

```text
src/components/learning/
  CourseCard.tsx           # Kurs-Karte mit Fortschritt
  CourseDetail.tsx         # Kurs-Uebersicht mit Modulen
  ModuleAccordion.tsx      # Aufklappbare Module
  LessonCard.tsx           # Lektion mit Status
  VideoPlayer.tsx          # Video mit Progress-Tracking
  ProgressBar.tsx          # Fortschrittsbalken
  KPISummary.tsx           # KPI-Zusammenfassung fuer Kunde
```

### 8.2 Admin-Bereich (Staff-Sicht)

```text
src/components/members/
  MemberList.tsx           # Liste aller Members
  MemberCard.tsx           # Member-Karte
  MemberDetail.tsx         # Detail-Modal
  KPIChart.tsx             # KPI-Verlauf Chart
  RiskIndicator.tsx        # Risk Score Anzeige
  PerformanceWidget.tsx    # Top/Low Performer
```

### 8.3 Dashboard-Erweiterungen

```text
src/components/dashboard/
  CallQueueWidget.tsx      # Morgens: Heutige Calls
  FollowupApprovalsWidget.tsx  # Pending Approvals
  CustomerAvatarWidget.tsx # Aktueller PCA
  MemberRiskWidget.tsx     # At-Risk Members
```

### 8.4 Courses.tsx erweitern

```typescript
// src/pages/app/Courses.tsx
// Kunde sieht:
// - Verfuegbare Kurse (basierend auf Membership)
// - Fortschritt pro Kurs
// - Naechste Lektion
// - KPI Summary

// Layout:
+-------------------------------------------------------------------+
| Deine Kurse                                                        |
+-------------------------------------------------------------------+
| [Kurs 1: SalesFlow Grundlagen]                                     |
| [==========================] 75% abgeschlossen                     |
| Naechste Lektion: "Pipeline-Optimierung"                           |
+-------------------------------------------------------------------+
| [Kurs 2: Fortgeschrittene Techniken]                              |
| [==========] 25% abgeschlossen                                     |
| Naechste Lektion: "Closing-Strategien"                             |
+-------------------------------------------------------------------+
|                                                                    |
| Deine Performance diese Woche:                                     |
| +--------------------+  +--------------------+                      |
| | Aufgaben: 80%      |  | Lektionen: 60%     |                     |
| +--------------------+  +--------------------+                      |
+-------------------------------------------------------------------+
```

---

## Phase 9: Neue Seiten & Routes

### 9.1 Neue Seiten

```text
src/pages/app/Course.tsx        # Kurs-Detailseite
src/pages/app/Lesson.tsx        # Lektions-Ansicht
src/pages/app/Members.tsx       # Admin: Member-Uebersicht
src/pages/app/MemberDetail.tsx  # Admin: Member-Detail
```

### 9.2 Routes erweitern

```typescript
// App.tsx
// Kunde-Routes (alle authentifizierten)
<Route path="courses/:courseId" element={<Course />} />
<Route path="courses/:courseId/lessons/:lessonId" element={<Lesson />} />

// Staff-Routes
<Route path="members" element={
  <ProtectedRoute requireMinRole="mitarbeiter">
    <Members />
  </ProtectedRoute>
} />
<Route path="members/:memberId" element={
  <ProtectedRoute requireMinRole="mitarbeiter">
    <MemberDetail />
  </ProtectedRoute>
} />
```

### 9.3 Sidebar erweitern

```typescript
// AppSidebar.tsx
// Fuer Kunden:
{ label: 'Kurse', href: '/app/courses', icon: GraduationCap }

// Fuer Staff:
{ label: 'Mitglieder', href: '/app/members', icon: Users, minRole: 'mitarbeiter' }
```

---

## Phase 10: Realtime Updates

### 10.1 Supabase Realtime fuer Progress

```typescript
// In Course.tsx oder Lesson.tsx
useEffect(() => {
  const channel = supabase
    .channel('lesson_progress_changes')
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'lesson_progress',
        filter: `member_id=eq.${memberId}`
      },
      (payload) => {
        // Progress-State aktualisieren
        refetch();
      }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [memberId]);
```

### 10.2 Realtime fuer Admin-Dashboard

```typescript
// In PerformanceWidget.tsx
// Live-Updates wenn Member Fortschritt macht
useEffect(() => {
  const channel = supabase
    .channel('member_activity')
    .on('postgres_changes', { ... }, handleUpdate)
    .subscribe();
}, []);
```

---

## Zusammenfassung: Zu erstellende Dateien

| Datei | Beschreibung |
|-------|--------------|
| **Types** | |
| `src/types/members.ts` | Member, Membership, Course, etc. |
| `src/types/automation.ts` | FollowupPlan, CallQueue, etc. |
| **Hooks** | |
| `src/hooks/useMember.ts` | Member-Daten fuer Kunden |
| `src/hooks/useCourses.ts` | Kurs-Daten |
| `src/hooks/useLessonProgress.ts` | Fortschritts-Tracking |
| `src/hooks/useAdminMembers.ts` | Admin Member-Verwaltung |
| `src/hooks/useCallQueue.ts` | Call Queue |
| `src/hooks/useFollowupPlans.ts` | Followup-Approvals |
| **Components** | |
| `src/components/learning/*` | 7 Komponenten |
| `src/components/members/*` | 6 Komponenten |
| `src/components/dashboard/CallQueueWidget.tsx` | |
| `src/components/dashboard/FollowupApprovalsWidget.tsx` | |
| `src/components/dashboard/CustomerAvatarWidget.tsx` | |
| **Pages** | |
| `src/pages/app/Course.tsx` | Kurs-Detail |
| `src/pages/app/Lesson.tsx` | Lektions-Ansicht |
| `src/pages/app/Members.tsx` | Admin-Uebersicht |
| `src/pages/app/MemberDetail.tsx` | Admin-Detail |
| **Edge Functions** | |
| `supabase/functions/prospecting_daily_run/index.ts` | |
| `supabase/functions/generate_followup_plan/index.ts` | |
| `supabase/functions/approve_followup_plan/index.ts` | |
| `supabase/functions/avatar_daily_recalc/index.ts` | |
| `supabase/functions/channel_event_ingest/index.ts` | |

## Zu aendernde Dateien

| Datei | Aenderungen |
|-------|-------------|
| `supabase/functions/webhook-payment/index.ts` | Member-Erstellung |
| `src/pages/app/Courses.tsx` | Vollstaendige Implementierung |
| `src/pages/app/Dashboard.tsx` | Neue Widgets |
| `src/App.tsx` | Neue Routes |
| `src/components/app/AppSidebar.tsx` | Mitglieder-Link |
| `supabase/config.toml` | Neue Edge Functions |

---

## Naechste Schritte nach Implementierung

1. **Migration ausfuehren**: Alle neuen Tabellen erstellen
2. **Test-Daten**: Demo-Kurse und Module anlegen
3. **Kunden-Flow testen**: Kurs starten, Fortschritt speichern
4. **Payment-Flow testen**: Zahlung -> Member erstellen
5. **Realtime testen**: Fortschritt in Admin-View pruefen
6. **n8n Integration**: Edge Functions mit n8n verbinden
