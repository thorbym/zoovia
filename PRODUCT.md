# Product Guide — Zoovia

## What Zoovia is
A two-sided marketplace for UK dog kennel boarding. Kennel operators on the supply side; dog owners on the demand side.

The model is the OpenTable playbook: operators sign up for the software because it solves a real operations problem. The consumer-facing marketplace grows as a consequence of operators being on the platform — not the other way around.

## Product doctrine
- Solve the operator's problem first. Dog owners follow when operators are live.
- Own the enquiry flow (the front door), then earn the right to expand into operations.
- UK-native from day one: AAL compliance, BACS/bank transfer support, UK hours.
- Never add a feature unless it (a) reduces inbound chaos, or (b) increases willingness to pay.

## Target customers

**Operators (supply side):**
- UK independent kennels, 10–30 runs
- Currently running on paper diaries, WhatsApp, and Excel
- Overwhelmed at peak (Christmas, school holidays, August)
- Prefer control over automated instant booking

**Dog owners (demand side — Phase 6 focus):**
- Post-COVID dog owners, many boarding for the first time
- Want online availability, transparent pricing, and proactive updates during stays
- Increasing expectations set by home boarders (Rover, Pawshake)

## Roadmap

| Phase | Name | Revenue |
|-------|------|---------|
| 1 | Listings Foundation | £0 — first contact with both sides |
| 2 | Enquiry Management | ~£25/mo Starter — inbox saves hours/week at peak |
| 3 | Core KMS | ~£49/mo Pro — replaces the paper diary |
| 4 | Payments & Compliance | Pro — AAL moat, Open Banking pay-by-link |
| 5 | Communications | Pro — WhatsApp per-booking thread |
| 6 | Online Booking Marketplace | Booking fee % — the full marketplace |

## Current work: Phase 1 & Phase 2

See `EPICS.md` for full epic definitions.

### Phase 1 — Listings Foundation
- **EP-01: Find a kennel** — dog owners discover and view licensed kennel profiles on Zoovia
- **EP-02: Own your listing** — operators claim, verify, and manage their profile

Seeded from public AAL register data. Zero revenue, low build cost. First contact with both sides of the marketplace.

### Phase 2 — Enquiry Management *(first paid tier: ~£25/mo)*
- **EP-03: Capture enquiries** — incoming booking requests land in one place (intake form already built)
- **EP-04: Work the inbox** — operators view, action, and track each enquiry
- **EP-05: Know the dog** — dog and owner profile created and stored from the first enquiry

First revenue. Operators pay because the inbox alone saves hours per week at peak.

## Personas

**Operators:**
- **Pat Webb (The Veteran)** — 22 years, paper diary, deeply sceptical of software. Wins via peer recommendation and compliance trigger.
- **Gary Patel (The Grower)** — 8 years, expanding, burned by Revelation Pets. Needs reliability and team visibility.

**Dog owners:**
- **Anna Clarke (The Anxious First-Timer)** — pandemic dog, first boarding experience. Wants licence verification, digital onboarding, daily photo updates.
- **Frank O'Brien (The Pragmatic Regular)** — boards 8–10×/year. Wants online availability and two-tap booking.

## Pricing

| Tier | Included | Price |
|------|----------|-------|
| Free | Listed on Zoovia, claim profile, receive enquiry email notifications | £0 |
| Starter | Enquiry inbox, intake form, basic dog/owner records | ~£25/mo |
| Pro | Full KMS, runs view, capacity calendar, AAL compliance, WhatsApp, online booking | ~£49/mo |

No transaction fees on Starter or Pro. Booking fee (small %) may apply on marketplace-originated bookings in Phase 6.

## Competitive positioning

| Competitor weakness | Zoovia response |
|---|---|
| Stripe-only (KennelBooker) | Payment-agnostic + Open Banking pay-by-link |
| No AAL compliance tools (everyone) | Inspection-ready records, vaccination log, incident log |
| No WhatsApp (everyone) | WhatsApp Business API per-booking thread (Phase 5) |
| US-built, wrong support hours | UK-native, UK hours |
| Over-engineered for large operations | Built for 10–30 run kennels, no unused modules |
| PE price creep (Togetherwork users fleeing) | Migration hook — import existing client data |

## Success metrics (Phase 2, first 90 days)
- ≥10 paying kennels on Starter tier
- Weekly active usage: operator logs in at least 2×/week during peak
- Renewal after peak season (churn is the real test)

## Expansion gate
Only move to Phase 3 features when ALL are true:
- ≥10 paying kennels request the same feature unprompted
- They describe a repetitive workaround they do today
- They agree to pay more before we build it
