

# Test-Daten Erstellung: LMS Kurse & Lead-Owner-Zuweisungen

## Uebersicht

Dieser Plan erstellt vollstaendige Test-Daten fuer:
1. **LMS-System**: 2 Demo-Kurse mit Modulen und Lektionen
2. **Prospecting-Optimierung**: Lead-Owner-Zuweisungen fuer Call Queue Tests

---

## Phase 1: Test-Kurse fuer LMS

### 1.1 Kurs 1: SalesFlow Grundlagen

```sql
-- Kurs erstellen
INSERT INTO courses (name, description, thumbnail_url, version, published, required_product, sort_order)
VALUES (
  'SalesFlow Grundlagen',
  'Lerne die Grundlagen des erfolgreichen Vertriebs mit SalesFlow. Dieser Kurs fuehrt dich durch alle wichtigen Bereiche vom Lead-Management bis zum erfolgreichen Abschluss.',
  '/placeholder.svg',
  1,
  true,
  'starter',
  1
);

-- Module fuer Kurs 1
-- Modul 1.1: Einfuehrung
INSERT INTO modules (course_id, name, description, sort_order)
VALUES (
  (SELECT id FROM courses WHERE name = 'SalesFlow Grundlagen'),
  'Einfuehrung in SalesFlow',
  'Erste Schritte und Systemueberblick',
  1
);

-- Lektionen fuer Modul 1.1
INSERT INTO lessons (module_id, name, description, content_ref, lesson_type, duration_seconds, sort_order)
VALUES
  ((SELECT id FROM modules WHERE name = 'Einfuehrung in SalesFlow'),
   'Willkommen bei SalesFlow', 'Ueberblick ueber die Plattform', 'https://example.com/video1', 'video', 300, 1),
  ((SELECT id FROM modules WHERE name = 'Einfuehrung in SalesFlow'),
   'Dashboard-Navigation', 'So findest du dich zurecht', 'https://example.com/video2', 'video', 420, 2),
  ((SELECT id FROM modules WHERE name = 'Einfuehrung in SalesFlow'),
   'Checkliste: Erste Schritte', 'Deine Aufgaben fuer den Start', NULL, 'task', NULL, 3);

-- Modul 1.2: Lead-Management
INSERT INTO modules (course_id, name, description, sort_order)
VALUES (
  (SELECT id FROM courses WHERE name = 'SalesFlow Grundlagen'),
  'Lead-Management Basics',
  'Leads erfassen, qualifizieren und priorisieren',
  2
);

-- Lektionen fuer Modul 1.2
INSERT INTO lessons (module_id, name, description, content_ref, lesson_type, duration_seconds, sort_order)
VALUES
  ((SELECT id FROM modules WHERE name = 'Lead-Management Basics'),
   'Was ist ein Lead?', 'Definition und Bedeutung', 'https://example.com/video3', 'video', 360, 1),
  ((SELECT id FROM modules WHERE name = 'Lead-Management Basics'),
   'Lead-Qualifizierung', 'So erkennst du gute Leads', 'https://example.com/video4', 'video', 540, 2),
  ((SELECT id FROM modules WHERE name = 'Lead-Management Basics'),
   'ICP-Score verstehen', 'Automatische Bewertung nutzen', 'https://example.com/video5', 'video', 420, 3),
  ((SELECT id FROM modules WHERE name = 'Lead-Management Basics'),
   'Uebung: Lead-Bewertung', 'Bewerte 5 Beispiel-Leads', NULL, 'worksheet', NULL, 4);

-- Modul 1.3: Pipeline-Steuerung
INSERT INTO modules (course_id, name, description, sort_order)
VALUES (
  (SELECT id FROM courses WHERE name = 'SalesFlow Grundlagen'),
  'Die Sales-Pipeline',
  'Vom Lead zum Kunden',
  3
);

INSERT INTO lessons (module_id, name, description, content_ref, lesson_type, duration_seconds, sort_order)
VALUES
  ((SELECT id FROM modules WHERE name = 'Die Sales-Pipeline'),
   'Pipeline-Stages erklaert', 'Die Reise des Kunden', 'https://example.com/video6', 'video', 480, 1),
  ((SELECT id FROM modules WHERE name = 'Die Sales-Pipeline'),
   'Leads durch die Pipeline fuehren', 'Best Practices', 'https://example.com/video7', 'video', 600, 2),
  ((SELECT id FROM modules WHERE name = 'Die Sales-Pipeline'),
   'Abschluss-Quiz: Grundlagen', 'Teste dein Wissen', NULL, 'quiz', NULL, 3);
```

### 1.2 Kurs 2: Fortgeschrittene Verkaufstechniken

