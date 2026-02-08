

# Vollständige Übersicht: Offene Punkte

Nach Durchsicht des gesamten Chatverlaufs und der Codebasis wurden folgende noch nicht umgesetzte Punkte identifiziert:

## Status-Übersicht

| Nr. | Auftrag | Status |
|-----|---------|--------|
| 1 | Admin View-As Feature | Erledigt |
| 2 | sessionStorage Persistierung | Erledigt |
| 3 | Tutorial-Tooltip für AdminViewSwitcher | **OFFEN** |
| 4 | Auto-Reset Timer (30 Min.) für View-As | **OFFEN** |
| 5 | FollowupApprovalsWidget im Dashboard einbinden | **OFFEN** |
| 6 | CustomerAvatarWidget im Dashboard einbinden | **OFFEN** |
| 7 | Dashboard-Rendering-Logik vereinfachen (Bug) | **OFFEN** |

---

## Detaillierte Änderungen

### 1. Tutorial-Tooltip für AdminViewSwitcher

**Datei:** `src/components/app/AdminViewSwitcher.tsx`

| Änderung | Beschreibung |
|----------|--------------|
| Import | TooltipProvider, Tooltip, TooltipTrigger, TooltipContent |
| Wrapping | Button in Tooltip-Komponenten einpacken |
| Inhalt | Erklärungstext zur Funktion anzeigen |

```text
+--------------------------------+
|  [Ansicht: Admin v] <-- Hover  |
+--------------------------------+
          |
          v
+----------------------------------------+
| Wechsle die Ansicht, um die App aus    |
| verschiedenen Rollen-Perspektiven      |
| zu erleben.                            |
+----------------------------------------+
```

---

### 2. Auto-Reset Timer (30 Minuten)

**Dateien:** 
- `src/contexts/AuthContext.tsx`
- `src/components/app/ViewAsBanner.tsx`

| Komponente | Änderung |
|------------|----------|
| AuthContext | Timestamp `admin_viewAsStartTime` in sessionStorage speichern |
| ViewAsBanner | useEffect mit Timer-Logik, Countdown-Anzeige |

**Logik:**
```text
setViewAsRole(role) --> sessionStorage.setItem('admin_viewAsStartTime', Date.now())
                              |
                              v
                    ViewAsBanner useEffect
                              |
                              v
              Prüfe alle 60 Sekunden: elapsed > 30 Min?
                              |
              Ja: setViewAsRole(null) + Toast
              Nein: Zeige verbleibende Minuten
```

**UI im Banner:**
```text
+-------------------------------------------------------------------------+
| 👁 Du siehst die App als "Mitarbeiter"  | ⏱ 28 Min.  |  [Beenden]     |
+-------------------------------------------------------------------------+
```

---

### 3. Fehlende Dashboard-Widgets einbinden

**Datei:** `src/pages/app/Dashboard.tsx`

Aktuell werden nur 4 Widgets verwendet:
- CallQueueWidget
- TopLeadsWidget  
- RecentAnalysesWidget
- PipelineStatsWidget

Aber es existieren noch 2 weitere Widgets:
- **FollowupApprovalsWidget** (Genehmigungen für Followup-Pläne)
- **CustomerAvatarWidget** (Kunden-Avatar PCA)

Diese sollen in die Admin- und Staff-Dashboards integriert werden.

**Neue Widget-Anordnung:**

```text
Admin/Staff Dashboard Grid:
+-------------------+-------------------+-------------------+
| CallQueueWidget   | TopLeadsWidget    | RecentAnalyses    |
+-------------------+-------------------+-------------------+
| PipelineStats     | FollowupApprovals | CustomerAvatar    |
+-------------------+-------------------+-------------------+
```

---

### 4. Dashboard-Rendering-Logik Bug fixen

**Problem in Dashboard.tsx (Zeilen 223-226):**

```typescript
// Aktuell (fehlerhaft):
{isEffectiveAdmin && !isViewingAs && renderAdminDashboard()}
{isEffectiveAdmin && isViewingAs && renderAdminDashboard()}  // Doppelt!
{!isEffectiveAdmin && isEffectiveStaff && renderStaffDashboard()}
{isEffectiveKunde && !isEffectiveStaff && renderKundeDashboard()}
```

Admin-Dashboard wird zweimal gerendert und Logik ist verwirrend.

**Korrektur:**

```typescript
// Korrigiert:
{isEffectiveAdmin && renderAdminDashboard()}
{!isEffectiveAdmin && isEffectiveStaff && renderStaffDashboard()}
{!isEffectiveStaff && renderKundeDashboard()}
```

---

## Zusammenfassung der Änderungen

| Datei | Änderungen |
|-------|------------|
| `src/components/app/AdminViewSwitcher.tsx` | Tooltip hinzufügen |
| `src/contexts/AuthContext.tsx` | Timestamp-Speicherung für Timer |
| `src/components/app/ViewAsBanner.tsx` | Countdown + Auto-Reset Logik |
| `src/pages/app/Dashboard.tsx` | Widgets ergänzen + Logik-Fix |

---

## Nicht umsetzbar (erfordert manuellen Test)

| Punkt | Grund |
|-------|-------|
| CallQueueWidget mit 7 Leads prüfen | Erfordert Login als spezifischer Benutzer |
| Kurse-Seite testen | Erfordert Benutzer mit member-Datensatz |
| Phone-Button Status-Wechsel | Erfordert manuelle Interaktion |

Diese Tests müssen vom Benutzer nach Login durchgeführt werden.

---

## Technische Details

### Timer-Implementierung in ViewAsBanner

```typescript
const VIEW_AS_START_KEY = 'admin_viewAsStartTime';
const VIEW_AS_TIMEOUT_MS = 30 * 60 * 1000; // 30 Minuten

useEffect(() => {
  if (!isViewingAs) {
    setRemainingMinutes(null);
    return;
  }

  const checkExpiry = () => {
    const startTime = sessionStorage.getItem(VIEW_AS_START_KEY);
    if (startTime) {
      const elapsed = Date.now() - parseInt(startTime);
      const remaining = VIEW_AS_TIMEOUT_MS - elapsed;
      
      if (remaining <= 0) {
        setViewAsRole(null);
        toast.info('View-As Modus nach 30 Minuten beendet');
      } else {
        setRemainingMinutes(Math.ceil(remaining / 60000));
      }
    }
  };

  checkExpiry();
  const interval = setInterval(checkExpiry, 60000);
  return () => clearInterval(interval);
}, [isViewingAs, setViewAsRole]);
```

### Tooltip-Implementierung in AdminViewSwitcher

```typescript
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <DropdownMenuTrigger asChild>
        <Button ...>...</Button>
      </DropdownMenuTrigger>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="max-w-[200px]">
      <p className="text-sm">
        Wechsle die Ansicht, um die App aus der Perspektive 
        verschiedener Benutzerrollen zu erleben.
      </p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

