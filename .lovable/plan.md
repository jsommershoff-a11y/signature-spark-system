
# Admin-Bereichsauswahl nach Login

## Uebersicht

Dieses Feature ermoeglicht Administratoren, nach dem Login eine Ansichtsrolle auszuwaehlen ("Ansicht als"). Der Admin behaelt dabei alle Berechtigungen, sieht aber die App aus der Perspektive der gewaehlten Rolle.

## Funktionsweise

```text
+------------------+     +-------------------+     +------------------+
|  Admin Login     | --> | Rollen-Auswahl    | --> | App mit View-As  |
|                  |     | (Modal/Selector)  |     | Banner + Sidebar |
+------------------+     +-------------------+     +------------------+
                                                          |
                                                          v
                                                   +------------------+
                                                   | Jederzeit        |
                                                   | wechselbar       |
                                                   +------------------+
```

## Benutzer-Erlebnis

1. **Login als Admin** - Normale Authentifizierung
2. **Rollen-Selector erscheint** - Admin waehlt "Ansicht als" Rolle
3. **Dashboard zeigt gewaehlte Perspektive** - Navigation und Widgets passen sich an
4. **Sichtbarer Hinweis** - Banner zeigt aktive Ansichtsrolle
5. **Schneller Wechsel** - Jederzeit ueber Header umschaltbar

## Aenderungen

### 1. AuthContext erweitern

Neue Eigenschaften im AuthContext:

| Eigenschaft | Typ | Beschreibung |
|-------------|-----|--------------|
| `viewAsRole` | `AppRole \| null` | Aktuell simulierte Rolle (nur fuer Admins) |
| `setViewAsRole` | `(role: AppRole \| null) => void` | Rolle wechseln |
| `effectiveRole` | `AppRole \| null` | Die aktuell wirksame Rolle (viewAsRole oder highestRole) |
| `isViewingAs` | `boolean` | True wenn Admin eine andere Rolle simuliert |

Die `hasMinRole` und `hasRole` Funktionen werden angepasst, um `effectiveRole` statt `highestRole` zu verwenden.

### 2. Neue Komponente: AdminViewSwitcher

Position: Im Header neben dem UserMenu (nur fuer Admins sichtbar)

```text
+--------------------------------------------------+
|  [Logo]                    [Ansicht: Admin v] [Avatar] |
+--------------------------------------------------+
```

Funktionen:
- Dropdown mit allen Rollen
- Aktuelle Ansichtsrolle hervorgehoben
- "Zurueck zu Admin" Option

### 3. View-As Banner

Wenn Admin eine andere Rolle simuliert, erscheint ein dezenter Banner:

```text
+--------------------------------------------------+
| Du siehst die App als "Mitarbeiter"    [Beenden] |
+--------------------------------------------------+
```

### 4. Angepasste Komponenten

**AppSidebar.tsx**
- Verwendet `effectiveRole` statt `highestRole` fuer Navigation
- Admin-Menuepunkt bleibt immer sichtbar (wenn echter Admin)

**Dashboard.tsx**
- Rendert Dashboard basierend auf `effectiveRole`
- Admin sieht "echtes" Admin-Dashboard nur wenn viewAsRole = null

**ProtectedRoute.tsx**
- Echte Admin-Rolle wird fuer Zugangsrechte beibehalten
- viewAsRole beeinflusst nur UI, nicht Security

**UserMenu.tsx**
- Zeigt simulierte Rolle im Badge
- Hinweis wenn View-As aktiv

## Neue Dateien

| Datei | Zweck |
|-------|-------|
| `src/components/app/AdminViewSwitcher.tsx` | Rollen-Dropdown fuer Admins |
| `src/components/app/ViewAsBanner.tsx` | Hinweis-Banner bei aktiver Simulation |

## Sicherheitshinweise

- **Keine echte Impersonation** - Admin bleibt Admin, nur UI aendert sich
- **RLS bleibt unveraendert** - Datenbank-Abfragen nutzen echte Benutzer-ID
- **Nur clientseitig** - Kein Backend-Impact

## Technische Details

### AuthContext Erweiterung

```typescript
// Neue State-Variablen
const [viewAsRole, setViewAsRole] = useState<AppRole | null>(null);

// Berechnete Werte
const isRealAdmin = roles.includes('admin');
const isViewingAs = isRealAdmin && viewAsRole !== null;
const effectiveRole = isViewingAs ? viewAsRole : getHighestRole(roles);

// Angepasste Funktionen
const hasMinRoleCheck = (minRole: AppRole) => {
  // Echte Admin-Berechtigungen fuer geschuetzte Routen
  if (roles.includes('admin')) return true;
  return checkMinRole(effectiveRole, minRole);
};
```

### AdminViewSwitcher Komponente

```typescript
// Nur fuer echte Admins sichtbar
// Dropdown mit allen Rollen
// Persistiert Auswahl in sessionStorage (optional)
```

## Zusammenfassung

| Bereich | Aenderung |
|---------|-----------|
| AuthContext | +4 neue Eigenschaften, angepasste Logik |
| AppLayout | AdminViewSwitcher + ViewAsBanner |
| AppSidebar | Verwendet effectiveRole |
| Dashboard | Verwendet effectiveRole |
| Neue Dateien | 2 neue Komponenten |

Nach Umsetzung kann ein Admin:
- Alle Bereiche sehen (voller Zugang bleibt)
- UI-Perspektive jeder Rolle erleben
- Schnell zwischen Ansichten wechseln
- Kunden-/Mitarbeiter-Erfahrung testen
