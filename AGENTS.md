# AGENTS.md — Zoovia

Codex: read this first. If anything conflicts with my prompt, ask a single clarifying question OR follow my prompt.

## 1) What we're building (one sentence)
Zoovia is a two-sided marketplace for UK dog kennel boarding: kennel operators on the supply side, dog owners on the demand side, built phase by phase.

## 2) Current focus
We are building **Phase 1 (Listings Foundation)** and **Phase 2 (Enquiry Management)**.

See `EPICS.md` for the five epics covering these two phases. See `PRODUCT.md` for the full six-phase roadmap.

## 3) Scope boundary for current phases

### In scope (Phase 1 & 2)
- Kennel profile pages (seeded from AAL register data, claimable by operators)
- Claim-your-listing flow (identity verification, profile enrichment)
- Public booking enquiry form per kennel (the intake form already built)
- Enquiry inbox: list, detail, status transitions (new / needs-info / accepted / rejected)
- Dog and owner profiles created at point of enquiry
- Email notifications (to operator on new enquiry; to owner on status change)
- Internal notes on enquiries

### Out of scope (do not build yet)
- Payments, deposits, invoicing
- Online booking with instant confirmation
- Live availability calendar exposed to dog owners
- AAL compliance records (vaccination log, incident log)
- WhatsApp integration
- Staff rota, active stay management
- Roles/permissions, multi-user teams
- Data migration tools
- Anything in Phases 3–6

Rule of thumb: if it would appear on the Phase 3–6 roadmap in `PRODUCT.md`, it is out of scope now.

## 4) Product rules
- Prefer boring, reliable, minimal workflows.
- Manual processes are acceptable if they validate value.
- Never add a feature unless it (a) reduces inbound chaos, or (b) increases operator willingness to pay.

## 5) Execution policy
When asked for multi-step work:
- Use the template in `PLANS.md` to create a concrete plan, then implement.
- Keep changes small; ship vertical slices.
- Reset `PLANS.md` to template when complete.

Definition of done for any change:
- Tests added/updated for all new or changed behaviour, and all required test commands executed successfully
- Lints/format passes
- No PII in logs
- README/PRODUCT updated if behaviour changes
- RLS policies updated/validated for any new table or access path

## 6) Testing & quality gates (non-negotiable)

Tests are part of the feature. No new functionality is complete without them.

### Mandatory rules
- For **any new functionality or behaviour change**, add or update tests.
- For **any bug fix**, add a regression test that would fail without the fix.
- For **any API route, server action, Supabase query, or RLS policy**, add at least one integration test (or explicitly justify why it is impractical).

### Required test execution
After any code change, run:

1) `pnpm lint`
2) `pnpm test`

If the change touches **data access, auth, routing, or backend logic**, also run:
3) `pnpm test:integration`

If the change affects a **core user flow** (enquiry submission, inbox triage):
4) `pnpm e2e`

Work is not complete if any required command fails.

### Handling failures
- If tests fail due to your changes, fix them before proceeding.
- If failures are pre-existing or flaky, document this clearly and propose a fix in the PR summary.

### Output expectations
Every PR or change summary must include a **Verification** section stating:
- Which test commands were run
- What tests were added or updated
- Any remaining known risks

## 7) Tech choices

Default stack:
- Next.js (App Router) + TypeScript
- Hosting: Vercel
- Database: Supabase Postgres
- ORM: none (NO Prisma)
- Data access: Supabase JS client
- Auth: Supabase Auth for kennel operator accounts
- Authorization: Supabase Row Level Security (RLS) from day one
- Email: Resend (or equivalent) via a small provider interface

Rules:
- Never use Prisma in this project.
- Do not connect directly to Postgres from Vercel functions; use Supabase JS client.
- Use `SUPABASE_SERVICE_ROLE_KEY` only in server-side code (route handlers / server actions).
- Use `SUPABASE_ANON_KEY` for client-side reads/writes governed by RLS.

## 8) Security & privacy (non-negotiable)
We store owner and dog details strictly to:
- Process booking enquiries
- Enable repeat bookings with less friction

We do NOT use stored data for:
- Marketing
- Cross-kennel promotion
- Behavioural profiling

