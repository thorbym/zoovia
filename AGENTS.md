# AGENTS.md — Zoovia

Read this first. If anything here conflicts with my prompt, ask a single clarifying question OR follow my prompt.

## 1) What we're building
Zoovia is a two-sided marketplace for UK dog kennel boarding: kennel operators on the supply side, dog owners on the demand side, built phase by phase.

Current focus: **Phase 1 (Listings Foundation)** and **Phase 2 (Enquiry Management)** — EP-01 to EP-05 in `EPICS.md`. Full roadmap in `PRODUCT.md`.

## 2) Scope boundary
In scope: kennel profile pages seeded from AAL register data, claim-your-listing flow, public enquiry form, enquiry inbox (list / detail / status transitions), dog and owner profiles created at enquiry, notification emails, internal notes.

Out of scope: anything on the Phase 3–6 roadmap in `PRODUCT.md` — payments, instant booking, availability calendar, AAL compliance records, WhatsApp, rota/stay management, team roles and permissions, data migration tools.

## 3) Product rules
- Prefer boring, reliable, minimal workflows. Manual processes are fine if they validate value.
- Never add a feature unless it (a) reduces inbound chaos, or (b) increases operator willingness to pay.

## 4) Execution policy
For multi-step work: plan in `PLANS.md` using its template, implement, then reset `PLANS.md`. Keep changes small; ship vertical slices.

Definition of done:
- Tests added/updated for new or changed behaviour, and the required test commands below run clean
- Lint/format passes; no PII in logs
- RLS policies updated/validated for any new table or access path
- `PRODUCT.md` / `EPICS.md` updated if behaviour or scope changes

## 5) Testing gates (non-negotiable)
Tests are part of the feature. Any behaviour change gets a test; any bug fix gets a regression test that would fail without it; any API route, server action, Supabase query, or RLS policy gets at least one integration test (or an explicit justification why not).

Run after any code change: `pnpm lint`, `pnpm test`. Add `pnpm test:integration` for data access, auth, routing, or backend logic. Add `pnpm test:e2e` for core user flows (enquiry submission, inbox triage). Work is not complete if a required command fails — fix your own breakage; document pre-existing or flaky failures in the change summary.

Every change summary needs a **Verification** section: commands run, tests added/updated, remaining risks.

## 6) Tech choices
Next.js (App Router) + TypeScript on Vercel; Supabase Postgres via the Supabase JS client; Supabase Auth for operator accounts; RLS from day one; Resend (or equivalent) behind a small provider interface.

- No ORM. **Never use Prisma.**
- Never connect directly to Postgres from Vercel functions — use the Supabase JS client.
- `SUPABASE_SERVICE_ROLE_KEY` server-side only (route handlers / server actions). `SUPABASE_ANON_KEY` for client-side access governed by RLS.

## 7) Security & privacy (non-negotiable)
Owner and dog details are stored only to process booking enquiries and reduce friction on repeat bookings — never for marketing, cross-kennel promotion, or behavioural profiling. Any reuse beyond that needs explicit user consent.

- Treat all inputs as sensitive. Never log PII (emails, phone numbers, notes, vaccination dates).
- Vaccination data is date-only — no document uploads in Phase 1/2.
- Internal notes must not be framed as medical records.

## 8) Data model (current phases)
- `organisations` — the business entity, seeded from AAL register data before any operator claims it. name, slug, licence_region, address fields, postcode, telephone, contact_email, website, latitude, longitude, `claim_status` (unclaimed / pending_verification / claimed / rejected). Unclaimed listings are public by default; there is no visibility/hidden field. latitude/longitude are nullable, geocoded via postcodes.io by `scripts/geocode-organisations.ts` and `scripts/seed-organisations.ts` (see `scripts/lib/geocode.ts`) — no licence_number or star_rating columns exist (2026-08-19 decision).
- `user_profiles` — extends `auth.users`. `type` = 'owner' or 'operator' (operators have `org_id` set). Dog owners are `user_profiles` rows — there is no `owners` table.
- `capacity_settings` — max_dogs_total, max_dogs_by_size, min_notice_days. FK → organisations.
- `blackout_dates` — date, reason. FK → organisations.
- `booking_requests` — dates, status (new / needs-info / accepted / rejected). FKs → organisations, dogs, user_profiles.
- `dogs` — name, breed, size_category, vaccination_expiry_date, internal_notes. FKs → user_profiles, organisations.
- `internal_notes` — free text, private to the organisation. FKs → organisations, booking_requests.

