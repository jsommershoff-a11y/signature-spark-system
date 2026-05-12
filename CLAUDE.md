# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`signature-spark-system` is the web/mobile front end and Supabase backend for **dein-automatisierungsberater.de** / "KI Automationen" — a SaaS platform combining a public marketing site, CRM/sales pipeline, member portal, learning academy, and admin console for KRS Immobilien GmbH. The app is also packaged as a native iOS/Android app via Capacitor (see `SOP_IOS_BUILD.md`).

The project was bootstrapped with Lovable (`lovable.dev`) — changes pushed here are mirrored back into Lovable, and `lovable-tagger` runs as a Vite plugin in dev mode for component tagging.

## Common Commands

```sh
npm i                   # install (or `bun install` — both bun.lockb and package-lock.json are committed)
npm run dev             # Vite dev server on port 8080 (host "::")
npm run build           # production build (drops console.* and debugger via esbuild)
npm run build:dev       # build in development mode
npm run preview         # preview the production build
npm run lint            # eslint over the repo
npm run test            # vitest run (one-shot)
npm run test:watch      # vitest in watch mode
npx vitest run path/to/file.test.ts          # run a single test file
npx vitest run -t "name of test"             # filter by test name
```

Supabase Edge Functions (Deno) are deployed individually:

```sh
supabase secrets set OPENAI_API_KEY=sk-...   # never put OPENAI keys in VITE_* / frontend env
supabase functions deploy <function-name>    # e.g. chatgpt, generate-offer-from-product, analyze-call
```

There is **no local Supabase stack** wired up in this repo — migrations under `supabase/migrations/` and functions under `supabase/functions/` are deployed against the remote project (`onbxoflsgrwdszjltnge`, see `supabase/config.toml`). Use the Supabase MCP tools or CLI against that project rather than expecting `supabase start` to work out-of-the-box.

## Architecture

### Stack
- **Vite 5 + React 18 + TypeScript** with `@vitejs/plugin-react-swc`. Path alias `@` → `src`.
- **Tailwind CSS** + **shadcn/ui** (components in `src/components/ui/`, configured via `components.json`). Brand tokens (orange `--primary`, Tannengrün `--accent`, cream background) are defined in `src/index.css` and re-exported in `tailwind.config.ts`. **Always use semantic Tailwind tokens (`bg-primary`, `text-success`, `bg-accent`) — never hard-coded hex/rgb.**
- **React Router v6** (single `BrowserRouter` in `src/App.tsx`).
- **TanStack Query v5** for all server state. The single `QueryClient` lives in `App.tsx` with `staleTime: 2min`, `gcTime: 5min`, `refetchOnWindowFocus: true`, `retry: 1`. On sign-in/out, `AuthContext` invalidates/clears the cache.
- **react-hook-form + zod** for forms, **sonner** + shadcn `<Toaster />` for toasts, **lucide-react** for icons, **recharts** for charts.
- **Supabase JS** for auth, DB queries (RLS), realtime, storage, and edge function invocation.
- **Capacitor 8** wraps the build into iOS/Android apps; `capacitor.config.ts` points the native shell at the hosted Lovable preview URL.

### Routing & layout layers
`src/App.tsx` is the routing source of truth. Three layers:
1. **Public landing pages** under `/` (`src/pages/landing/*`) — marketing pages, legal, newsletter, bundle pages. `CookieConsentBanner` and `ReferralTracker` mount globally.
2. **Auth pages** (`/auth`, `/reset-password`, `/email-consent/*`).
3. **Protected app** under `/app` rendered by `AppLayout` (`src/components/app/`). Inside, `/app/admin` is rendered by `AdminLayout` (left sub-nav on desktop, horizontal scroll on mobile — see `ADMIN_UI_GUIDELINES.md`).

Route guarding goes through `<ProtectedRoute>` (`src/components/ProtectedRoute.tsx`) with two props:
- `requiredRole` — exact role match
- `requireMinRole` — role hierarchy check (see `src/lib/roles.ts`)

