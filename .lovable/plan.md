

## Kunden-Seite: Tabelle mit Suchfunktion

### Ausgangssituation

Es gibt keine dedizierte `customers`-Tabelle. Kunden sind Benutzer mit der Rolle `kunde` in der `user_roles`-Tabelle, deren Daten (Name, E-Mail, Telefon, Firma) in der `profiles`-Tabelle gespeichert sind. Das Feld `assigned_to` in `profiles` verweist auf die Profil-ID des zugewiesenen Mitarbeiters.

### Umsetzung

**Step 01 -- Datenbank-Funktion fuer Kundenabfrage**

Da die RLS-Policies auf `profiles` restriktiv sind (Mitarbeiter sehen nur zugewiesene Profile), wird eine `SECURITY DEFINER`-Funktion erstellt, die Kunden-Profile zurueckgibt -- aber nur fuer Aufrufer mit mindestens Rolle `mitarbeiter`:

```sql
CREATE FUNCTION get_customers()
RETURNS TABLE(
  id uuid, full_name text, first_name text, last_name text,
  email text, phone text, company text, created_at timestamptz,
  assigned_to uuid, assigned_staff_name text
)
```

Die Funktion:
- Prueft `has_min_role(auth.uid(), 'mitarbeiter')`
- Jooint `profiles` mit `user_roles` (WHERE role = 'kunde')
- Jooint `assigned_to` zurueck auf `profiles` fuer den Mitarbeiter-Namen

**Step 02 -- Hook `useCustomers`**

Neue Datei: `src/hooks/useCustomers.ts`
- Ruft `supabase.rpc('get_customers')` auf
- Implementiert clientseitiges Filtern nach Suchbegriff (Name, Firma)
- Gibt `customers`, `isLoading`, `refetch` zurueck

**Step 03 -- Kunden-Seite umbauen**

Datei: `src/pages/app/Customers.tsx`
- Platzhalter-Inhalt entfernen
- Suchleiste (Input mit Lupen-Icon) oben
- Tabelle mit Spalten: Name, E-Mail, Telefon, Firma, Zugewiesener Mitarbeiter
- Leerzustand wenn keine Kunden vorhanden
- Ladezustand mit Spinner

### Technische Details

- Die DB-Funktion umgeht die restriktiven RLS-Policies auf `profiles`, ist aber selbst durch den `has_min_role`-Check geschuetzt
- Clientseitige Suche filtert die bereits geladene Liste (performant bei erwarteter Kundenanzahl)
- Bestehende UI-Komponenten (`Table`, `Input`, `Badge`) werden wiederverwendet
- Keine neuen Abhaengigkeiten noetig

