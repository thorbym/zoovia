# Zoovia — High-Level Plan
*August 2026*

---

## What We're Building

A two-sided marketplace for UK dog kennel boarding: kennel operators on the supply side, dog owners on the demand side. Three layers, built in sequence:

1. **Kennel listings directory** — dog owners find licensed kennels; kennels get a free profile
2. **Kennel management system (KMS)** — operators run their business inside Zoovia
3. **Online booking marketplace** — dog owners book directly with live availability and payment

The model is the OpenTable playbook: operators sign up for the software because it solves a real operations problem. The consumer-facing marketplace grows as a consequence of operators being on the platform — not the other way around.

---

## Strategic Decisions

**Focus: traditional kennels only (for now)**
The KMS is built for licensed kennel operators running a physical facility. Home boarders (Rover, Pawshake, Tailster already serve them) and non-dog animals (cats etc.) are excluded from the KMS. They can appear as listing types on the directory — because dog owners don't always care about the distinction — but the product and the operator tooling is kennel-first.

**UK-native from the ground up**
No competitor addresses the Animal Activities Licensing (AAL) 2018 regulations, which require documented vaccination logs, incident records, and welfare checks for every inspection. This is a hard UK-only differentiator.

**Payment-agnostic, bank-transfer-smart**
KennelBooker and others force Stripe. UK operators want BACS, bank transfer, and their existing card machine. Zoovia supports all methods, with Open Banking pay-by-link (GoCardless Instant Bank Pay) as the primary deposit collection flow — direct to the operator's account, auto-reconciled against bookings, no Stripe mandate.

---

## Roadmap (sequential, no fixed dates)

### Phase 1 — Listings Foundation
- Seed kennel profiles from public AAL register data (council-by-council)
- Basic unclaimed profile pages (name, location, licence number, star rating, website link)
- Claim-your-listing flow for operators
- "Claim your free listing" email campaign (batched, domain-warmed, GDPR-compliant)
- SEO and domain infrastructure

**First contact with both sides. Zero revenue, low build cost.**

---

### Phase 2 — Enquiry Management *(first paid tier: ~£25/mo)*
- Enquiry inbox — all incoming requests in one place (replaces email/WhatsApp/Facebook chaos)
- Intake form (already built in kennel-intake project)
- Dog and owner profiles created at point of enquiry
- Email notifications and basic status tracking (new / responded / declined)

**First revenue. Operators pay because the inbox alone saves hours per week at peak.**

---

### Phase 3 — Core KMS *(second paid tier: ~£49/mo)*
- Runs view with multi-date calendar (prototype built)
- Booking confirmation, decline, and modification flows
- Capacity management — how many runs are available on any given date
- Full dog profiles: breed, dietary needs, medications, behavioural notes, vet details, vaccination status
- Full owner profiles with booking history
- Staff access — multiple logins, shared view

**Replaces the paper diary. Creates switching costs through accumulated data.**

---

### Phase 4 — Payments & Compliance
- Deposit tracking (requested / received / overdue)
- Pay-by-link via Open Banking (GoCardless Instant Bank Pay) — direct to operator's account, auto-reconciled
- Manual payment marking for operators with existing methods
- Invoice generation
- AAL compliance records: vaccination log, incident log, welfare check records
- Inspection-ready export (PDF summary of all required records)

**The AAL compliance piece is a UK-only moat. No competitor offers it.**

---

### Phase 5 — Communications
- WhatsApp Business API integration — per-booking thread for dog owner updates during the stay
- Automated deposit chase reminders (X days before deadline)
- Pre-arrival reminders to owners (vaccination cert, drop-off time)
- Vaccination expiry alerts for operators
- Pickup reminders
- Morning briefing for operators — arrivals, departures, notes for the day

---

### Phase 6 — Online Booking *(marketplace layer)*
- Live availability shown on listing pages to dog owners
- Direct booking flow (book, not just enquire) with payment at point of booking
- Dog owner accounts — stored profiles, booking history, upload vaccination certs once
- Operator toggle to enable/disable online booking per run type
- Review and star rating system (verified, post-stay only)
- Booking fee revenue layer (per-booking % on top of subscription)

**The full marketplace. Only possible because operators are already running availability in Zoovia.**

---

## Charging Model

| Tier | What's included | Price |
|------|----------------|-------|
| Free | Listed on Zoovia, claim profile, receive enquiry email notifications | £0 |
| Starter | Enquiry inbox, intake form, pay-by-link deposits, basic dog/owner records | ~£25/mo |
| Pro | Full KMS, runs view, capacity calendar, AAL compliance, WhatsApp, online booking | ~£49/mo |

No transaction fees on Starter or Pro. Booking fee (small %) may apply on marketplace-originated bookings in Phase 6.

---

## Core Personas

Four personas grounding all product and copy decisions. Full profiles in `zoovia-personas.html`.

**Operators:**
- **Pat Webb (The Veteran)** — 22 years, paper diary, deeply sceptical of software, wins via peer recommendation and compliance trigger
- **Gary Patel (The Grower)** — 8 years, expanding, burned by Revelation Pets, needs reliability and team visibility

**Dog Owners:**
- **Anna Clarke (The Anxious First-Timer)** — pandemic dog, first boarding, wants licence verification, digital onboarding, daily photo update
- **Frank O'Brien (The Pragmatic Regular)** — boards 8–10x/year, wants online availability and two-tap booking

---

## Key Differentiators vs. Competitors

| Competitor weakness | Zoovia response |
|---|---|
| Stripe-only (KennelBooker) | Payment-agnostic + Open Banking pay-by-link |
| No AAL compliance tools (everyone) | Inspection-ready records, vaccination log, incident log |
| No WhatsApp (everyone) | WhatsApp Business API per-booking thread |
| US-built, wrong support hours (Revelation Pets, Gingr) | UK-native, UK hours |
| Over-engineered for large operations (Gingr, PetExec) | Built for 10–30 run kennels, no unused modules |
| PE price creep driving Togetherwork users to leave | Migration hook — import existing client data |
