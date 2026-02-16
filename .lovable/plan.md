

## Zwei Features: E-Mail-Benachrichtigungen + Datei-Upload fuer Kontakt-Import

### Feature A -- Automatische E-Mails bei neuem Lead

Wie bereits geplant und genehmigt:

**Step 01 -- Edge Function `notify-new-lead`**

Neue Datei: `supabase/functions/notify-new-lead/index.ts`
- Empfaengt `{ name, email, phone, message, source }` per POST
- Validiert Input mit Zod
- Sendet zwei E-Mails via Resend API:
  - **Kundenbestaetigung** an die Lead-E-Mail: Danke-Mail mit Hinweis auf Rueckmeldung innerhalb 24h
  - **Team-Benachrichtigung** an `info@krs-signature.de`: Alle Lead-Daten auf einen Blick
- Absender: `KRS Signature System <info@krs-signature.de>`
- Rate-Limiting: DB-Check ob in letzten 60s bereits Lead mit gleicher E-Mail existiert
- `verify_jwt = false` in `supabase/config.toml`

**Step 02 -- Frontend-Aufruf in ContactModal**

Datei: `src/components/landing/ContactModal.tsx`
- Nach erfolgreichem Insert: Fire-and-forget `fetch` an `notify-new-lead`
- Keine UX-Aenderung fuer den Besucher

---

### Feature B -- Datei-Upload fuer Massen-Import von Kontakten

Im CRM-Bereich (Leads-Seite) wird eine Upload-Funktion hinzugefuegt, mit der Staff-Nutzer CSV-, Excel- oder Bilddateien hochladen koennen, um neue Leads anzulegen.

**Step 03 -- Storage Bucket anlegen**

SQL-Migration:
- Neuer Storage Bucket `lead-imports` (privat, nicht oeffentlich)
- RLS-Policies: Nur Nutzer mit Rolle `mitarbeiter` oder hoeher koennen hochladen und lesen

**Step 04 -- Edge Function `import-leads`**

Neue Datei: `supabase/functions/import-leads/index.ts`
- Empfaengt eine Datei per `multipart/form-data`
- Auth-Check: JWT + Rolle `mitarbeiter` erforderlich
- Unterstuetzte Formate:
  - **CSV**: Parst Zeilen, erwartet Spalten wie `first_name, last_name, email, phone, company, industry, location, source_type`
  - **Excel (XLSX/XLS)**: Parst erstes Sheet mit gleichen Spaltenerwartungen (via `xlsx`-Library fuer Deno)
  - **Bilder**: Werden nur im Bucket gespeichert, kein automatischer Import (Bilder enthalten keine strukturierten Kontaktdaten)
- Validiert jede Zeile (E-Mail Pflicht, Vorname Pflicht)
- Fuegt valide Zeilen als `crm_leads` ein (mit `source_type` default `inbound_organic`, `discovered_by: 'manual'`)
- Gibt Ergebnis zurueck: Anzahl erfolgreich importiert, Anzahl uebersprungen, Fehlerdetails
- `verify_jwt = true` in `supabase/config.toml`

**Step 05 -- Upload-Dialog im Frontend**

Neue Datei: `src/components/crm/ImportLeadsDialog.tsx`
- Dialog mit Drag-and-Drop-Zone und Datei-Auswahl
- Akzeptiert `.csv`, `.xlsx`, `.xls`, `.jpg`, `.png`, `.pdf`
- Zeigt Fortschritt und Ergebnis (X importiert, Y uebersprungen)
- Fehlerhafte Zeilen werden aufgelistet mit Grund
- Download-Link fuer eine CSV-Vorlage (generiert im Frontend)

**Step 06 -- Integration in Leads-Seite**

Datei: `src/pages/app/Leads.tsx`
- Neuer Button "Importieren" (Upload-Icon) neben "Neuer Lead"
- Oeffnet den ImportLeadsDialog
- Nach erfolgreichem Import wird die Lead-Liste automatisch neu geladen

### Technische Details

```text
Datei-Upload Flow:
+------------------+     +------------------+     +------------------+
| Frontend         | --> | Edge Function    | --> | Supabase DB      |
| ImportLeadsDialog|     | import-leads     |     | crm_leads        |
|                  |     |                  |     |                  |
| 1. Datei waehlen |     | 2. Parsen        |     | 4. Insert Leads  |
| 3. Upload senden |     | 3. Validieren    |     |                  |
| 5. Ergebnis      | <-- | 4. Insert        |     |                  |
+------------------+     +------------------+     +------------------+
```

### Sicherheit

- Datei-Upload nur fuer authentifizierte Nutzer mit Rolle `mitarbeiter+`
- Maximale Dateigroesse: 5 MB (im Frontend und Edge Function geprueft)
- Maximale Zeilenanzahl: 500 pro Import
- Input-Validierung jeder Zeile mit Zod
- Keine Bilder/Dateien in der Datenbank gespeichert -- nur strukturierte Daten werden extrahiert
- Storage Bucket ist privat mit RLS

### Reihenfolge

Steps 01-02 (E-Mail) und Steps 03-06 (Import) sind unabhaengig und werden sequenziell abgearbeitet. Jeder Step wird einzeln getestet (PASS/FAIL) bevor der naechste beginnt.
