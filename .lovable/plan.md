

# Fix: Call Queue mit Items neu generieren

## Problem

Die Call Queue für heute (2026-02-08) wurde um 19:36 erstellt - **bevor** die Lead-Owner zugewiesen wurden. Dadurch enthält sie 0 Items. Bei der erneuten Ausführung um 19:52 wurde sie übersprungen.

## Lösung

1. Bestehende leere Call Queue löschen
2. Edge Function erneut ausführen
3. Call Queue Widget prüfen

---

## SQL zum Ausführen

```sql
-- Leere Call Queue für heute löschen
DELETE FROM call_queues WHERE date = '2026-02-08';
```

---

## Nach dem SQL: Edge Function erneut testen

Die Edge Function `prospecting_daily_run` wird dann:
1. Neue Queue für Jan Sommershoff erstellen
2. 7 Pipeline-Items als Call Queue Items hinzufügen
3. Items priorisiert nach Pipeline Priority Score

---

## Erwartetes Ergebnis

| Metrik | Vorher | Nachher |
|--------|--------|---------|
| Call Queues | 1 (leer) | 1 (mit 7 Items) |
| Queue Items | 0 | 7 |

---

## UI-Verification

Nach erfolgreicher Generierung wird das **CallQueueWidget** im Dashboard die 7 Leads anzeigen:
- Max Mustermann (new_lead → Erstgespräch)
- Anna Schmidt (new_lead → Erstgespräch)
- Thomas Weber (setter_call_scheduled → Geplanter Call)
- Lisa Müller (setter_call_scheduled → Geplanter Call)
- Sarah Hoffmann (analysis_ready → Analyse besprechen)
- Markus Fischer (offer_draft → Angebot finalisieren)
- Julia Wagner (offer_sent → Angebot nachfassen)

