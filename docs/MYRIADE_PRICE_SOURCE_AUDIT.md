# Myriade price source audit — 2026-09-07

**Question asked:** pull the product prices out of Myriade's own PDF.

**Answer: the PDF contains no prices.** Not a parsing failure, not a
locked-down file — the flyer is a product brochure and never states a price
for any of the 31 products.

## What was examined

| | |
|---|---|
| File | `Products Flyer.pdf` — the client-supplied Myriade brochure |
| Source | `BLUE_DIAMOND_PRODUCTS_BEFORE_AFTER_IMAGEKIT_READY_2026-09-06.zip` → `01_SOURCE_PDF/` |
| SHA-256 | `b5d74fc5b8fce533bcc8f3fbf8431b1e2472437d49bdfaad75dba39d1bc0f4c3` |
| Pages | 20, all extracted |
| Extracted text | `evidence/myriade-flyer-text-2026-09-07.txt` (21,689 characters) — untracked working evidence, like the rest of `evidence/` |
| Date | 2026-09-07 |

## How, and why the method matters

The flyer embeds subsetted Lato fonts with `Identity-H` encoding, so its text
is stored as two-byte glyph ids inside literal strings — a naive extraction
returns `b v | o u` where the page reads `institute`. Every glyph was decoded
through its font's own `/ToUnicode` CMap, which is why the transcript above is
readable prose rather than a substitution cipher. **This matters for the
conclusion**: a broken extraction would also have "found no prices", and would
have looked exactly like this one. The transcript is included so the result can
be checked by reading it.

## Result

- **Currency symbols, `CAD`, `USD`, `price`, `prix`, `GST`: 0 occurrences** in
  20 pages.
- Every numeric token in the whole document is a size, a percentage, an SPF, a
  page number, or part of the Quebec address/phone:
  `0.25 0.5 1–20 30 40 48 50 68 100 130 150 250 450 937 3709`.
- Nothing resembling a decimal money amount appears anywhere.

What the flyer *does* supply, and what was published from it: product names,
subtitles, sizes, benefits, key features, directions, key ingredients, kit
contents and the packshots.

## Consequence for the catalogue

30 of the 31 Myriade records therefore carry `priceCents: null`, and a price
line does not render for them at all — see `src/features/products/data.ts` and
`tests/unit/skinmedica-catalogue.spec.ts` ("no Myriade record claims a price…").

The single exception is **The Purifying Peeling**, `188 + GST`, which came from
the client's own CL-037 copy, **not** from this flyer. The Brightening Peeling
has no price and does not borrow it (GAP-019).

Publishing a price for the other 30 needs the client to supply a retail price
list. Nothing here can be derived, inferred from the SkinMedica list, or
estimated — see GAP-022 in `CONTENT_GAPS_AND_APPROVALS.md`.
