

## PROMPT #02 -- Ziel-Breakdown: Ampel + Soll/Ist + Heute-ToDos

### Step 01 -- Utility: `src/lib/goalBreakdown.ts`

**Objective**: Pure-Function fuer Breakdown-Berechnung (keine DB-Abhaengigkeit)

**Neue Datei**: `src/lib/goalBreakdown.ts`

```text
Export: computeGoalBreakdown(goal, progressRows, now)
```

**Logik**:
- `targetTotal` = `goal.target_value` oder `(goal.target_amount_cents ?? 0) / 100` bei EUR, Fallback `goal.target_amount`
- `actualToDate` = Summe aller `progressRows.actual_value` (wenn leer => 0)
- `elapsedDays` = max(1, Differenz start_date bis now in Tagen)
- `remainingDays` = max(1, Differenz now bis end_date in Tagen)
- `requiredPerDay` = (targetTotal - actualToDate) / remainingDays
- `requiredPerWeek` = requiredPerDay * 7
- `requiredPerMonth` = requiredPerDay * 30.4375
- `actualAvgPerDay` = actualToDate / elapsedDays
- `status` = actualAvgPerDay >= requiredPerDay * 0.98 ? 'green' : 'red'
- `todosToday` = [{ label: z.B. "Calls heute", value: ceil(requiredPerDay), unit }]

**Return-Type**:
```text
GoalBreakdown {
  goalId: string
  horizon: GoalHorizon
  unit: string | null
  targetTotal: number
  actualToDate: number
  requiredPerMonth: number
  requiredPerWeek: number
  requiredPerDay: number
  actualAvgPerDay: number
  status: 'green' | 'red'
  todosToday: { label: string; value: number; unit: string }[]
}
```

**Validation**: Reine Funktion, keine DB-Calls. Typen exportiert.

---

### Step 02 -- Hook: `src/hooks/useGoalBreakdowns.ts`

**Objective**: Laedt aktive Ziele + deren Progress, berechnet Breakdowns

**Neue Datei**: `src/hooks/useGoalBreakdowns.ts`

- Laedt `goals` mit Status `active` und `end_date >= today`
- Laedt alle `goal_progress` Eintraege fuer diese Ziele (letzte 120 Tage)
- Ruft `computeGoalBreakdown` fuer jedes Ziel auf
- Gruppiert Ergebnis nach `horizon` (YEAR, HALF_YEAR, MONTH)
- Gibt zurueck: `{ breakdowns, byHorizon, isLoading, error }`

Verwendet direkte Supabase-Queries (keine verschachtelten Hooks), um Rules-of-Hooks Probleme zu vermeiden.

---

### Step 03 -- Komponente: `src/components/goals/GoalBreakdownCard.tsx`

**Objective**: Einzelne Breakdown-Karte mit Ampel, Soll/Ist, Heute-ToDos

**Neue Datei**: `src/components/goals/GoalBreakdownCard.tsx`

**Aufbau**:
- Headline: Zielname + Horizon Badge (Jahr/6M/Monat)
- Ampel Badge: Gruen oder Rot (mit Farbe)
- Progress-Bar: actualToDate / targetTotal
- Soll-Tabelle: Monat | Woche | Tag (3 Spalten, grosse Zahlen)
- "Heute zu tun"-Liste: Items aus `todosToday`

Nutzt bestehende `Card`, `Badge`, `Progress` UI-Komponenten.

---

### Step 04 -- Goals-Seite anpassen: `src/pages/app/Goals.tsx`

**Objective**: Tabs auf Horizonte umstellen, BreakdownCards anzeigen

**Aenderungen**:
- Neuer Tab-Satz: "Jahr" | "6 Monate" | "Monat" | "Alle" (ersetzt active/completed/all)
- Pro Tab: Gefilterte BreakdownCards nach Horizont
- Bestehender "Neues Ziel" Button und CreateGoalDialog bleiben
- GoalDetailModal bleibt (Klick auf BreakdownCard oeffnet es)
- Optional: Query-Param `goalId` fuer Scroll/Focus (einfache Implementierung mit useSearchParams + scrollIntoView)

---

### Ergebnis

- Jedes aktive Ziel zeigt Soll pro Tag/Woche/Monat
- Ampel gruen/rot ist sofort sichtbar
- "Heute zu tun" ist pro Ziel konkret (z.B. "3 Calls heute")
- Tabs filtern nach Zeithorizont
- Keine DB-Migration noetig (nutzt bestehende `goals` + `goal_progress` Tabellen)

### Technische Details

- `computeGoalBreakdown` ist eine reine Funktion ohne Seiteneffekte -- testbar
- `useGoalBreakdowns` verwendet zwei flache Queries statt verschachtelter Hooks
- Bestehende GoalCard/GoalDetailModal bleiben erhalten, BreakdownCard ist eine zusaetzliche Ansicht
- Alle Berechnungen client-seitig (kein Edge Function noetig)
