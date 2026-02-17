

## Edge Function: `log-email` -- E-Mail-Dokumentations-API fuer Manus.ai

### Zweck

Eine neue Edge Function, die Manus.ai (oder jedes andere externe Tool) per REST-API aufrufen kann, um gesendete/empfangene E-Mails als Aktivitaeten in der CRM-Datenbank zu protokollieren. Die E-Mails werden als `activity`-Eintraege (Typ `email`) gespeichert und sind sofort im Activity-Feed des jeweiligen Leads sichtbar.

### Authentifizierung

Verwendet den bereits vorhandenen Secret **`CHANNEL_INGEST_API_KEY`** als API-Key im Header `x-api-key`. Kein neuer Secret noetig.

### API-Spezifikation

**Endpoint:** `POST /functions/v1/log-email`

**Header:**
- `x-api-key: <CHANNEL_INGEST_API_KEY>`
- `Content-Type: application/json`

**Request Body:**

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| `lead_email` | string (E-Mail) | Ja* | E-Mail-Adresse des Leads |
| `lead_id` | string (UUID) | Ja* | Alternativ: Lead-ID direkt |
| `subject` | string (max 500) | Ja | Betreff der E-Mail |
| `body` | string (max 5000) | Nein | E-Mail-Inhalt (Zusammenfassung) |
| `direction` | `"inbound"` oder `"outbound"` | Ja | Richtung der E-Mail |
| `sent_at` | string (ISO 8601) | Nein | Zeitpunkt (Default: jetzt) |

*Mindestens eines von `lead_email` oder `lead_id` muss angegeben werden.

**Erfolgs-Antwort (200):**
```text
{
  "success": true,
  "activity_id": "uuid",
  "lead_id": "uuid"
}
```

**Fehler-Antworten:** 401 (kein/falscher API-Key), 400 (Validierungsfehler), 404 (Lead nicht gefunden)

### Beispiel-Aufruf fuer Manus.ai

```text
POST https://onbxoflsgrwdszjltnge.supabase.co/functions/v1/log-email
Headers:
  x-api-key: <dein_api_key>
  Content-Type: application/json

Body:
{
  "lead_email": "kunde@example.com",
  "subject": "Angebot fuer Beratung",
  "body": "Sehr geehrter Herr Mueller, anbei unser Angebot...",
  "direction": "outbound"
}
```

### Technische Details

**Neue Datei:** `supabase/functions/log-email/index.ts`

- Nutzt Zod fuer Input-Validierung (gleiches Muster wie `channel_event_ingest`)
- Authentifizierung via `x-api-key` Header gegen `CHANNEL_INGEST_API_KEY`
- Lead-Lookup per `lead_id` oder `lead_email` aus `crm_leads`
- Schreibt in `activities`-Tabelle mit `type: 'email'` und `user_id` des Lead-Owners
- Speichert Subject, Body, Direction und Zeitstempel in `metadata`
- Content-Feld zeigt menschenlesbare Zusammenfassung: z.B. "Ausgehende E-Mail: Angebot fuer Beratung"
- CORS-Headers fuer Kompatibilitaet

**Config-Eintrag (`supabase/config.toml`):**
```text
[functions.log-email]
verify_jwt = false
```

### Keine Datenbank-Aenderungen

Die E-Mails werden in der bestehenden `activities`-Tabelle als Typ `email` gespeichert. Keine Migration noetig.

