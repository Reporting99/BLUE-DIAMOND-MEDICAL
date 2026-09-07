# Deferred schema debt — OP-002 / OP-012 (`booking_channel`)

**Status:** deferred, deliberately. Not a defect, not a regression, and not
something to retry against production.

## What is not applied

Two of the 59 staged CMS operations:

| Op | Locale | Record | Route | Change |
|---|---|---|---|---|
| OP-002 | en | `dc849465-c82e-4e6d-8572-4c2a2d02c6de` | `/medical/minor-procedures` | `booking_channel`: `family-doctor` → `minor-procedures` |
| OP-012 | ar | `879ad279-36b3-43d2-8636-553e703cfacf` | `/الرعاية-الطبية/الإجراءات-البسيطة` | `booking_channel`: `family-doctor` → `minor-procedures` |

The other **57 are applied and verified live** (`--mode=verify` →
`VERIFIED_LIVE=57`).

## Why they fail

The `medical-service` content type defines `booking_channel` as a `select`
whose configured options are exactly:

```
["family-doctor", "eye-screening"]
```

The application's own contract
(`src/features/medical-services/cms-contract.ts`) allows four:
`family-doctor`, `eye-screening`, `phone-medical-botox`, `minor-procedures`.
The CMS has never been taught the last two, so the write is rejected:

```
HTTP 400 {"message":"Field booking_channel must match a configured option."}
```

## Why there is no user-visible regression

`booking_channel` is clinical policy, not editable copy, and the frontend
does not trust the CMS for it. `authoritativeBookingChannel()` returns the
**static** channel for any service this repository defines:

```ts
const known = medicalServices.find((service) => service.id === serviceId);
return known ? known.bookingChannel : fromCms;
```

`minor-procedures` is defined in `src/features/medical-services/data.ts` with
`bookingChannel: "minor-procedures"`, so the correct value wins regardless of
what the CMS row says. This is the CL-018 defence, and it is deliberate: an
editor can change every word on the page but cannot re-route a procedure into
an online queue.

Verified on the live site: `/medical/minor-procedures` offers **no** online
booking control in either locale (no Skip the Waiting Room, Mikata or Jane
link), and its phone CTA is the medical line **825 413 1113**.

## Why it was not fixed here

Adding the option needs `CONTENT_TYPE_MANAGE`, which the `publisher` role
deliberately does not carry — approving media and publishing content are one
class of act, changing the shape of a content type is another.

More importantly, `PUT /admin/v1/projects/:projectId/content/types/:id`
**replaces** the whole type definition. That definition is currently used by
**46 live entries** (7 medical-service + 39 others resolved through the same
controller). A hand-built replacement payload sent straight at production, to
fix two fields with no rendered effect, is the wrong trade.

## How to close it properly

1. Develop and test the change locally against a copy of the type definition —
   not against production.
2. Add `"minor-procedures"` (and `"phone-medical-botox"`, so the CMS can
   express the app's full contract) to the `booking_channel` options.
3. Send the complete `fieldDefinitions` array back; a `PUT` that omits a field
   drops it.
4. Re-read the type and diff it against
   `evidence/content-type-product.snapshot.json`'s sibling capture for
   `medical-service` before touching entries.
5. Then re-run `node scripts/feelstack-republish.mjs --mode=apply --only=OP-002,OP-012`
   and `--mode=verify` (expect `VERIFIED_LIVE=59`).

Until then this file, not a silent gap, is the record.
