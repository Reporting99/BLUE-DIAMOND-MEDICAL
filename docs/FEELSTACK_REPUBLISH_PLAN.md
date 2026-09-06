# FeelStack Republishing Plan — Blue Diamond Medical

**Generated:** 2026-09-06
**Site key:** `blue-diamond-medical`
**Project ID:** `d1a870a4-a514-4719-bf71-6cff26b18dcb`
**Status:** `NEEDS_CMS_REPUBLISH` — 59 field-level patches across 13 routes.

---

## 1. Why this document exists

A block of published content on this site is **owned by FeelStack, not by this repository**.
For those routes `FEELSTACK_CONTENT_MODE=hybrid` means the CMS record wins: the static
TypeScript in `src/features/**` is a fallback that never renders while a published CMS
record exists.

The repository's own data has already been corrected. Editing it again would change
nothing a visitor sees. **The stale text is in the CMS, and only a CMS republish removes
it.** This plan exists so that work can be done precisely, by someone who has the write
credentials this session does not.

### What access was available

| Capability | Status |
| --- | --- |
| FeelStack **read** (public resolve API) | ✅ Available and used |
| FeelStack **write** / publish | ❌ No credentials in this environment |

Because read access worked, every `currentPublishedText` in the machine-readable files is
the **verbatim live value**, and every `recordId` / FAQ id is the **real UUID** — not a
guess, not a forward declaration. The raw API responses are archived at
`evidence/cms-live/raw.json`, with a human-readable rendering at
`evidence/cms-live/digest.txt`.

---

## 2. The machine-readable package

| File | Use |
| --- | --- |
| `evidence/feelstack-content-patches.json` | Canonical source. One object per field-level change. |
| `evidence/feelstack-content-patches.csv` | Same rows, UTF-8 BOM, for spreadsheet review and sign-off. |
| `evidence/cms-live/raw.json` | Full live API responses captured 2026-09-06 (the "before" evidence). |
| `evidence/cms-live/digest.txt` | Readable dump of every live record's fields and FAQs. |

Each row carries: `recordId`, `contentType`, `routeEn`, `routeAr`, `locale`, `fieldPath`,
`currentPublishedText`, `approvedReplacementText`, `clientChangeId`, `reason`,
`sourceOfTruth`, `verificationUrl`, `status`.

**Arabic rows.** Where an Arabic FAQ's current text is shown as a `<...>` placeholder, that
is deliberate: the Arabic FAQ bodies are not returned in the same shape by the resolve
endpoint, so rather than transcribe them approximately the row identifies the record and
FAQ **by UUID** and gives the exact approved Arabic replacement. The editor opens that FAQ
by id and replaces the answer. Every Arabic *field* value (summaries, partner notes,
`whats_included`) **was** captured verbatim.

---

## 3. Routes covered

| Route (EN) | Patches | Principal defect |
| --- | --- | --- |
| `/medical/minor-procedures` | 18 | Bakare-exclusivity; `booking_channel` wrong; "Mika" |
| `/medical/preventive-care` | 11 | Saeed-exclusivity; "Mika" |
| `/medical/chronic-disease-management` | 8 | Bakare-exclusivity; "Mika" |
| `/medical/pain-management` | 6 | Bakare-exclusive joint injections; "Mika" |
| `/medical/after-hours-care` | 6 | PCN pathway named for only 2 of 6 physicians |
| `/medical/weight-management` | 2 | "Mika" |
| `/our-team/mohamed-farhat` | 2 | "28 years" vs approved "over 30 years" |
| `/our-team/reem-hamdi` | 1 | Bio omits certifications incl. Botox certification |
| `/our-team/ahmed-gwea` | 1 | Superseded bio; missing walk-in leadership |
| `/our-team/omaima-saeed` | 1 | Missing walk-in leadership |
| `/our-team/omonijo` | 1 | Missing walk-in leadership |
| `/patient-resources` | 2 | Missing pharmacy-extension instruction |
| `/aesthetics/treatments/prp-skin-rejuvenation` | 2 | **No change** — verified correct |

