

# Plan: Email Automation Engine — Auto-Enrollment Triggers + Queue Enhancement + Seed Data

## Current State

- **Tables exist**: `email_sequences`, `email_sequence_steps`, `lead_sequence_enrollments`, `email_messages`
- **2 preset sequences** already seeded: "Freebie Follow-up" (4 steps) and "Kunden Onboarding" (3 steps), both in `draft` status
- **No triggers** exist for auto-enrollment
- **No email templates** exist yet — steps use `subject_override` but no `template_id`
- **`offers` and `orders` tables** exist with `lead_id` columns
- **Missing**: "Angebot Follow-up" sequence

---

## Step 01 — Database Migration: Triggers + Functions

Create 3 SECURITY DEFINER functions + 3 triggers:

**Function `enroll_lead_in_sequences(lead_id, trigger_type)`**
- Shared logic: finds all `email_sequences` where `status = 'active'` and `trigger_type` matches
- Inserts into `lead_sequence_enrollments` with `status = 'active'`, `current_step = 0`
- Uses `ON CONFLICT DO NOTHING` to prevent duplicate enrollments

**Trigger 1**: `AFTER INSERT ON crm_leads` → calls enroll with `'lead_registered'`

**Trigger 2**: `AFTER INSERT ON offers` → calls enroll with `'offer_created'` using `NEW.lead_id`

**Trigger 3**: `AFTER UPDATE ON orders` → when `NEW.status = 'paid' AND OLD.status != 'paid'` → calls enroll with `'product_purchased'` using `NEW.lead_id`

---

## Step 02 — Seed Data: Missing Sequence + Templates

Using the insert tool (not migration):

1. **Create 10 email templates** (one per step across all 3 sequences):
   - `freebie_welcome`, `freebie_value`, `upsell_offer`, `last_call`
   - `offer_reminder`, `trust_case`, `last_chance`
   - `portal_access`, `system_setup`, `support_invite`
   - Each with placeholder `body_html` using `{{first_name}}` and `{{company}}` variables

2. **Insert "Angebot Follow-up" sequence** with `trigger_type = 'offer_created'`, 3 steps (1440/4320/7200 min delays)

3. **Link existing steps** to their templates via `UPDATE email_sequence_steps SET template_id = ...`

4. **Activate all 3 sequences**: `UPDATE email_sequences SET status = 'active'`

---

## Step 03 — Enhance `process-email-queue` Edge Function

Extend the function to do two things:

**Part A — Generate queued emails from enrollments**:
- Query `lead_sequence_enrollments` where `status = 'active'`
- For each enrollment, find the next step (`current_step + 1`)
- Check if an `email_message` already exists for this enrollment + step
- If not, calculate `scheduled_at = enrolled_at + step.delay_minutes`
- If `scheduled_at <= now()`, create the message from the step's template (or `subject_override`)
- Update enrollment's `current_step`; if last step → set `status = 'completed'`

**Part B — Send queued emails** (existing logic, enhanced):
- Query `email_messages` where `status = 'queued'` AND `scheduled_at <= now()`
- Send via `send-campaign-email` (existing)
- Variable replacement (existing)

---

## Files Changed

| File | Change |
|------|--------|
| New migration SQL | 1 function + 3 triggers |
| Seed data (insert tool) | 10 templates, 1 sequence + 3 steps, link template_ids, activate |
| `supabase/functions/process-email-queue/index.ts` | Add enrollment processing logic before send loop |

No UI changes. No new dependencies.

