# Decisions (ADR-lite)

Record only decisions that affect scope, architecture, or pricing.
Format: `## YYYY-MM-DD — Title — Status` (Proposed / Accepted / Superseded), then Context, Decision, Rationale, Consequences.

---

## 2025-12-28 — Intake-only wedge first — Accepted
**Context:** We need early signals of success or failure.
**Decision:** Ship intake + triage before any operations features.
**Rationale:** Faster adoption, lower switching cost, avoids support burden.
**Consequences:** No payments or instant-booking guarantees in the MVP.

---

## 2025-12-28 — Store dog breed in MVP — Accepted
**Context:** Breed affects kennel acceptance rules and capacity decisions, and owners expect to enter it once.
**Decision:** Breed is a required field on the booking request and dog profile.
**Rationale:** Low sensitivity, high operational value, better repeat-booking experience.
**Consequences:** We must avoid turning breed data into behavioural or medical profiling.

---

## 2025-12-29 — Supabase Postgres + RLS; no Prisma — Accepted
**Context:** We want fast iteration on Vercel without serverless Postgres connection pitfalls.
**Decision:** Supabase Postgres via the Supabase JS client, with Row Level Security. No Prisma.
**Rationale:** Managed Postgres + auth + RLS fits the MVP and cuts operational overhead.
**Consequences:** Tables and policies must be designed carefully; service-role keys stay server-only.

---

## 2026-08-18 — Rebrand to Zoovia; pivot to two-sided marketplace — Accepted
**Context:** The project was built as a narrow intake-only tool, revived in August 2026 with a longer roadmap.
**Decision:** Rename to Zoovia and reframe as a two-sided marketplace built phase by phase, following the OpenTable playbook.
**Rationale:** A narrow intake tool is hard to price and position. The marketplace framing creates a defensible asset (network effects, data moat, Phase 6 booking fees) while shipping the same Phase 1/2 features.
**Consequences:** Phase 1 (Listings) is new work; Phase 2 (Enquiry Management) maps to the original intake scope and reuses existing code.

---

## 2026-08-18 — Payment-agnostic with Open Banking as primary — Accepted
**Context:** KennelBooker's Stripe-only model is a consistent complaint from UK operators who want BACS, bank transfer, and their existing card machine.
**Decision:** Support all payment methods. Open Banking pay-by-link (GoCardless Instant Bank Pay) is the primary deposit flow — direct to the operator's bank account, auto-reconciled against bookings.
**Rationale:** UK-native differentiator; removes a concrete adoption barrier; no Stripe mandate means no processing-fee uplift for operators.
**Consequences:** Payment work is Phase 4. No payment code in Phase 1 or 2.

---

## 2026-08-18 — AAL compliance as UK-only differentiator — Accepted
**Context:** The 2018 Animal Activities Licensing regulations impose record-keeping requirements for council inspections (vaccination logs, incident records, welfare checks). No existing software addresses this.
**Decision:** Phase 4 ships inspection-ready AAL compliance records; the capability is used in positioning and copy.
**Rationale:** Zero competitors address it, and operators face annual council inspections.
**Consequences:** Compliance schemas must be designed against the AAL framework. No impact on Phase 1/2.

---

## 2026-08-19 — Dog owners are user_profiles; no separate owners table — Accepted
**Context:** An earlier schema had a standalone `owners` table (FK → organisations). It duplicated identity data and made it impossible to link one dog owner to multiple kennels or to their Supabase auth account.
**Decision:** Drop `owners`. Dog owners are `user_profiles` rows with `type = 'owner'`; `dogs` and `booking_requests` FK to `user_profiles(id)` via `user_id`.
**Rationale:** Owners are users of the platform, not a data record held by a kennel. This enables auth, RLS, and repeat-booking detection without duplicate storage.
**Consequences:** `org_id` on `user_profiles` is set for operators only and left null for owners. RLS on `dogs` and `booking_requests` grants access to the authenticated owner (`user_id = auth.uid()`) and to operators of the relevant organisation.

---

