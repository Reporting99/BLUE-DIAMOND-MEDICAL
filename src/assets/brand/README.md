# Brand mark assets

## `blue-diamond-medical-logo.png`

The logo supplied by the client on 2026-09-07, stored byte-for-byte as
received — 800×661 PNG, 122,243 bytes,
`sha256 7ea7355db33a572046788dba0bf2de08a798b0b80154af2b33fffd761d4a5c0c`.
It is the full lock-up on a white field: the four-facet diamond with the ECG
trace through it, and the English "BLUE DIAMOND MEDICAL" wordmark set below.

Nothing in the app imports this file; it is kept as the provenance record the
derived mark below is cut from. The same bytes are in the media library at
`/blue-diamond/brand/blue-diamond-medical-logo.png`.

**It supersedes the file supplied on 2026-09-06** (a 1536×1024 JPEG of the
diamond glowing on a black field, `sha256 5a97518c…49fb`) and the
low-resolution legacy web logo that was at
`/blue-diamond/shared/brand/68406a8a540e-blue-diamond-medical-logo.png`. Both
are gone from the repository; see docs/MEDIA.md for what remains to be removed
from the media library.

## `blue-diamond-medical-mark.png`

The diamond itself, cut out of the supplied lock-up onto transparency — 424×519,
57,861 bytes,
`sha256 345575466a2b48619560f7e5a99aaddeaa01a6dc95238ad1d5d4813a016f10d4`.
This is what `src/lib/media/brand-mark.ts` imports and what every header,
footer and About lock-up renders.

The site requests it from **ImageKit**: the same bytes were imported through
FeelStack's `media/import` door to
`/blue-diamond/brand/blue-diamond-medical-mark.png`, and the CDN's
`?tr=orig-true` copy is byte-identical to this file (a plain CDN URL returns
fewer bytes because ImageKit optimises at delivery — compare originals or the
checksums disagree for the wrong reason). This copy stays in the repository,
and stays imported by `src/lib/media/brand-mark.ts`, as the build-time fallback
for the one image whose absence reads as a broken site rather than a missing
photograph.

It is a **crop with an alpha channel, not a redraw**: every pixel inside the
diamond is the supplied file's own pixel, unretouched and unrecolored, so
docs/UI_UX_FOUNDATION.md §1.1 ("never redrawn, recolored, stretched, rotated,
cropped, given a gradient, drop shadow, outline, or additional elements") is
satisfied for the mark. One thing about the supplied file is deliberately not
carried over:

- **The lock-up's own English wordmark.** It is English-only, while the site
  sets the clinic's name as live bilingual text beside the mark (Arabic pages
  must read "بلو دايموند الطبية"). `Logo` and `BrandLockup` keep rendering that
  text, so the mark alone is what the image contributes — first approved on
  2026-09-06 and unchanged by the new supply. At the header's `h-9` the
  supplied lock-up's wordmark would be about 2px tall in any case.

### How it was produced

The white field is **not** removed by keying on colour. The diamond's negative
space is white too, and it is not enclosed: the gap between the two lower
facets opens to the outside at the bottom vertex, so a flood fill from the
border drains it and leaves the mark with a white top half and a transparent
bottom half. It is cut to the diamond's own outline instead.

The outline was measured off the supplied file by locating the facet edges
along scan rows and fitting the four straight edges, giving the quadrilateral

    top (409.5, 22)   right (613, 284)   bottom (399, 540)   left (190, 286.5)

(every fitted edge lies within 1.7px of the rendered silhouette, and within
0.9px on three of the four), which was rasterised at 4×4 supersampling into an
alpha channel — RGB left untouched, so the white *inside* the diamond stays
white on the dark footer exactly as the client drew it — and cropped to that
polygon's bounding box, 424×519. No resampling: this is the supplied file's
own pixel grid.

424px is ~2.0× the largest size the mark is ever rendered at (the About hero's
lock-up tops out at a 480px width, of which the mark is 14.61% = 70px, ×3 for
a 3× display).

Regenerate it from the supplied file, do not redraw it. If Decca Design Inc.'s
master vector file (SVG/EPS) is ever supplied, that file supersedes both of
these.

## `src/app/favicon.ico`

Generated from `blue-diamond-medical-mark.png` at 16/32/48px, 32-bit with
alpha. Regenerate it whenever the mark changes — it is the same artwork and
must not drift from it.
