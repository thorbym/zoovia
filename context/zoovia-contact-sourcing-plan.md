# Zoovia — Kennel Contact Sourcing Plan
*August 2026*

**Status: Draft.** Plan only — nothing built yet. Written to unblock two things at once: Phase 1 of `zoovia-plan.md` ("Seed kennel profiles from public AAL register data, council-by-council" + the "claim your free listing" email campaign) and the operator-alert solutions under opportunity 1.1 in the OST (`zoovia-opportunity-plan.md`), which need a verified contact channel before they're actionable.

---

## Why this step exists

The single "AAL register" referenced so far doesn't have broad email coverage. That's because there isn't one central AAL register — animal boarding licensing in England is administered **per local authority** under the Animal Activities Licensing (AAL) 2018 regulations (Scotland/Wales/NI run separate regimes). Each of the ~300 English councils publishes and maintains its own register of licensed premises. Coverage, format, and update cadence all vary, and most registers list licensee name, trading name, address, and licence number/expiry — few list an email address directly.

This plan is about building a deduplicated, sourced contact list of licensed kennel operators. It does **not** cover sending the claim campaign itself — that's a separate, already-planned Phase 1 workstream, and should go through its own compliance check before any send.

---

## Sourcing priority, in order

1. **Local authority public licensing registers** — primary, legitimate source for name, address, and licence status. Some councils publish structured open data (CSV, sometimes an API via a shared platform like Idox Public Access); most publish as PDF or an HTML table buried in committee agendas.
2. **Companies House** — for registered-company kennels, gives a registered office and director names. No email, but strengthens identity matching and dedup.
3. **Google Places / Maps listings** — matched against the business name + address from step 1, usually surfaces a public phone number and website.
4. **Website contact-page scrape** — for any website found in step 3, pull the listed enquiry/contact email.
5. **Fallback (no email found)** — flag for a non-email outreach channel (phone, or a physical mail nudge) rather than guessing an address. Don't fabricate or brute-force emails (e.g. `info@`, `enquiries@` guesses) without confirming the domain actually serves that address.

---

## Legal / compliance guardrails

- **UK GDPR + PECR** apply to unsolicited commercial email, even B2B. Sole traders and unincorporated small kennels are treated closer to consumers under PECR than a registered company would be — needs a real legitimate-interest basis, not just "it's public data." Worth a proper legal sanity check before any send, not after — this was already flagged as an open risk in `zoovia-opportunity-plan.md`.
- **Source discipline**: prefer councils' official open-data downloads over scraping their HTML where one exists. Where scraping is the only option, respect robots.txt and site terms.
- **Data minimisation**: only capture what's needed to identify and contact the business (name, address, licence number, contact channel, source, collection date). No incidental personal data beyond that.
- **Audit trail**: every contact record keeps its source and collection date, so the eventual claim email can honestly say why they're being contacted ("we found your licence on [council]'s public register") — this is also what keeps the outreach reading as a genuine lead rather than a scrape-and-spam operation.

---

## Technical approach (phased)

**Phase A — Coverage mapping**
Enumerate all English local authorities with an animal boarding licensing register. Catalog format (open data / PDF / HTML), URL, and update cadence. Output: a master council list (~300 rows) as the crawl target list.

**Phase B — Structured ingestion**
For councils with open data (CSV/API), ingest directly — no scraping needed. Normalize into the existing `organisations` table schema, including `claim_status = unclaimed`.

**Phase C — Semi-structured scraping**
For councils publishing PDF/HTML tables, build a scraper — either per-council parsers for the common platforms (several councils share the same licensing software vendor, so one parser often covers a cluster of councils) or a generic table/PDF extractor with a manual QA pass on low-confidence rows.

**Phase D — Enrichment**
For each licensed business without a captured email: search for a matching website (business name + postcode), scrape its contact page, and tag a confidence score. No confirmed email → fallback per the sourcing list above.

**Phase E — Dedup and normalisation**
Match records across council data, Companies House, and Google Places to collapse duplicates, reusing the organisation-name normalisation work already in the codebase.

**Phase F — Compliance tagging**
Attach source, collection date, and lawful-basis note to every record before it's eligible for the claim campaign queue.

---

## What this doesn't do

- Doesn't send any outreach — that's the Phase 1 claim-campaign workstream, gated on its own legal review.
- Doesn't guarantee email coverage — some operators will only be reachable by phone or post, and that's fine; the fallback tier should feed a manual/lower-priority outreach lane rather than blocking the rest of the pipeline.

---

## Open questions

- Which councils' registers are structured vs. scrape-only — needs the Phase A audit before effort estimates are real.
- Refresh cadence: licences renew/lapse, so this likely needs periodic re-runs rather than a one-off pull, but that's a v2 concern, not a blocker for the first pass.
