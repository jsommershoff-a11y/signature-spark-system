

# Plan: Vertriebsplan-Daten in das System integrieren

## Zusammenfassung

Die kompletten Inhalte aus der Google Spreadsheet (9 Tabs) werden an den passenden Stellen im System integriert: Gesprächsleitfaden und Einwandbehandlung direkt in den SalesGuideWizard, Outreach-Vorlagen als E-Mail-Templates, und der Vertriebsplan als neues Cockpit-Widget.

## Aenderungen

### 1. SalesGuideWizard.tsx – Gesprächsleitfaden & Einwandbehandlung integrieren

Die Phasen-Definitionen (PHASES) werden mit den konkreten Skripten aus der Spreadsheet angereichert:

**Rapport-Phase**: Skript-Texte aus Triage-Call und Strategy Session als `script`-Feld pro Checklist-Item:
- "Hey [Name], lass uns keine Zeit verlieren. Wir haben 15 Minuten..."
- "Erzaehl mir kurz: Was machst du genau und wie lange schon?"

**Discovery-Phase**: Konkrete Fragen aus dem Gespraechsleitfaden:
- "Was war der Hauptgrund, warum du auf meine Nachricht reagiert hast?"
- "Wie viele Stunden pro Woche verbringst du mit Dingen, die eigentlich ein System machen sollte?"
- "Was kostet dich das im Monat?"
- Budget-Check: "Waerst du bereit dafuer zu investieren?"

**Presentation-Phase**: Pitch-Skript:
- "Wir bauen das System GEMEINSAM in dein Unternehmen. 30 Tage. Ab Tag 1 Ergebnisse."
- Case Study Referenz

**Closing-Phase – Einwandbehandlung als eigene UI-Sektion**:
Neue ausklappbare Accordion-Komponente innerhalb der Closing-Phase mit den Big 5 Einwaenden:
- "Keine Zeit" → Reframe + Done-with-you Antwort
- "Zu teuer / 10k sind eng" → ROI-Rechnung + Finanzierung
- "Muss mit Partner besprechen" → Emotionaler Hebel
- "Habe schon was Aehnliches probiert" → System vs. Tool Differenzierung
- "Muss darueber nachdenken" → Echten Einwand finden + Deadline

Plus 6 Goldene Regeln als Tipps-Box.

### 2. sales-guide-ai.ts – Keyword-Suggestions erweitern

Neue Keyword-Patterns aus der Einwandbehandlung hinzufuegen:
- `['partner', 'besprechen', 'frau', 'mann']` → "Partner-Einwand: Emotionalen Hebel nutzen (Familie/Zeit)"
- `['probiert', 'versucht', 'tool', 'software']` → "Tool-Erfahrung: System vs. Tool differenzieren"
- `['nachdenken', 'ueberlegen', 'spaeter']` → "Nachdenk-Einwand: Echten Einwand erfragen + Deadline"
- `['finanzierung', 'rate', 'raten']` → "Finanzierung erwaehnen: Signature Transformation Finanzierung"

### 3. Neue Datei: src/lib/sales-scripts.ts

Zentrales Daten-Modul mit allen Gespraechsskripten und Outreach-Vorlagen:

```text
- TRIAGE_SCRIPT: 7 Phasen mit Dauer, Text und Psychologie
- STRATEGY_SCRIPT: 9 Phasen mit Dauer, Text und Psychologie  
- COLD_CALL_SCRIPT: 4 Phasen mit Text und Psychologie
- OBJECTION_HANDLING: 5 Einwaende mit Konter und Psychologie
- GOLDEN_RULES: 6 Regeln
- OUTREACH_TEMPLATES: 5 Vorlagen (Warm DM, Lead-Magnet, Kalt-DM, Follow-up, E-Mail nach Kaltanruf)
```

### 4. CallDetailView.tsx – Gesprächstyp-Auswahl

Neuer Tab oder Dropdown im SalesGuideWizard-Bereich:
- "Triage-Call (15 Min)" → laedt Triage-Skript mit passenden Checklisten
- "Strategy Session (45-60 Min)" → laedt Strategy-Skript
- "Kaltakquise" → laedt Kaltakquise-Skript

Das aendert die Checklist-Items und Hints dynamisch basierend auf dem Gespraechstyp.

### 5. Outreach-Vorlagen als E-Mail-Templates in DB einfuegen

5 Outreach-Vorlagen als Eintraege in die `email_templates` Tabelle:
- Vorlage A: WhatsApp/LinkedIn DM (Warm)
- Vorlage B: Nach Lead-Magnet Download
- Vorlage C: Kalt-DM an Unbekannte
- Vorlage D: Follow-up nach 48h
- Vorlage E: E-Mail nach Kaltanruf

### 6. Dashboard-Widget: Vertriebsziele (StaffDashboard)

Neues Widget in `StaffDashboard.tsx` das die Cockpit-Daten anzeigt:
- Tages-Mantra: "Jeden Tag 3 Outreach. Jeden Tag 1 Call. Jeden Tag 1 Follow-up."
- KPI-Karten: Leads/Monat (Ziel: 100), Strategy Sessions (Ziel: 35), Close-Rate (40%)
- Tages-Aktivitaeten Tracker (Outreach, Kaltanrufe, Triage-Calls, Strategy Sessions, Follow-ups)

## Dateien

1. **Neu**: `src/lib/sales-scripts.ts` – Alle Skripte, Einwaende, Outreach-Vorlagen
2. **Aendern**: `src/components/offers/SalesGuideWizard.tsx` – Einwandbehandlung-Accordion, Skript-Anzeige, Gespraechstyp-Wahl
3. **Aendern**: `src/lib/sales-guide-ai.ts` – Erweiterte Keyword-Suggestions
4. **Aendern**: `src/components/dashboard/StaffDashboard.tsx` – Vertriebsziele-Widget
5. **DB-Insert**: 5 Outreach-Vorlagen in `email_templates`

