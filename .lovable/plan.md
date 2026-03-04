

# Plan: Social Media + Email Kampagnen Module (Phase A)

## Overview

Two new main modules added to the sidebar, accessible for `mitarbeiter` and above. Full database schema, RLS, hooks, pages, and components. KI Content Generator uses Lovable AI Gateway. Email sending uses existing Resend integration.

Due to the scale, Phase A is split into sequential implementation steps. Phase B (Stripe/Offer Landing) and Phase C (Zipgate/Franchise) are tracked as future tickets.

---

## Database Schema (single migration)

### Social Media Tables

```text
social_posts
├── id uuid PK
├── title text NOT NULL
├── platform text NOT NULL (instagram, tiktok, linkedin, facebook, youtube, x)
├── content_type text NOT NULL (post, reel, story, carousel, video, newsletter_teaser)
├── scheduled_at timestamptz
├── status text DEFAULT 'idee' (idee, produktion, geplant, veroeffentlicht)
├── hook text
├── caption text
├── assets jsonb DEFAULT '[]'
├── notes text
├── metrics jsonb DEFAULT '{}'
├── assigned_to uuid → profiles(id)
├── created_by uuid → profiles(id) NOT NULL
├── created_at / updated_at

social_library_items
├── id uuid PK
├── type text NOT NULL (hook, template, hashtag, story)
├── title text NOT NULL
├── content text
├── tags text[] DEFAULT '{}'
├── industry text
├── created_by uuid → profiles(id) NOT NULL
├── created_at / updated_at

social_strategy_settings
├── id uuid PK
├── posting_frequency jsonb DEFAULT '{}'
├── content_pillars jsonb DEFAULT '[]'
├── kpi_targets jsonb DEFAULT '{}'
├── updated_by uuid → profiles(id)
├── created_at / updated_at
```

### Email Campaign Tables

```text
email_templates
├── id uuid PK
├── name text NOT NULL
├── subject text NOT NULL
├── body_html text NOT NULL
├── variables text[] DEFAULT '{}'
├── created_by uuid → profiles(id) NOT NULL
├── created_at / updated_at

email_sequences
├── id uuid PK
├── name text NOT NULL
├── description text
├── trigger_type text (lead_registered, offer_created, offer_not_accepted, product_purchased)
├── trigger_config jsonb DEFAULT '{}'
├── status text DEFAULT 'draft' (draft, active, paused, archived)
├── is_preset boolean DEFAULT false
├── created_by uuid → profiles(id) NOT NULL
├── created_at / updated_at

email_sequence_steps
├── id uuid PK
├── sequence_id uuid → email_sequences(id) ON DELETE CASCADE
├── step_order integer NOT NULL
├── delay_minutes integer DEFAULT 0
├── template_id uuid → email_templates(id)
├── subject_override text
├── conditions jsonb
├── created_at

lead_sequence_enrollments
├── id uuid PK
├── lead_id uuid → crm_leads(id) NOT NULL
├── sequence_id uuid → email_sequences(id) NOT NULL
├── status text DEFAULT 'active' (active, paused, completed, unsubscribed)
├── current_step integer DEFAULT 0
├── enrolled_at timestamptz DEFAULT now()
├── completed_at timestamptz
├── created_at / updated_at

email_messages
├── id uuid PK
├── enrollment_id uuid → lead_sequence_enrollments(id) (nullable for broadcasts)
├── template_id uuid → email_templates(id)
├── lead_id uuid → crm_leads(id) NOT NULL
├── subject text NOT NULL
├── body_html text NOT NULL
├── status text DEFAULT 'queued' (queued, sent, delivered, failed, bounced)
├── sent_at timestamptz
├── message_type text DEFAULT 'sequence' (sequence, broadcast)
├── broadcast_id uuid (nullable)
├── resend_message_id text
├── created_at

email_events
├── id uuid PK
├── message_id uuid → email_messages(id) NOT NULL
├── event_type text NOT NULL (delivered, opened, clicked, bounced, unsubscribed)
├── metadata jsonb DEFAULT '{}'
├── created_at

email_broadcasts
├── id uuid PK
├── name text NOT NULL
├── template_id uuid → email_templates(id)
├── subject text NOT NULL
├── body_html text
├── segment_filter jsonb DEFAULT '{}'
├── status text DEFAULT 'draft' (draft, scheduled, sending, sent)
├── scheduled_at timestamptz
├── sent_at timestamptz
├── total_recipients integer DEFAULT 0
├── created_by uuid → profiles(id) NOT NULL
├── created_at / updated_at
```

### RLS Pattern

All tables: `has_min_role(auth.uid(), 'mitarbeiter')` for SELECT/INSERT/UPDATE. Admin for DELETE. Same pattern as existing CRM tables.

---

## Step 01 — Social Media: Calendar + CRUD + List

**Files created:**
- `src/types/social.ts` — TypeScript types
- `src/hooks/useSocialPosts.ts` — React Query CRUD hook
- `src/pages/app/SocialMedia.tsx` — Main page with Tabs (Kalender, Liste, Bibliothek, Generator, Einstellungen)
- `src/components/social/CalendarView.tsx` — Month/week calendar grid with status pills
- `src/components/social/ListView.tsx` — Table view with filters (platform, status, period, owner)
- `src/components/social/CreatePostDialog.tsx` — Quick-add modal (title, platform, date, status)
- `src/components/social/PostDetailModal.tsx` — Full edit view with all fields + metrics

