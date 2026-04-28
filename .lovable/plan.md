
## Ziel

Die globale Leadliste in deinem Google Sheet
`14wfNDBU85hyZjVYZBOmo7iX3-ErdVW_fqI6eF55Y3cE`
wird stündlich automatisch in `crm_leads` eingelesen. Bestehende Leads werden **nie** überschrieben. Jeder neue Lead wird klar als „Google Drive Leadliste" markiert. Der CRM-Status wird zurück ins Sheet geschrieben.

## Datenfluss

```text
Google Sheet (Drive)
       │  read  (stündlich via pg_cron)
       ▼
Edge Function: sync-drive-leads
       │  insert (nur neu, dedupe per E-Mail/Telefon)
       ▼
crm_leads  (source_type = inbound_organic, source_detail = "drive_sheet:<id>")
       │
       ▼
Edge Function schreibt CRM-Status zurück → Sheet-Spalte „CRM-Status"
```

## Komponenten

### 1. Connector
- Google Sheets Connection (`Jan's Google Sheets`) wird mit dem Projekt verlinkt, damit `GOOGLE_SHEETS_API_KEY` in der Edge Function verfügbar ist. Drive-Token funktioniert für Sheets-API nicht (bereits getestet → `connector_type_mismatch`).

### 2. DB-Migration
- Neue Tabelle `drive_sync_state`: speichert pro Sheet die letzte Sync-Zeit, Anzahl neuer Zeilen, letzten Fehler, gefundene Header.
- Neue Tabelle `drive_sync_runs`: Run-Historie (timestamp, inserted, skipped, errors[]) für Admin-Monitoring.
- RLS: nur Admin lesen.
- Erweitere `crm_leads.enrichment_json` um Felder `drive_row_index`, `drive_sheet_id` (kein Schema-Change nötig, JSONB).

### 3. Edge Function `sync-drive-leads` (POST, JWT off, geschützt via `x-cron-secret`)
- Liest Sheet-Metadaten + erste Tab → Header-Zeile (Row 1).
- Mapped Header heuristisch auf CRM-Felder (Aliasliste, case-insensitive):
  - `email|e-mail|mail` → `email`
  - `vorname|first name|firstname` → `first_name`
  - `nachname|last name|lastname|name` → `last_name`
  - `telefon|phone|handy|mobile` → `phone`
  - `firma|company|unternehmen` → `company`
  - `website|url|domain` → `website_url`
  - `branche|industry` → `industry`
  - `ort|stadt|location|city` → `location`
  - `quelle|source` → `source_detail` (zusätzlich zur fixen Kennzeichnung)
  - `notiz|notes|kommentar` → `notes`
- Validierung pro Zeile (Zod): mind. `email` ODER `phone`, gültiges Email-Format.
- Dedupe-Check: `SELECT id FROM crm_leads WHERE lower(email)=$1 OR regexp_replace(phone,'[^0-9]','','g')=$2 LIMIT 1`. Treffer → skip (insert-only Modus).
- Insert mit:
  - `source_type='inbound_organic'`
  - `source_detail='drive_sheet:<sheetId>'`
  - `discovered_by='manual'` (kein AI-Crawl)
  - `enrichment_json={ origin:'google_drive_sheet', drive_sheet_id, drive_row_index, raw_row:{…} }`
- Trigger `assign_lead_round_robin` und `create_pipeline_item_for_lead` greifen automatisch.
- Sammelt pro Run: `inserted`, `skipped_dedupe`, `skipped_invalid`, `errors`.
- Schreibt nach erfolgreicher Verarbeitung zurück in eine Spalte `CRM-Status` (wird angelegt falls fehlt) für jede Zeile: `imported` / `duplicate` / `invalid:<grund>` / `skipped`.
- Loggt Run in `drive_sync_runs`.

### 4. Cron
- `pg_cron` Eintrag stündlich (`5 * * * *`) → `net.http_post` auf die Edge Function inkl. `x-cron-secret`-Header (existierendes Secret `CRON_SECRET`).
- SQL wird über `psql`-Insert eingespielt (nicht als Migration), Pattern wie bei den anderen Cron-Jobs.

### 5. Admin-UI Erweiterung
- Neue Karte unter `/app/admin` (oder in `AdminIntegrations`): „Drive-Leadliste-Sync"
  - Status: letzter Run, Anzahl neue Leads, Fehler.
  - Buttons: „Jetzt synchronisieren" (Admin-only), „Historie anzeigen".
  - Quelle des Sheets editierbar (Sheet-ID + Tabname).

## Sicherheitspunkte
- Edge Function akzeptiert nur Calls mit gültigem `x-cron-secret` ODER eingeloggtem Admin (JWT-Check via `has_min_role(uid,'admin')` über service-role client).
- Input-Validierung via Zod auf jede Sheet-Zeile.
- E-Mail-Suffix-Match per Trigger-bekanntem Pattern (kein SQL-Injection-Vektor – wir nutzen den Supabase-Client, keine raw SQL).
- Keine Updates auf bestehende Leads → kein Datenverlustrisiko.
- Sheet-Rückschreiben nur in eine eigens angelegte Spalte „CRM-Status", andere Spalten werden nie angefasst.

## Akzeptanzkriterien
1. Stündlicher Cron läuft und legt neue Leads in `crm_leads` an, sichtbar in `/app/leads`.
2. Jeder neue Lead trägt `source_type=inbound_organic`, `source_detail` enthält `drive_sheet:<id>` und `enrichment_json.origin='google_drive_sheet'`.
3. Doppelte E-Mail/Telefonnummern werden nicht erneut eingefügt.
4. Im Sheet erscheint die neue Spalte „CRM-Status" mit Werten pro Zeile.
5. Admin sieht Run-Historie + Fehlerliste in `/app/admin`.

## Was ich nach Approval zuerst tue
1. Google Sheets Connection mit dem Projekt verlinken (Connect-Dialog).
2. Header des Sheets auslesen → Mapping bestätigen (kurze Rückfrage falls Spaltennamen unklar).
3. Migration + Edge Function + Cron + Admin-Card bauen, jeweils mit Step-PASS-Test laut Engineering-Policy.

## Optionale Verbesserungen (liefere ich direkt mit, falls du nichts anderes sagst)
- Webhook-Mode zusätzlich zum Cron, damit Zapier/Make sofort triggern kann.
- Slack/Telegram-Notification bei `inserted > 0`.
- „Trockenlauf"-Knopf im Admin (zeigt was importiert würde, ohne zu schreiben).
- Konfigurierbare Mapping-Tabelle (UI), falls sich die Sheet-Struktur ändert.
