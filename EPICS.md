# Epics

Phase 1 & 2 only. Later phases live in `PRODUCT.md`; anything on that roadmap is out of scope here.

## Phase 1 — Listings Foundation

### EP-01: Find a kennel
**Goal:** Dog owners can discover and view licensed kennel profiles.

- Kennel profiles seeded from public AAL register data (name, location, website) ✅
- Search and filter by location (postcode / area / town), distance-sorted ✅
- Individual profile page, unclaimed state ✅
- SEO-friendly URLs and page structure ✅

Licence number and star rating are both official AAL register data, not currently sourced — see 2026-08-19 decision "Licence number and star rating deferred". Licence number moves to EP-02 operator self-report at claim time; star rating has no source yet and is out of scope until one exists.

Out of scope: enquiry from the listing page (EP-03 — the profile page links out to the existing enquiry form instead), reviews beyond the AAL star rating, paid or featured listings.

---

### EP-02: Own your listing
**Goal:** Operators can claim, verify, and manage their profile.

- "Claim this listing" flow — operator account linked to their AAL licence
- Verification step (email match against the registered contact address)
- Profile editor — description, services, photos, contact details
- Claimed badge on the profile page

Out of scope: subscription payment for claiming (free tier for now).

---

## Phase 2 — Enquiry Management

### EP-03: Capture enquiries — *in progress*
**Goal:** Incoming booking requests land in one structured place.

Out of scope: owner-facing availability calendar, payment or deposit at point of enquiry.

#### F1: Public enquiry form ✅
Per-kennel public URL. Required: check-in, check-out, dog name, breed, size (small/medium/large), owner name, owner email. Optional: vaccination expiry, owner phone, notes. Mobile and desktop; success redirects to a confirmation page.

#### F2: Form validation ⚠️ partial
- [x] Server rejects check-out not after check-in (400)
- [x] Server rejects missing required fields (400)
- [ ] Client-side: check-in cannot be in the past
- [ ] Client-side: check-out must be after check-in
- [ ] Required-field errors shown inline on the field, not as one top-level message
- [ ] Remove the required asterisk from phone (it is optional)

#### F3: Spam prevention 🔲
- [ ] Hidden honeypot field, not visible or focusable by real users
- [ ] Populated honeypot → request silently discarded server-side, no error returned, no emails sent
- [ ] Submission endpoint rate-limited to 5 per IP per 10 minutes
- [ ] Rate limit breach returns "Too many requests — please try again shortly"

#### F4: Enquiry stored ✅
Saved to `booking_requests` with status `new`. Owner identified by their authenticated account (sign-up gate after form fill); repeat bookers link to their existing `user_profiles` row. Dog upserted by `(user_id, name)`. Capacity snapshot recorded, minimum notice period enforced, submission blocked with a 409 when full. No PII in logs.

#### F5: Owner confirmation email 🔲
- [ ] Sent within 60 seconds of a successful submission
- [ ] Contains kennel name, stay dates, dog name, and plain-language next steps
- [ ] Sent from a Zoovia address, not the operator's

#### F6: Operator notification email 🔲
- [ ] Sent to the operator's registered address for every new enquiry, within 60 seconds
- [ ] Contains owner name, owner email, stay dates, dog name and size, and a direct link to the enquiry in the inbox
- [ ] Email failure must never block the submission — store the enquiry regardless

---

### EP-04: Work the inbox
**Goal:** Operators can view, action, and track the status of each enquiry.

- List view (sortable by date, status) and detail view (all submitted fields)
- Status transitions: New → Needs Info / Accepted / Rejected
- One-click email reply template per status
- Internal notes, private to the kennel
- Search and filter by date range, status, dog name, owner name

---

### EP-05: Know the dog
**Goal:** A dog and owner profile is created from the first enquiry, reducing friction on repeat bookings.

- Dog profile auto-created from the enquiry: name, breed, size, vaccination expiry, internal notes
- Owner account created or linked at the sign-up gate (`user_profiles` with `type='owner'`; full_name and phone captured at sign-up); signed-in repeat bookers link automatically
- Dog and owner linked to all their enquiries (history view)
- Operator can edit dog profile fields and add internal notes

Out of scope: owner-facing portal or self-service profile editing, medical/behavioural records beyond internal notes, vaccination document uploads.