`/medical/eye-screening` and `/medical/uninsured-services` were probed and are **clean**.

---

## 4. The four defect classes

### 4.1 Provider exclusivity (CL-015 / CL-016 / CL-017) — the largest class

Published records present **ordinary, clinic-wide family medicine** as though it belonged
to one named physician. Live examples:

> "AHS-insured minor procedures including suture removal and application, **with Dr. Bakare
> additionally offering** in-house minor skin lesion excision and joint injections."

> "Do I need to see Dr. Bakare specifically?" — "For skin lesion excision and joint
> injections, **yes**."

The rule being restored: *all current family physicians are qualified to provide general
family medicine, chronic disease management, minor procedures, preventive care and other
ordinary family-medicine services* unless a verified record proves a genuine restriction.

**This is not a removal of Dr. Bakare.** His biography and his genuine clinical interests
(chronic disease management, palliative care, teaching, skin lesion excision, intra-articular
injections) stay exactly where they are — on his own profile. What is removed is the claim
that the *clinic's* services are *his* services. The same applies to Dr. Saeed and preventive
care.

### 4.2 Genuinely doctor-specific content — PRESERVE

Two attributions are correct and must survive this pass untouched:

- **PRP** (skin rejuvenation and hair restoration) — Dr. Farhat. The extraction document
  states it twice: *"Performed by Dr. Farhat"* and *"PRP treatments are performed by Dr.
  Farhat."* The package includes these rows explicitly marked `VERIFIED_NO_CHANGE` so a
  reviewer working through the provider-neutrality corrections does not generalise them by
  momentum.
- **Cosmetic Botox** — Dr. Mohamed Farhat and Dr. Reem Hamdi, and no one else. Do not
  broaden this to "all doctors", and do not extend Dr. Hamdi to aesthetics, PRP, hair
  restoration, after-hours or PCN statements — her name appears in the Botox context only.

### 4.3 Booking-pathway integrity (CL-018 / CL-019)

- `/medical/minor-procedures` publishes `booking_channel: "family-doctor"`, which would put
  the one service that must **never** be bookable online into the online queue. The frontend
  already defends against this (`authoritativeBookingChannel()` in
  `src/features/medical-services/cms-contract.ts` makes the *static* channel win for any
  service this repository defines), so the rendered page is safe today. The CMS record is
  still wrong and must be fixed at source — the guard is a seatbelt, not a reason to leave
  the record broken.
- Five FAQ answers still say **"Mika"**. The canonical vendor spelling is **Mikata**
  (CL-019); both "Mika" and "Mikita" are stale.

Booking destinations must stay separated after republishing:

