

# sessionStorage-Persistierung für Admin View-As

## Übersicht

Die viewAsRole soll in sessionStorage gespeichert werden, damit die Admin-Ansichtswahl bei Seitenwechsel und Refresh erhalten bleibt.

## Änderungen

### AuthContext.tsx

| Änderung | Beschreibung |
|----------|--------------|
| Initialisierung | `viewAsRole` aus sessionStorage laden |
| Setter-Wrapper | Bei Änderung in sessionStorage speichern |
| Sign-Out | sessionStorage leeren |
| Rollen-Laden | Nach Rollen-Fetch prüfen ob gespeicherte Rolle noch gültig |

### Technische Umsetzung

```text
+------------------+     +-------------------+     +------------------+
| Admin Login      | --> | sessionStorage    | --> | viewAsRole State |
|                  |     | "admin_viewAsRole"|     | wird gesetzt     |
+------------------+     +-------------------+     +------------------+
         |                        ^
         |                        |
         v                        |
+------------------+     +-------------------+
| setViewAsRole()  | --> | sessionStorage    |
|                  |     | schreiben         |
+------------------+     +-------------------+
```

### Code-Änderungen

**1. Storage-Key als Konstante**
```typescript
const VIEW_AS_STORAGE_KEY = 'admin_viewAsRole';
```

**2. Initialer State aus sessionStorage**
```typescript
const getInitialViewAsRole = (): AppRole | null => {
  try {
    const stored = sessionStorage.getItem(VIEW_AS_STORAGE_KEY);
    return stored as AppRole | null;
  } catch {
    return null;
  }
};

const [viewAsRole, setViewAsRoleState] = useState<AppRole | null>(getInitialViewAsRole);
```

**3. Wrapper für setViewAsRole**
```typescript
const setViewAsRole = (role: AppRole | null) => {
  setViewAsRoleState(role);
  try {
    if (role) {
      sessionStorage.setItem(VIEW_AS_STORAGE_KEY, role);
    } else {
      sessionStorage.removeItem(VIEW_AS_STORAGE_KEY);
    }
  } catch {
    // sessionStorage nicht verfügbar
  }
};
```

**4. Bei Sign-Out sessionStorage leeren**
```typescript
const signOut = async () => {
  await supabase.auth.signOut();
  setUser(null);
  setSession(null);
  setProfile(null);
  setRoles([]);
  setViewAsRoleState(null);
  try {
    sessionStorage.removeItem(VIEW_AS_STORAGE_KEY);
  } catch {}
};
```

**5. Validierung nach Rollen-Laden**
Nach dem Laden der Rollen wird geprüft, ob der Benutzer noch Admin ist. Falls nicht, wird die gespeicherte viewAsRole gelöscht.

## Sicherheit

- sessionStorage ist browser-tab-spezifisch
- Wird beim Schließen des Tabs automatisch gelöscht
- Kein Sicherheitsrisiko, da viewAsRole nur UI beeinflusst

## Betroffene Datei

| Datei | Änderungen |
|-------|------------|
| `src/contexts/AuthContext.tsx` | Storage-Logik hinzufügen |

