

## Step 07 -- Admin-Dashboard: Leads-Ubersicht mit Qualification-Score

### Ziel

Das Admin-Dashboard (`/app/admin`) um einen neuen Tab "Leads-Ubersicht" erweitern, der alle Inbound-Leads aus der `leads`-Tabelle anzeigt -- inkl. Qualification-Score, Qualified/Disqualified-Filter und Sortierung.

### Datenquelle

Die Tabelle `leads` (nicht `crm_leads`) enthalt die Inbound-Formulardaten mit:
- `name`, `email`, `phone`, `source`, `branche`
- `qualification_score`, `is_qualified`
- `jahresumsatz`, `entscheider_status`, `motivation`, `entscheidungsstil`
- `created_at`

RLS: Admins haben bereits SELECT-Zugriff (`Admins can view all leads`). Keine DB-Anderungen notig.

### UI-Anderungen

**1. Admin-Seite auf Tabs umstellen**

Die bestehende Admin-Seite bekommt zwei Tabs:
- **Benutzer** (bestehende Benutzerverwaltung)
- **Leads** (neue Leads-Ubersicht)

**2. Neue Komponente: `AdminLeadsTable`**

```text
src/components/admin/AdminLeadsTable.tsx
```

Funktionen:
- Tabelle mit Spalten: Score, Qualifiziert, Name, E-Mail, Branche, Umsatz, Quelle, Datum
- Score-Anzeige mit Farbcodierung (0 = rot, 50+ = gelb, 80+ = grun)
- Qualified/Disqualified Badge
- Filter: qualified / disqualified / alle
- Sortierung: nach Score (absteigend, Standard), Datum, Name
- Suchfeld fur Name/E-Mail

**3. Neuer Hook: `useAdminLeads`**

```text
src/hooks/useAdminLeads.ts
```

- Ladt alle Leads aus der `leads`-Tabelle
- Unterstutzt Sortierung und Filterung client-seitig (Datenmenge uberschaubar)
- React Query mit Key `['admin', 'leads']`

### Technische Details

**AdminLeadsTable Spalten:**

| Spalte | Feld | Darstellung |
|--------|------|-------------|
| Score | `qualification_score` | Zahl mit Farbcodierung |
| Status | `is_qualified` | Badge grun/rot |
| Name | `name` | Text |
| E-Mail | `email` | Text |
| Branche | `branche` | Text oder "-" |
| Umsatz | `jahresumsatz` | Text |
| Quelle | `source` | Badge |
| Datum | `created_at` | dd.MM.yy Format |

**Filter-Leiste:**
- Select: "Alle" / "Qualifiziert" / "Disqualifiziert"
- Select: Sortierung (Score absteigend, Score aufsteigend, Neueste zuerst, Alteste zuerst)
- Suchfeld: Freitextsuche uber Name und E-Mail

**Admin.tsx Anderungen:**
- Import von `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- Bestehende Benutzerverwaltung in Tab "Benutzer" verschieben
- Neuer Tab "Leads" mit `AdminLeadsTable`

### Dateien

| Datei | Aktion |
|-------|--------|
| `src/hooks/useAdminLeads.ts` | Neu erstellen |
| `src/components/admin/AdminLeadsTable.tsx` | Neu erstellen |
| `src/pages/app/Admin.tsx` | Tabs hinzufugen, LeadsTable integrieren |

### Keine DB-Migration erforderlich

Die `leads`-Tabelle und ihre RLS-Policies existieren bereits. Admins haben SELECT-Zugriff.