## 2026-08-19 — Account gate appears after form fill, not before — Accepted
**Context:** Requiring an account before the enquiry form creates drop-off before the user has shown intent.
**Decision:** Dog owners fill the entire enquiry form first; the sign-up/sign-in gate appears at the final submission step. Already-signed-in users proceed directly.
**Rationale:** A filled form is investment — those users convert on sign-up far more often than users shown a gate on arrival. Standard conversion-optimised marketplace onboarding.
**Consequences:** The form holds state across the sign-up flow. `user_id` on `dogs` and `booking_requests` is set only on successful sign-up and submission; there is no anonymous submission path. Implemented in `components/booking-form.tsx` — the sign-up step renders inline in the same component, so state lives in React rather than sessionStorage or a URL param. `/api/public/bookings` requires a verified user (session cookie or Bearer token) before it writes.

---

## 2026-08-19 — Unclaimed listings visible by default; claim_status enum — Accepted
**Context:** EP-01 seeds kennel profiles from public AAL register data before any operator signs up. We had to decide whether unclaimed listings are publicly visible, and how to model claim state now that EP-02 adds a verification step.
**Decision:** Unclaimed listings are visible by default (opt-out). `organisations.is_claimed` (boolean) becomes `organisations.claim_status`: `unclaimed | pending_verification | claimed | rejected`. No visibility/hidden field and no monetization field.
**Rationale:** Comparable marketplaces seeded from public directories (G2, Capterra, Healthgrades) show unclaimed listings with a "claim this listing" CTA — an empty results page kills discovery before the product starts. Alarm risk is lower than for review-driven directories because Zoovia mirrors public AAL licence facts only, with no user-generated content on an unclaimed listing. Claim status and visibility are orthogonal; collapsing them would force state explosion (`claimed_hidden`, `unclaimed_hidden`, …). A takedown mechanism is deferred until an operator actually asks for one.
**Consequences:** Unclaimed profiles render clearly labelled as unclaimed, showing only AAL register facts, with a claim CTA. `/api/staff/bootstrap`'s email-match-against-`contact_email` check is EP-02's verification step and sets `claim_status = 'claimed'` on match. `/api/onboard` (self-service org creation, not from the AAL seed) sets `claim_status = 'claimed'` immediately. `pending_verification` is reserved for a future manual-review path.

---

## 2026-08-19 — Licence number and star rating deferred; distance search via postcodes.io — Accepted
**Context:** EP-01's spec listed licence number and star rating as register-sourced profile fields, but neither exists in the seeded data (`scripts/data/kennels.csv` has no licence number or star rating columns). Both are official AAL facts (the council-assigned inspection rating is not the same thing as a user review), which rules out operator self-reporting the star rating — an operator has an obvious incentive to always claim 5 stars, and publishing a false official rating is a different order of problem than a biased review. Separately, EP-01's location search needed to actually work like "kennels near me," which plain text matching on postcode/locality strings can't do — a searcher's own postcode has no string relationship to a nearby kennel's postcode.
**Decision:** Drop star rating from EP-01 entirely (no source, not self-reportable). Defer licence number to EP-02, where the operator supplies it at claim time. Add nullable `latitude`/`longitude` to `organisations`, geocoded via postcodes.io (free, no key, UK-official, bulk endpoint), and compute distance in the `/kennels` route handler at query time — no PostGIS, sufficient at ~1,220 rows.
**Rationale:** Shipping EP-01 now with data that exists beats blocking on a register re-pull or a review system that's much bigger than EP-01 as scoped. Distance-accurate search is the actual bar (PRODUCT.md cites Rover/Pawshake), and postcodes.io gets there without new paid infrastructure.
**Consequences:** `organisations.latitude`/`longitude` are nullable and backfilled by `scripts/geocode-organisations.ts`; `scripts/seed-organisations.ts` geocodes new rows going forward via the shared `scripts/lib/geocode.ts` helper. Kennel profile pages render no licence number or star rating field. The claim CTA on `/kennels/[slug]` reuses the existing `KennelOwnerModal` (email-to-team) as an interim claim-intent capture until EP-02 ships real verification.
