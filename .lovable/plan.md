

## Realtime Call-Center Layer for Sipgate Integration

### Current State

- **Webhook** (`sipgate-webhook/index.ts`): Already handles `newCall`, `answer`, `hangup` events, inserts into `calls` table, creates activities on hangup, matches leads by phone number
- **Frontend**: No realtime subscription on `calls` table. No incoming call popup. No auto-follow-up task creation
- **Tables**: `calls` table exists with all needed columns. `crm_leads` has `phone` but no `mobile`/`whatsapp_number` columns (matching only via `phone`)
- **Dashboard**: `CommunicationStatusWidget` and `CallQueueWidget` already exist

### Architecture

The `calls` table already receives INSERTs from the webhook. Supabase Realtime can subscribe to these changes directly — no additional broadcast mechanism needed. The frontend subscribes to `INSERT` and `UPDATE` on `calls` where `provider = 'sipgate'`, then shows a popup overlay.

```text
Sipgate → webhook → INSERT calls table
                          ↓
              Supabase Realtime (postgres_changes)
                          ↓
              Frontend subscription (useIncomingCall hook)
                          ↓
              IncomingCallPopup overlay in AppLayout
```

### Implementation Steps

#### Step 01 — Create `useIncomingCall` hook

**File**: `src/hooks/useIncomingCall.ts`

- Subscribe to Supabase Realtime on `calls` table for `INSERT` events
- When a new call with `status = 'in_progress'` and `provider = 'sipgate'` arrives with `meta.direction = 'INCOMING'`:
  - Fetch lead details if `lead_id` exists
  - Fetch last activity for that lead
  - Set state to show the popup
- Subscribe to `UPDATE` events on same table to track status changes (in_progress → completed/failed)
- Track call duration with a timer (setInterval)
- Auto-dismiss popup 30s after call ends
- Provide `dismiss`, `minimize` toggle
- Clean up subscription on unmount

#### Step 02 — Create `IncomingCallPopup` component

**File**: `src/components/calls/IncomingCallPopup.tsx`

- Fixed-position overlay (bottom-right desktop, bottom-center mobile)
- States: `ringing` → `active` → `ended`
- Shows:
  - Lead name + company (or raw phone number if no match)
  - Lead status badge
  - Last activity snippet
  - Live call duration timer
  - Status indicator (pulsing green for active, red for ended)
- Action buttons:
  - "Call öffnen" → navigate to `/app/calls/{id}`
  - "Lead öffnen" → navigate to `/app/crm` or lead detail
  - "Notiz hinzufügen" → open inline textarea, save as activity
- Minimizable: collapses to a small pill showing phone icon + duration
- Mobile: full-width bottom bar when minimized, slide-up card when expanded
- z-index above everything except dialogs

#### Step 03 — Integrate popup into AppLayout

**File**: `src/components/app/AppLayout.tsx`

- Import and render `IncomingCallPopup` inside the layout (always mounted)
- Only show for users with `mitarbeiter` role or above

#### Step 04 — Enhance webhook for follow-up task creation

**File**: `supabase/functions/sipgate-webhook/index.ts`

On `hangup` event, after updating the call record:
- Check if a follow-up task already exists for this lead (query `crm_tasks` where `lead_id` matches and `status = 'open'` and `type = 'follow_up'`)
- If none exists, create one:
  - `title`: "Follow-up nach Telefonat"
  - `due_at`: tomorrow
  - `assigned_user_id`: `leadMatch.owner_user_id`
  - `lead_id`: matched lead
  - `type`: 'follow_up'
  - `status`: 'open'

#### Step 05 — Enhance webhook lead matching

**File**: `supabase/functions/sipgate-webhook/index.ts`

Current matching only checks `phone`. Extend to also handle calls where no lead is found:
- When no lead matches, still insert the call with `lead_id` set to a dummy or null — but the `calls` table requires `lead_id` (NOT NULL). We'll need to check if we can handle unknown contacts.

Looking at the schema: `lead_id` on `calls` is `NOT NULL`. So for unknown contacts, we cannot insert without a lead. The current webhook already only inserts when `leadMatch` exists. We'll keep this behavior but add a `meta.unknown_contact = true` flag and a console log. The popup will handle missing lead gracefully by showing the phone number.

#### Step 06 — Update Dashboard KPIs

**File**: `src/hooks/useDashboardData.ts`

Add query for missed calls today (calls where `status = 'failed'` and `started_at >= today`). This data already flows into `CommunicationStatusWidget` via `todayCalls` — it already counts missed. No changes needed here.

### Files Changed

| File | Action |
|------|--------|
| `src/hooks/useIncomingCall.ts` | Create — Realtime subscription + state management |
| `src/components/calls/IncomingCallPopup.tsx` | Create — Popup UI component |
| `src/components/app/AppLayout.tsx` | Edit — Mount IncomingCallPopup |
| `supabase/functions/sipgate-webhook/index.ts` | Edit — Add follow-up task creation on hangup |

### No Schema Changes Needed

All data uses existing tables (`calls`, `crm_tasks`, `activities`, `crm_leads`). Supabase Realtime works on existing `calls` table via `postgres_changes`.

### Realtime Requirement

Supabase Realtime must be enabled for the `calls` table. This is typically enabled by default for all tables. The subscription uses:
```typescript
supabase.channel('incoming-calls')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'calls' }, handler)
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'calls' }, handler)
  .subscribe()
```

### What's Already Live vs Fallbacks

- **Live**: Call recording, lead matching, activity logging, call status tracking — all via existing webhook
- **Fallback**: If no lead matches, popup shows raw phone number. If Sipgate not connected, no events fire (silent)
- **Auto follow-up**: New — created server-side in webhook on hangup