| Audience | Destination |
| --- | --- |
| New patients & walk-ins | `https://ab.skipthewaitingroom.com/walk-in-clinic/calgary/blue-diamond-medical/blue-diamond-medical` |
| Registered / current patients | Mikata (`app.mikatahealth.com`, clinic's tokenized link) |
| Generic header / mobile "Book Appointment" | `/book-appointment` |
| Minor procedures | **No online booking** — phone or in person |
| Eye screening | Euclid only |
| Aesthetics | Mikata aesthetics pathway, 20-minute consultation with Dr. Farhat |

Do not introduce Jane links or any other booking host while editing.

### 4.4 After-hours / PCN (CL-011)

The published record documents an after-hours pathway for **two** named physicians and
tells everyone else no pathway is documented for them. Extraction_1(5).docx settles this,
and the correction is now **source-proven rather than inferred**:

- Clinic-level membership — *"As a member of the Calgary West Central Primary Care Network
  (CWC PCN), **our doctors and our clinic** work collaboratively with CWC PCN team
  members."*
- One documented exception — Mosaic PCN for **Dr. Hamdi's** patients.

So: **Mosaic for Dr. Reem Hamdi's patients; Calgary West Central for patients of all other
Blue Diamond family physicians.** No individual physician's PCN assignment is invented
beyond that clinic-wide default and the one named exception.

---

## 5. Contact-number rules to hold while editing

Where both clinics are appropriate, present them as two labelled lines, with `tel:` links:

```
Medical Clinic      825 413 1113
Aesthetic Clinic    (403) 247-1418
```

- **Never** describe 825 413 1113 as a Botox-only number. It is the general medical clinic
  line.
- The sentence *"To book medical Botox (migraine, bruxism, hyperhidrosis), please call us
  directly."* and every equivalent must not be reintroduced. It has zero occurrences in the
  repository today.
- Do not reinstate a dedicated Botox-only contact block on the booking page or the Botox
  page.

---

## 6. How to republish

For each row in `feelstack-content-patches.json`:

1. Open the record by `recordId` in the FeelStack admin for the project above
   (`content_entry` and `aesthetic-treatment` values live under `data.fields`;
   `person_profile` values live at the top level of `data`).
2. Navigate to `fieldPath`. For FAQ rows the path is
   `relations.faqs[<faq-uuid>].<question|answer>` — the UUID is the FAQ's real id.
3. Confirm the field still reads `currentPublishedText`. **If it does not, stop** — someone
   else has edited the record since 2026-09-06; re-capture before proceeding.
4. Replace with `approvedReplacementText` exactly. Do not paraphrase, shorten, or
   "improve" approved clinical copy.
5. Rows whose `fieldPath` says `(DELETE ENTIRE FAQ)` remove the whole FAQ entry, not just
   its answer.
6. **Publish** the record. A saved draft does not change the live page.
7. Repeat for the paired locale. EN and AR are **separate records with separate UUIDs**;
   publishing one does not publish the other.
8. Confirm cache invalidation reached the site — the webhook path is
   `src/lib/feelstack/webhook-handler.ts` and requires `FEELSTACK_REVALIDATE_SECRET` plus a
   matching `FEELSTACK_PROJECT_ID`. If those are unset in the deployed environment, the
   page will keep serving the old text until the route's cache expires.

---

## 7. Verification — required before any PASS

Republishing is not "done" until the **rendered** page is checked. For each affected route,
in **both** locales, open `verificationUrl` and confirm:

- [ ] No "Dr. Bakare" / "الدكتور باكاري" on any clinic-wide medical service page.
- [ ] No "Dr. Saeed" / "الدكتورة سعيد" qualifier on `/medical/preventive-care`.
- [ ] No "Mika" or "Mikita" anywhere — only "Mikata".
- [ ] `/medical/minor-procedures` offers **no** online booking control, and its phone CTA
      dials the **medical** clinic line.
- [ ] After-hours page names Mosaic for Dr. Hamdi's patients and CWC PCN for all others.
- [ ] Dr. Farhat's profile reads "over 30 years", not "28 years", in both locales.
- [ ] PRP still attributed to Dr. Farhat; cosmetic Botox still attributed to Dr. Farhat and
      Dr. Hamdi, and to no one else.
- [ ] Both clinic numbers labelled with their real purpose; neither described as
      Botox-only.

Then re-run the stale probe that produced `evidence/stale-cms-probe.json` and confirm
`totalStaleHits: 0`.

**Until that probe reads zero, `CMS_CONTENT_AUDIT` stays `NEEDS_REPUBLISH` and
`CLIENT_CHANGES_COMPLETE` stays `NO`.**

---

## 8. Known blockers carried forward

| # | Blocker | Owner |
| --- | --- | --- |
| B-1 | No FeelStack write credentials in this environment — 59 patches cannot be applied here. | Client / CMS admin |
| B-2 | No approved **Arabic** translation of Dr. Farhat's CL-034 biography. The Arabic record cannot be brought to parity without one; the interim fix is the 28→30 correction alone. | Client |
| B-3 | Dr. Farhat's Arabic profile will remain a shortened paraphrase of the English until B-2 is resolved. | Client |
| B-4 | PCN assignments for individual physicians beyond the clinic-wide CWC default and the named Mosaic exception for Dr. Hamdi are **not proven** and were not invented. | Client |
