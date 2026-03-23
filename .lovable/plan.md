

# Plan: COO Cockpit als eigene Seite + Admin-Integration

## Zusammenfassung

Das COO Cockpit wird als eigenständige Seite unter `/app/coo-cockpit` erstellt (nur Admin-Zugriff) mit einem Verweis-Tab im bestehenden Admin-Bereich. Die bestehenden System-Logs werden um Sync-Monitoring erweitert.

## Voraussetzung

Die Tabellen (`invoices`, `contacts`, `open_items`, `revenue_summary`, `sync_logs`, `sync_errors`) werden **nicht** angelegt. Die UI wird gegen diese Tabellennamen gebaut. Solange die Tabellen nicht existieren, werden leere/Error States angezeigt. Die Supabase-Queries nutzen `.from('invoices')` etc. direkt, da die Tabellen noch nicht im generierten Types-File sind, wird mit generischen Typen gearbeitet.

## Dateien und Struktur

### Neue Dateien

1. **`src/pages/app/CooCockpit.tsx`** -- Hauptseite mit Tabs-Layout:
   - KPI-Header mit 10 KPI-Karten (Rechnungen, Umsatz, offene Posten, Angebote, Kontakte, Sync-Status)
   - Tabs: Rechnungen, Kontakte, Angebote, Offene Posten, Umsatz, Sync-Monitoring
   - Header-Bereich mit Titel + "Sync pruefen" / "Logs aktualisieren" Buttons

2. **`src/hooks/useCooCockpit.ts`** -- Daten-Hook mit React Query fuer alle 6 Tabellen, KPI-Berechnung

3. **`src/components/coo/InvoicesTab.tsx`** -- Rechnungstabelle mit Suche, Filter (Status/Bereich/Kostenstelle/Datum), Sortierung, Summenzeile, CSV-Export

4. **`src/components/coo/ContactsTab.tsx`** -- Kontakte-Tabelle mit Suche, Typ-Filter, Detail-Drawer

5. **`src/components/coo/OffersTab.tsx`** -- Angebote-Tabelle mit Stage/Status-Filter, Summenfeld

6. **`src/components/coo/OpenItemsTab.tsx`** -- Offene Posten mit Farb-Highlighting (ueberfaellig=rot), Risiko/Status-Filter, Sortierung nach tage_ueberfaellig desc

7. **`src/components/coo/RevenueTab.tsx`** -- KPI-Karten + Tabelle + Recharts-Diagramme (Monatsumsatz, Delta, nach Bereich/Objekt)

8. **`src/components/coo/SyncMonitoringTab.tsx`** -- Zwei Bloecke: Erfolgreiche Syncs + Fehlerprotokoll mit raw_payload-Modal

9. **`src/components/coo/CooKpiCards.tsx`** -- 10 KPI-Karten Komponente

### Angepasste Dateien

10. **`src/App.tsx`** -- Neue Route `/app/coo-cockpit` mit `requiredRole="admin"`

11. **`src/components/app/AppSidebar.tsx`** -- Neuer Menuepunkt "COO Cockpit" mit `exactRole: 'admin'`, vor dem Admin-Link

12. **`src/pages/app/Admin.tsx`** -- Neuer Tab "COO Cockpit" mit Link-Card die auf `/app/coo-cockpit` verweist

13. **`src/components/admin/AdminSystemLogs.tsx`** -- Erweitern um Sync-Logs/Errors Bereich (zusammengefuehrt)

## Technische Details

- **Tabellen-Zugriff**: `supabase.from('invoices').select('*')` etc. mit manuellen TypeScript-Interfaces (da Tabellen nicht im generierten Types-File)
- **Pagination**: Client-seitig mit State (page, pageSize) und `.range()` Queries
- **Filter**: Lokaler State pro Tab, Supabase `.eq()` / `.gte()` / `.ilike()` Filter
- **Waehrungsformatierung**: `new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })`
- **Datumsformatierung**: `new Intl.DateTimeFormat('de-DE')` oder date-fns
- **Charts**: Recharts (bereits im Projekt fuer Reports genutzt)
- **Status-Badges**: Wiederverwendung des bestehenden Badge-Components mit Farbvarianten
- **Admin Actions**: Buttons die Edge Functions aufrufen koennten (zunächst als Platzhalter mit Toast-Feedback)
- **Loading/Error/Empty States**: Skeleton-Loader, Alert-Komponenten, leere Tabellen-Hinweise

## UX-Pattern

```text
┌──────────────────────────────────────────────┐
│ COO Cockpit          [Sync prüfen] [Refresh] │
│ Finanz-, Sync- und Performance-Übersicht     │
├──────────────────────────────────────────────┤
│ [KPI] [KPI] [KPI] [KPI] [KPI]               │
│ [KPI] [KPI] [KPI] [KPI] [KPI]               │
├──────────────────────────────────────────────┤
│ Rechnungen│Kontakte│Angebote│Offene│Umsatz│Sync│
│ ┌─Filter──────────────────────────────────┐  │
│ │ Status ▾  Bereich ▾  Suche...  Export ↓ │  │
│ ├─────────────────────────────────────────┤  │
│ │ Tabelle mit Pagination                  │  │
│ └─────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

