# Zoovia — Opportunity Tree: Methodology & Rationale
*August 2026 — trimmed*

**The tree itself lives in Miro and is the single source of truth: https://miro.com/app/board/uXjVNGLDJZI=/** — 10 parent opportunities (6 operator, 4 owner), each with sub-opportunities in customer-problem voice tagged by evidence strength, solutions branching off as they're generated. Don't reconstruct the tree from this document; it no longer contains one. What's kept below is rationale and working method not captured on the board itself.

---

## Outcome

> **Grow the number of UK kennel operators running their day-to-day booking operations inside Zoovia** — measured as weekly active operators with ≥1 booking/enquiry action logged, not just a claimed listing.

Chosen over vanity metrics (listings claimed, signups) because operational reliance is what the roadmap phases actually bet on.

---

## Evidence-strength tags

Every opportunity/sub-opportunity on the board is tagged by source strength — keep using this scale when adding new ones:

| Source | Strength |
|---|---|
| Forum/review quote (Mumsnet, Trustpilot, Facebook group) | Medium — real voice, not our customer |
| Competitor complaint pattern (repeated across reviews) | Medium — validated pain, unvalidated for us |
| Direct interview with a UK operator or dog owner | Strong |
| Assumption / inference from research | Weak — flag and prioritise validating |

**5–8 short conversations** (a mix of operators and recent dog-owner boarders) is the standing recommendation for upgrading Weak/Medium tags before betting build effort on them.

---

## Prioritisation criteria

When scoring opportunities (not solutions) for build order:

1. **Outcome impact** — how directly it moves weekly-active-operator reliance
2. **Evidence strength** — per the table above
3. **Differentiation** — does it map to a named moat (AAL compliance, WhatsApp-first, payment-agnostic, Togetherwork migration)? Moat-mapped opportunities outrank generic ones at equal impact
4. **Reach/frequency** — how many personas it touches, how often the pain recurs

---

## Growth lever: demand-pull claim trigger

Sits alongside the tree as an *acquisition mechanism*, not a customer opportunity — shapes how Phase 1 works and raises that phase's priority.

**Pattern (Podium/ZocDoc model):** show an unclaimed business real, waiting demand — an enquiry, a review — and use that as the claim trigger, instead of pitching software abstractly. The business adopts because there's a live enquiry it can't answer without claiming the profile.

**Applied to Zoovia:** a dog owner enquires against an unclaimed listing → notification reads *"Someone wants to book [dates] at your kennel — claim your listing to reply,"* not a batched "claim your free listing" email. The lead is the pitch. This is also the exact trigger Pat Webb (persona) names as what would change her mind.

**Infrastructure already in place:** `organisations.claim_status` (`unclaimed` / `pending_verification` / `claimed` / `rejected`) already exists — an enquiry against an unclaimed row is already a distinguishable state, no new schema needed.

**Open risk:** needs a real person's email (sourced via council licensing registers — see `zoovia-contact-sourcing-plan.md`) and needs to read as a genuine prospective customer, not a marketing trick, or it burns the peer-trust channel operators actually listen to.

---

## Keep it alive

Revisit the Miro tree every time a phase ships or a new persona conversation happens. New evidence (support tickets, churn reasons, sales objections) gets added as it arrives; low-evidence branches get promoted or cut. It sits permanently between "we talked to a customer" and "we shipped a feature" — never filed away as finished.