**Routing:** `/app/social` in `App.tsx`, sidebar entry with `Share2` icon, `minRole: 'mitarbeiter'`.

---

## Step 02 — Social Media: Content Library

**Files created:**
- `src/hooks/useSocialLibrary.ts` — CRUD for library items
- `src/components/social/LibraryTab.tsx` — Tab content with category sub-tabs (Hooks, Templates, Hashtags, Story Scripts)
- `src/components/social/LibraryItemCard.tsx` — Card with "In Post ubernehmen" button
- `src/components/social/CreateLibraryItemDialog.tsx` — Create/edit dialog

---

## Step 03 — Social Media: AI Content Generator

**Files created:**
- `supabase/functions/generate-social-content/index.ts` — Edge function calling Lovable AI Gateway with structured tool-calling output (hook variants, caption, hashtags, story script, posting time)
- `src/components/social/GeneratorTab.tsx` — Form with platform, content type, goal, topic, tonality, CTA inputs. Output display with "Als Post planen" and "In Bibliothek speichern" buttons.

**Config:** Add `[functions.generate-social-content]` with `verify_jwt = false` to `config.toml`.

---

## Step 04 — Social Media: Strategy Settings

**Files created:**
- `src/hooks/useSocialStrategy.ts` — Read/upsert singleton
- `src/components/social/SettingsTab.tsx` — Posting frequency per platform, content pillars editor, KPI targets

---

## Step 05 — Email Campaigns: Templates

**Files created:**
- `src/types/email.ts` — TypeScript types for all email entities
- `src/hooks/useEmailTemplates.ts` — CRUD hook
- `src/pages/app/EmailCampaigns.tsx` — Main page with Tabs (Sequenzen, Broadcasts, Templates, Analytics)
- `src/components/email/TemplateList.tsx` — List with preview
- `src/components/email/TemplateEditor.tsx` — Editor with variable support, live preview
- `src/components/email/TemplateSendTest.tsx` — Test send to admin email

**Routing:** `/app/email` in `App.tsx`, sidebar entry with `Mail` icon, `minRole: 'mitarbeiter'`.

---

## Step 06 — Email Campaigns: Sequences + Steps

**Files created:**
- `src/hooks/useEmailSequences.ts` — CRUD for sequences + steps
- `src/components/email/SequenceList.tsx` — List with status badges
- `src/components/email/SequenceEditor.tsx` — Visual step builder (delay, template, conditions)
- `src/components/email/SequenceEnrollments.tsx` — View enrolled leads

**Preset sequences** inserted via migration:
1. Freebie Follow-up (0/1/3/7 days) → Upsell 499EUR
2. Angebot Follow-up (1/3/5 days) → Reminder + Trust
3. Kunden Onboarding (after purchase) → Portal activation

---

## Step 07 — Email Campaigns: Sending Engine

**Files created:**
- `supabase/functions/send-campaign-email/index.ts` — Edge function that sends via Resend (from `info@krs-signature.de`), logs to `email_messages`, creates tracking pixel URL and link wrapping
- `supabase/functions/email-tracker/index.ts` — Public endpoint for open pixel + click tracking, writes to `email_events`
- `supabase/functions/process-email-queue/index.ts` — Cron-like function that processes queued emails from `email_messages` where status='queued' and scheduled time has passed

**Config:** All three functions added to `config.toml` with `verify_jwt = false`.

---

## Step 08 — Email Campaigns: Broadcasts

**Files created:**
- `src/hooks/useEmailBroadcasts.ts` — CRUD hook
- `src/components/email/BroadcastEditor.tsx` — Segment selection (all leads, by status/stage, customers), template or ad-hoc content, schedule or send now

---

## Step 09 — Email Campaigns: Analytics Dashboard

**Files created:**
- `src/hooks/useEmailAnalytics.ts` — Aggregation queries for open/click/conversion rates
- `src/components/email/AnalyticsTab.tsx` — Charts (recharts) for Open Rate, Click Rate, Conversion Rate, Top Sequences, Top Templates, Bounce/Unsubscribe

---

## Step 10 — Auto-Enrollment Triggers

**Database triggers** (migration):
- After INSERT on `crm_leads` → enroll in active sequences with `trigger_type = 'lead_registered'`
- After INSERT on `offers` → enroll lead in `trigger_type = 'offer_created'`
- After UPDATE on `orders` (status → 'paid') → enroll in `trigger_type = 'product_purchased'`

A scheduled check for "offer not accepted after X days" handled by `process-email-queue` function.

---

## Technical Notes

- All hooks follow the existing `useQuery`/`useQueryClient` pattern from `useLeads.ts`.
- UI uses existing shadcn components (Card, Tabs, Table, Dialog, Select, Calendar, Badge).
- Brand orange as primary accent (existing theme), status pills use semantic colors.
- Tables that reference `profiles(id)` use `get_user_profile_id(auth.uid())` in RLS.
- AI generator uses tool-calling for structured JSON output (no streaming needed for this use case).
- Email sending uses `info@krs-signature.de` as sender via Resend.
- The `types.ts` file auto-updates after migration; all new tables accessed via `.from('table_name')` with type assertions.

---

## Not in This Phase

- Phase B: Stripe Payment for offers, offer landing page improvements
- Phase C: Zipgate call integration, franchise/partner blueprint
- These will be addressed as separate follow-up tickets after Phase A is stable.

