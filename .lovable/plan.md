

# Plan: Kurs "START HIER" mit 2 Modulen und 8 Lektionen anlegen

## Ueberblick

Neuer Freebie-Kurs als Einstiegspunkt fuer alle Kunden. Wird per SQL-Insert in die bestehenden Tabellen `courses`, `modules` und `lessons` geschrieben. Kein Learning Path noetig (eigenstaendiger Kurs wie "SalesFlow Grundlagen"). Alle Lektionen mit vollstaendigen `content_html` Inhalten im `meta` JSONB-Feld.

## Kursstruktur

```text
Kurs: START HIER – Dein Unternehmen auf dem Pruefstand (Freebie, published, sort_order: -1)

├── Modul 1: Wo stehst du? (Selbstanalyse)
│   ├── L1: Was ist ein Signature System? (video, 5 Min)
│   ├── L2: Die 5 groessten Zeitfresser identifizieren (task + Arbeitsblatt)
│   ├── L3: Dein Prozess-Audit in 30 Minuten (worksheet)
│   └── L4: Quiz: Wie automatisiert ist dein Unternehmen? (quiz)
│
└── Modul 2: Die Grundlagen verstehen
    ├── L5: Automatisierung ≠ kompliziert (video, 5 Min)
    ├── L6: Die 3 Automatisierungs-Ebenen (video, 8 Min)
    ├── L7: Dein erster Quick Win (task)
    └── L8: Checkliste: Deine Top-3 Hebel (worksheet)
```

## Technische Umsetzung

3 SQL-INSERT-Statements via Supabase Insert Tool:
1. **1x INSERT into `courses`** – Freebie, published, sort_order -1 (erscheint ganz oben)
2. **2x INSERT into `modules`** – je 1 pro Modul
3. **8x INSERT into `lessons`** – mit vollstaendigen `content_html` Inhalten, Beschreibungen, Typen, Dauer

Jede Lektion enthaelt:
- Klarer Titel
- Beschreibung (1 Satz)
- lesson_type (video/task/worksheet/quiz)
- duration_seconds
- meta.content_html mit vollstaendigem HTML-Inhalt (Erklaerung, Praxisbeispiel, Aufgabe, naechster Schritt)
- Fuer Quiz: meta.quiz Array mit Fragen und Antworten

## Keine Code-Aenderungen noetig

Die bestehenden LMS-Komponenten (LearningDashboard, CourseDetailView, LessonPlayerView) lesen bereits dynamisch aus der DB und rendern content_html. Der Kurs erscheint automatisch.

## Dateien

- Keine Dateiaenderungen – nur Datenbank-Inserts

