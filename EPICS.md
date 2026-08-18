# Epics

## Phase 1 — Listings Foundation

### EP-01: Find a kennel
**Goal:** Dog owners can discover and view licensed kennel profiles on Zoovia.

**Scope:**
- Seeded kennel profiles from public AAL register data (name, location, licence number, star rating, website)
- Search and filter by location (postcode / area)
- Individual kennel profile page (unclaimed state)
- SEO-friendly URLs and page structure

**Out of scope:**
- Booking or enquiry from the listing page (Phase 2)
- Reviews or ratings beyond the AAL star rating (Phase 6)
- Paid or featured listings

---

### EP-02: Own your listing
**Goal:** Kennel operators can claim, verify, and manage their Zoovia profile.

**Scope:**
- "Claim this listing" flow — operator creates an account linked to their AAL licence
- Verification step (manual review or email confirmation to the registered address)
- Profile editor — description, services offered, photos, contact details
- Claimed badge on profile page

**Out of scope:**
- Online booking toggle (Phase 6)
- Subscription payment for claiming (free tier for now)

---

## Phase 2 — Enquiry Management

### EP-03: Capture enquiries
**Goal:** Incoming booking requests land in one structured place.

**Status:** In progress

**Out of scope:**
- Availability signals / capacity calendar
- Payment or deposit at point of enquiry

---

#### F1: Public enquiry form ✅ Done

- Accessible at a public URL per kennel — no login required
- Required fields: check-in date, check-out date, dog name, breed, size (small / medium / large), owner name, owner email
- Optional fields: vaccination expiry date, owner phone, additional notes
- Renders correctly on mobile and desktop
- Successful submission redirects to a confirmation page

---

#### F2: Form validation ⚠️ Partial

- [x] Server rejects submissions where check-out is not after check-in (400)
- [x] Server rejects submissions missing any required field (400)
- [ ] Client-side: check-in date cannot be in the past (validated before API call)
- [ ] Client-side: check-out must be after check-in (validated before API call)
- [ ] All required field errors are shown inline on the relevant field — not as a single top-level message
- [ ] Phone is optional — remove the required asterisk from the UI (currently marked required in error)

---

#### F3: Spam prevention 🔲 To do

- [ ] A hidden honeypot field is present in the form (not visible or focusable by real users)
- [ ] If the honeypot field is populated on submission, the request is silently discarded server-side — no error is returned to the submitter
- [ ] The submission endpoint is rate-limited: max 5 submissions per IP per 10 minutes
- [ ] A rate limit breach returns a user-facing error message ("Too many requests — please try again shortly")
- [ ] Honeypot submissions do not trigger confirmation or notification emails

---

#### F4: Enquiry stored ✅ Done

- Enquiry saved to `booking_requests` with status `new`
- Owner upserted by (kennel_id, email) — repeat bookers link to their existing owner record
- Dog upserted by (kennel_id, owner_id, name)
- Availability signal and capacity snapshot recorded at time of submission
- Minimum notice period enforced (configurable per kennel)
- Submission blocked with a clear error if availability is `full` (409)
- No PII written to server logs

---

#### F5: Owner confirmation email 🔲 To do

- [ ] A confirmation email is sent to the owner's email address within 60 seconds of a successful submission
- [ ] Email contains: kennel name, stay dates, dog name, and a plain-language explanation of next steps ("We'll review your request and be in touch shortly")
- [ ] Email is sent from a Zoovia address — not the operator's email address
- [ ] Email is not sent for honeypot-rejected submissions

---

#### F6: Operator notification email 🔲 To do

- [ ] An email is sent to the operator's registered address for every new enquiry
- [ ] Email contains: owner name, owner email, stay dates, dog name and size category
- [ ] Email includes a direct link to the enquiry in the Zoovia inbox
- [ ] Email is sent within 60 seconds of the enquiry being stored
- [ ] If the operator has no registered email address, the enquiry is still stored — email failure must not block the submission

---

### EP-04: Work the inbox
**Goal:** Operators can view, action, and track the status of each enquiry.

**Scope:**
- Enquiry list view (sortable by date, status)
- Enquiry detail view (all submitted fields)
- Status transitions: New → Needs Info / Accepted / Rejected
- One-click email reply templates for each status
- Internal notes on an enquiry (private to the kennel)
- Search and filter by date range, status, dog name, owner name

**Out of scope:**
- Team/staff access (Phase 3)
- Booking calendar or runs view (Phase 3)

---

### EP-05: Know the dog
**Goal:** A dog and owner profile is created and stored from the first enquiry, reducing friction on repeat bookings.

**Scope:**
- Dog profile auto-created from enquiry: name, breed, size, vaccination expiry date, internal notes
- Owner profile auto-created: name, email, phone
- Dog and owner linked to all their enquiries (history view)
- Operator can edit dog/owner profile fields
- Repeat booker detection — if email matches an existing owner, link to existing profile

**Out of scope:**
- Owner-facing portal or self-service profile editing (Phase 6)
- Medical or behavioural records beyond internal notes (Phase 3)
- Vaccination document uploads (Phase 4)
