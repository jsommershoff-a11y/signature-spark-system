

## Neue "Ziele"-Seite mit Fortschrittsbalken und Teil-Zielen

### Uebersicht

Es wird eine neue Seite `/app/goals` erstellt, auf der Teamleiter und hoehere Rollen Ziele fuer Mitarbeiter und Teams erstellen, verfolgen und in Teil-Ziele herunterbrechen koennen. Dazu werden zwei neue Datenbanktabellen, ein Hook, mehrere UI-Komponenten und eine neue Route angelegt.

### Datenbank-Design

Da keine eigenstaendige `teams`-Tabelle existiert (Teams werden ueber `profiles.team_id` als Verweis auf den Teamleiter abgebildet), wird `team_id` als Verweis auf ein Teamleiter-Profil gestaltet.

**Tabelle `goals`:**

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | uuid (PK) | Primaerschluessel |
| user_id | uuid (FK profiles.id) | Zugewiesener Mitarbeiter (nullable) |
| team_id | uuid (FK profiles.id) | Team (Teamleiter-Profil, nullable) |
| title | text | Ziel-Titel |
| description | text | Optionale Beschreibung |
| target_amount | integer | Zielwert |
| current_amount | integer | Aktueller Fortschritt |
| start_date | date | Startdatum |
| end_date | date | Enddatum |
| status | text | 'active', 'completed', 'cancelled' |
| created_by | uuid (FK profiles.id) | Ersteller |
| created_at | timestamptz | Erstellungszeitpunkt |
| updated_at | timestamptz | Letzte Aenderung |

**Tabelle `goal_milestones` (Teil-Ziele / To-Do-Liste):**

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | uuid (PK) | Primaerschluessel |
| goal_id | uuid (FK goals.id) | Eltern-Ziel |
| title | text | Titel des Teil-Ziels |
| is_completed | boolean | Erledigt-Status |
| sort_order | integer | Reihenfolge |
| completed_at | timestamptz | Abschlusszeitpunkt |
| created_at | timestamptz | Erstellungszeitpunkt |

**RLS-Policies:**
- Teamleiter+ koennen Ziele erstellen, lesen und aktualisieren
- Mitarbeiter sehen nur ihre eigenen zugewiesenen Ziele
- Kunden haben keinen Zugriff
- Admin kann alles loeschen

### Neue Dateien

1. **`src/pages/app/Goals.tsx`** - Hauptseite mit Tabs (Aktiv / Abgeschlossen), Fortschrittsbalken-Karten, Erstellen-Button
2. **`src/hooks/useGoals.ts`** - Supabase-Hook fuer CRUD auf `goals` und `goal_milestones`
3. **`src/components/goals/GoalCard.tsx`** - Karte mit Progress-Balken, Prozentanzeige, Zeitraum, zugewiesener Person
4. **`src/components/goals/CreateGoalDialog.tsx`** - Formular: Titel, Beschreibung, Zielwert, Zeitraum, Zuweisung (Mitarbeiter oder Team)
5. **`src/components/goals/GoalDetailModal.tsx`** - Detail-Ansicht mit Teil-Ziele-Liste (hinzufuegen, abhaken, loeschen)
6. **`src/components/goals/MilestoneList.tsx`** - Checkliste der Teil-Ziele mit Fortschrittsindikator

### Bestehende Dateien (Aenderungen)

1. **`src/App.tsx`** - Neue Route `/app/goals` mit `requireMinRole="mitarbeiter"`
2. **`src/components/app/AppSidebar.tsx`** - Neuer Nav-Eintrag "Ziele" mit Target-Icon, `minRole: 'mitarbeiter'`

### UI-Design

Jede Ziel-Karte zeigt:
- Titel und optionale Beschreibung
- Fortschrittsbalken (current_amount / target_amount als Prozent)
- Zeitraum (Start- bis Enddatum)
- Zugewiesene Person oder Team
- Anzahl erledigter Teil-Ziele / Gesamt

Die Detail-Ansicht enthaelt:
- Editierbare Felder fuer current_amount
- Checkliste der Teil-Ziele mit Inline-Hinzufuegen
- Status-Aenderung (aktiv / abgeschlossen / abgebrochen)

### Technische Details

**SQL-Migration:**

```text
-- goals table
CREATE TABLE goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  team_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  target_amount integer NOT NULL DEFAULT 100,
  current_amount integer NOT NULL DEFAULT 0,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- goal_milestones table
CREATE TABLE goal_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title text NOT NULL,
  is_completed boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;

-- RLS for goals
CREATE POLICY "Staff can read own goals" ON goals
  FOR SELECT USING (
    has_min_role(auth.uid(), 'mitarbeiter') AND
    (user_id = get_user_profile_id(auth.uid()) OR
     created_by = get_user_profile_id(auth.uid()))
  );

CREATE POLICY "Teamleiter can read team goals" ON goals
  FOR SELECT USING (
    has_min_role(auth.uid(), 'teamleiter')
  );

CREATE POLICY "Teamleiter can insert goals" ON goals
  FOR INSERT WITH CHECK (
    has_min_role(auth.uid(), 'teamleiter')
  );

CREATE POLICY "Teamleiter can update goals" ON goals
  FOR UPDATE USING (
    has_min_role(auth.uid(), 'teamleiter')
  );

CREATE POLICY "Admin can delete goals" ON goals
  FOR DELETE USING (
    has_role(auth.uid(), 'admin')
  );

-- RLS for milestones (inherits from goal access)
CREATE POLICY "Staff can read milestones" ON goal_milestones
  FOR SELECT USING (
    goal_id IN (SELECT id FROM goals)
  );

CREATE POLICY "Staff can manage milestones" ON goal_milestones
  FOR ALL USING (
    has_min_role(auth.uid(), 'mitarbeiter') AND
    goal_id IN (SELECT id FROM goals)
  );

-- updated_at trigger
CREATE TRIGGER goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Routing (App.tsx):**
- Neue Route: `<Route path="goals" element={<ProtectedRoute requireMinRole="mitarbeiter"><Goals /></ProtectedRoute>} />`

**Sidebar (AppSidebar.tsx):**
- Neuer Eintrag: `{ label: 'Ziele', href: '/app/goals', icon: Target, minRole: 'mitarbeiter' }` nach "Aufgaben"

