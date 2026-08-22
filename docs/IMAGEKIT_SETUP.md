# ImageKit Setup

How to activate real image delivery for this site.

## 1. Account and credentials

The approved account/endpoint is known (brief §12): **`https://ik.imagekit.io/oq92dh6zib`**, media root **`/blue-diamond/`** — e.g. `/blue-diamond/home/home-hero-blue-diamond.png`. `src/config/imagekit.ts` already defaults `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` to this value and exports `MEDIA_ROOT` for every content file that builds a path, so **no environment variable is required just to point at the right account**. What's still genuinely missing:

- **Public key** and **private key** — real secrets, needed only for the SDK's authenticated upload flow (`scripts/imagekit-import.mjs --upload`). Not yet supplied.
- **Real photography uploaded into the account** — the endpoint being known doesn't mean any asset exists at it yet. Every path in `src/content/media/image-manifest.ts` is `status: "pending"`, which is what actually keeps every image rendering the FacetTile placeholder (`imagekitIsConfigured` alone isn't sufficient — see `src/components/media/ImageKitImage.tsx`).

## 2. Set environment variables (only needed to add the keys, or to override the endpoint)

Add to `.env.local` (never commit real values — `.env.local` is gitignored):

```env
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/oq92dh6zib
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_xxxxxxxxxxxx
IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxxxx
```

The `NEXT_PUBLIC_` prefixed values are safe to expose (ImageKit's public key and URL endpoint are meant to be public — they don't grant upload/delete access). `IMAGEKIT_PRIVATE_KEY` must **never** get a `NEXT_PUBLIC_` prefix — it's read only server-side, by `scripts/imagekit-import.mjs` and (once wired up) any future signed-upload API route.

Nothing else in the codebase needs to change once real photography is uploaded and public/private keys are set. Flipping the relevant manifest entry's `status` to `"approved"` (see step 4) is what actually switches that entry's `ImageKitImage` instance from the FacetTile placeholder to the real ImageKit-delivered asset — no template or component code needs touching.

## 3. Run the real import

A licensed source archive (`blue-diamond-original-site-images.zip`, 70 images) was found and fully classified this pass — see `docs/IMAGEKIT_IMPORT_REPORT.md` for exactly what's in it and what's ready to go.

```bash
# Dry run (safe, no credentials needed, already verified working):
node scripts/imagekit-import.mjs

# Real upload, once credentials are set in the environment:
node scripts/imagekit-import.mjs --upload
```

The script uploads only the assets it classified as "ready to import" — it does **not** upload the 3 unidentified doctor portraits or the 15 before/after-review candidates automatically; those need a human decision first (see `docs/DATA_APPROVAL_BLOCKERS.md`).

## 4. Flip approval status in content files

After a real upload, each content file's `status: "pending"` needs to become `status: "approved"` for the corresponding entry (e.g. in `src/types/doctor.ts` for doctor portraits, `src/content/products.ts` once product photography exists, `src/content/before-after.ts` once real pairs are approved). This is a manual, deliberate step — the site never auto-promotes an asset's status just because a file exists in the account, which is what keeps "pending" a meaningful signal rather than a formality.

## 5. Verify

- `tests/unit/image-usage.spec.ts` — confirms no code bypasses `ImageKitImage` and every referenced path has a manifest entry (already passing; re-run after real assets are wired up).
- Visually check a few pages in both locales — the FacetTile placeholders should be replaced by real photos wherever `status: "approved"` is now set.
- Confirm `IMAGEKIT_PRIVATE_KEY` never appears in any client-side bundle: `grep -r "IMAGEKIT_PRIVATE_KEY" .next/static` after a production build should return nothing.

## What was NOT tested (honest gap)

No live ImageKit account exists in this build environment, so the actual upload path (`--upload` flag) and the real CDN delivery URL have never been exercised end-to-end — only the dry-run classification logic has been run and verified. This procedure is believed correct based on the official `@imagekit/next` SDK's documented Upload API, but "believed correct, never executed" is a different claim than "tested," and this document doesn't pretend otherwise.
