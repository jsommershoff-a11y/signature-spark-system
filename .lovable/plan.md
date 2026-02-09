

## Step 08 -- Team-Management: team_id Zuweisung fur Mitarbeiter

### Ziel

Admins konnen im Admin-Bereich Mitarbeiter einem Team zuweisen. Ein "Team" wird durch die `profile.id` eines Teamleiters definiert -- alle Mitarbeiter mit derselben `team_id` gehoren zu dessen Team. Damit funktioniert die bestehende RLS-Logik (`get_user_team_id`, `get_team_member_ids`).

### Ist-Zustand

- `profiles.team_id` existiert bereits, ist aber bei allen Benutzern `NULL`
- Teamleiter-RLS-Policies (`Teamleiter can view team profiles`, etc.) sind bereits implementiert
- Helper-Funktionen `get_user_team_id()` und `get_team_member_ids()` sind vorhanden
- Admins haben bereits UPDATE-Zugriff auf `profiles` via RLS

### Konzept

- Der Teamleiter selbst bekommt seine eigene `profile.id` als `team_id` (er ist sein eigener Team-Chef)
- Mitarbeiter bekommen die `profile.id` des Teamleiters als `team_id`
- In der UI: Admin wahlt pro Benutzer aus einem Dropdown den Teamleiter aus

### Keine DB-Migration erforderlich

Die Spalte `profiles.team_id` und alle RLS-Policies existieren bereits.

### Anderungen

**1. `AdminUserManagement.tsx` erweitern**

Neue Spalte "Team" in der Tabelle:
- Zeigt den aktuellen Teamleiter-Namen an (oder "-" wenn kein Team)
- Dropdown mit allen Teamleitern zur Auswahl
- Option "Kein Team" zum Entfernen der Zuweisung

Datenfluss:
- Beim Laden: Profiles mit `team_id` abrufen (bereits im Query enthalten, muss nur erweitert werden)
- Teamleiter-Liste: Aus den geladenen Benutzern filtern (Rolle = teamleiter oder hoher)
- Bei Anderung: `profiles.team_id` per Supabase UPDATE setzen

Technische Details:
- `fetchUsers` erweitern: `team_id` und `id` (profile.id) mit abfragen
- Interface `UserWithRole` um `team_id` und `profile_id` erweitern
- Teamleiter-Kandidaten aus der User-Liste filtern (Rolle >= teamleiter)
- Neuer Handler `handleTeamChange(userId, teamId)` fur UPDATE auf profiles
- Neues Select-Dropdown in der Tabelle

**2. Dateien**

| Datei | Aktion |
|-------|--------|
| `src/components/admin/AdminUserManagement.tsx` | Erweitern um Team-Spalte |

Nur eine Datei wird geandert -- die bestehende Benutzerverwaltung bekommt eine zusatzliche Spalte.

### UI-Entwurf

```text
| Name | E-Mail | Rolle | Rolle andern | Team | Registriert |
|------|--------|-------|--------------|------|-------------|
| Jan  | ...    | Admin | [Select]     | -    | 01.01.26    |
| Test | ...    | TL    | [Select]     | [Select: Jan / Kein Team] | 02.01.26 |
```

Team-Dropdown zeigt:
- "Kein Team" (setzt team_id = null)
- Liste aller Teamleiter/GF/Admins mit Namen

### Validierung nach Implementierung

1. Als Admin einloggen und Team-Spalte sehen
2. Mitarbeiter einem Teamleiter zuweisen
3. Verifizieren dass team_id in der DB gesetzt wird
4. Security-Scan -- keine Regressionen

