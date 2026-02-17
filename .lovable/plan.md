

## Aktivitaeten-System + Channel-API-Integration

### Ueberblick

Dieses erweiterte Konzept kombiniert zwei Teile:
1. **Aktivitaeten-Tabelle + UI** (manuelles Erfassen von Anrufen, E-Mails, Meetings, Notizen, Fehlern)
2. **Channel-API-Erweiterung** (automatisches Protokollieren von E-Mail-Verkehr, Anrufen und WhatsApp-Nachrichten ueber die bestehende Edge Function `channel_event_ingest`)

Die bestehende `channel_event_ingest` Edge Function schreibt bisher nur in `crm_tasks` und `pipeline_items`. Sie wird erweitert, um jedes Event auch als Datensatz in der neuen `activities`-Tabelle zu persistieren -- so entsteht eine lueckenlose Kommunikationshistorie pro Lead/Kunde.

---

### Step 01 -- Datenbank: Enum + Tabelle `activities` + RLS

**Neue Enum**: `activity_type` mit Werten `'anruf'`, `'email'`, `'meeting'`, `'notiz'`, `'fehler'`

**Neue Tabelle**: `activities`

| Spalte | Typ | Beschreibung |
|---|---|---|
| id | uuid (PK) | Auto-generiert |
| lead_id | uuid, nullable | FK zu `crm_leads.id` ON DELETE CASCADE |
| customer_id | uuid, nullable | FK zu `profiles.id` ON DELETE SET NULL |
| user_id | uuid, NOT NULL | FK zu `auth.users.id` -- Ersteller |
| type | activity_type | Enum |
| content | text, NOT NULL | Freitext max. 5000 Zeichen |
| metadata | jsonb, nullable | Zusaetzliche Daten (z.B. Channel-Event-Payload) |
| created_at | timestamptz | Default `now()` |

**Check-Constraint**: Mindestens `lead_id` oder `customer_id` muss gesetzt sein.

**RLS-Policies**:
- Mitarbeiter: INSERT fuer eigene, SELECT fuer eigene Leads/Kunden
- Teamleiter: SELECT fuer Team-Leads
- Admin/GF: SELECT alle, DELETE
- Service-Rolle (Edge Function): INSERT via `SUPABASE_SERVICE_ROLE_KEY`

### Step 02 -- Edge Function `channel_event_ingest` erweitern

Die bestehende Funktion wird um einen INSERT in `activities` ergaenzt. Nach jedem erfolgreich verarbeiteten Event wird automatisch ein Aktivitaets-Datensatz erstellt:

- `lead_id` = gefundener Lead
- `type` = Mapping: `email` -> `'email'`, `whatsapp` -> `'notiz'`, `phone` -> `'anruf'`
- `content` = automatisch generierter Text (z.B. "E-Mail geoeffnet", "WhatsApp-Antwort erhalten", "Verpasster Anruf")
- `metadata` = sanitisierter Payload
- `user_id` = authentifizierter User oder ein System-User-Placeholder

Die bestehende Logik (Pipeline-Urgency-Updates, Task-Erstellung, Followup-Trigger) bleibt unveraendert.

### Step 03 -- Hook `useActivities`

Neue Datei: `src/hooks/useActivities.ts`
- Query mit Filter nach `lead_id` oder `customer_id`
- `createActivity`-Mutation mit Zod-Validierung (content max. 5000 Zeichen)
- Joined den Ersteller-Namen ueber `profiles`

### Step 04 -- Komponente `ActivityFeed`

Neue Datei: `src/components/activities/ActivityFeed.tsx`
- Chronologische Liste mit Icon pro Typ (Phone, Mail, Calendar, FileText, AlertTriangle)
- Automatische vs. manuelle Eintraege visuell unterschieden (Badge "API" fuer automatische)
- Formular: Typ-Select + Textarea + Absenden-Button
- Ladezustand und Leerzustand

### Step 05 -- Lead-Detail: Aktivitaeten-Tab erweitern

Datei: `src/components/crm/LeadDetailModal.tsx`
- Im bestehenden "Aktivitaeten"-Tab den `ActivityFeed` unterhalb der Tasks einfuegen
- Separator zwischen Tasks und Activity-Feed
- `lead_id` wird an den Feed uebergeben

### Step 06 -- Kunden-Seite: Klickbare Zeilen + Detail-Dialog

Datei: `src/pages/app/Customers.tsx`
- Tabellenzeilen werden klickbar
- Dialog oeffnet sich mit Tabs: "Uebersicht" (Kontaktdaten) und "Aktivitaeten"
- Aktivitaeten-Tab nutzt `ActivityFeed` mit `customer_id`

---

### API-Dokumentation (fuer externe Integrationen)

Die `channel_event_ingest` Edge Function ist die zentrale API. Externe Systeme (E-Mail-Provider, WhatsApp Business API, Telefon-Anlage) koennen Events per POST senden:

```text
POST /functions/v1/channel_event_ingest
Header: x-api-key: <CHANNEL_INGEST_API_KEY>

Body:
{
  "channel": "email" | "whatsapp" | "phone",
  "event_type": "<siehe Whitelist>",
  "lead_id": "<uuid>" oder "lead_email": "<email>",
  "payload": { ... optionale Zusatzdaten }
}
```

Erlaubte Event-Typen pro Channel:
- **email**: opened, clicked, bounced, delivered, unsubscribed
- **whatsapp**: replied, read, delivered, failed
- **phone**: missed, voicemail, answered, failed

**Wichtig**: Das Secret `CHANNEL_INGEST_API_KEY` muss in Supabase konfiguriert werden, damit externe Systeme die API nutzen koennen.

---

### Sicherheit

- `user_id` ist NOT NULL, wird ueber RLS mit `auth.uid()` geprueft
- Edge Function nutzt Service-Role-Key fuer INSERTs (umgeht RLS)
- Externe API-Zugriffe sind durch `x-api-key` oder JWT geschuetzt
- Content-Laenge auf 5000 Zeichen begrenzt
- Payload wird sanitisiert (nur strings bis 500 Zeichen, numbers, booleans)
- Kein anonymer Zugriff auf Aktivitaeten moeglich

