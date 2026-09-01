/**
 * The one media-frame treatment for official device photography.
 *
 * WHY THIS EXISTS. Manufacturer device shots do not share an aspect ratio and
 * never will: the three approved Cynosure assets are 1197x1050 (landscape),
 * 1530x2000 (portrait) and 711x2048 (a tower nearly 3x taller than it is
 * wide). The card grid, correctly, is one fixed shape. Rendered with the
 * site's default `object-cover` those three met the frame three different
 * ways -- Elite iQ lost a little top and bottom, Potenza lost a lot, and ULTRA
 * showed a slice of its own midsection with the head and base cropped away, so
 * the one card that most needed to say "this is a tall floor-standing laser"
 * said the least.
 *
 * `object-cover` is right for photography that is *about* a scene, where the
 * frame is a window and cropping loses nothing that identifies the subject. It
 * is wrong for a picture of a single object on a plain ground, where the
 * silhouette IS the identity. So device cards contain rather than cover, and
 * the space that containing leaves over is treated as deliberate matting
 * instead of being hidden by a crop.
 *
 * WHY A MODULE AND NOT A UTILITY CLASS. Two surfaces render these cards -- the
 * homepage technology strip (dark section) and the /aesthetics/technologies
 * listing (light section) -- and the requirement is that a device looks the
 * same in both. Exporting the strings from one module is what makes that
 * true by construction: there is no second copy to drift. It is also why the
 * mat is a fixed light tone rather than inheriting each section's background;
 * a device that sits on white in one place and on navy in another is two
 * different presentations of one product.
 *
 * NO SHADOW, DELIBERATELY. These assets already carry their own studio
 * lighting and, in the PNGs, their own soft contact shadow. A CSS drop-shadow
 * under the contained box would sit under the *frame*, not the device, and
 * read as a second light source disagreeing with the first.
 */

/**
 * The mat behind a contained device: white.
 *
 * A tinted mat was tried first and rejected on the evidence. The palette's
 * coolest near-white (`--surface-blue-mist`, #edf4f7) is the obvious choice on
 * paper, and it is right for the one asset that ships with transparency
 * (ULTRA). The other two do not: the Potenza JPEG and the Elite iQ PNG both
 * carry their own opaque white studio ground. Contained on a tinted mat those
 * grounds render as a hard white rectangle floating inside a blue frame -- a
 * visible second border around two of three cards, which is the opposite of
 * the consistency this frame exists to produce. Screenshotted at 1440 with the
 * real assets before choosing; #fafcfd was tried too and still showed the
 * rectangle's edge.
 *
 * White removes the seam for the opaque pair and costs the transparent one
 * nothing, so all three read the same way. On the dark homepage strip it also
 * reads as a deliberate light plate holding the product, which is the same
 * composition the light listing gets -- one device, one presentation, two
 * surfaces. The card's own border supplies the containment the tint would
 * otherwise have provided.
 */
export const deviceMediaFrame = "bg-white";

/**
 * Inset the device from the frame edge so a full-height silhouette is not
 * flush against the crop line. Scales with the card, so a 375px phone gets
 * proportionally the same composition as a 1440px desktop rather than a fixed
 * gap that swallows a small card and disappears on a large one.
 */
export const deviceMediaPadding = "p-4 sm:p-5";
