

## RLS-Policy-Optimierung: Profiles-Tabelle

### Ausgangslage

Die aktuelle `profiles`-SELECT-Policy ist zu permissiv:

```sql
-- CURRENT (zu weit gefasst)
USING (
  auth.uid() = user_id 
  OR has_min_role(auth.uid(), 'mitarbeiter')
)
```

**Problem:** Jeder Mitarbeiter kann ALLE Profile sehen, inkl. sensible Daten (E-Mail, Telefon) von Kunden, die nicht mit ihm arbeiten.

### Analyse der Zugriffsanforderungen

| Rolle | Benötigter Zugriff | Begründung |
|-------|-------------------|------------|
| Kunde | Nur eigenes Profil | Selbstverwaltung |
| Mitarbeiter | Eigenes + zugewiesene Leads-Owner | Für CRM-JOINs |
| Teamleiter | + Team-Mitglieder | Team-Übersicht |
| Geschäftsführung | Alle Profile | Vollzugriff für Management |
| Admin | Alle Profile | System-Administration |

### Technische Herausforderung

Profile werden in vielen JOINs verwendet:
- `crm_leads.owner_user_id → profiles` (Lead-Owner-Anzeige)
- `members.profile_id → profiles` (Member-Management)
- `member_kpis.member.profile` (KPI-Dashboard)

**Kritisch:** Wenn wir den Zugriff zu stark einschränken, brechen diese JOINs.

### Lösungsansatz

Eine neue, granulare SELECT-Policy mit mehreren Bedingungen:

```text
┌─────────────────────────────────────────────────────────────────┐
│ Profiles SELECT-Policy (neu)                                    │
├─────────────────────────────────────────────────────────────────┤
│ 1. Eigenes Profil                                               │
│    → auth.uid() = user_id                                       │
│                                                                 │
│ 2. Zugewiesene Profile (assigned_to = mein Profil)              │
│    → assigned_to = get_user_profile_id(auth.uid())              │
│                                                                 │
│ 3. Team-Mitglieder (für Teamleiter)                             │
│    → team_id = (SELECT team_id FROM profiles                    │
│         WHERE user_id = auth.uid())                             │
│       AND has_min_role(auth.uid(), 'teamleiter')                │
│                                                                 │
│ 4. Leads-Owner (Profile die Leads besitzen, die ich sehen darf) │
│    → id IN (SELECT owner_user_id FROM crm_leads                 │
│         WHERE RLS erlaubt mir diesen Lead zu sehen)             │
│                                                                 │
│ 5. Geschäftsführung/Admin → Alle Profile                        │
│    → has_min_role(auth.uid(), 'geschaeftsfuehrung')             │
└─────────────────────────────────────────────────────────────────┘
```

### Implementierungsplan

**Step 01 — Security-Definer-Funktion erstellen**

Neue Hilfsfunktion `can_view_profile()` um Rekursion zu vermeiden:

```sql
CREATE OR REPLACE FUNCTION public.can_view_profile(_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- 1. Eigenes Profil
    EXISTS (SELECT 1 FROM profiles WHERE id = _profile_id AND user_id = auth.uid())
    OR
    -- 2. GF/Admin sieht alle
    has_min_role(auth.uid(), 'geschaeftsfuehrung')
    OR
    -- 3. Zugewiesene Profile
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = _profile_id 
      AND assigned_to = get_user_profile_id(auth.uid())
    )
    OR
    -- 4. Team-Mitglieder (für Teamleiter+)
    (
      has_min_role(auth.uid(), 'teamleiter')
      AND EXISTS (
        SELECT 1 FROM profiles p1, profiles p2
        WHERE p1.id = _profile_id
        AND p2.user_id = auth.uid()
        AND p1.team_id IS NOT NULL
        AND p1.team_id = p2.team_id
      )
    )
    OR
    -- 5. Leads-Owner (Profile von Leads die ich besitze/sehen kann)
    (
      has_min_role(auth.uid(), 'mitarbeiter')
      AND EXISTS (
        SELECT 1 FROM crm_leads l
        WHERE l.owner_user_id = _profile_id
        AND l.owner_user_id = get_user_profile_id(auth.uid())
      )
    )
$$;
```

