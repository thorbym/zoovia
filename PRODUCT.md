# Product Guide — Zoovia

## What Zoovia is
A two-sided marketplace for UK dog kennel boarding: kennel operators on the supply side, dog owners on the demand side.

The model is the OpenTable playbook — operators sign up because the software solves a real operations problem, and the consumer-facing marketplace grows as a consequence of operators being on the platform, not the other way around.

## Doctrine
- Solve the operator's problem first. Dog owners follow when operators are live.
- Own the enquiry flow (the front door), then earn the right to expand into operations.
- UK-native from day one: AAL compliance, BACS/bank transfer support, UK hours.

## Target customers
**Operators (supply side):** UK independent kennels, 10–30 runs, running on paper diaries, WhatsApp and Excel. Overwhelmed at peak (Christmas, school holidays, August). Prefer control over automated instant booking.

**Dog owners (demand side — Phase 6 focus):** post-COVID owners, many boarding for the first time. Want online availability, transparent pricing, and proactive updates during stays. Expectations set by home boarders (Rover, Pawshake).

## Roadmap

| Phase | Name | What it unlocks |
|-------|------|-----------------|
| 1 | Listings Foundation | £0 — first contact with both sides |
| 2 | Enquiry Management | Starter tier — the inbox saves hours/week at peak |
| 3 | Core KMS | Pro tier — replaces the paper diary |
| 4 | Payments & Compliance | AAL moat, Open Banking pay-by-link |
| 5 | Communications | WhatsApp per-booking thread |
| 6 | Online Booking Marketplace | Booking fee % — the full marketplace |

Phases 1 and 2 are the current build; see `EPICS.md` for EP-01 to EP-05.

## Personas
**Pat Webb (The Veteran)** — operator, 22 years, paper diary, deeply sceptical of software. Wins via peer recommendation and a compliance trigger.
**Gary Patel (The Grower)** — operator, 8 years, expanding, burned by Revelation Pets. Needs reliability and team visibility.
**Anna Clarke (The Anxious First-Timer)** — owner, pandemic dog, first boarding. Wants licence verification, digital onboarding, daily photo updates.
**Frank O'Brien (The Pragmatic Regular)** — owner, boards 8–10×/year. Wants online availability and two-tap booking.

## Pricing

| Tier | Included | Price |
|------|----------|-------|
| Free | Listed on Zoovia, claim profile, enquiry email notifications | £0 |
| Starter | Enquiry inbox, intake form, basic dog/owner records | ~£25/mo |
| Pro | Full KMS, runs view, capacity calendar, AAL compliance, WhatsApp, online booking | ~£49/mo |

No transaction fees on Starter or Pro. A small booking fee may apply to marketplace-originated bookings in Phase 6.

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
- ≥10 paying kennels on Starter
- Operator logs in ≥2×/week during peak
- Renewal after peak season — churn is the real test

## Expansion gate
Only move to Phase 3 features when ALL are true: ≥10 paying kennels request the same feature unprompted; they describe a repetitive workaround they do today; they agree to pay more before we build it.
