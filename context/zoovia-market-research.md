# Zoovia — Market Research
*August 2026*

---

## The Opportunity in One Paragraph

The UK has an estimated 10,000–15,000 licensed dog boarding operations (traditional kennels, home boarders, and day care). The market is worth ~£530m in dog boarding alone (2024) and growing at ~8% CAGR. The demand driver is structural: 3 million pandemic-era dogs are now reaching prime boarding age and their owners are back in offices. One in four UK kennels closed during COVID and never reopened — so supply is tight and operators are stretched. The overwhelming majority of independent kennels still run on paper diaries, WhatsApp, and spreadsheets. The only UK-native software at the relevant price point (Carica Pets, £5–20/mo) has essentially no market presence. There is no clean, purpose-built, UK-native kennel intake product at the £35–50/mo tier. That's the gap.

---

## The Software Landscape

### Who exists

The market is dominated by US companies, most of which have been rolled up under a single PE firm (Togetherwork, owned by Aquiline Capital), which now owns Gingr, PetExec, and DaySmart Pet. All three are seeing post-acquisition price rises and support collapse — users are actively looking to leave.

The most relevant players for a UK audience:

| Product | Price | Notes |
|---|---|---|
| Revelation Pets | $39–55/mo (~£30–43) | US-based; most commonly used by UK kennels. Best value in its tier. But data loss bugs, doubled in price over 4 years, US support hours. |
| KennelBooker | $42–87/mo (~£33–68) | Ireland-based; works for UK. Stripe-only payment lock-in is a common complaint. |
| Gingr | $105–155/mo | US; PE-owned; post-acquisition support collapse and price rises. Users fleeing. |
| Carica Pets | £5–20/mo | Only UK-native product. Zero market presence or review base. |
| PawPal | Unknown | Newer UK entrant; lightweight, but marketing blog rather than established product. |

**No existing product is specifically designed for the UK regulatory environment.** The 2018 Animal Activities Licensing (AAL) regulations impose specific record-keeping requirements that councils inspect against — vaccination logs, incident records, welfare checks — and zero of the mainstream tools address this.

### What they all get wrong

Consistently cited complaints across all platforms:

- **Support collapse** — chat-only or multi-day response times; no live UK-hours phone support
- **Bugs and data loss** — vaccination records disappearing, reservations vanishing, overbooking
- **Price creep** — base prices systematically mislead; SMS costs, payment processing uplift, per-module fees, and setup charges routinely add 50–200% to the headline figure
- **Complexity** — built for 30+ run operations with daycare, grooming, training, and retail. A 12-run kennel with two part-time staff pays for functionality they'll never open
- **Stripe lock-in** — UK operators want BACS, bank transfer, and their existing card machine; Stripe-only solutions miss this
- **Client-facing portals that don't work** — promised to reduce phone calls; in practice, dog owners bypass them and ring anyway
- **No WhatsApp integration** — UK pet business communication is WhatsApp-first; every existing tool offers email and SMS, which customers treat as secondary

### The structural opportunity from Togetherwork

Gingr, PetExec, and DaySmart have a large combined installed base. All three are now showing the classic PE playbook: price increases (20–60% within 24 months of acquisition), support headcount cuts, reliability deterioration. Users want to leave but face switching cost lock-in (years of client data, custom configurations). A product that makes migration from these platforms frictionless has a concrete acquisition lever right now.

---

## Kennel Owner Pain Points

### How they actually operate today

Most independent UK kennels run on:
- A paper diary or appointment book (primary booking record)
- Excel spreadsheets (availability and finance)
- WhatsApp for client updates and enquiries
- Facebook Messenger for initial enquiries
- Email for confirmations and paperwork
- Phone for everything else

Enquiries arrive across all five channels simultaneously, with no unified thread. Information is siloed by channel, lost between staff shifts, and never centralised.

### The real pain, in priority order

**1. Communication chaos**
Enquiries arrive via phone, Facebook Messenger, WhatsApp, email, and website forms — all simultaneously. There's no inbox. Staff miss messages, reply late, lose enquiries. Critical care information (dietary needs, medication schedules, behavioural triggers) is communicated verbally, scribbled in notebooks, or written on carrier bags, and doesn't transfer reliably between staff.

**2. Admin volume**
Staff at manually-run facilities spend an estimated 8–15 hours per week on booking-related admin: responding to enquiries, confirming reservations, chasing vaccination certificates, processing payments, writing invoices. For a sole-trader running 10–15 runs, this is a significant slice of the working week.

**3. Vaccination record management**
Every licensed kennel must verify vaccinations before drop-off. The current process is: ask owner to bring the vaccination book, owner forgets, confrontation at the gate. Or: the kennel keeps photocopies somewhere, can't find them, or discovers an expired record only at check-in. This is also a compliance issue — the 2018 regulations require documented vaccination records for inspection.

**4. No-shows and late cancellations**
A last-minute cancellation during Christmas week is total revenue loss — the kennel already turned away all other enquiries for that slot. Most operators take a non-refundable deposit (commonly 50% for Christmas bookings) as their only protection, but collecting and tracking deposits manually — phone call, bank transfer, email confirmation, matching against a diary — is itself a time cost. There is no automated waitlist.

**5. Peak period management**
Christmas, school half-terms, and August are when the business makes or loses the year. The enquiry volume during booking season is enormous; managing it manually — cross-referencing a paper diary, maintaining a verbal waitlist, sending individual confirmations — is the highest-friction time of the operator's year. Everything is done reactively, by hand.

