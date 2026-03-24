

# Plan: Onboarding-Flow, Kunden-Dashboard Umbau & Kurs-Inhalte

## Zusammenfassung

Drei zusammenhaengende Aenderungen: (1) Gefuehrter Onboarding-Flow nach Registrierung, (2) Kunden-Dashboard als Umsetzungs-Cockpit mit Fortschritt und naechster Lektion, (3) Kurs 2 "ANFRAGEN & LEADS" in der Datenbank anlegen + fehlende Inhalte fuer Kurs 1 und 2.

---

## 1. Gefuehrter Onboarding-Flow

### Problem
Die aktuelle `ProfileCompletionDialog` fragt nur "Firma" ab. Kein Branchenbezug, kein Ziel, keine Weiterleitung zum ersten Kurs.

### Loesung
Die bestehende `ProfileCompletionDialog.tsx` wird zu einem mehrstufigen Onboarding-Wizard umgebaut (3 Schritte, gleiche Dialog-Komponente):

**Schritt 1: Branche** (Select mit 8 Optionen)
- Handwerk, Dienstleistung, Praxis/Gesundheit, Immobilien, Gastronomie/Hotellerie, Handel, Agentur/Beratung, Sonstiges

**Schritt 2: Groesstes Ziel** (Select mit 4 Optionen)
- "Weniger operatives Chaos"
- "Mehr Zeit fuer Kerngeschaeft"  
- "Bessere Prozesse und Uebergaben"
- "Wachstum ohne mehr Arbeit"

**Schritt 3: Firma + Name** (wie bisher, aber kompakter)

Nach Abschluss: Weiterleitung zu `/app/academy` mit Toast "Starte mit deinem ersten Kurs"

### DB-Aenderung (Migration)
`profiles` Tabelle braucht 2 neue Spalten:
```sql
ALTER TABLE profiles ADD COLUMN industry text;
ALTER TABLE profiles ADD COLUMN primary_goal text;
```

### Datei-Aenderungen
- `src/components/app/ProfileCompletionDialog.tsx` – Komplett umschreiben als 3-Step-Wizard
- `src/contexts/AuthContext.tsx` – Profile-Interface um `industry` und `primary_goal` erweitern

---

## 2. Kunden-Dashboard Umbau

### Problem
Dashboard zeigt statische "0"-Karten. Kein Einstiegspunkt, keine Motivation.

### Loesung
`KundeDashboard.tsx` komplett ersetzen durch ein Umsetzungs-Cockpit:

**Willkommens-Widget** (oben, volle Breite):
- "Dein Signature System – Schritt fuer Schritt aufbauen"
- Fortschrittsring (ProgressRing aus LMS wiederverwendet)
- "Naechste Lektion: [Titel]" mit direktem Link
- "Starte hier"-Button wenn noch kein Fortschritt

**Freebie-Banner** (bleibt, wenn kein Produkt)

**Quick-Links** (2 Karten):
- "Mein System" statt "KI-Academy"
- "Dokumente" statt "Meine Vertraege"

**Stats** werden dynamisch aus `useLearningPaths` Hook befuellt statt statisch "0".

### Datei-Aenderungen
- `src/components/dashboard/KundeDashboard.tsx` – Komplett umschreiben
- Importiert `useLearningPaths` fuer echte Fortschrittsdaten
- Importiert `ProgressRing` aus LMS-Komponenten

---

## 3. Kurs 2 anlegen + Inhalte befuellen

### Kurs 2: "ANFRAGEN & LEADS – Nie wieder Anfragen verlieren"
Wird per SQL-Insert in die DB geschrieben (gleicher Ansatz wie Kurs 1):

```text
Kurs 2: ANFRAGEN & LEADS (Starter, published, sort_order: 0)
├── Modul 3: Anfragen automatisch erfassen
│   ├── L9: Warum Anfragen untergehen (video, 5 Min)
│   ├── L10: Dein CRM in 15 Minuten einrichten (video, 12 Min)
│   ├── L11: Automatische Lead-Erfassung einrichten (task)
│   └── L12: Praxis: Deine ersten 5 Leads eintragen (task)
├── Modul 4: Follow-ups, die laufen
│   ├── L13: Warum Follow-ups Geld bringen (video, 5 Min)
│   ├── L14: Automatische Follow-up-Sequenz bauen (video, 10 Min)
│   ├── L15: E-Mail-Vorlage: Der perfekte Follow-up (worksheet)
│   └── L16: Quiz: Follow-up-Strategie (quiz)
```

Alle Lektionen mit vollstaendigen `content_html` Texten im `meta`-Feld, Quizze mit Fragen/Antworten.

### Arbeitsblatt-PDFs
2 PDFs werden generiert und in `/mnt/documents/` abgelegt:
1. "Prozess-Audit Arbeitsblatt" (fuer Kurs 1, L3)
2. "Follow-up E-Mail-Vorlage" (fuer Kurs 2, L15)

---

## Dateien die geaendert werden

1. **Migration**: `profiles` + `industry` + `primary_goal` Spalten
2. `src/components/app/ProfileCompletionDialog.tsx` – 3-Step Onboarding Wizard
3. `src/contexts/AuthContext.tsx` – Profile-Interface erweitern
4. `src/components/dashboard/KundeDashboard.tsx` – Umsetzungs-Cockpit
5. **DB-Inserts**: Kurs 2 mit 2 Modulen und 8 Lektionen
6. **PDFs**: 2 Arbeitsblaetter generieren

