

## Admin-Dashboard: Operatives Steuerungszentrum

### Ist-Zustand

Das AdminDashboard zeigt aktuell 4 generische KPI-Cards (Gesamte Leads, Aktive Mitglieder, Offene Aufgaben, Conversion Rate), ein GoalsMotivationPanel und 6 Widgets in einem flachen Grid. Es fehlen operative Prioritaeten, Quick Actions, Aktivitaeten-Feed, erweiterte KPIs und ein klarer Kommunikationsbereich.

### Ziel-Struktur

Das Dashboard wird in 6 klar getrennte Sektionen mit Section-Headern aufgeteilt:

```text
┌─────────────────────────────────────────────────┐
│ Bereich 1: Top-KPIs (2x3 Grid, 6 Cards)        │
│ Leads gesamt | Neue heute | Neue Woche |        │
│ Aktive Kunden | Offene Tasks | Conversion       │
├─────────────────────────────────────────────────┤
│ Bereich 2: Prioritaeten heute                   │
│ Ueberfaellige Tasks | Neue unkontaktierte Leads │
│ Offene Follow-ups | Calls ohne Nachbearbeitung  │
├─────────────────────────────────────────────────┤
│ Bereich 3: Quick Actions (Icon-Buttons)         │
│ Lead+ | Aufgabe+ | CRM | Pipeline | Reports    │
├─────────────────────────────────────────────────┤
│ Bereich 4: CRM & Pipeline (2-col)               │
│ PipelineStatsWidget | TopLeadsWidget            │
├─────────────────────────────────────────────────┤
│ Bereich 5: Calls & Kommunikation                │
│ CallQueueWidget | Sipgate Status Card           │
├─────────────────────────────────────────────────┤
│ Bereich 6: Ziele + Analysen + Follow-ups + PCA  │
│ GoalsMotivationPanel                            │
│ RecentAnalyses | FollowupApprovals | Avatar     │
└─────────────────────────────────────────────────┘
```

### Implementation Plan

#### Step 01 -- Extend `useDashboardData` hook

Add new queries to the existing hook:

- **New leads today**: `crm_leads` where `created_at >= today`
- **New leads this week**: `crm_leads` where `created_at >= monday`
- **Active members**: `members` where `status = 'active'`
- **Overdue tasks**: `crm_tasks` where `due_at < now()` and `status = 'open'`
- **Uncontacted new leads**: `crm_leads` where `status = 'new'` and no activity exists
- **Today's calls count**: `calls` where `scheduled_at` is today
- **Recent activities** (global, last 10): `activities` ordered by `created_at desc`

All queries use existing Supabase tables. No schema changes needed.

#### Step 02 -- Create `TodayPrioritiesWidget` component

New file: `src/components/dashboard/TodayPrioritiesWidget.tsx`

- Receives overdue tasks, uncontacted leads, pending follow-ups from props
- Renders a Card with prioritized list items showing:
  - Overdue tasks with red indicators
  - Uncontacted new leads with CTA
  - Pending follow-up count
- Clean empty states per category ("Keine ueberfaelligen Aufgaben")

#### Step 03 -- Create `QuickActionsWidget` component

New file: `src/components/dashboard/QuickActionsWidget.tsx`

- Grid of action buttons (Link components to existing routes):
  - Lead anlegen -> `/app/leads` (or trigger CreateLeadDialog)
  - Aufgabe anlegen -> `/app/tasks`
  - CRM oeffnen -> `/app/crm`
  - Pipeline -> `/app/pipeline`
  - Calls -> `/app/calls`
  - Reports -> `/app/reports`
  - Angebot erstellen -> `/app/offers`
- Each button: icon + label, responsive grid (3-col mobile, 4-col desktop)
- Minimum 44px touch targets

#### Step 04 -- Create `RecentActivitiesWidget` component

New file: `src/components/dashboard/RecentActivitiesWidget.tsx`

- Fetches last 10 activities globally (new query in hook)
- Timeline-style list with type icons (call, email, meeting, note)
- Shows creator name, content snippet, relative time
- Empty state: "Noch keine Aktivitaeten erfasst"

#### Step 05 -- Create `CommunicationStatusWidget` component

New file: `src/components/dashboard/CommunicationStatusWidget.tsx`

- Shows today's call count, completed calls, pending calls from call queue data
- Sipgate connection status indicator (simple badge, not full SipgatePanel)
- Links to `/app/calls`

#### Step 06 -- Rebuild `AdminDashboard` layout

Refactor `src/components/dashboard/AdminDashboard.tsx`:

- Section 1: Expanded KPI grid (2x3 on desktop, 2-col on mobile) with 6 KPIs:
  - Gesamte Leads, Neue heute, Neue diese Woche, Aktive Kunden, Offene Aufgaben, Conversion Rate
- Section 2: `TodayPrioritiesWidget` (full width)
- Section 3: `QuickActionsWidget` (full width)
- Section 4: Pipeline + TopLeads (2-col grid)
- Section 5: CallQueue + CommunicationStatus (2-col grid)
- Section 6: Goals panel + remaining widgets (Analyses, Follow-ups, Avatar in 3-col grid)

Each section gets a subtle `<h2>` header for visual hierarchy.

#### Step 07 -- Update `DashboardDataReturn` type

Export new fields from the hook so they flow through to AdminDashboard props.

### Files Changed

| File | Action |
|------|--------|
| `src/hooks/useDashboardData.ts` | Extend with 5+ new queries |
| `src/components/dashboard/TodayPrioritiesWidget.tsx` | Create |
| `src/components/dashboard/QuickActionsWidget.tsx` | Create |
| `src/components/dashboard/RecentActivitiesWidget.tsx` | Create |
| `src/components/dashboard/CommunicationStatusWidget.tsx` | Create |
| `src/components/dashboard/AdminDashboard.tsx` | Full rebuild with sections |
| `src/components/dashboard/index.ts` | Add new exports |

### Data Sources

All data comes from existing tables -- no migrations needed:
- `crm_leads` (new leads today/week, uncontacted)
- `crm_tasks` (overdue, open)
- `pipeline_items` (pipeline stats)
- `calls` (today's calls)
- `activities` (recent activities feed)
- `call_queue_items` / `call_queues` (call queue)
- `followup_plans` (pending approvals)
- `members` (active member count)

Where live data is unavailable, professional empty states with actionable CTAs will be shown.

### Design Principles

- Section headers: `text-sm font-semibold uppercase tracking-wide text-muted-foreground`
- Consistent card padding, no overflow-x
- Mobile: single column stacking, 2-col KPI grid
- Desktop: multi-column grids as shown
- Existing widget components reused without modification (TopLeads, Pipeline, CallQueue, FollowupApprovals, CustomerAvatar, RecentAnalyses, GoalsMotivation)