Rules:
- Treat all inputs as sensitive.
- Do not log PII (emails, phone numbers, notes, vaccination dates).
- Vaccination data is date-only (no document uploads in Phase 1/2).
- Internal notes must not be framed as medical records.

Any reuse beyond enquiry processing and rebooking requires explicit user consent.

## 9) Data model (current phases)

**Core:**
- `organisations` — the business entity. Seeded from AAL register data; exists before any operator claims it. Fields: name, slug, licence_region, street_address, locality, region, postcode, telephone, contact_email, website, is_claimed.
- `user_profiles` — extends auth.users. type = 'owner' (dog owner) or 'operator' (kennel operator, org_id set). No separate permissions table until Phase 3.

**Operator config (Phase 2):**
- `capacity_settings` — max_dogs_total, max_dogs_by_size, min_notice_days. FK → organisations.
- `blackout_dates` — date, reason. FK → organisations.

**Enquiry management (Phase 2):**
- `booking_requests` — dates, status (new / needs-info / accepted / rejected). FKs → organisations + dogs + user_profiles.
- `dogs` — name, breed, size_category, vaccination_expiry_date, internal_notes. FKs → user_profiles (the owner's account) + organisations.
- `internal_notes` — free text, private to the organisation. FKs → organisations + booking_requests.

Dog owners are `user_profiles` records with type='owner'. There is no separate `owners` table. Dog owners must sign up to submit an enquiry; the sign-up gate appears after the form is filled, not before (implemented in `components/booking-form.tsx`). See DECISIONS.md for the two ADRs covering this.

All tables use `org_id` as the FK to organisations. Never `kennel_id`.

**Gotchas worth knowing before touching this schema again (app code was fully migrated 2026-08-19, see that commit):**
- `user_profiles.id` IS the `auth.users` id (primary key references it directly) — there is no separate `user_id` column. Query a caller's own profile with `.eq("id", user.id)`, not `.eq("user_id", user.id)`.
- Owner email lives only in `auth.users`, never in `user_profiles`. Reading it server-side requires `supabase.auth.admin.getUserById()` on a service-role client.
- RLS has no policy letting an operator read another user's `user_profiles` row directly (only `auth.uid() = id`). Staff routes that need owner name/phone/email (dogs list, owner detail, request detail/list) authorize the caller with the RLS-bound client first, then read cross-owner data with the service-role client.
- `dogs` has a `unique (user_id, name)` constraint — a dog's identity is scoped to its owner, not to the org. The same dog name enquiring at a second kennel will move that dog's `org_id`, not create a second row.
- `user_profiles` has no `role` column (team roles are Phase 3, out of scope) and `organisations` has no `notify_*` columns (email sending, EP-03 F5/F6, isn't built yet). Don't reintroduce either without a schema change.
- `booking_requests` has no `contact_opt_in` column.
- `organisations.postcode` is `not null`. `scripts/seed-organisations.ts` upserts in batches of 100 — one row with a blank postcode fails the *whole batch*, not just that row (filtered out with a warning before batching, as of 2026-08-19). `organisations` is seeded (1,222 rows, from `scripts/data/kennels.csv`, gitignored — not in the repo).

## 10) Common commands
- Install: `pnpm i`
- Dev: `pnpm dev`
- Test: `pnpm test`
- Lint: `pnpm lint` *(currently broken — Next 16 removed `next lint`; no replacement wired up yet)*

Create `test:integration` and `e2e` scripts if missing; keep them passing. **There is currently no test suite in this repo at all**, despite §6 above — a known, unaddressed gap, not a green baseline to assume. `next.config.mjs` also sets `typescript.ignoreBuildErrors: true` to work around a `@supabase/supabase-js` v2.45 generic-inference bug that otherwise floods `tsc` with spurious `does not exist on type 'never'` errors on every Supabase query — pre-existing, not a signal of real type errors.

## 11) Style
- Small functions, explicit naming, no clever abstractions.
- Prefer server actions / route handlers that are easy to test.
- Always include "why" in comments for business rules.

## 12) If uncertain
Ask exactly one question; otherwise choose the simplest approach consistent with this file.