### Auth & roles
`AuthContext` (`src/contexts/AuthContext.tsx`) wraps the app and exposes `user`, `session`, `profile`, `roles`, `effectiveRole`, plus role helpers. Two key concepts:

- **Role hierarchy** in `src/lib/roles.ts`: `admin (100)` > `vertriebspartner / gruppenbetreuer (50)` > `member_pro (30)` > `member_starter (20)` > `member_basic (10)` > `guest (0)`. Use `hasMinRole()` and the `STAFF_ROLES` / `MEMBER_ROLES` constants — never hard-code role strings in checks.
- **Admin "View-As"**: real admins can impersonate a lower role for UI testing; this is persisted in `sessionStorage` (`admin_viewAsRole`). `hasRole`/`hasMinRole` always return `true` for real admins (so they aren't locked out), while UI-only checks use `effectiveRole`. Be careful which one a feature needs.

Roles are loaded from the `user_roles` table; profile from `profiles`. On `SIGNED_IN` the context inserts a row into `portal_login_events`.

### Supabase integration
- Client: `src/integrations/supabase/client.ts` (anon key is committed — RLS is the security boundary). Import via `@/integrations/supabase/client`.
- DB types: `src/integrations/supabase/types.ts` is **auto-generated** — do not hand-edit. Regenerate via the Supabase CLI / MCP `generate_typescript_types` after schema changes.
- Migrations live in `supabase/migrations/` (140+ files, timestamp-prefixed). New migrations should be appended, never edited in place once shipped.
- Edge functions live in `supabase/functions/<name>/index.ts` (Deno runtime). Shared helpers (`openai.ts`, `crm.ts`, `webhook-logger.ts`, etc.) live in `supabase/functions/_shared/`. JWT verification can be disabled per-function in `supabase/config.toml` — only do this for public webhooks (Stripe, Sipgate, inbound email, newsletter confirm, etc.).

### Data layer pattern
Every domain has a hook in `src/hooks/use<Domain>.ts` that wraps `useQuery` / `useMutation` against Supabase. Components consume the hook — they should not call `supabase.from(...)` directly. Examples: `usePipeline`, `useLeads`, `useOffers`, `useTasks`, `useCalls`, `useCustomers`, `useTrialStatus`. Mutations invalidate their own query keys; the auth context invalidates everything on session changes.

### CRM / Pipeline domain
This is the largest domain. Critical files:
- `src/types/crm.ts` — **single source of truth** for `PipelineStage`, `LeadSourceType`, `TaskType`, plus `PIPELINE_STAGE_LABELS`, `PIPELINE_STAGE_HINTS`, `PIPELINE_STAGE_TOOLTIPS` lookups.
- `src/lib/pipeline-stage.ts` — UI helpers (`getStageLabel`, `getStageTooltip`, `getPriorityTier`, `getPriorityTone`, `STAGE_LABEL_WRAP_CLASS`, etc.). All pipeline UI **must** read labels and priority styling through these helpers — do not duplicate stage-color logic in components.
- `src/lib/sales-scripts/` — static sales-script playbooks per stage (`stage-playbook.ts`), follow-up/outreach/objection content. Pure local constants, no backend.
- `src/components/crm/` — `PipelineBoard`, `PipelineColumn`, `PipelineCard`, `PipelineFilters`, `LeadDetailSidebar` (used from `/app/pipeline`), `LeadDetailModal` (used from `/app/leads`), `StageTransitionDialog` (drag-drop confirmation w/ per-stage follow-up actions).

Pipeline stages flow: `new_lead → setter_call_scheduled → setter_call_done → analysis_ready → offer_draft → offer_sent → payment_unlocked → won` (plus terminal `lost`).

### Admin console
`src/pages/app/admin/*` + `src/components/admin/*`. Layout, KPI tiles, tables, and integration-grid styling are documented in `ADMIN_UI_GUIDELINES.md` — follow it when adding admin pages (PageHeader on top, KPI tiles via `<Tile />` pattern, status badges, settings tabs with `bg-muted/60` triggers).

### Other notable areas
- **Email/Inbox hubs**: `EmailHub` and `InboxHub` consolidate older standalone routes — legacy paths (`/app/email-kampagnen`, `/app/outlook`, `/app/tickets`, etc.) are kept as `<Navigate>` redirects. Add new email/inbox features as tabs inside the hubs, not as new top-level routes.
- **Offers**: `src/pages/Offer.tsx` is the **public** offer view (`/offer/:token`); `src/pages/app/Offers.tsx` and `OfferDetail.tsx` are internal. Edge functions `generate-offer-*` and `send-offer-email` handle PDF generation and delivery.
- **OpenAI**: never call OpenAI from the browser. All LLM calls go through edge functions (`chatgpt`, `analyze-call`, `generate-social-content`, `generate-offer-from-product`, `mail-ocr-classify`) using `_shared/openai.ts`, which normalizes models (strips sampling params for `gpt-5*`/`o*`, maps `max_tokens` → `max_completion_tokens`).
- **Analytics & consent**: `src/lib/consent.ts` + `CookieConsentBanner` gate analytics. `initApolloAutoload()` (called once in `App.tsx`) only loads Apollo after marketing consent — DSGVO requirement, do not bypass.
- **Feature flags**: `src/config/feature-flags.ts`. Prefer flags over deleting code when introducing risky changes.

### Tests
Vitest + jsdom + Testing Library. Setup file `src/test/setup.ts` mocks `matchMedia`. Tests live next to source (`*.test.ts(x)`) — see `src/lib/analytics.test.ts`, `src/lib/webhook-verify.test.ts`, `src/components/crm/__tests__/`. Coverage is sparse; new tests are welcome but not enforced.

## Conventions & gotchas

- **Comments and docs are German.** Most existing docstrings, route labels, and UI strings are German (the product is German-only). Keep new user-facing copy in German; code comments may be either, but match the file's existing language.
- **Single source of truth for stage/role/label lookups** — extend `src/types/crm.ts`, `src/lib/roles.ts`, `src/lib/pipeline-stage.ts` rather than redefining values in components.
- **Console statements are stripped in production builds** (see `vite.config.ts` `esbuild.drop`). Don't rely on `console.*` for user-visible behavior; use `sonner` toasts or the in-app notifications system (`useNotifications`).
- **shadcn aliases** are configured (`@/components`, `@/components/ui`, `@/hooks`, `@/lib`, `@/lib/utils`). Add new shadcn components via the standard CLI so they land in `src/components/ui/`.
- **`.env`** holds `VITE_SUPABASE_*` only (anon key, project URL). Service-role keys and OPENAI/Stripe/Sipgate/etc. secrets belong in Supabase function secrets, never in `VITE_*`.
- **Route mutations**: when consolidating routes, leave a `<Navigate replace>` for the old path (see `/app/email-*`, `/app/outlook`, `/app/tickets`, `/app/members` for examples) so external links keep working.
- **Mobile**: many layouts switch from drawer/`Sheet` on mobile to inline panels on desktop (`md:`/`lg:` breakpoints, plus a custom `xs: 400px` breakpoint). Test both.

## Reference docs in this repo
- `README.md` — Lovable workflow, ChatGPT/edge-function setup snippets.
- `ADMIN_UI_GUIDELINES.md` — admin layout, color tokens, KPI tiles, table patterns. Read before touching `/app/admin/*`.
- `SOP_IOS_BUILD.md` — Apple Developer enrollment + iOS build/release pipeline (Lovable export, EAS, Xcode Cloud).
- `.lovable/plan.md` — historical step plan for pipeline UX work; useful context, not a current spec.
