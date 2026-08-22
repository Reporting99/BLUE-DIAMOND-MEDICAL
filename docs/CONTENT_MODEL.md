# Content Model

What content exists, where it came from, what is deliberately missing, and how
media is handled. Companions: `ARCHITECTURE.md`, `FEELSTACK.md`,
`DEPLOYMENT.md`.

---

## 1. Entity types

| Entity | Type | Content | Route |
|---|---|---|---|
| Medical service | `types/medical-service.ts` | `content/medical-services.ts` | `/medical/[serviceId]` |
| Doctor | `types/doctor.ts` | inline in the same file | `/doctors/[doctorId]` |
| Aesthetic treatment | `types/aesthetics.ts` | `content/treatments.ts` | `/aesthetics/treatments/[treatmentId]` |
| Concern | `types/aesthetics.ts` | `content/concerns.ts` | `/aesthetics/concerns/[concernId]` |
| Technology | `types/aesthetics.ts` | `content/technologies.ts` | `/aesthetics/technologies/[technologyId]` |
| Product | `types/product.ts` | `content/products.ts` | `/shop/[productId]` |
| Health Hub article | `types/article.ts` | `content/health-hub-articles.ts` | `/health-hub/[articleId]` |
| Legal page | `types/legal.ts` | `content/legal-pages.ts` | `/[legalPageId]` |
| Before/after | `types/before-after.ts` | `content/before-after.ts` | `/aesthetics/before-after` |
| Pricing | `types/pricing.ts` | `content/uninsured-fees.ts`, `content/aesthetics-pricing.ts` | `/medical/uninsured-services`, `/aesthetics/pricing` |
| Media manifest | `types/media.ts` | `content/media/image-manifest.ts` | — |

Clinic facts (address, phone, fax, hours, social) live in `config/site.ts` and
`config/clinic-hours.ts` and are read from there by every component and schema —
never hardcoded elsewhere.

FAQs and prices are **not** standalone entities; they travel embedded on their
parent entity, in both the local types and the CMS schemas. Each entity's CMS
counterpart and cache tags: `FEELSTACK.md` §4–5.

## 2. Bilingual by construction

Every user-facing string field is `Bilingual` (`{ en: string; ar: string }`).
There is no code path that can register English-only content — the type makes
both required. Same for routes: `RouteEntry.path` is a required `{ en; ar }`.

### Arabic review status

**All Arabic copy is AI-drafted and unreviewed.** It was written for register,
medical tone and natural phrasing rather than machine-literally, but it needs a
native-speaker pass — and, for anything clinical, a medically-literate reviewer
— before this is the production Arabic site.

Highest priority for review, by volume and clinical specificity:
`content/treatments.ts` (mechanism-of-action language, contraindications,
downtime), then `content/medical-services.ts` (including 42 FAQs, 6 per
service), `content/concerns.ts`, `content/technologies.ts`, and
`content/uninsured-fees.ts` (fee labels should match how patients actually refer
to these documents).

Specific items needing confirmation:

1. **Doctor name transliterations**, especially "Dr. Ahmed Gwea" → `أحمد جويع`,
   a best-effort phonetic rendering with no confirmed source spelling. Each
   doctor should ideally confirm their own preferred Arabic spelling.
2. **Medical terminology** — e.g. bruxism/TMJ → `صرير الأسنان (TMJ)`,
   hyperhidrosis → `التعرق الزائد`. This draft uses Modern Standard Arabic
   throughout; regional expectations vary.
3. **Numerals policy** — Western/Latin digits everywhere, including inside
   Arabic paragraphs, so phone numbers and prices never visually reverse. A
   deliberate design decision; some Arabic-first audiences prefer `٠١٢٣`.
4. **Legal and clinical disclaimers** — translated, not reviewed by anyone with
   Arabic medical-legal expertise.
5. **Manufacturer names** (Elite iQ™, Potenza, TempSure, Cynosure) are kept
   untranslated as proper nouns; confirm this matches how the clinic wants brand
   names presented in Arabic.

Closing this out: export all `ar:` strings, native-speaker pass, medical
sign-off on clinical terminology, then remove this status.

## 3. Sources and provenance

### Approved source documents

| File | Used for |
|---|---|
| `BLUE DIAMOND LOGO DOCUMENT[10519].pdf` (Decca Design Inc.) | logo geometry, 4-blue/4-grey palette, wordmark reference |
| `Blue-Diamond-Medical-Website-Content-Extraction_1.docx` | all site copy: home, fees, uninsured services, doctor bios, aesthetics, Botox, eye screening, PCN, policies, careers, contact, SkinMedica price list, and the full aesthetics-domain treatment/technology/concern catalogue |

