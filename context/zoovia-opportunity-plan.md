# Zoovia — Plan to Surface Opportunities
*August 2026*

**Status: Complete.** The outcome and opportunity tree are built and live in Miro: https://miro.com/app/board/uXjVNGLDJZI=/ — that board is now the canonical, up-to-date version. This document stays as the record of how we got there (rationale, methodology, original backlog); treat any opportunity content below as a historical first draft, not current state.

---

## Why this step exists

We have personas (`zoovia-personas.html`) and a desired outcome / build roadmap (`zoovia-plan.md`), but nothing sits between them. The roadmap phases were written straight from research pain points to feature sets — solutions were chosen before the opportunity space was mapped or prioritised. This plan closes that gap using an **Opportunity Solution Tree** (Teresa Torres): Outcome → Opportunities (unmet needs, pain points, desires) → Solutions. We stop at the opportunity layer. No solutioning until the tree is reviewed.

---

## Step 1 — Pin down the desired outcome as a measurable statement

`zoovia-plan.md` currently states a *strategy* ("operators adopt software to solve a real ops problem; the marketplace follows"), not a measurable *outcome*. An opportunity tree needs one outcome at the root, stated as a metric we can see move.

Candidate, drafted from the existing strategy — needs your sign-off before anything downstream is built on it:

> **Outcome:** Grow the number of UK kennel operators running their day-to-day booking operations inside Zoovia — measured as weekly active operators with ≥1 booking/enquiry action logged, not just a claimed listing.

This deliberately excludes vanity metrics (listings claimed, signups) in favour of *operational reliance*, which is what phases 2–6 are actually betting on. Confirm or amend before Step 2.

---

## Step 2 — Mine opportunities from what we already have

We don't need new research to get a first draft — `zoovia-market-research.md` and the four personas already contain ~20 distinct pain/need/desire statements. Step 2 is purely extraction: pull every discrete pain point and quote into a flat, ungrouped backlog, tagged by persona. Candidates already visible in the research:

**Operator side (Pat, Gary):**
- Enquiry chaos across phone/Messenger/WhatsApp/form/walk-in, no unified thread
- Manual deposit chasing and reconciliation
- Vaccination record retrieval at drop-off
- Compliance anxiety — no structured AAL record-keeping
- Staff see inconsistent information — double-bookings
- Revenue leakage on unbilled extras
- No real waitlist for peak periods
- No visibility into true cost-per-night / margin

**Owner side (Anna, Frank):**
- Can't verify licence status or legitimacy before booking
- No visible pricing until after enquiring
- Repeats dog/owner info on every visit, no stored profile
- No proactive updates during the stay
- No online availability check outside business hours
- Confirmations live in unsearchable WhatsApp threads

This list is a *starting* backlog, not the finished tree — Step 3 groups it, Step 4 stress-tests it.

---

## Step 3 — Structure the backlog into a tree

Group the flat list into parent opportunities, each with **sub-opportunities** underneath — not descriptive detail, but opportunities in their own right, one level down the tree. Each should still trace back to the outcome. Rough shape (to refine together, not to finalise solo):

- **Opportunity: Operators have no single place enquiries land**
  - Sub-opportunity: enquiries scattered across 5 channels
  - Sub-opportunity: critical care info lost between staff / shifts
- **Opportunity: Operators can't trust the system to hold money correctly**
  - Sub-opportunity: manual deposit chasing
  - Sub-opportunity: revenue leakage on extras
- **Opportunity: Operators can't prove compliance without effort**
  - Sub-opportunity: vaccination record retrieval at the gate
  - Sub-opportunity: no inspection-ready record trail
- **Opportunity: Owners can't establish trust or price before committing**
  - Sub-opportunity: no licence/rating visibility
  - Sub-opportunity: no visible pricing
- **Opportunity: Owners get no signal once the dog is dropped off**
  - Sub-opportunity: zero proactive updates during stay
- **Opportunity: Booking a known kennel again is needlessly repetitive**
  - Sub-opportunity: no stored profile
  - Sub-opportunity: no out-of-hours availability check

Each parent opportunity should be able to answer "if we solved this, how does the outcome metric move?" — if it can't, it's noise, not an opportunity.

**The tree now lives in Miro**, in Miro's official Opportunity Solution Tree template (Teresa Torres' own layout): https://miro.com/app/board/uXjVNGLDJZI=/ — 10 parent opportunities (6 operator, 4 owner), each with pain points in customer-problem voice tagged by evidence strength, and a ⚑ moat flag where a branch maps to a named differentiator. Miro is the canonical, live copy; the standalone HTML export that previously mirrored it has been retired to avoid a second version drifting out of sync.

