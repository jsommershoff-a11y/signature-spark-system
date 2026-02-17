

## Reports-Dashboard: Vollstaendiges Reporting mit Diagrammen und Export

### Uebersicht

Die Platzhalter-Seite `/app/reports` wird durch ein vollstaendiges Reporting-Dashboard mit vier Berichts-Sektionen ersetzt. Alle Daten kommen aus bestehenden Supabase-Tabellen -- keine DB-Aenderungen noetig.

### Architektur

**Neuer Hook:** `src/hooks/useReportsData.ts`
- Vier React-Query-Abfragen fuer die Berichtsdaten:
  1. **Umsatz/Pipeline**: `orders` (paid, amount_cents nach Monat) + `pipeline_items` (Stage-Verteilung)
  2. **Team-Performance**: `profiles` (Mitarbeiter) JOIN `crm_leads` (Anzahl), `calls` (Anzahl), `orders` (Umsatz) -- aggregiert pro Mitarbeiter
  3. **Lead-Konvertierung**: `pipeline_items` gruppiert nach Stage, berechnet als Trichter (new_lead -> won)
  4. **Kundenaktivitaet**: `activities` gruppiert nach Typ und Woche/Monat

**Export-Utility:** `src/lib/report-export.ts`
- `exportToCSV(data, filename)`: Konvertiert Array-Daten in CSV und loest Download aus
- `exportToPDF(elementId, filename)`: Nutzt `window.print()` mit CSS `@media print` fuer PDF-Export (keine zusaetzliche Bibliothek noetig)

### Neue Dateien

1. **`src/hooks/useReportsData.ts`** -- Daten-Hook mit 4 Queries
2. **`src/lib/report-export.ts`** -- CSV-/PDF-Export-Hilfsfunktionen
3. **`src/components/reports/RevenueChart.tsx`** -- Balkendiagramm (Recharts BarChart) fuer monatlichen Umsatz + Pipeline-Verteilung als Tortendiagramm
4. **`src/components/reports/TeamPerformanceTable.tsx`** -- Tabelle mit Spalten: Mitarbeiter, Leads, Calls, Abschluesse, Umsatz
5. **`src/components/reports/ConversionFunnel.tsx`** -- Trichter-Visualisierung der Pipeline-Stages (Recharts BarChart horizontal oder gestapelte Balken)
6. **`src/components/reports/ActivityChart.tsx`** -- Linien-/Flaechendiagramm der Aktivitaeten nach Typ ueber Zeit

### Bestehende Dateien (Aenderungen)

1. **`src/pages/app/Reports.tsx`** -- Kompletter Umbau: Tabs fuer die 4 Berichtskategorien, jede mit Export-Buttons (CSV/PDF)

### UI-Aufbau der Reports-Seite

```text
+--------------------------------------------------+
| Reports                                          |
| Analysen und Berichte         [Zeitraum-Filter]  |
+--------------------------------------------------+
| [Umsatz] [Team] [Konvertierung] [Aktivitaet]    |
+--------------------------------------------------+
|                                                  |
|  +-- Card: Umsatz-Entwicklung ----------------+ |
|  | [CSV] [PDF]                     BarChart    | |
|  +--------------------------------------------+ |
|                                                  |
|  +-- Card: Pipeline-Verteilung ---------------+ |
|  | [CSV] [PDF]                     PieChart    | |
|  +--------------------------------------------+ |
+--------------------------------------------------+
```

### Technische Details

**Recharts-Komponenten** (bereits installiert):
- `BarChart` + `Bar` fuer Umsatz und Trichter
- `PieChart` + `Pie` fuer Pipeline-Verteilung
- `LineChart` + `Line` fuer Aktivitaetsverlauf
- `ChartContainer` aus `src/components/ui/chart.tsx` fuer konsistentes Styling

**CSV-Export:**
```text
function exportToCSV(rows: Record<string, unknown>[], filename: string) {
  // Header aus Object.keys, Werte als Zeilen
  // Blob mit text/csv, automatischer Download
}
```

**PDF-Export:**
```text
function exportToPDF(title: string) {
  // window.print() mit @media print CSS
  // Blendet Sidebar/Header aus, zeigt nur Report-Inhalt
}
```

**Datenabfragen (useReportsData.ts):**

- Umsatz: `orders` WHERE status='paid', GROUP BY Monat (client-side Aggregation)
- Team-KPIs: `profiles` mit Rolle 'mitarbeiter', gezaehlt ueber `crm_leads.owner_user_id`, `calls.conducted_by`, `orders` via Lead-Zuordnung
- Konvertierung: `pipeline_items` alle Stages zaehlen, als Trichter sortiert
- Aktivitaet: `activities` GROUP BY type + Woche (client-side)

**Zeitraum-Filter:**
- Select-Dropdown: Letzte 7 Tage, 30 Tage, 90 Tage, 12 Monate
- Wird an alle Queries als Parameter weitergegeben

### Keine Datenbank-Aenderungen

Alle benoetigten Daten existieren bereits in den Tabellen `orders`, `pipeline_items`, `crm_leads`, `calls`, `activities` und `profiles`. Die RLS-Policies stellen sicher, dass nur berechtigte Nutzer (Geschaeftsfuehrung/Admin) vollstaendige Reports sehen.

