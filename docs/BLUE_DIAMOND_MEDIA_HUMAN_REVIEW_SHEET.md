# Human Review Sheet — 7 Ambiguous Assets

**No CMS mutation has been made to any asset on this sheet. All 7 remain `pending`.**

These are the only assets whose disposition a person must decide. Everything else in the batch is already classified: 3 approved and rendering, 15 `DO_NOT_APPROVE`, 12 unassigned.

They fall into two kinds, and the second kind is the one that matters.

## Kind 1 — identity cannot be established (3 assets)

Scraped from the legacy *our-team* page with opaque filenames carrying no identity. **Identity was NOT inferred from the photographs.** Face-based identification is exactly the method that produces a physician's portrait on the wrong physician's page, so it was not used.

> **None of these may be mapped to Dr. Omaima Saeed under any circumstance** — `photoDeclined: true`, `disabled`, 0 assignments, and that state is permanent.

### `5e943a11fef2-WhatsApp-Image-2024-12-30-at-17.06.09.jpg`

- **Asset** `b3cc6605-72c4-4ede-8a45-f9f3ca300154` · `/blue-diamond/shared/legacy/5e943a11fef2-WhatsApp-Image-2024-12-30-at-17.06.09.jpg` · HTTP 200 · status `pending`
- **Source page** https://bluediamondmedical.ca/our-team
- **Visible** Studio portrait of a smiling woman in a purple turtleneck with a purple stethoscope, arms folded
- **Proposed entity / slot** none — cannot propose until identified
- **Why ambiguous** IDENTITY NOT CONFIRMED. Must be positively identified against the roster before any assignment. MUST NOT be mapped to Dr. Omaima Saeed (photoDeclined).
- **Human decision needed** Name the physician from the clinic roster, or confirm the person is not current staff. If named and they consent, assign `doctorPortrait`; otherwise leave pending.

### `909b70250b4d-blob-0846d7f.jpg`

- **Asset** `401d8156-b24a-445c-a6e6-e3a749631222` · `/blue-diamond/shared/legacy/909b70250b4d-blob-0846d7f.jpg` · HTTP 200 · status `pending`
- **Source page** https://bluediamondmedical.ca/our-team
- **Visible** Indoor portrait of a woman with shoulder-length brown hair in a blue satin blouse, arms folded
- **Proposed entity / slot** none — cannot propose until identified
- **Why ambiguous** IDENTITY NOT CONFIRMED, and no stethoscope or coat to corroborate a clinical role. MUST NOT be mapped to Dr. Omaima Saeed (photoDeclined).
- **Human decision needed** Name the physician from the clinic roster, or confirm the person is not current staff. If named and they consent, assign `doctorPortrait`; otherwise leave pending.

### `ba25b0e06455-blob-7cc2b3d.png`

- **Asset** `c46684ca-6195-438c-9351-3e3fc1d5d67f` · `/blue-diamond/shared/legacy/ba25b0e06455-blob-7cc2b3d.png` · HTTP 200 · status `pending`
- **Source page** https://bluediamondmedical.ca/our-team
- **Visible** Indoor portrait of a smiling man in a lilac striped shirt, arms folded, wearing a pager on his belt
- **Proposed entity / slot** none — cannot propose until identified
- **Why ambiguous** IDENTITY NOT CONFIRMED. Must be positively identified against the roster before any assignment.
- **Human decision needed** Name the physician from the clinic roster, or confirm the person is not current staff. If named and they consent, assign `doctorPortrait`; otherwise leave pending.

## Kind 2 — entity match is thematic, not depictive (4 assets)

Each is already **assigned** to a specific entity, and each is a generic stock photograph that does not depict the treatment it is attached to. They are not unsafe — no patient, no claim, no before/after — they are simply **weak matches**, and a weak match on a medical treatment page reads as a stock-photo filler.

| Asset | Assigned to | Slot | What it actually shows | Decision needed |
|---|---|---|---|---|
| `497e5e99856f-Laser.jpg` | Laser Skin Treatments | `hero` | Studio portrait of a woman with long brown hair, hand at her cheek, neutral grey background | keep as decorative, or replace with equipment/clinic photography |
| `668422217736-blob-7fba277.png` | Laser Hair Removal | `hero` | Studio photograph of a woman seated on the floor in a light dress, legs extended | keep as decorative, or replace with equipment/clinic photography |
| `85de6a3890f3-2193658276.jpg` | Ultra Treatment | `hero` | Backlit photograph of a woman tucking her hair behind her ear, indoors | keep as decorative, or replace with equipment/clinic photography |
| `b9caaf08bff8-TempSure.jpg` | Radio Frequency | `hero` | Studio close-up of a woman resting her hand against her cheek | keep as decorative, or replace with equipment/clinic photography |

For these four, the proposed alt text is already written and factual — it describes the model, not a treatment outcome. If a reviewer accepts the match, the alt text can be approved as-is:

| Asset | Proposed alt (EN) | Proposed alt (AR) |
|---|---|---|
| `497e5e99856f-Laser.jpg` | Studio portrait of a woman with long hair | صورة استوديو لامرأة ذات شعر طويل |
| `668422217736-blob-7fba277.png` | Studio photograph of a seated woman | صورة استوديو لامرأة جالسة |
| `85de6a3890f3-2193658276.jpg` | Photograph of a woman indoors | صورة لامرأة داخل مكان مغلق |
| `b9caaf08bff8-TempSure.jpg` | Studio portrait of a woman resting her hand against her cheek | صورة استوديو لامرأة تسند يدها إلى خدها |

## What must NOT happen to these seven

- No identification from facial appearance.
- No publishing on the grounds that an image "looks appropriate".
- No inferred consent and no inferred licence.
- No alt text written to make an asset publishable.

Each remains `pending`, so the public resolver withholds it and `ImageKitImage` renders the FacetTile. That is the correct resting state until a person decides.