**6. Financial opacity**
Most operators have never calculated their actual cost-per-night. They price by looking at what nearby competitors charge. Revenue leakage from unbilled extras (additional walks, medication administration, extended stays) is common. Operating costs typically consume 78–95% of turnover at small UK kennels.

### Why operators don't adopt software

This is the most instructive area. The resistance is real and layered:

- **Cost vs. scale**: $150/month is a hard sell for a 12-run kennel on thin margins. A paper diary costs nothing.
- **Over-engineered**: available software was designed for 30+ run operations with multiple service lines. A sole trader running home boarding doesn't need a multi-module platform.
- **Learning curve during a live operation**: kennel work is physical and constant. Onboarding new software while dogs are boarding feels impossible.
- **Data trust**: word-of-mouth about data loss spreads through local kennel networks and kills adoption. Operators who've built a booking history in Excel don't trust cloud software with their client records.
- **The "I'm already full" problem**: operators turning away dozens of enquiries a week feel least motivated to change systems. The admin burden is experienced as a cost of success, not a solvable problem.
- **Demographic factors**: many UK kennel businesses are run by people who've operated for 15–25 years. The paper diary is trusted and familiar.

---

## Dog Owner Pain Points

### The booking experience, as it stands

Dog owners encounter multiple layers of friction:

**Availability crisis**: post-COVID supply crunch means many kennels are fully booked 6–12 months in advance at peak. One-in-four kennels that closed during COVID never reopened, while pandemic dog ownership added 3 million new dogs.

**No online booking**: the vast majority of UK kennels still operate on phone-or-email-only enquiries. Dog owners can't check availability or book at 11pm on a Sunday. They submit a form, wait 2+ days for a response, and often find the dates are gone.

**No visible availability or pricing**: most kennel websites don't show a live calendar or prices. Owners must fire off an enquiry just to establish if a kennel is available and what it costs. Hidden peak surcharges and extras (medications, grooming, special diets) add to the opacity.

**Vaccination paperwork**: many dog owners discover too late that kennel cough vaccination requires a 2–6 week waiting period. Physical vaccination cards must be brought to drop-off. The paperwork expectation is rarely clearly communicated upfront.

**No updates during the stay**: most traditional kennels send zero proactive communication between drop-off and collection. One Mumsnet user wrote: *"I would love to ask the owner to send me daily pictures of him but I feel like that would be asking too much."* The fact that asking for photos feels like an imposition tells you everything about the baseline. Home boarders routinely send daily photos and texts; traditional kennels almost never do.

**Post-stay trauma**: a recurring theme across forums. Dogs returned thinner, withdrawn, with chewed blankets, not eating, "not themselves for days." These stories spread widely in local Facebook groups and poison the well for the whole industry.

### What dog owners actually want

- Online availability and provisional booking, confirmed within hours not days
- Transparent pricing upfront, including all extras
- Digital pre-arrival admin: upload vaccination certs, sign waivers, complete a dog profile — once, not repeated every visit
- Proactive updates during the stay: at minimum, a daily photo and message
- A single clear communication channel with the kennel, not WhatsApp AND email AND phone
- Visible confirmation that the kennel is properly licensed and its star rating
- The ability to visit the kennel before committing

### The trust gap

Dog owners can't verify claims. *"We provide 24/7 care"* and *"dogs are never left alone"* are unverifiable. The information asymmetry between what a kennel says and what happens after drop-off is enormous. This is why word-of-mouth from a vet or trusted friend still dominates as the primary discovery mechanism — it's the only trust signal that works.

---

## What This Means for Zoovia

### The market thesis holds

You're right that there's an underserved market. Specifically:

- The UK has no clean, purpose-built intake/booking product at the £35–50/mo tier
- The closest options are US-based, have serious bugs and support issues, and are getting worse as PE consolidation squeezes them
- Operators are stretched, running on manual systems, and resistant to complex over-engineered tools
- The 2018 AAL regulations have raised compliance complexity without giving operators the tools to manage it
- Demand is structurally elevated and growing

### The specific wedge you've chosen (intake-only) is validated

The biggest single pain point — communication chaos across multiple channels with no unified thread — is exactly what a clean booking request flow solves. Your "front door" positioning is the right one. The operators who need this most are the ones drowning in peak-period enquiry volume without the admin bandwidth to handle it.

### The risk to watch

The "I'm already full" problem. Operators at peak capacity feel least motivated to adopt tools. The sweet spot is operators who are growing, have recently had a bad experience (double-booking, missed medication, lost enquiry), or are younger and less habituated to paper systems. Your marketing should speak to the *fear* of a missed enquiry or a compliance failure, not the promise of efficiency.

### Potential differentiation moves worth considering

1. **AAL compliance tools**: no competitor addresses the record-keeping requirements of the 2018 regulations. A simple vaccination log, incident record, and inspection-ready export would be a genuine UK-only differentiator.
2. **WhatsApp integration**: every other tool offers email and SMS; UK kennel communication is WhatsApp-first. A Zoovia-to-WhatsApp thread per booking would be transformative.
3. **Dog owner comms during stay**: the #1 ask from dog owners is proactive updates. A lightweight "send a photo update" flow — simple for the kennel, massively valued by owners — could become a retention and word-of-mouth driver.
4. **BACS/bank transfer support**: Stripe-only lock-in is a consistent complaint. Supporting UK bank transfer payment collection would remove a genuine adoption barrier.
5. **Migration hook**: as Togetherwork users look to leave Gingr/PetExec, a clear "import your client data" flow is a timely acquisition play.

---

*Research conducted August 2026. Four parallel research agents covered: (1) existing software landscape, (2) UK kennel owner pain points, (3) UK market size and structure, (4) dog owner booking experience.*