No other client documents have been supplied — no aesthetics pricing, no
before/after photography, no legal copy, no headshots, no day-by-day hours, no
ImageKit or FeelStack credentials.

**Source priority:** (1) the two documents above, (2) direct brief instructions,
(3) a live crawl of both legacy domains — used strictly for *discovery* (finding
URLs absent from the DOCX and reading their titles for correct redirect
targeting), never as a copy source.

That crawl found 10 real pages missing from the DOCX-derived inventory
(`/tempsure`, `/microneedling`, `/vitalia`, and 7
`/about-skinmedica-products/f/<slug>` pages), all now redirected rather than
left to 404. `sitemap.ola.xml` and `/ols/products` are GoDaddy platform
artifacts, not editorial pages.

**Never used:** competitor clinic sites (structure only, never content), stock
photography, AI-generated photography, or any non-ImageKit production image
source.

### The governing rule

**A field with no approved source is omitted, never invented.** A missing
optional field means the section is not rendered — never placeholder text, never
"coming soon". `sourceVerified` on an entity means every field traces to the
approved extraction document. Products additionally carry per-fact `sources`
with publisher and retrieval date.

This is what makes the structured data safe: schema is generated only from
fields that already exist and are already rendered, so JSON-LD can never assert
something the page does not show.

### What is published, and on what basis

| Claim | Status |
|---|---|
| Clinic address, phone, fax | Approved — header, footer, contact, homepage, JSON-LD |
| Opened 2022-07-04, founded by Dr. Farhat, 28+ years | Approved — homepage, about |
| Six physicians, names and bios | Approved — doctors index and profiles |
| AHS-insured service list; 7 service pages | Approved |
| Uninsured fee tables + no-show schedule | Approved, published verbatim |
| Botox treatment list and insurance/compassionate-program note | Approved, using the source's exact qualified phrasing |
| Clinic policies | Approved — patient resources |
| Eye screening (Euclid Telehealth partnership) | Approved |
| After-hours care (Mosaic PCN / CWC PCN partners) | Approved |
| 8 aesthetic treatments, 9 concerns, 5 technologies — full clinical detail | Approved, published |
| 23 SkinMedica products — names, prices, sizes, bilingual detail, FAQs | Client-approved, published |
| Reviews, ratings, awards, patient counts, certifications | **Never to be fabricated** — absent from every page and every JSON-LD block |
| Doctor photography, aesthetics pricing, before/after, legal copy | **Not approved / not supplied** |

Clinical review of treatment, concern and technology mechanism/safety text is
**recommended and not yet performed**.

### Documented editorial deviations

