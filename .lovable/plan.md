

## Analyse

**Problem**: Die Funktion `assign_default_role()` weist neuen Benutzern die Rolle `mitarbeiter` zu. Das bedeutet, jeder der sich registriert, hat sofort Zugriff auf CRM, Leads, Pipeline, Kundenveraltung und alle personenbezogenen Daten.

**Ziel**: Neue Registrierungen erhalten die Rolle `kunde`. Nur Admin/Geschaeftsfuehrung darf Rollen hochstufen.

## Plan

### Step 01 -- DB-Migration: Default-Rolle auf 'kunde' ändern

SQL-Migration, die `assign_default_role()` ändert:

```sql
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.user_id, 'kunde');
  RETURN NEW;
END;
$function$;
```

### Step 02 -- Auth-Redirect: Kunden nach Login auf /app/contracts leiten

Bereits implementiert in `Auth.tsx` (Zeile 37-40): Kunden werden auf `/app/contracts` weitergeleitet. Keine Änderung nötig.

### Step 03 -- Routen absichern: Settings-Seite für Kunden einschränken

Die Route `/app/settings` ist derzeit für alle Rollen offen. Prüfen ob dort sensible Daten (z.B. andere Profile) sichtbar sind. Falls ja, Einschränkung auf eigene Profildaten.

### Step 04 -- Sidebar-Anpassung prüfen

Die Sidebar filtert bereits korrekt nach Rollen:
- CRM, Leads, Pipeline, Calls, Angebote, Kunden, Mitglieder, Ziele, Social Media, Email: `minRole: 'mitarbeiter'` -- Kunden sehen diese nicht
- Kurse, Verträge: `exactRole: 'kunde'` -- nur für Kunden sichtbar
- Dashboard, Aufgaben, Einstellungen: keine Einschränkung -- für alle sichtbar

Keine Änderung nötig.

### Step 05 -- Bestehende Benutzer mit Rolle 'mitarbeiter' prüfen

Hinweis an den Benutzer: Bereits registrierte Benutzer, die fälschlicherweise als `mitarbeiter` angelegt wurden, müssen manuell in der Admin-Benutzerverwaltung auf `kunde` heruntergestuft werden. Dies ist eine manuelle Aktion in der Admin-UI.

---

### Zusammenfassung

| Was | Aktion |
|-----|--------|
| DB-Trigger `assign_default_role` | `mitarbeiter` -> `kunde` |
| Routen-Schutz | Bereits vorhanden via `requireMinRole` |
| Sidebar-Filter | Bereits korrekt konfiguriert |
| Rollenhochstufung | Nur über Admin-UI möglich (bereits implementiert) |
| Bestehende User | Manuelle Korrektur durch Admin empfohlen |

**Einzige Code-Änderung**: Eine SQL-Migration, die den Trigger anpasst.