```sql
-- Kurs erstellen
INSERT INTO courses (name, description, thumbnail_url, version, published, required_product, sort_order)
VALUES (
  'Fortgeschrittene Verkaufstechniken',
  'Fuer erfahrene Verkaeufer: Schliesse mehr Deals mit fortgeschrittenen Strategien, Einwandbehandlung und Strukturanalyse.',
  '/placeholder.svg',
  1,
  true,
  'growth',
  2
);

-- Module fuer Kurs 2
-- Modul 2.1: Einwandbehandlung
INSERT INTO modules (course_id, name, description, sort_order)
VALUES (
  (SELECT id FROM courses WHERE name = 'Fortgeschrittene Verkaufstechniken'),
  'Einwandbehandlung Masterclass',
  'Die haeufigsten Einwaende souveraen meistern',
  1
);

INSERT INTO lessons (module_id, name, description, content_ref, lesson_type, duration_seconds, sort_order)
VALUES
  ((SELECT id FROM modules WHERE name = 'Einwandbehandlung Masterclass'),
   'Die 5 Standard-Einwaende', 'Preis, Timing, Trust, Need, Authority', 'https://example.com/video8', 'video', 720, 1),
  ((SELECT id FROM modules WHERE name = 'Einwandbehandlung Masterclass'),
   'Der Preis ist zu hoch', 'Strategien zur Wertargumentation', 'https://example.com/video9', 'video', 540, 2),
  ((SELECT id FROM modules WHERE name = 'Einwandbehandlung Masterclass'),
   'Timing-Einwaende meistern', 'Wenn Kunden zoegern', 'https://example.com/video10', 'video', 480, 3),
  ((SELECT id FROM modules WHERE name = 'Einwandbehandlung Masterclass'),
   'Praxis: Einwand-Rollenspiel', 'Uebe mit Beispielen', NULL, 'task', NULL, 4);

-- Modul 2.2: Strukturanalyse
INSERT INTO modules (course_id, name, description, sort_order)
VALUES (
  (SELECT id FROM courses WHERE name = 'Fortgeschrittene Verkaufstechniken'),
  'Strukturanalyse & Persoenlichkeitstypen',
  'Kunden besser verstehen mit dem Structogram',
  2
);

INSERT INTO lessons (module_id, name, description, content_ref, lesson_type, duration_seconds, sort_order)
VALUES
  ((SELECT id FROM modules WHERE name = 'Strukturanalyse & Persoenlichkeitstypen'),
   'Einfuehrung ins Structogram', 'Rot, Gruen, Blau verstehen', 'https://example.com/video11', 'video', 600, 1),
  ((SELECT id FROM modules WHERE name = 'Strukturanalyse & Persoenlichkeitstypen'),
   'Der Rote Typ', 'Dominant, direkt, ergebnisorientiert', 'https://example.com/video12', 'video', 420, 2),
  ((SELECT id FROM modules WHERE name = 'Strukturanalyse & Persoenlichkeitstypen'),
   'Der Gruene Typ', 'Beziehungsorientiert, empathisch', 'https://example.com/video13', 'video', 420, 3),
  ((SELECT id FROM modules WHERE name = 'Strukturanalyse & Persoenlichkeitstypen'),
   'Der Blaue Typ', 'Analytisch, detailgenau', 'https://example.com/video14', 'video', 420, 4),
  ((SELECT id FROM modules WHERE name = 'Strukturanalyse & Persoenlichkeitstypen'),
   'Analyse-Arbeitsblatt', 'Analysiere deine eigenen Kunden', NULL, 'worksheet', NULL, 5);
```

---

## Phase 2: Lead-Owner-Zuweisungen

### 2.1 Leads dem Staff zuweisen

```sql
-- Alle vorhandenen Leads dem Staff-Member Jan Sommershoff zuweisen
UPDATE crm_leads
SET owner_user_id = '2824ab54-05a2-4358-8a98-4ec7ae1262f9'
WHERE owner_user_id IS NULL;
```

---

## Phase 3: Test-Member erstellen

### 3.1 Demo-Member mit Membership

```sql
-- Falls Test-User existiert, Member erstellen
-- (Dieser Teil wird aktiviert wenn ein Test-User angelegt wurde)

-- Demo-Fortschritt fuer den Member
-- INSERT INTO lesson_progress (member_id, lesson_id, status, progress_percent, started_at, completed_at)
-- VALUES (...);
```

---

## Zusammenfassung der SQL-Migration

Die Migration erstellt:

| Objekt | Anzahl |
|--------|--------|
| **Kurse** | 2 (SalesFlow Grundlagen, Fortgeschrittene Techniken) |
| **Module** | 5 (3 + 2) |
| **Lektionen** | 18 (10 + 8) |
| **Lead-Updates** | 5 (Owner-Zuweisung) |

---

## Erwartete Ergebnisse nach Migration

### LMS-Bereich (/app/courses):
- 2 Kurse werden angezeigt
- Module aufklappbar mit Lektionen
- Video/Task/Worksheet/Quiz Typen sichtbar

### prospecting_daily_run:
- Call Queue Items werden fuer Leads mit Owner erstellt
- Leads erscheinen in der Call Queue des Mitarbeiters
- Follow-up Tasks werden generiert

---

## Naechste Schritte

1. **Migration ausfuehren**: SQL in Supabase SQL Editor
2. **prospecting_daily_run erneut testen**: Jetzt mit Lead-Ownern
3. **Kursbereich pruefen**: /app/courses nach Login
4. **Call Queue testen**: Dashboard-Widget

