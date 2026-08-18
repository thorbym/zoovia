# Decisions (ADR-lite)

Record only decisions that affect scope, architecture, or pricing.
Format: YYYY-MM-DD — Title — Status (Proposed/Accepted/Superseded)

---

## Template
## YYYY-MM-DD — Decision title — Status
Context:
Decision:
Rationale:
Consequences:

---

## 2025-12-28 — Intake-only wedge first — Accepted
Context:
Business decisions for early signals of success/failure

Decision:
We will ship intake + triage before any operations features.
Rationale:
faster adoption, lower switching cost, avoids support burden.

Consequences:
no payments, no instant booking guarantees in MVP.

---

## 2025-12-28 — Store dog breed in MVP — Accepted

Context:
Breed affects kennel acceptance rules and capacity decisions.
Owners expect to enter it once, not repeatedly.

Decision:
Store dog breed as a required field in the booking request and dog profile.

Rationale:
Low sensitivity, high operational value, improves repeat booking experience.

Consequences:
We must avoid turning breed data into behavioural or medical profiling early.

---

## 2025-12-29 — Supabase Postgres + RLS; no Prisma — Accepted

Context:
We want fast iteration on Vercel without serverless Postgres connection pitfalls.

Decision:
Use Supabase Postgres with Supabase JS client and Row Level Security (RLS).
Do not use Prisma.

Rationale:
Supabase provides a managed Postgres + auth + RLS model that fits our MVP and reduces operational overhead.

Consequences:
We must design tables and policies carefully; service role keys are server-only.

---

## 2026-08-18 — Rebrand to Zoovia; pivot to two-sided marketplace — Accepted

Context:
The kennel-intake project was built as a narrow intake-only tool. Revived in August 2026 with a clearer commercial thesis and a longer roadmap.

Decision:
Rename the product to Zoovia. Reframe as a two-sided marketplace (operators and dog owners) built phase by phase, following the OpenTable playbook.

Rationale:
A narrow intake tool is hard to price and position. The marketplace framing creates a defensible long-term asset (network effects, data moat, booking fee revenue in Phase 6) while still shipping the same Phase 1/2 features as the original plan.

Consequences:
AGENTS.md, PRODUCT.md, and EPICS.md all updated. Phase 1 (Listings) is new work not in the original plan; Phase 2 (Enquiry Management) maps to the original intake scope and reuses existing code.

---

## 2026-08-18 — Payment-agnostic with Open Banking as primary — Accepted

Context:
KennelBooker's Stripe-only model is a consistent complaint from UK operators who want BACS, bank transfer, and their existing card machine.

Decision:
Zoovia supports all payment methods. Open Banking pay-by-link (GoCardless Instant Bank Pay) is the primary deposit collection flow — direct to operator's bank account, auto-reconciled against bookings.

Rationale:
UK-native differentiator. Removes a concrete adoption barrier. No Stripe mandate means no processing fee uplift passed to operators.

Consequences:
Payment work is Phase 4. No payment code in Phase 1 or 2.

---

## 2026-08-18 — AAL compliance as UK-only differentiator — Accepted

Context:
The 2018 Animal Activities Licensing regulations impose specific record-keeping requirements for council inspections (vaccination logs, incident records, welfare checks). No existing software addresses this.

Decision:
Phase 4 will include inspection-ready AAL compliance records. This is a hard UK-only differentiator used in positioning and copy.

Rationale:
Zero competitors address it. It is a concrete value prop for operators facing annual council inspections.

Consequences:
Compliance record schemas must be designed with the AAL framework in mind. Phase 4 work. No impact on Phase 1/2.