**Step 02 — Alte Policy löschen**

```sql
DROP POLICY IF EXISTS "Staff can view profiles based on role" ON profiles;
```

**Step 03 — Neue granulare Policies erstellen**

```sql
-- Policy 1: Jeder sieht eigenes Profil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: GF/Admin sehen alle
CREATE POLICY "Management can view all profiles"
ON profiles FOR SELECT
USING (has_min_role(auth.uid(), 'geschaeftsfuehrung'));

-- Policy 3: Staff sieht zugewiesene Profile
CREATE POLICY "Staff can view assigned profiles"
ON profiles FOR SELECT
USING (
  has_min_role(auth.uid(), 'mitarbeiter')
  AND assigned_to = get_user_profile_id(auth.uid())
);

-- Policy 4: Teamleiter sieht Team-Mitglieder
CREATE POLICY "Teamleiter can view team profiles"
ON profiles FOR SELECT
USING (
  has_min_role(auth.uid(), 'teamleiter')
  AND team_id IS NOT NULL
  AND team_id = (
    SELECT p.team_id FROM profiles p WHERE p.user_id = auth.uid()
  )
);

-- Policy 5: Mitarbeiter kann Lead-Owner-Profile sehen (für JOINs)
CREATE POLICY "Staff can view lead owner profiles"
ON profiles FOR SELECT
USING (
  has_min_role(auth.uid(), 'mitarbeiter')
  AND id IN (
    SELECT DISTINCT cl.owner_user_id 
    FROM crm_leads cl
    WHERE cl.owner_user_id = get_user_profile_id(auth.uid())
  )
);
```

**Step 04 — Testing**

1. Als **Kunde** einloggen → Nur eigenes Profil sichtbar
2. Als **Mitarbeiter** einloggen → Eigenes + zugewiesene Profile
3. Als **Teamleiter** einloggen → + Team-Mitglieder
4. Als **Admin** einloggen → Alle Profile
5. CRM-Lead-Ansicht prüfen → Owner-Name wird korrekt angezeigt

**Step 05 — Validierung**

- Security-Scan durchführen
- Build-Check (0 Errors)
- UI-Flow: Leads-Tabelle, Members-Ansicht, Admin-Panel

### Risiken und Mitigation

| Risiko | Mitigation |
|--------|------------|
| JOIN-Bruch bei Leads | Policy 5 erlaubt Lead-Owner-Profile |
| Performance bei vielen Profiles | Indizes auf `team_id`, `assigned_to` |
| Rekursive RLS | Security-Definer-Funktionen |

### Alternative: Pragmatischer Ansatz

Falls die granulare Lösung zu komplex ist, kann ein **Zwischen-Kompromiss** gewählt werden:

```sql
-- Nur GF+ sieht alle, Mitarbeiter nur eigenes + zugewiesene
CREATE POLICY "Restricted profile access"
ON profiles FOR SELECT
USING (
  auth.uid() = user_id
  OR has_min_role(auth.uid(), 'geschaeftsfuehrung')
  OR (
    has_min_role(auth.uid(), 'mitarbeiter')
    AND (
      assigned_to = get_user_profile_id(auth.uid())
      OR id = get_user_profile_id(auth.uid())
    )
  )
);
```

**Nachteil:** Mitarbeiter sehen keine Lead-Owner-Namen in der UI (NULL-Anzeige).

### Empfehlung

Da `assigned_to` und `team_id` derzeit nicht aktiv genutzt werden (0 Einträge in DB), empfehle ich den **pragmatischen Ansatz** als Zwischenlösung:

1. Mitarbeiter → Nur eigenes Profil
2. Teamleiter → Team (sobald `team_id` gepflegt wird)
3. GF/Admin → Alle Profile

Die JOINs für Lead-Owner-Anzeige werden über eine separate Policy oder View gelöst.

