# Manual FeelStack cleanup — Dr. Bakare relation rows

**Status:** `BLOCKED` — cannot be done by script. Requires an authenticated
FeelStack admin UI session.

## Why this is manual

The admin API exposes `GET` and `POST` on
`/admin/v1/projects/{projectId}/content/relations`, but **no `DELETE`**. The only
delete verb in the structured-content controller is
`DELETE /content/faq-assignments/:id`. There is therefore no supported API call
that removes a content relation, and `scripts/feelstack-republish.mjs`
deliberately does not invent one.

## Impact if it is never done

**None on the rendered site.** The frontend reads the typed
`related_doctor_ids` field, not `relations.items` — see the comment in
`src/features/medical-services/cms-contract.ts` explaining that the relation
rows are the CMS-side graph while the typed field serves the frontend. The
applied operations clear `related_doctor_ids` on both locale records, so
`/medical/minor-procedures` stops attributing clinic-wide procedures to one
physician regardless.

What remains is a stale edge in the CMS content graph. It will resurface in any
future consumer that walks relations rather than the typed field, which is why
it is tracked rather than waved away.

## Exact records

Project: `d1a870a4-a514-4719-bf71-6cff26b18dcb`

### English

| Field | Value |
| --- | --- |
| Content entry | `dc849465-c82e-4e6d-8572-4c2a2d02c6de` |
| Entry title | **Minor Procedures** |
| Route | `/medical/minor-procedures` |
| **Relation row id** | **`a1da453b-27de-409e-9dee-f31a64e0dcd5`** |
| relationKey | `doctors` |
| targetType | `person_profile` |
| targetId | `003739b5-88d6-4f12-9e93-0f8a45582a32` (Dr. Bakare, EN) |
| sortOrder | `1` |

### Arabic

| Field | Value |
| --- | --- |
| Content entry | `879ad279-36b3-43d2-8636-553e703cfacf` |
| Entry title | **الإجراءات البسيطة** |
| Route | `/الرعاية-الطبية/الإجراءات-البسيطة` |
| **Relation row id** | **`1e7a1078-fb0f-4092-991f-6b591c65d4af`** |
| relationKey | `doctors` |
| targetType | `person_profile` |
| targetId | `df9768f4-98d0-4f38-bd64-5b36dda9d9e7` (Dr. Bakare, AR) |
| sortOrder | `1` |

> The two locales are separate records with **different** person_profile
> targets. Removing one does not remove the other. An earlier draft of the
> manifest recorded the English target UUID for both; that was wrong and has
> been corrected from the live capture.

## Steps

1. Sign in to the FeelStack admin UI for project `d1a870a4-…`.
2. Open content entry `dc849465-c82e-4e6d-8572-4c2a2d02c6de` (**Minor
   Procedures**, EN).
3. In its relations, find the `doctors` relation whose id is
   `a1da453b-27de-409e-9dee-f31a64e0dcd5` and remove **only** that row.
4. Save and publish the entry.
5. Repeat for the Arabic entry `879ad279-36b3-43d2-8636-553e703cfacf`, removing
   relation `1e7a1078-fb0f-4092-991f-6b591c65d4af`.
6. Verify from the public API that the relation is gone:

```bash
curl -s "https://feelstack.dfeelings.com/api/public/v1/sites/blue-diamond-medical/resolve?path=/medical/minor-procedures&locale=en" \
  | python -c "import json,sys; print(json.load(sys.stdin)['relations']['items'])"
# expect: []
```

Repeat with `path=/الرعاية-الطبية/الإجراءات-البسيطة&locale=ar`.

## Do not

- **Do not** touch Dr. Bakare's own `person_profile` record. His biography and
  his genuine clinical interests — chronic disease management, palliative care,
  teaching, minor skin lesion excision, intra-articular injections — are correct
  and stay exactly as they are. Only the claim that the *clinic's* services are
  *his* services is being removed.
- **Do not** remove any other doctor relation on any other entry.
- **Do not** remove the PRP → Dr. Farhat attribution on
  `/aesthetics/treatments/prp-skin-rejuvenation`
  (`a64fe8ed-aeef-4ddd-9ae3-06423d47f6d8` EN /
  `189dac66-3916-46e3-973e-26e147e431a0` AR). That one is **verified correct**
  and is carried in the manifest as `VERIFIED_NO_CHANGE` precisely so it is not
  generalised by momentum.
