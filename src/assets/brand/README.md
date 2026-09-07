# Brand mark assets

## `blue-diamond-logo-source.jpg`

The logo file supplied by the client on 2026-09-06, stored byte-for-byte as
received — 1536×1024 JPEG, 99,133 bytes,
`sha256 5a97518c10d5ea62437deca7e4318c7cd587d16c05cbb49ca21b8723596749fb`.
It is the render of the mark: the four-facet diamond glowing on a solid black
field, with the English "BLUE DIAMOND MEDICAL" wordmark set below it in the
glow. Nothing in the app imports this file; it is kept as the provenance
record the derived asset below is cut from.

## `blue-diamond-mark.png`

The diamond itself, cut out of the source onto transparency. It replaced the
inline SVG stand-in that recreated the mark from the brand PDF's coordinates
(docs/MEDIA.md CL-001).

Since 2026-09-07 the site requests this asset from **ImageKit**, on the
client's instruction: the same bytes were imported through FeelStack's
`media/import` door to `/blue-diamond/brand/blue-diamond-mark.png`, and the
CDN's `?tr=orig-true` copy is byte-identical to this file (sha256
`f467436ad918c33518f99f7294225797ad7269bd499764e1a3294541aec76e9b`; a plain
CDN URL returns fewer bytes because ImageKit optimises at delivery — compare
originals or the checksums disagree for the wrong reason). This copy stays in
the repository, and stays imported by `src/lib/media/brand-mark.ts`, as the
build-time fallback for the one image whose absence reads as a broken site
rather than a missing photograph.

It is a **crop with an alpha channel, not a redraw**: every pixel inside the
diamond is the source file's own pixel, unretouched and unrecolored, so
docs/UI_UX_FOUNDATION.md §1.1 ("never redrawn, recolored, stretched, rotated,
cropped, given a gradient, drop shadow, outline, or additional elements") is
satisfied for the mark. Two things about the source are deliberately not
carried over, both because the mark has to sit on the white header, the dark
blue footer and the About hero alike:

- **The black field and its glow.** They are the render's backdrop, not part
  of the mark, and an opaque black rectangle in a white header is not a logo
  lock-up. Approved by the client on 2026-09-06 in preference to keeping the
  glow (which reads as a blue haze on light surfaces) or the black field.
- **The image's own wordmark.** It is English-only, while the site sets the
  clinic's name as live bilingual text beside the mark (Arabic pages must read
  "بلو دايموند الطبية"). `Logo` and `BrandLockup` keep rendering that text —
  also approved on 2026-09-06.

### How it was produced

The diamond's outline was measured off the source by locating the facet edges
along scan rows and fitting the four straight edges, giving the quadrilateral

    top (767.5, 20)   right (1121, 432)   bottom (767.5, 847)   left (414, 432)

which was rasterised at 4×4 supersampling into an alpha channel (RGB left
untouched), cropped to that polygon's bounding box — 707×827 — and resized to
440×515 lossless PNG. 440px is ~2.2× the largest size the mark is ever
rendered at (the About hero's lock-up tops out at a 480px width, of which the
mark is 13.67% = 66px, ×3 for a 3× display).

Regenerate it from the source, do not redraw it. If Decca Design Inc.'s master
vector file (SVG/EPS) is ever supplied, that file supersedes both of these.
