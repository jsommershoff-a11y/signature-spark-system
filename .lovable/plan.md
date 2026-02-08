
# CRM-Kern Implementierung

## Übersicht

Implementierung eines vollständigen CRM-Systems mit Lead-Management, Pipeline-Tracking und Aufgabenverwaltung. Die bestehende `leads`-Tabelle (für Kontaktformulare) wird beibehalten, aber eine neue erweiterte CRM-Leads-Struktur aufgebaut.

---

## Phase 1: Datenbank-Schema

### 1.1 Neue Enums erstellen

```sql
-- Lead-Source Typen
CREATE TYPE lead_source_type AS ENUM (
  'inbound_paid',
  'inbound_organic', 
  'referral',
  'outbound_ai',
  'outbound_manual',
  'partner'
);

-- Lead Discovery Methode
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

-- Task Typen
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
```

### 1.2 Neue Tabelle: crm_leads

```sql
CREATE TABLE crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
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
```

### 1.3 Neue Tabelle: pipeline_items

```sql
CREATE TABLE pipeline_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  stage pipeline_stage DEFAULT 'new_lead',
  stage_updated_at TIMESTAMPTZ DEFAULT now(),
  pipeline_priority_score INTEGER CHECK (pipeline_priority_score >= 0 AND pipeline_priority_score <= 100),
  
  -- Metadata for scoring
  purchase_readiness INTEGER CHECK (purchase_readiness >= 0 AND purchase_readiness <= 100),
  urgency INTEGER CHECK (urgency >= 0 AND urgency <= 100),
  
  UNIQUE(lead_id)
);
```

### 1.4 Neue Tabelle: tasks

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
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
```

### 1.5 Profiles-Tabelle erweitern (Team-Zuordnung)

```sql
ALTER TABLE profiles 
ADD COLUMN team_id UUID REFERENCES profiles(id);
```

---

## Phase 2: RLS Policies

### 2.1 crm_leads Policies

```sql
-- Admin/GF: Full Read
CREATE POLICY "Admin/GF can read all leads"
ON crm_leads FOR SELECT
USING (has_min_role(auth.uid(), 'geschaeftsfuehrung'));

