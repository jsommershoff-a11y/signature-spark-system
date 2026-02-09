

# Step 01.3 - Fix leads_source_check Constraint

## Problem

Das Qualifizierungs-Formular schlägt beim Speichern fehl mit:
```
new row for relation "leads" violates check constraint "leads_source_check"
```

Der aktuelle CHECK-Constraint erlaubt nur:
```sql
CHECK ((source = ANY (ARRAY['start'::text, 'growth'::text])))
```

Aber der Code verwendet 8 verschiedene Source-Werte:
- `start` (erlaubt)
- `growth` (erlaubt)
- `handwerk` (nicht erlaubt)
- `praxen` (nicht erlaubt)
- `dienstleister` (nicht erlaubt)
- `immobilien` (nicht erlaubt)
- `kurzzeitvermietung` (nicht erlaubt)
- `qualifizierung` (nicht erlaubt)

---

## Lösung

Den bestehenden CHECK-Constraint droppen und durch einen erweiterten Constraint ersetzen.

### SQL Migration:

```sql
-- Step 1: Drop the existing constraint
ALTER TABLE public.leads 
DROP CONSTRAINT IF EXISTS leads_source_check;

-- Step 2: Add new constraint with all valid source values
ALTER TABLE public.leads 
ADD CONSTRAINT leads_source_check 
CHECK (source = ANY (ARRAY[
  'start'::text, 
  'growth'::text, 
  'handwerk'::text, 
  'praxen'::text, 
  'dienstleister'::text, 
  'immobilien'::text, 
  'kurzzeitvermietung'::text, 
  'qualifizierung'::text
]));
```

---

## Betroffene Dateien

| Datei | Aktion |
|-------|--------|
| Supabase Migration | CHECK-Constraint aktualisieren |

Keine Code-Änderungen erforderlich - die Frontend-Komponenten verwenden bereits die korrekten Source-Werte.

---

## Validierung nach Fix

| Test | Erwartetes Ergebnis |
|------|---------------------|
| Qualifizierung: Formular absenden | ✓ Erfolgreiche Speicherung in Supabase |
| Qualifizierung: Weiterleitung | ✓ Navigation zu /danke |
| ContactModal mit source="handwerk" | ✓ Erfolgreiche Speicherung |
| ContactModal mit source="praxen" | ✓ Erfolgreiche Speicherung |
| Supabase: leads-Tabelle prüfen | ✓ Neue Einträge mit korrektem source-Wert |
| Console: Keine Errors | ✓ Keine 400-Fehler mehr |

---

## Technical Details

Der Fix ist eine reine Datenbank-Migration ohne Anwendungscode-Änderungen. Die Migration verwendet:

1. `DROP CONSTRAINT IF EXISTS` - sicher falls der Constraint nicht existiert
2. `ADD CONSTRAINT` mit allen 8 gültigen Source-Werten
3. Keine Datenänderung nötig (bestehende Daten haben nur 'start' oder 'growth')

