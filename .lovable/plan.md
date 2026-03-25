

# Plan: COO-Tab aus Admin entfernen + Admin-Dashboard Mobile-Optimierung

## 2 Probleme

1. **COO Cockpit Tab im Admin-Bereich**: Der COO-Tab in `/app/admin` ist redundant -- COO Cockpit hat bereits eine eigene Seite (`/app/coo-cockpit`) und einen eigenen Sidebar-Eintrag. Der Tab im Admin-Bereich zeigt nur einen "Oeffnen"-Button. Wird entfernt.

2. **Admin-Dashboard auf Mobile**: Die TabsList im Admin-Bereich mit 8 Tabs bricht auf kleinen Screens. Das Admin-Dashboard selbst ist bereits mobile-optimiert (2-spaltige KPI-Grids, single-column Widgets). Hauptproblem ist die Admin-Seite (`/app/admin`).

## Aenderungen

### 1. `src/pages/app/Admin.tsx`
- **COO-Tab entfernen**: TabsTrigger "COO Cockpit" (Zeile 26) und TabsContent "coo" (Zeile 39-51) komplett entfernen
- **TabsList mobile-optimiert**: `flex-wrap` beibehalten, aber `overflow-x-auto` hinzufuegen und Tabs auf Mobile als scrollbare Zeile darstellen statt Umbruch. Alternativ: `grid grid-cols-2 sm:flex sm:flex-wrap` fuer 2-spaltige Tab-Buttons auf Mobile.

### 2. `src/components/dashboard/AdminDashboard.tsx`
- Keine Aenderungen noetig -- das Dashboard ist bereits mobile-responsive (grid-cols-2, grid-cols-1 auf Mobile fuer Widgets)

## Dateien

- `src/pages/app/Admin.tsx` -- COO-Tab entfernen + TabsList mobil machen