---

## Growth lever: demand-pull claim trigger (the Podium/ZocDoc model)

This sits alongside the tree rather than inside it — it's an *acquisition mechanism*, not a customer opportunity, but it directly shapes how Phase 1 should work and it changes the priority calculus in Step 5, so it's captured here rather than left to solutioning.

**The pattern:** Podium and ZocDoc both grew by showing an unclaimed business real, waiting demand rather than pitching them software in the abstract — a patient's appointment request, a customer's review — and using that as the claim trigger. The business doesn't adopt because of a feature list; it adopts because there's a live enquiry it can't respond to without claiming the profile.

**Applied to Zoovia:** a dog owner finds an unclaimed listing and submits an enquiry. Instead of (or ahead of) the batched "claim your free listing" email currently planned for Phase 1, the notification is enquiry-shaped: *"Someone wants to book [dates] at your kennel — claim your listing to reply."* The lead itself is the pitch.

**Why it matters for prioritisation:** this is the exact trigger the Pat Webb persona already names as what would change her mind — *"a missed enquiry that cost her a booking."* It converts an abstract, low-conversion nurture email into a manufactured version of the moment that already persuades sceptical operators, on demand rather than by chance. It also means the Phase 1 directory isn't just top-of-funnel SEO/reach — it's the acquisition engine for the harder side of the marketplace (operators), which should raise its priority relative to how the current roadmap treats it (a low-cost, low-attention first phase).

**Infrastructure already in place:** the `organisations` table already models this — `claim_status` (`unclaimed` / `pending_verification` / `claimed` / `rejected`) exists as of the current migration, so an enquiry landing against an `unclaimed` row is already a distinguishable state the notification flow can key off, not something requiring new schema.

**Open risk, not yet resolved:** an enquiry sent to an operator who hasn't claimed their profile needs to reach a real person (email address sourced from the AAL register or elsewhere) and needs to read as a genuine prospective customer, not a marketing trick — otherwise it burns exactly the peer-trust channel operators say they actually listen to. Worth a small test batch before relying on it as the primary Phase 1 mechanism.

---

## Step 4 — Flag evidence strength before committing to any of it

Everything above is desk research and persona synthesis — nobody has said these words to us directly yet. Before this tree drives Phase 2+ scope, tag each opportunity with its evidence source:

| Source | Strength |
|---|---|
| Forum/review quote (Mumsnet, Trustpilot, Facebook group) | Medium — real voice, but not our customer |
| Competitor complaint pattern (repeated across reviews) | Medium — validated pain, unvalidated for us specifically |
| Direct interview with a UK kennel operator or dog owner | Strong |
| Assumption / inference from research | Weak — flag and prioritise validating |

Recommended before Step 5: **5–8 short conversations** — a mix of operators (ideally one paper-diary veteran type, one growth-stage type) and dog owners who've boarded recently. Doesn't need to be formal; the goal is to hear 2–3 of the mapped opportunities in their own words, or discover the tree is wrong.

---

## Step 5 — Prioritise the opportunities

Score each opportunity, not each solution, against:

1. **Outcome impact** — how directly it moves weekly-active-operator reliance
2. **Evidence strength** — from Step 4
3. **Differentiation** — does solving it map to a moat already identified (AAL compliance, WhatsApp-first, payment-agnostic, migration-from-Togetherwork)? Opportunities that hit a moat outrank generic ones at equal impact.
4. **Reach/frequency** — how many of the four personas it touches, and how often the pain recurs (daily admin vs. once-a-year compliance panic)

Output: a ranked shortlist of opportunities — not solutions — ready for solutioning. This is also the point to sanity-check the existing Phase 1–6 roadmap: does it already cover the top-ranked opportunities, or did we build toward the wrong ones? Factor in the demand-pull claim trigger above when scoring "Operators have no single place enquiries land" — its priority should reflect that it's also the operator-acquisition engine, not just an operational pain.

---

## Step 6 — Keep it alive, don't file it away

The tree isn't a one-off document — revisit it every time a phase ships or a new persona conversation happens. New evidence (support tickets, churn reasons, sales call objections) gets added as it arrives, and low-evidence opportunities get promoted or cut. Treat it as the thing that sits between "we talked to a customer" and "we shipped a feature," permanently.

---

## What this plan does *not* do

It does not generate solutions, features, or roadmap changes. It stops once opportunities are mapped and ranked. Solutioning is the next, separate exercise — and should start from the top of this tree, not from the existing Phase 1–6 list.