- **Concern → treatment cross-links** for Rosacea, Spider Veins and Sun Damage:
  the legacy site linked all three to `/laser-hair-removal`. The extraction doc
  itself flags a mislink pattern elsewhere ("Ultra Treatment — links to
  /prp-therapy, mislabeled"), so these were relinked to Laser Skin Treatments,
  whose approved content explicitly covers redness, spider veins and
  pigmentation. Recorded on each entry via `correctedFromSource`.
- **Elite+ vs Elite iQ™**: the source uses both. Treated as equipment family vs
  specific configured device, not as interchangeable names —
  `technologies.ts` registers `elite-iq`, matching the source's own FAQ usage.
- **SkinMedica naming corrections**: "Total Defence" → "Total Defense + Repair
  SPF 34" (Tinted and Clear), "TNS Advanced Plus Serum®" → "TNS® Advanced+
  Serum", "HA5 Rejuvenative Hydrator" → "HA5® Rejuvenating Hydrator". Approved
  price and size preserved; each mapping recorded in the product's bilingual
  `detail.legacyNameNote`. Verified via skinmedica.com plus authorized Canadian
  retailers — skinmedica.ca returned HTTP 403 on every attempt, documented
  rather than silently worked around.
- **Scar Recovery Gel** ships as two independent product records cross-linked by
  `variantOfId` rather than one variant-selector page — there is no variant model
  in the data layer and checkout is disabled regardless.
- **Product `concernIds` are deliberately empty.** The approved catalogue groups
  products by "Factor", which is organizational, not a clinical-suitability
  claim. Populating concern-targeting would mean inventing a suitability claim.

## 4. Open conflicts needing a client decision

None block the build; each is resolved using the source-priority order with the
conflict recorded rather than silently picked.

1. **Doctor roster** — the DOCX names six physicians; the legacy live site
   reportedly showed a different count. The DOCX wins and all six are published.
   **Launch blocker**: confirm the roster is current. If Dr. Gwea has left, the
   fix is one line — routes regenerate from the doctors array.
2. **Three unidentified portraits** — the licensed archive holds two unnamed
   female portraits (one remaining female slot, Dr. Omonijo) and one unnamed
   male portrait (Dr. Bakare or Dr. Gwea). None were guessed. Client must confirm
   which name belongs to each.
3. **Opening hours** — both legacy sites published only "open today" plus one
   range (clinic 08:00–19:00, aesthetics 09:00–17:00). Mon–Fri applied,
   Saturday/Sunday marked "not confirmed, closed by default" rather than
   invented. Needs the real weekly schedule.
4. **TempSure Vitalia prevalence** — the DOCX says "roughly 1 in 3 women"; the
   live legacy page says "nearly 1 in 4". The DOCX figure was kept, not averaged
   or reconciled. Needs confirmation of which is current.
5. **Before/after assets** — 15 candidates found, none approved; several pairings
   unconfirmed. Needs clinical/marketing review before any import.
6. **Aesthetics phone number** — `(403) 247-1418` is genuinely a different
   reception line from the clinic's `(825) 413-1113`. Not a conflict, but easy
   to mistakenly "unify"; kept as separate fields in `config/site.ts`.

## 5. Feature gating

`config/features.ts` is the single set of flags. A disabled feature is hidden
from navigation, excluded from the sitemap, and unreachable — its route calls
`notFound()`. It never renders an empty page. Gated routes are fully built, so
enabling one is a flag flip, not new code.

| Flag | Blocked on |
|---|---|
| `shopCheckoutEnabled` | no payment provider implemented or approved |
| `legalPagesEnabled` | legacy Terms/Privacy are literal "Coming soon" placeholders |
| `healthHubArticlesEnabled` | template and model built; zero approved articles drafted or medically reviewed |
| `beforeAfterEnabled` | no approved before/after photography |
| `consultationFormEnabled` | no approved consultation-intake flow |
| `aestheticPricingEnabled` | no approved aesthetics price list (distinct from SkinMedica product prices) |
| `newsletterEnabled` | no email provider configured |
| `medicalBotoxDetailPagesEnabled` | its only source content already lives in full on `/botox` |
| `cosmeticBotoxTreatmentPageEnabled` | its only source content is the treatment-area list already on `/botox` |
| `skinTighteningTreatmentPageEnabled` | "skin tightening" is the Radio Frequency/TempSure page's stated function, not a distinct procedure |
| `newProductBrandEnabled` | no second approved brand |

`shopEnabled` and `careersFormEnabled` are on.

`/health-hub/[articleId]` has no flag at all — it is gated purely by
`content/health-hub-articles.ts` being empty, so `generateStaticParams` returns
nothing and any slug 404s.

### Other things deliberately not shown

- **Contact form delivery** — validates and rate-limits, then fails closed with
  a "please call us" fallback rather than a false success, until
  `CONTACT_DELIVERY_PROVIDER` exists.
- **Careers applications** — `mailto:` only; no file upload or ATS integration
  was supplied.
- **Day-by-day hours** — see §4.3.

## 6. Media

Every image is an entry in `content/media/image-manifest.ts` with an approval
`status`. Only `"approved"` renders the real ImageKit path; everything else
renders the FacetTile placeholder, so an unapproved or missing photo degrades to
a designed placeholder rather than a broken image.

**41 registered assets: 0 approved, 4 identity-confirmed and ready to import, 3
candidates with unconfirmed identity, 1 permanently disabled, 33 pending.**

The approved account and endpoint are known —
`https://ik.imagekit.io/oq92dh6zib`, media root `/blue-diamond/` — and
`config/imagekit.ts` already defaults to them, so **no environment variable is
needed just to point at the right account**. What is missing is the public and
private keys (needed only for authenticated upload) and any actual uploaded
photography.

### Doctor image rules (binding)

- **Dr. Saeed — no photo, ever.** Declined by the subject; permanent, never
  revisit. Facet tile only.
- **Dr. Farhat, Dr. Hamdi** — real licensed portraits exist and are
  identity-confirmed (Dr. Hamdi via a visible embroidered name badge). Ready to
  import the moment credentials exist.
- **Dr. Omonijo, Dr. Bakare, Dr. Gwea** — real non-stock portraits exist but
  carry no visible name. Not assigned. See §4.2.
- No stock or generated face is ever substituted for any doctor.
- All doctor cards render at identical dimensions photographed or tiled, so
  nothing shifts when real photos arrive.

### Also ready to import

Real clinic-interior signage and reception photography, and manufacturer device
photography for 4 of 5 technologies (Elite iQ, Potenza, TempSure, Ultra —
TempSure Vitalia not distinctly identified). No SkinMedica bottle photography
exists in the archive; every product renders the placeholder until real
photography is supplied. The 15 before/after candidates must not be imported
before clinical review.

The logo in `components/layout/Logo.tsx` is a **functional recreation** from the
approved PDF's coordinates and colors — no master vector was supplied. Swap for
Decca Design Inc.'s master file before launch.

### Import procedure

```bash
node scripts/imagekit-import.mjs            # dry run, no credentials needed
node scripts/imagekit-import.mjs --upload   # real upload, once keys are set
```

Set in `.env.local` (never committed):

```env
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/oq92dh6zib
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_xxxxxxxxxxxx
IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxxxx
```

`IMAGEKIT_PRIVATE_KEY` must **never** take a `NEXT_PUBLIC_` prefix. Verify after
a production build: `grep -r "IMAGEKIT_PRIVATE_KEY" .next/static` must return
nothing.

The script uploads only assets it classified as ready — never the unidentified
portraits or the before/after candidates. After upload, flip each manifest
entry's `status` to `"approved"` manually. Nothing auto-promotes an asset just
because a file exists in the account, which is what keeps `"pending"` a
meaningful signal.

**Honest gap:** no live ImageKit account exists in this environment, so the
`--upload` path and real CDN delivery have never been exercised end-to-end. Only
the dry-run classification has been run. "Believed correct from the SDK's
documented Upload API" is not the same claim as "tested".

## 7. Booking

There is **no internal booking calendar, form, or patient-data collection**, by
design — this keeps PHI entirely off the codebase. Every "Book" CTA resolves
through `config/booking.ts`, never a hardcoded URL.

| Channel | Provider | Destination |
|---|---|---|
| `family-doctor`, `walk-in` | Mika | `https://mika.care` |
| `eye-screening` | Euclid Telehealth | `https://euclidtelehealth.org/book-now` |
| `aesthetics-consultation` | Jane App | `https://bluediamondmedical.janeapp.com` |
| `phone-medical-botox` | telephone | `tel:+18254131113` |
| `phone-aesthetics` | telephone | `tel:+14032471418` |

`getBookingUrl(channel)` is the only supported way to render a booking CTA.
`allowedBookingHosts` is validated by `lib/security/booking-allowlist.ts`, so a
future channel pointing outside the allowlist fails a check rather than silently
linking to an unreviewed host. URL destinations open in a new tab, so leaving
the site is explicit.

`/book-appointment` is a routing hub, not a form. The general contact form is
validated to reject health/medical free-text so it cannot become a de facto
intake form. Nothing anywhere asks for date of birth, health card number,
symptoms or medical history, and no booking data is stored, logged or
transmitted by this codebase.

**Open item:** Arabic pages should note that an external booking system may open
in English. Whether Mika, Euclid or Jane support Arabic could not be confirmed
(`mika.care` redirects to a JS-rendered app), so rather than assert an
unverified fact the recommended copy is true either way:
"سيتم فتح هذا النظام في نافذة جديدة، وقد لا يكون متوفرًا باللغة العربية."
Not yet implemented.

## 8. Adding or changing content

1. Add or edit the entry in `src/content/*.ts`, filling only fields with an
   approved source.
2. If it needs a new route, add it to `src/config/routes.ts` with both locale
   paths — nav, breadcrumbs, canonical, hreflang and sitemap follow
   automatically.
3. Record provenance in §3 above.
4. For images, add a manifest entry with `status: "pending"` and flip it to
   `"approved"` only once the asset is uploaded and signed off.
5. Run `npm run validate` and the Playwright suite. The static-analysis tests
   reject unapproved image hosts, catalogue drift, and sitemap or hreflang
   inconsistency.

Once FeelStack is provisioned, the same entities become CMS-managed one family
at a time — `FEELSTACK.md` §7.
