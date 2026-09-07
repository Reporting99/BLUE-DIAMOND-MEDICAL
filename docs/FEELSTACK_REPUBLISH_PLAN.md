# FeelStack Republishing Plan — Blue Diamond Medical

**Generated:** 2026-09-06
**Site key:** `blue-diamond-medical`
**Project ID:** `d1a870a4-a514-4719-bf71-6cff26b18dcb`
**Status:** `NEEDS_CMS_REPUBLISH` — **6 operations** still to apply. See below.

---

## 0. Status, re-derived from the records — 2026-09-07

Everything below §1 describes the set as generated on 2026-09-06. Most of it has
since been applied. This section is the current state, taken from
`--mode=verify` against the live public resolver rather than from any earlier
summary, and it supersedes the counts further down where they differ.

| | count | |
| --- | --- | --- |
| Operations in the file | **69** | |
| Applicable | **63** | 59 as generated, plus OP-060..OP-063 added 2026-09-07 |
| Excluded, never written by the tool | **6** | EX-001..EX-006, unchanged |
| **Verified live** | **57** | `--mode=verify` → `VERIFIED_LIVE=57` |
| **Still to apply** | **6** | `--mode=dry-run` → `READY=6`, no `CONFLICT`, no `UNREADABLE` |

The six outstanding:

| op | route | field | why it is still open |
| --- | --- | --- | --- |
| OP-002 | `/medical/minor-procedures` | `booking_channel` | still `family-doctor`; must be `minor-procedures` |
| OP-012 | Arabic counterpart | `booking_channel` | same |
| OP-060 | `/medical/minor-procedures` | `seo.description` | still attributes clinic-wide care to Dr. Bakare |
| OP-061 | Arabic counterpart | `seo.description` | same |
| OP-062 | `/medical/chronic-disease-management` | `seo.description` | same |
| OP-063 | Arabic counterpart | `seo.description` | same |

**Correcting the arithmetic that has been restated a few times.** The effective
set was reported as 57 by taking 59 applicable and subtracting the 2 manual
relation deletions. That reaches the right number by the wrong route: EX-003 and
EX-004, the relation deletions, are `applicable: false` and are already among
the 6 excluded — they were never inside the 59. 57 is simply how many of the 59
are live; the missing 2 are OP-002 and OP-012, which have not been applied at
all. The two coincide numerically and mean different things.

**Do not read a timestamp as proof.** `publishedAt`/`updatedAt` move for any
write to a record, so an array-valued operation (`whats_included`,
`related_doctor_ids`) or a `faq.archive` can show a fresh timestamp on a record
whose target field never changed. Every count above comes from comparing the
structured field value itself, which is what `--mode=verify` does.

**The blocker** is unchanged and is B-1 below: applying these needs an identity
holding `content.publish`. The credentials for it live in
`/home/blue-diamond/secrets/`.

---

## 1. Why this document exists

A block of published content on this site is **owned by FeelStack, not by this
repository**. On those routes `FEELSTACK_CONTENT_MODE=hybrid` means the CMS
record wins: the static TypeScript in `src/features/**` is a fallback that never
renders while a published CMS record exists.

The repository's own data is already correct. Editing it again would change
nothing a visitor sees. **The stale text is in the CMS, and only a CMS republish
removes it.**

### Access available in the build environment

| Capability | Status |
| --- | --- |
| FeelStack **read** (public resolve API) | Available, and used for every baseline value |
| FeelStack **write** (`FEELSTACK_ADMIN_*`) | **Not set** — no write was attempted |

Because read access worked, every `from` value is the **verbatim live value** and
every record / FAQ id is the **real UUID**. Raw capture:
`evidence/cms-live/raw.json`; readable rendering: `evidence/cms-live/digest.txt`.

---

## 2. How the operation list is derived

The operations are **not** a hand-written opinion about what should change. They
are a **pure diff**:

```
approved static record   (evidence/cms-live/approved-static.json,
                          dumped from src/features/{medical-services,doctors}/data.ts)
                 ─── vs ───
live published CMS record (evidence/cms-live/raw.json)
```

Every field where the two disagree becomes one operation. Nothing else does.