-- Teamleiter: Team-Leads lesen
CREATE POLICY "Teamleiter can read team leads"
ON crm_leads FOR SELECT
USING (
  has_role(auth.uid(), 'teamleiter') AND
  owner_user_id IN (
    SELECT id FROM profiles WHERE team_id = (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  )
);

-- Mitarbeiter: Nur eigene Leads
CREATE POLICY "Mitarbeiter can read own leads"
ON crm_leads FOR SELECT
USING (
  has_min_role(auth.uid(), 'mitarbeiter') AND
  owner_user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Write Policies (ähnliche Struktur)
```

### 2.2 pipeline_items Policies

```sql
-- Folgt der Lead-Zugriffsberechtigung via JOIN
```

### 2.3 tasks Policies

```sql
-- Mitarbeiter sieht eigene Tasks
-- Teamleiter sieht Team-Tasks
-- Admin/GF sieht alle
```

---

## Phase 3: Datenbank-Funktionen

### 3.1 Pipeline Priority Score berechnen

```sql
CREATE OR REPLACE FUNCTION calculate_pipeline_priority(
  _icp_score INTEGER,
  _source_weight NUMERIC,
  _purchase_readiness INTEGER,
  _urgency INTEGER
) RETURNS INTEGER AS $$
BEGIN
  RETURN LEAST(100, GREATEST(0, 
    COALESCE(_icp_score, 0) * 0.3 +
    COALESCE(_source_weight, 1) * 10 +
    COALESCE(_purchase_readiness, 0) * 0.3 +
    COALESCE(_urgency, 0) * 0.3
  )::INTEGER);
END;
$$ LANGUAGE plpgsql;
```

### 3.2 Auto-Assign (Round-Robin)

```sql
CREATE OR REPLACE FUNCTION assign_lead_round_robin()
RETURNS TRIGGER AS $$
DECLARE
  next_user_id UUID;
BEGIN
  -- Finde nächsten Mitarbeiter mit wenigsten offenen Leads
  SELECT p.id INTO next_user_id
  FROM profiles p
  JOIN user_roles ur ON ur.user_id = p.user_id
  WHERE ur.role = 'mitarbeiter'
  ORDER BY (
    SELECT COUNT(*) FROM crm_leads 
    WHERE owner_user_id = p.id AND status = 'new'
  ) ASC
  LIMIT 1;
  
  NEW.owner_user_id := COALESCE(NEW.owner_user_id, next_user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Phase 4: UI-Komponenten

### 4.1 Datei-Struktur

```text
src/
├── components/
│   └── crm/
│       ├── LeadTable.tsx           # Lead-Liste mit Filtern
│       ├── LeadFilters.tsx         # Filter-Komponente
│       ├── LeadCard.tsx            # Einzelne Lead-Karte
│       ├── LeadDetail.tsx          # Lead-Detail Modal
│       ├── PipelineBoard.tsx       # Kanban-Board
│       ├── PipelineColumn.tsx      # Kanban-Spalte
│       ├── PipelineCard.tsx        # Kanban-Karte
│       ├── TaskList.tsx            # Aufgabenliste
│       ├── TaskCard.tsx            # Aufgaben-Karte
│       └── TaskFilters.tsx         # Task-Filter
├── hooks/
│   ├── useLeads.ts                 # Lead CRUD + Filter
│   ├── usePipeline.ts              # Pipeline-Operationen
│   └── useTasks.ts                 # Task CRUD
└── pages/app/
    ├── Leads.tsx                   # Überarbeitet: Lead-Liste
    ├── Pipeline.tsx                # Neu: Kanban-Board
    └── Tasks.tsx                   # Überarbeitet: Call-Liste
```

### 4.2 Lead-Liste (Leads.tsx)

```text
┌─────────────────────────────────────────────────────────────┐
│ Leads                                              [+ Neu]  │
├─────────────────────────────────────────────────────────────┤
│ Filter: [Stage ▼] [Owner ▼] [Source ▼] [Priority ▼] 🔍     │
├─────────────────────────────────────────────────────────────┤
│ ┌─────┬────────────┬────────────┬──────────┬────────┬─────┐ │
│ │ Pri │ Name       │ Company    │ Stage    │ Owner  │ ... │ │
│ ├─────┼────────────┼────────────┼──────────┼────────┼─────┤ │
│ │ 85  │ Max Müller │ ABC GmbH   │ Qualifi. │ Anna   │ ... │ │
│ │ 72  │ Lisa Weber │ XYZ AG     │ Neu      │ Ben    │ ... │ │
│ └─────┴────────────┴────────────┴──────────┴────────┴─────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Pipeline-Board (Pipeline.tsx)

```text
┌───────────────────────────────────────────────────────────────────────────┐
│ Pipeline                                          Sortierung: [Priority ▼]│
├───────────┬───────────┬───────────┬───────────┬───────────┬───────────────┤
│ Neu (5)   │ Call Gep. │ Call Done │ Analyse   │ Angebot   │ Gewonnen (3)  │
├───────────┼───────────┼───────────┼───────────┼───────────┼───────────────┤
│ ┌───────┐ │ ┌───────┐ │           │ ┌───────┐ │           │ ┌───────────┐ │
│ │Max M. │ │ │Lisa W.│ │           │ │Tom K. │ │           │ │ Sarah H.  │ │
│ │Pri: 85│ │ │Pri: 72│ │           │ │Pri: 90│ │           │ │ €12,000   │ │
│ └───────┘ │ └───────┘ │           │ └───────┘ │           │ └───────────┘ │
│ ┌───────┐ │           │           │           │           │               │
│ │Anna B.│ │           │           │           │           │               │
│ └───────┘ │           │           │           │           │               │
└───────────┴───────────┴───────────┴───────────┴───────────┴───────────────┘
```

### 4.4 Aufgaben-Liste "Heute" (Tasks.tsx)

```text
┌─────────────────────────────────────────────────────────────┐
│ Meine Aufgaben heute                              [+ Neu]   │
├─────────────────────────────────────────────────────────────┤
│ Filter: [Typ ▼] [Status ▼]                                  │
├─────────────────────────────────────────────────────────────┤
│ 🟢 OFFEN                                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📞 Call: Max Müller (ABC GmbH)        Fällig: 10:00    │ │
│ │    → Erstgespräch nach Webinar-Anmeldung               │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔄 Followup: Lisa Weber               Fällig: 14:00    │ │
│ │    → Angebot nachfassen                                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ✅ ERLEDIGT                                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ✓ Call: Tom Klein                     09:30            │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 5: React Hooks

### 5.1 useLeads Hook

```typescript
// Funktionen:
- fetchLeads(filters) - Leads mit Filtern laden
- createLead(data) - Neuen Lead erstellen
- updateLead(id, data) - Lead aktualisieren
- assignLead(leadId, userId) - Lead zuweisen
- Realtime-Subscription für Live-Updates
```

### 5.2 usePipeline Hook

```typescript
// Funktionen:
- fetchPipeline(filters) - Pipeline-Items laden
- moveToStage(itemId, stage) - Stage ändern
- updatePriority(itemId) - Priority neu berechnen
- Drag & Drop Support für Kanban
```

### 5.3 useTasks Hook

```typescript
// Funktionen:
- fetchTasks(filters) - Tasks laden (heute, alle, etc.)
- createTask(data) - Task erstellen
- completeTask(id) - Task abschließen
- Filterung nach Lead/Member
```

---

## Phase 6: Navigation erweitern

### AppSidebar.tsx anpassen

```typescript
// Neuer Menüpunkt hinzufügen:
{
  label: 'Pipeline',
  href: '/app/pipeline',
  icon: Kanban,
  minRole: 'mitarbeiter'
}
```

### App.tsx Route hinzufügen

```typescript
<Route path="pipeline" element={<Pipeline />} />
```

---

## Zu erstellende Dateien

### Neue Dateien:
- `src/components/crm/LeadTable.tsx`
- `src/components/crm/LeadFilters.tsx`
- `src/components/crm/LeadCard.tsx`
- `src/components/crm/LeadDetail.tsx`
- `src/components/crm/PipelineBoard.tsx`
- `src/components/crm/PipelineColumn.tsx`
- `src/components/crm/PipelineCard.tsx`
- `src/components/crm/TaskList.tsx`
- `src/components/crm/TaskCard.tsx`
- `src/hooks/useLeads.ts`
- `src/hooks/usePipeline.ts`
- `src/hooks/useTasks.ts`
- `src/pages/app/Pipeline.tsx`

### Zu ändernde Dateien:
- `src/pages/app/Leads.tsx` (komplett überarbeitet)
- `src/pages/app/Tasks.tsx` (komplett überarbeitet)
- `src/pages/app/CRM.tsx` (Dashboard mit KPIs)
- `src/components/app/AppSidebar.tsx` (Pipeline-Link)
- `src/App.tsx` (Pipeline-Route)
- `supabase/migrations/` (neue Migration)

---

## Technische Details

### TypeScript Types

```typescript
interface CrmLead {
  id: string;
  created_at: string;
  source_type: LeadSourceType;
  source_detail?: string;
  source_confidence_score?: number;
  source_priority_weight: number;
  discovered_by: LeadDiscoveredBy;
  dedupe_key?: string;
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  company?: string;
  website_url?: string;
  industry?: string;
  location?: string;
  icp_fit_score?: number;
  icp_fit_reason?: Record<string, unknown>;
  enrichment_json?: Record<string, unknown>;
  owner_user_id?: string;
  status: LeadStatus;
  notes?: string;
  // Joined data
  owner?: Profile;
  pipeline_item?: PipelineItem;
}

interface PipelineItem {
  id: string;
  lead_id: string;
  stage: PipelineStage;
  stage_updated_at: string;
  pipeline_priority_score?: number;
  purchase_readiness?: number;
  urgency?: number;
  // Joined data
  lead?: CrmLead;
}

interface Task {
  id: string;
  assigned_user_id: string;
  lead_id?: string;
  member_id?: string;
  type: TaskType;
  title: string;
  description?: string;
  due_at?: string;
  status: TaskStatus;
  meta?: Record<string, unknown>;
  // Joined data
  assigned_user?: Profile;
  lead?: CrmLead;
}
```

---

## Nächste Schritte nach Implementierung

1. **Test-Daten erstellen**: Einige Beispiel-Leads zum Testen
2. **Pipeline testen**: Drag & Drop zwischen Stages
3. **Aufgaben-Flow testen**: Task erstellen, zuweisen, abschließen
4. **RLS testen**: Mit verschiedenen Rollen einloggen
5. **Performance prüfen**: Bei vielen Leads
