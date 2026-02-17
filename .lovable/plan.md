

## Demo-Daten loeschen (Benutzer und Kurse bleiben erhalten)

### Was wird geloescht

Alle Geschaeftsdaten werden aus folgenden Tabellen entfernt:

| Tabelle | Anzahl Datensaetze | Aktion |
|---|---|---|
| call_queue_items | 7 | DELETE |
| call_queues | 1 | DELETE |
| transcripts | 2 | DELETE |
| ai_analyses | 1 | DELETE |
| offers | 1 | DELETE |
| crm_tasks | 7 | DELETE |
| pipeline_items | 10 | DELETE |
| calls | 3 | DELETE |
| crm_leads | 10 | DELETE |
| leads | 10 | DELETE |

### Was bleibt erhalten

- **Benutzerkonten**: Profile (Jan Sommershoff, Test Mitarbeiter) und alle Rollen
- **LMS-Kursinhalte**: 2 Kurse, 5 Module, 19 Lektionen
- **Leere Tabellen**: orders, members, memberships, lesson_progress, member_kpis, followup_plans/steps, applications, invitations, customer_avatar_models, closed_customer_snapshots (sind bereits leer)

### Technische Umsetzung

Ein einziger SQL-Befehl ueber das Insert-Tool, der die Tabellen in der richtigen Reihenfolge leert (abhaengige Tabellen zuerst, wegen Foreign-Key-Beziehungen):

```text
Loesch-Reihenfolge:
1. call_queue_items (referenziert call_queues)
2. call_queues
3. transcripts (referenziert calls)
4. ai_analyses (referenziert calls/crm_leads)
5. offers (referenziert crm_leads)
6. crm_tasks (referenziert crm_leads)
7. pipeline_items (referenziert crm_leads)
8. calls (referenziert crm_leads)
9. crm_leads
10. leads
```

### Sicherheit

- Keine Schema-Aenderungen -- nur Daten werden geloescht
- Benutzerkonten und Rollen bleiben vollstaendig intakt
- Kursinhalte bleiben vollstaendig intakt
- Keine RLS-Policies oder Trigger werden veraendert

