
# Umsetzung aller Vorschlaege

## Uebersicht

Dieser Plan implementiert alle offenen Punkte:

1. **CallQueueWidget ins Dashboard integrieren** - Widget fehlt im Dashboard
2. **Cron-Job fuer taegliche Prospecting-Ausfuehrung** - Automatische Queue-Generierung
3. **Auth-Hinweis** - E-Mail-Bestaetigung in Supabase deaktivieren

---

## Phase 1: CallQueueWidget ins Dashboard einbinden

### Problem
Das `CallQueueWidget` existiert bereits (`src/components/dashboard/CallQueueWidget.tsx`), ist aber nicht im Dashboard eingebunden.

### Loesung
Dashboard.tsx anpassen - Widget fuer Staff und Admin hinzufuegen:

```typescript
// Import hinzufuegen
import { TopLeadsWidget, RecentAnalysesWidget, PipelineStatsWidget, CallQueueWidget } from '@/components/dashboard';

// In renderStaffDashboard() und renderAdminDashboard():
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  <CallQueueWidget />  // NEU - An erster Stelle
  <TopLeadsWidget ... />
  <RecentAnalysesWidget ... />
  <PipelineStatsWidget ... />
</div>
```

---

## Phase 2: Cron-Job fuer prospecting_daily_run

### Voraussetzungen
Die Supabase-Extensions `pg_cron` und `pg_net` muessen aktiviert werden.

### SQL-Migration

```sql
-- Extensions aktivieren
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Berechtigung fuer cron auf public Schema
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Cron-Job erstellen: Taeglich um 06:00 UTC (07:00 CET)
SELECT cron.schedule(
  'prospecting-daily-run',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://onbxoflsgrwdszjltnge.supabase.co/functions/v1/prospecting_daily_run',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYnhvZmxzZ3J3ZHN6amx0bmdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzOTc4NDIsImV4cCI6MjA4NTk3Mzg0Mn0.5ZsfdmpwROPn_DRYKAR0PseLdfH_Ur9Zho4lmeXmDfU"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

### Zeitplan
- **06:00 UTC** = 07:00 CET (Winterzeit) / 08:00 CEST (Sommerzeit)
- Laeuft jeden Tag automatisch
- Generiert Call Queues und Follow-up Tasks fuer alle Staff-Mitglieder

---

## Phase 3: Auth-Konfiguration

### Manuelle Schritte in Supabase Dashboard
1. Gehe zu **Authentication > Providers > Email**
2. Deaktiviere **"Confirm email"**
3. Speichere die Einstellungen

Link: https://supabase.com/dashboard/project/onbxoflsgrwdszjltnge/auth/providers

---

## Aenderungen im Code

### Datei 1: src/pages/app/Dashboard.tsx

| Zeile | Aenderung |
|-------|-----------|
| 12 | CallQueueWidget zum Import hinzufuegen |
| 128-132 | CallQueueWidget in Staff-Dashboard einfuegen |
| 195-199 | CallQueueWidget in Admin-Dashboard einfuegen |

---

## Erwartetes Ergebnis

| Feature | Status |
|---------|--------|
| CallQueueWidget im Dashboard | Sichtbar fuer Staff/Admin |
| Cron-Job | Laeuft taeglich um 07:00 CET |
| Auth | Login ohne E-Mail-Bestaetigung |

---

## Zusammenfassung

Nach der Umsetzung:
- Staff und Admins sehen ihre **täglichen Calls** direkt im Dashboard
- Die **Call Queue wird automatisch** jeden Morgen generiert
- **Login funktioniert** ohne E-Mail-Bestätigung