This matters because the repository already contains the acceptance criterion:
`tests/contracts/medical-service-canary.spec.ts` and `doctor-canary.spec.ts`
assert that the CMS-adapted output equals the approved static record, field by
field and FAQ by FAQ. Deriving the operations from that same comparison makes
those tests the definition of "done" rather than a second opinion about it.

> **An earlier hand-built draft of this list was wrong and was discarded.** It
> proposed rewriting `/medical/preventive-care`'s summary and clearing its
> `related_doctor_ids`, on the reasoning that naming Dr. Saeed breached provider
> neutrality. The diff showed the CMS already **matches** the approved record on
> both fields: the approved copy deliberately keeps the question *"Do I need to
> see Dr. Saeed specifically for preventive care?"* and answers that any
> physician can provide it. Clarifying a service is not restricting it. That
> draft would have pushed the CMS **away** from approved content on four fields.
> The generated diff is authoritative; hand-reasoning about the rules is not.

### Files

| File | Use |
| --- | --- |
|  `content/feelstack/republish-operations.json` | **Canonical.** Machine-executable operations consumed by the utility. |
| `evidence/feelstack-content-patches.json` / `.csv` | Same rows as a review/sign-off manifest (CSV is UTF-8 BOM for Excel). |
| `evidence/cms-live/approved-static.json` | The approved source of truth, dumped from the repository. |
| `evidence/cms-live/raw.json` | Full live API capture — the "before" evidence. |

---

## 3. Scope

| Route | Ops | Principal defect |
| --- | --- | --- |
| `/medical/minor-procedures` | 20 | Bakare exclusivity; `booking_channel` wrong; extra Bakare-only FAQ; "Mika" |
| `/medical/chronic-disease-management` | 10 | Bakare exclusivity; "Mika" |
| `/medical/after-hours-care` | 10 | PCN pathway named only 2 of 6 physicians; `related_doctor_ids` |
| `/medical/preventive-care` | 4 | Single-physician qualifier in `whats_included`; "Mika" |
| `/medical/pain-management` | 4 | Joint injections published as Bakare-only; "Mika" |
| `/medical/weight-management` | 2 | "Mika" |
| `/our-team/{farhat,hamdi,gwea,saeed,omonijo}` | 9 | Superseded biographies |
| **Total applicable** | **59** | |
| Manual / never-written | 6 | see §6 |

`/medical/eye-screening` and `/medical/uninsured-services` were probed and are
**clean**.

### FAQ alignment

The adapter and the canary compare FAQs **positionally**. So for each index
below the approved count the CMS FAQ is rewritten to the approved question and
answer, and any CMS FAQ beyond the approved count is **archived**. Concretely,
`/medical/minor-procedures` publishes 5 FAQs where the approved record has 4:
the extra Bakare-only question is archived and the remainder are rewritten so
the published set matches the approved set exactly.

Archiving rather than deleting is deliberate — see §5.

---

## 4. Content rules held constant

These are verified decisions. The operations preserve them; do not "fix" them.

- Minor procedures use the **medical** number **825 413 1113**. Aesthetic clinic
  is **(403) 247-1418**. Neither is ever described as a Botox-only line, and the
  sentence *"To book medical Botox … please call us directly."* stays deleted.
- New patients and walk-ins → **Skip the Waiting Room**. Registered patients →
  **Mikata**. Eye screening → **Euclid**. Minor procedures → **no online
  booking**. No Jane links, ever.
- General family medicine, chronic disease management, minor procedures and
  preventive care are **clinic-wide**; they are never published as one doctor's.
- **Dr. Bakare is not being removed.** His biography and his genuine interests —
  chronic disease management, palliative care, teaching, skin lesion excision,
  intra-articular injections — stay on his own profile. Only the claim that the
  *clinic's* services are *his* services is corrected.
- **Botox providers stay Dr. Mohamed Farhat and Dr. Reem Hamdi**, and no one
  else. Dr. Hamdi is not extended to aesthetics, PRP, hair restoration,
  after-hours or PCN statements.
- The aesthetics wording stays: *"For all aesthetic treatment appointments, book
  a 20-minute consultation with Dr. Farhat."*