The FK to organisations is always `org_id`, never `kennel_id`.

### Gotchas (app layer migrated onto this schema 2026-08-19)
- `user_profiles.id` **is** the `auth.users` id — there is no `user_id` column. Query a caller's own profile with `.eq("id", user.id)`.
- Owner email lives only in `auth.users`. Reading it server-side needs `supabase.auth.admin.getUserById()` on a service-role client.
- RLS lets a user read only their own `user_profiles` row (`auth.uid() = id`). Staff routes needing owner name/phone/email authorize the caller with the RLS-bound client first, then read cross-owner data with the service-role client.
- `dogs` has `unique (user_id, name)` — a dog's identity is scoped to its owner, not the org. The same dog enquiring at a second kennel moves its `org_id` rather than creating a second row.
- `user_profiles` has no `role` column, `organisations` has no `notify_*` columns, `booking_requests` has no `contact_opt_in` column. Don't reintroduce them without a schema change.
- `organisations.postcode` is `not null`. `scripts/seed-organisations.ts` upserts in batches of 100, so one blank postcode fails the *whole batch* — blanks are filtered out with a warning before batching. Seeded from `scripts/data/kennels.csv` (gitignored, 1,222 rows).
- `schema.sql` is a full drop-and-recreate reset, safe only against an empty database. The database has had real data since 2026-08-19, so schema changes need an additive migration in `supabase/migrations/`, run by hand in the Supabase SQL Editor. Keep `schema.sql` in sync as the target state for fresh environments.
- `/kennels` location search takes structured `lat`/`lng`/`label` from `components/location-picker.tsx`, never free text — the search box's visible text is only a label and is never re-parsed. Don't wire a "use my location" or autocomplete flow to just write a display string into a text field and let a server-side parser figure it out; that was the 2026-08-20 bug (see `DECISIONS.md`). `?q=` on `/kennels` still works but only as a fallback for old bookmarked links.
- `location-picker.tsx`'s autocomplete calls Photon (`photon.komoot.io`), not Nominatim — Nominatim's `/search` only matches whole words, so it returns nothing for a partial word like "Norw" while the user is still typing. Photon prefix-matches. GB-only scope is enforced with a UK bounding box plus a client-side `countrycode === "GB"` filter, since Photon has no `countrycodes` param.
- `/kennels` location search (`lat`/`lng` present) renders only the nearest 10 via `KennelResultsList` (client component) + "Load more", not the numbered pager — that's still used for the no-location browse-all path. The shared distance/sort logic lives in `lib/kennels/search.ts`, used by both the initial SSR render and `/api/kennels/search` (which "Load more" fetches from with `offset`/`lat`/`lng`).

## 9) Commands & known gaps
`pnpm i` · `pnpm dev` · `pnpm test` · `pnpm test:integration` · `pnpm test:e2e` · `pnpm lint`

- **There is no test suite in this repo yet** — the scripts exist, the test files don't. A known gap, not a green baseline.
- `pnpm lint` is broken: Next 16 removed `next lint` and no replacement is wired up.
- `next.config.mjs` sets `typescript.ignoreBuildErrors: true` to work around a `@supabase/supabase-js` v2.45 generic-inference bug that floods `tsc` with spurious `does not exist on type 'never'` errors. Pre-existing, not a signal of real type errors.

## 10) Style
Small functions, explicit naming, no clever abstractions. Prefer server actions / route handlers that are easy to test. Always explain the "why" in comments for business rules.

If uncertain: ask exactly one question, otherwise take the simplest approach consistent with this file.
