

## PROMPT #01 -- Ziele erweitern: Horizonte, Motivation, Tracking, RLS

### Step 01 -- Supabase Migration

**Objective**: `goals`-Tabelle erweitern + neue `goal_progress`-Tabelle anlegen + RLS + Trigger

**SQL Migration** (ein Block):

```text
-- 1. goals erweitern (nur neue Spalten)
ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS horizon text NOT NULL DEFAULT 'YEAR',
  ADD COLUMN IF NOT EXISTS target_amount_cents integer,
  ADD COLUMN IF NOT EXISTS target_value numeric,
  ADD COLUMN IF NOT EXISTS unit text,
  ADD COLUMN IF NOT EXISTS reward_title text,
  ADD COLUMN IF NOT EXISTS reward_image_url text,
  ADD COLUMN IF NOT EXISTS reward_amount_cents integer;

-- horizon CHECK constraint
ALTER TABLE goals
  ADD CONSTRAINT goals_horizon_check
  CHECK (horizon IN ('YEAR', 'HALF_YEAR', 'MONTH'));

-- 2. goal_progress Tabelle
CREATE TABLE goal_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  period_type text NOT NULL CHECK (period_type IN ('DAY','WEEK','MONTH')),
  actual_value numeric NOT NULL DEFAULT 0,
  actual_amount_cents integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX goal_progress_unique
  ON goal_progress (goal_id, period_start, period_type);

-- 3. updated_at Trigger fuer goal_progress
-- (goals hat bereits einen updated_at Trigger)
CREATE TRIGGER goal_progress_updated_at
  BEFORE UPDATE ON goal_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. RLS fuer goal_progress
ALTER TABLE goal_progress ENABLE ROW LEVEL SECURITY;

-- Owner + Ersteller koennen eigene Progress-Eintraege lesen
CREATE POLICY "Staff can read own goal progress" ON goal_progress
  FOR SELECT USING (
    has_min_role(auth.uid(), 'mitarbeiter') AND
    goal_id IN (
      SELECT id FROM goals
      WHERE user_id = get_user_profile_id(auth.uid())
        OR created_by = get_user_profile_id(auth.uid())
    )
  );

-- Teamleiter+ koennen alle lesen
CREATE POLICY "Teamleiter can read all goal progress" ON goal_progress
  FOR SELECT USING (has_min_role(auth.uid(), 'teamleiter'));

-- Teamleiter+ koennen einfuegen
CREATE POLICY "Teamleiter can insert goal progress" ON goal_progress
  FOR INSERT WITH CHECK (has_min_role(auth.uid(), 'teamleiter'));

-- Teamleiter+ koennen aktualisieren
CREATE POLICY "Teamleiter can update goal progress" ON goal_progress
  FOR UPDATE USING (has_min_role(auth.uid(), 'teamleiter'));

-- Admin kann loeschen
CREATE POLICY "Admin can delete goal progress" ON goal_progress
  FOR DELETE USING (has_role(auth.uid(), 'admin'));
```

**Validation**: Migration laeuft ohne Fehler, neue Spalten/Tabelle sichtbar.

---

### Step 02 -- TypeScript Interfaces + Hook erweitern

**Objective**: `useGoals.ts` um neue Felder und `goal_progress` CRUD erweitern

**Aenderungen in `src/hooks/useGoals.ts`**:

- `Goal` Interface erweitern um: `horizon`, `target_amount_cents`, `target_value`, `unit`, `reward_title`, `reward_image_url`, `reward_amount_cents`
- Neues Interface `GoalProgress` mit allen Spalten
- Neuer Query `useGoalProgress(goalId)` -- laedt Progress-Eintraege fuer ein Ziel
- Neue Mutation `upsertGoalProgress` -- INSERT ON CONFLICT UPDATE fuer Progress
- `createGoal` Mutation erweitern um optionale neue Felder (`horizon`, `unit`, `target_value`, etc.)

---

### Step 03 -- CreateGoalDialog erweitern

**Objective**: Dialog um Horizont, Einheit, Motivation (Reward) Felder ergaenzen

**Aenderungen in `src/components/goals/CreateGoalDialog.tsx`**:

- Neues Select-Feld: Horizont (Jahr / 6 Monate / Monat)
- Neues Input: Einheit (z.B. EUR, Calls, Termine)
- Neues Input: Zielwert (numeric, ersetzt/ergaenzt target_amount)
- Optionale Felder: Belohnungstitel, Belohnungsbetrag
- Start/End-Datum wird automatisch je nach Horizont vorgeschlagen

---

### Step 04 -- GoalCard + GoalDetailModal erweitern

**Objective**: Neue Felder in der UI anzeigen

**GoalCard** (`src/components/goals/GoalCard.tsx`):
- Horizont als Badge anzeigen (Jahr/6M/Monat)
- Einheit neben dem Fortschrittsbalken anzeigen
- Reward-Icon wenn Belohnung hinterlegt

**GoalDetailModal** (`src/components/goals/GoalDetailModal.tsx`):
- Motivation/Belohnung anzeigen (Bild + Betrag)
- Progress-Eintraege als Tabelle oder Liste
- Neuer Button: "Fortschritt erfassen" (oeffnet kleines Formular zum Upsert von goal_progress)

---

### Ergebnis

- `goals` hat `horizon`, `unit`, `target_value`, `reward_*` Spalten
- `goal_progress` speichert Ist-Werte pro Periode (Tag/Woche/Monat) -- Basis fuer Ampel-Logik
- RLS: Mitarbeiter sehen nur eigene, Teamleiter+ sehen alles
- `updated_at` Trigger auf `goal_progress`
- UI zeigt Horizont, Einheit und Motivation an