- **PRP stays Dr. Farhat.** Extraction_1(5).docx states it twice. Two rows are
  carried in the manifest as `VERIFIED_NO_CHANGE` precisely so a reviewer
  working down the neutrality list cannot generalise them by momentum.
- **PCN:** Mosaic for **Dr. Reem Hamdi's** patients; Calgary West Central for
  patients of **all other** Blue Diamond family physicians. This is proven, not
  inferred — Extraction_1(5).docx states CWC PCN membership at clinic level
  (*"our doctors and our clinic work collaboratively with CWC PCN team
  members"*) with Mosaic as the one documented exception. No individual
  physician's assignment is invented beyond that.
- **Dr. Farhat's Arabic biography:** only the verified **28 → 30 years**
  correction is applied. The full approved Arabic biography does not exist and is
  **not** machine-translated or expanded. That item stays blocked (§6).

---

## 5. The utility

`scripts/feelstack-republish.mjs` consumes the operations file.

```
--mode=dry-run   (default) read-only, NO credentials needed. Compares live values
                 against the baseline via the PUBLIC resolve API.
--mode=backup    admin read.  Full pre-change snapshot.
--mode=apply     admin write. Backup → conflict-check → skip-if-applied → PATCH → publish.
--mode=verify    read-only.   Confirms each operation is live.
--mode=rollback  admin write. Restores every value from a backup file.
```

Safety properties, each load-bearing:

- **Refuses to write without credentials.** Write modes exit `3` when any
  `FEELSTACK_ADMIN_*` variable is missing. There is no bypass flag.
- **Idempotent.** A value already equal to its target is reported
  `ALREADY_APPLIED` and skipped. Re-running duplicates no FAQ, paragraph, link
  or biography.
- **Conflict-detecting.** A live value matching neither the baseline nor the
  target is `CONFLICT` and is skipped, never overwritten.
- **Field-preserving.** Entry writes `GET` the record, mutate only the named key
  inside `data`, and `PATCH` the merged object back.
- **Reversible.** Archive-not-delete for FAQs, and a snapshot for everything
  else, so `--mode=rollback` restores the prior state.
- **Redacted.** Password, revalidate secret and the runtime bearer token are
  scrubbed from every log line and from `--json` output.
- **Backups land outside the repository** (default `../blue-diamond-cms-backups`),
  therefore outside `public/` — a snapshot holds unpublished editorial text and
  must never be servable or committable.

### Why FAQs are archived rather than unassigned

`DELETE /content/faq-assignments/:id` needs the **assignment** UUID, which
neither the public resolve payload nor `GET /content/entries/:id` exposes — a
script cannot obtain it. The public route resolver selects FAQs with
`status: PUBLISHED` (`public-route-resolver.service.ts`), so setting a FAQ to
`archived` removes it from the page through a documented endpoint, is
idempotent, and is reversible by setting it back.

### Dry-run result (2026-09-06, against live CMS)

```
operations: 59 applicable, 6 excluded (manual / verified-no-change, never written)
summary: READY=59
```

All 59 match their captured baseline exactly: **no drift since capture, zero
conflicts.** Every UUID and field path resolves.

---

## 6. Not written by the utility

| Rows | Why |
| --- | --- |
| PRP provider attribution (EN + AR) | `VERIFIED_NO_CHANGE`. Correct as published. Never apply. |
| Bakare `doctors` relation row on `/medical/minor-procedures` (EN + AR) | The admin API has `GET`/`POST` for relations but **no `DELETE`** (only for faq-assignments). Remove in the admin UI. **Rendering is unaffected** — the frontend reads `related_doctor_ids`, which the operations do clear. |
| `/patient-resources` body (EN + AR) | No-op for the live site: the route renders from the static Next.js page, not the CMS body. Queued so the two cannot diverge if it is ever switched to CMS rendering. |

---

## 7. The exact command

An authorised administrator, on a trusted machine, with Node 20.19.5:

```bash
# 1. Credentials — server-side shell only. Never commit, never echo.
export FEELSTACK_API_URL="https://feelstack.dfeelings.com/api"
export FEELSTACK_SITE_KEY="blue-diamond-medical"
export FEELSTACK_ADMIN_PROJECT_ID="d1a870a4-a514-4719-bf71-6cff26b18dcb"
export FEELSTACK_ADMIN_USERNAME="<project admin user>"
export FEELSTACK_ADMIN_PASSWORD="<password>"
export FEELSTACK_REVALIDATE_SECRET="<revalidate secret>"   # optional but recommended
export NEXT_PUBLIC_SITE_URL="https://bluediamondmedical.ca"

# 2. Confirm nothing drifted since the 2026-09-06 capture (no credentials needed).
node scripts/feelstack-republish.mjs --mode=dry-run

# 3. Snapshot every affected record, outside the web root.
node scripts/feelstack-republish.mjs --mode=backup

# 4. Apply and publish all 59 operations.
node scripts/feelstack-republish.mjs --mode=apply --json > cms-apply-result.json

# 5. Confirm each one is live on the rendered site.
node scripts/feelstack-republish.mjs --mode=verify

# 6. If anything is wrong, restore byte-for-byte.
node scripts/feelstack-republish.mjs --mode=rollback \
  --backup-file=../blue-diamond-cms-backups/feelstack-backup-<timestamp>.json
```

Step 4 prints a `revisionId` and `revisionUpdatedAt` per operation and writes the
backup path needed for step 6.

---

## 8. Verification — required before any PASS

After `--mode=apply`, run `--mode=verify` (expect `VERIFIED_LIVE=59`), then check
the rendered site in **both** locales:

- [ ] No "Dr. Bakare" / "الدكتور باكاري" on any clinic-wide medical service page.
- [ ] Dr. Bakare's own profile is intact and unchanged.
- [ ] The extra Bakare-only FAQ is gone from `/medical/minor-procedures`; the
      page shows exactly the approved 4 questions.
- [ ] No "Mika" or "Mikita" anywhere — only "Mikata".
- [ ] `/medical/minor-procedures` offers **no** online booking control, and its
      phone CTA dials the **medical** line.
- [ ] After-hours names Mosaic for Dr. Reem Hamdi's patients and CWC PCN for all
      others.
- [ ] Dr. Farhat reads "over 30 years" / "تتجاوز 30 عامًا" in both locales.
- [ ] PRP still Dr. Farhat; cosmetic Botox still Dr. Farhat and Dr. Hamdi only.
- [ ] No duplicated FAQ, paragraph or biography (re-run `--mode=verify`; every
      row must report `ALREADY_APPLIED`, proving idempotence).

Then:

1. **Re-capture the canary fixtures.** `tests/fixtures/feelstack/*-resolve-{en,ar}.json`
   are recorded snapshots of the CMS envelope. They are stale in exactly the way
   the CMS is, which is why `medical-service-canary` and `doctor-canary`
   currently fail. Re-record them from the republished CMS and re-run
   `npx playwright test tests/contracts`. **Do not edit the assertions** — they
   are the drift detector doing its job.
2. Re-run the stale probe behind `evidence/stale-cms-probe.json` and confirm
   `totalStaleHits: 0`.

**Until verify reports 59 live, the fixtures are re-captured, and the contract
tests pass, `CMS_LIVE_VERIFICATION` stays `BLOCKED` and
`CLIENT_CHANGES_COMPLETE` stays `NO`.**

---

## 9. Blockers carried forward

| # | Blocker | Owner |
| --- | --- | --- |
| B-1 | No `FEELSTACK_ADMIN_*` credentials in this environment — the 59 operations cannot be applied here. | Client / CMS admin |
| B-2 | No approved **Arabic** translation of Dr. Farhat's CL-034 biography. Only the 28 → 30 correction is applied; the record stays a shortened paraphrase of the English. Must not be machine-translated. | Client |
| B-3 | The Bakare relation row needs the admin UI — no DELETE endpoint exists. | CMS admin |
| B-4 | Individual PCN assignments beyond the clinic-wide CWC default and the named Mosaic exception for Dr. Hamdi are **not proven** and were not invented. | Client |
| B-5 | Canary fixtures must be re-recorded after republishing, or `tests/contracts` keeps failing on stale snapshots. | Whoever runs the republish |
