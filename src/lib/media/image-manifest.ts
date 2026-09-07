import type { ImageKitAsset } from "@/types/media";
import { doctors } from "@/features/doctors";
import { treatments } from "@/features/aesthetics/data/treatments";
import { technologies } from "@/features/technologies/data";
import { concerns } from "@/features/concerns/data";
import { medicalServices } from "@/features/medical-services/data";
import { BRAND_MARK_PATH, MEDIA_ROOT } from "@/config/imagekit";

/**
 * Central inventory of every ImageKit asset referenced anywhere on the
 * site — brief §8. This is the audit trail: every `path` used by an
 * ImageKitImage instance should have a matching entry here with its real
 * dimensions, focal point, and bilingual alt text once uploaded. Today
 * every entry is `status: "pending"` because no ImageKit account exists
 * yet (docs/CONTENT_MODEL.md) — this file is what
 * docs/MEDIA.md is generated from by hand; keep them
 * in sync when either changes.
 */
/**
 * Concerns whose imagery this repository owns outright, because no publishable
 * CMS entry exists to carry a media assignment for them. Keeping the ids in
 * one named set is what stops the generated block below from emitting a second,
 * `pending` entry for the same concern under the same id.
 */
const SUPPLIED_CONCERN_ART = new Set(["unwanted-hair", "hair-loss"]);

export const imageManifest: ImageKitAsset[] = [
  /**
   * The brand mark, and the only entry here that is not content.
   *
   * Every other row names a photograph a page shows; this one names the
   * clinic's logo, which the header, the footer and the About lock-up all
   * render on every route. It is inventoried for the same reason as the rest
   * -- an asset nobody can find in the manifest is an asset nobody can audit
   * -- and because `src/lib/media/brand-mark.ts` reads `status` from here to
   * decide between the CDN copy and the copy bundled in the build.
   *
   * `approved` is deliberate, and it is the second time this manifest has
   * carried it (see `our-team-group` below for the first, and the reasoning).
   * The client supplied the mark on 2026-09-06 and asked on 2026-09-07 for it
   * to be served from ImageKit; the import left the CMS row `pending`, as an
   * importer must, and the bytes at this path were then verified against the
   * committed original with `?tr=orig-true` before this line was written.
   */
  {
    id: "brand-mark",
    path: BRAND_MARK_PATH,
    width: 424,
    height: 519,
    alt: {
      en: "Blue Diamond Medical Clinic",
      ar: "عيادة بلو دايموند الطبية",
    },
    role: "logo",
    status: "approved",
  },
  {
    id: "homepage-hero",
    // The real approved asset. The previous path, /hero/homepage-hero.jpg,
    // named a directory the media library does not have; it stayed invisible
    // because `status: "pending"` renders a FacetTile and never requests the
    // bytes. Correct even so -- a wrong path that happens not to be fetched is
    // a trap for whoever flips the status.
    path: `${MEDIA_ROOT}/home/home-hero-blue-diamond.png`,
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
    alt: {
      en: "Blue Diamond Medical Clinic, West Springs, Calgary",
      ar: "عيادة بلو دايموند الطبية، ويست سبرينغز، كالغاري",
    },
    role: "hero",
    status: "pending",
  },
  {
    id: "clinic-exterior",
    path: `${MEDIA_ROOT}/clinic/west-springs-exterior.jpg`,
    width: 800,
    height: 1000,
    aspectRatio: "4:5",
    alt: {
      en: "Blue Diamond Medical Clinic exterior, West Springs",
      ar: "واجهة عيادة بلو دايموند الطبية، ويست سبرينغز",
    },
    role: "location",
    status: "pending",
  },
  {
    id: "botox-consultation",
    path: `${MEDIA_ROOT}/botox/consultation.jpg`,
    width: 800,
    height: 600,
    aspectRatio: "4:3",
    alt: { en: "Botox consultation at Blue Diamond Medical", ar: "استشارة بوتوكس في بلو دايموند الطبية" },
    role: "treatment",
    status: "pending",
  },
  {
    id: "clinic-map",
    path: `${MEDIA_ROOT}/clinic/map-placeholder.jpg`,
    width: 800,
    height: 600,
    aspectRatio: "4:3",
    alt: { en: "Map to Blue Diamond Medical Clinic", ar: "خريطة الوصول إلى عيادة بلو دايموند الطبية" },
    role: "location",
    status: "pending",
  },
  {
    id: "pathways-medical-care",
    path: `${MEDIA_ROOT}/pathways/medical-care.jpg`,
    width: 900,
    height: 700,
    aspectRatio: "9:7",
    alt: { en: "Physician with patient at Blue Diamond Medical", ar: "طبيب مع مريض في بلو دايموند الطبية" },
    role: "service",
    status: "pending",
  },
  {
    id: "pathways-medical-aesthetics",
    path: `${MEDIA_ROOT}/pathways/medical-aesthetics.jpg`,
    width: 900,
    height: 700,
    aspectRatio: "9:7",
    alt: { en: "Medical aesthetics treatment technology", ar: "تقنية علاجات التجميل الطبي" },
    role: "treatment",
    status: "pending",
  },
  {
    id: "technology-potenza-device",
    path: `${MEDIA_ROOT}/technologies/potenza-device.jpg`,
    width: 800,
    height: 800,
    aspectRatio: "1:1",
    alt: { en: "Potenza RF micro-needling device", ar: "جهاز Potenza للإبر الدقيقة" },
    role: "technology",
    status: "pending",
  },
  {
    id: "aesthetics-hub-hero",
    path: `${MEDIA_ROOT}/aesthetics/hub-hero.jpg`,
    width: 800,
    height: 600,
    aspectRatio: "4:3",
    alt: { en: "Blue Diamond Medical Aesthetics", ar: "التجميل الطبي في بلو دايموند" },
    role: "treatment",
    status: "pending",
  },
  /**
   * The two "Find your way in" navigation cards on /aesthetics.
   *
   * These two cards are the only imagery on the site that no CMS entity owns.
   * They illustrate a ROUTE — "Treatments", "Our Technologies" — rather than a
   * concern, a treatment or a technology, so there is no content entry whose
   * media assignment could carry them, and inventing a content type just to
   * hold navigation artwork would put a schema in the CMS that models the
   * menu rather than the clinic. They are therefore repo-owned and audited
   * here, which is what this manifest is for.
   *
   * Supplied by the client on 2026-09-07 in
   * BLUE_DIAMOND_NEW_IMAGES_FEELSTACK_READY_2026-09-07 and imported through
   * the sanctioned door (FeelStack `POST /media/import`), which put the bytes
   * in ImageKit at exactly these paths and recorded the MediaAsset rows;
   * both were then approved by the `bd-media-reviewer` identity and the
   * delivered bytes re-verified against the supplied SHA-256 with
   * `?tr=orig-true`:
   *   treatments-collection.png  0b99b353f6b30e82512c5ce0871afd32e8ae91c1e9ed3ff5e642f576f6c57196
   *   technologies-equipment.png c65f6028dbee2815f70829e4ae8ecaaf71e9e438b1bffc273bacb2d60080503a
   *
   * They are AI-generated EDITORIAL imagery — not Blue Diamond patients, not
   * named clinic staff, and not before/after evidence. That provenance is
   * recorded on the media rows themselves (metadata.sourceType) and is the
   * reason they are allowed on a page whose other pictures are real people:
   * docs/UI_UX_FOUNDATION.md §18 forbids an INVENTED FACE standing in for a
   * real person, and neither of these depicts an identifiable individual.
   *
   * 1672x941 is the supplied original (≈16:9, the frame the cards already
   * use), so the card never asks ImageKit to enlarge the source.
   */
  {
    id: "aesthetics-nav-treatments",
    path: `${MEDIA_ROOT}/aesthetics/navigation/treatments-collection.png`,
    width: 1672,
    height: 941,
    aspectRatio: "16:9",
    alt: {
      en: "Editorial montage of laser, facial, and scalp treatments",
      ar: "مشهد تحريري يجمع علاجات الليزر والوجه وفروة الرأس",
    },
    role: "treatment",
    status: "approved",
  },
  {
    id: "aesthetics-nav-technologies",
    path: `${MEDIA_ROOT}/aesthetics/navigation/technologies-equipment.png`,
    width: 1672,
    height: 941,
    aspectRatio: "16:9",
    alt: {
      en: "Potenza, Elite iQ, and LaseMD Ultra treatment technologies",
      ar: "تقنيات العلاج Potenza وElite iQ وLaseMD Ultra",
    },
    role: "technology",
    status: "approved",
  },
  /**
   * The Our Team hero group photograph, supplied by the clinic for this page
   * and imported through the sanctioned door (FeelStack
   * `POST /admin/v1/projects/:id/media/import`, which put the bytes in
   * ImageKit at exactly this path and recorded the MediaAsset row); sha256
   * fcf6372a657914e7ba39ef1a41f57ac5dd85c332f5b48971915fca1c5fe54f42.
   *
   * The import left the CMS row `pending`, deliberately — see the header of
   * scripts/import-before-after.mjs on why an importer never grants approval
   * to its own upload. `approved` here is the separate, deliberate act
   * docs/MEDIA.md § "Flipping an asset from placeholder to real" describes: a
   * reviewable edit to the record that owns the asset, made on the clinic's
   * explicit instruction to publish this photograph on this page. It is the
   * FIRST approved entry in this manifest, which is why every other one still
   * renders a FacetTile.
   *
   * It is a photograph of the actual team — not stock, not a generated face,
   * which is the only thing docs/UI_UX_FOUNDATION.md §18 forbids on a page
   * whose subjects are real people. That rule was always "no invented faces",
   * never "no photograph".
   *
   * 600x451 is the supplied original, and nothing requests more than that —
   * see the "team-group" preset in src/config/imagekit.ts.
   */
  {
    id: "our-team-group",
    path: `${MEDIA_ROOT}/shared/our-team-group.webp`,
    width: 600,
    height: 451,
    aspectRatio: "4:3",
    alt: {
      en: "The Blue Diamond Medical team at the West Springs clinic",
      ar: "فريق بلو دايموند الطبي في عيادة ويست سبرينغز",
    },
    role: "hero",
    status: "approved",
  },
  /**
   * Dr. Omaima Saeed's consent-protected identity card.
   *
   * Listed by hand because the generator below deliberately excludes every
   * `photoDeclined` doctor — it generates PORTRAIT entries, and she has none.
   * This is not a portrait: it is a designed card carrying her name, her
   * title and the brand's facet geometry, with no likeness of any kind. It
   * needs a manifest row all the same, because `tests/unit/image-usage.spec.ts`
   * requires every rendered ImageKit path to be inventoried here, and because
   * an asset nobody can find in the manifest is an asset nobody can audit.
   *
   * `role: "doctor"` is its slot on the page, not a claim about its content.
   */
  {
    id: "doctor-omaima-saeed-identity",
    path: `${MEDIA_ROOT}/team/blue-diamond-team-dr-omaima-saeed-identity.webp`,
    width: 1280,
    height: 1600,
    aspectRatio: "4:5",
    alt: {
      en: "Identity card for Dr. Omaima Saeed, Family Physician, Blue Diamond Medical",
      ar: "بطاقة تعريف للدكتورة أميمة سعيد، طبيبة أسرة، بلو دايموند الطبية",
    },
    role: "doctor",
    status: "approved",
  },
  // Doctor portraits — generated from the single source of truth in
  // src/features/doctors/data.ts so the two never drift.
  ...doctors
    .filter((d) => !d.image.photoDeclined)
    .map(
      (d): ImageKitAsset => ({
        id: `doctor-${d.id}`,
        path: d.image.path,
        width: 640,
        height: 800,
        aspectRatio: "4:5",
        alt: { en: `Portrait of ${d.name.en}`, ar: `صورة ${d.name.ar}` },
        role: "doctor",
        status: d.image.status,
      }),
    ),

  // Homepage premium redesign ("PREMIUM UNIFIED HOMEPAGE REDESIGN" pass) —
  // section 2 (Two Care Pathways) uses distinct imagery from the hero's
  // dual-image composition (which reuses pathways-medical-care /
  // pathways-medical-aesthetics above), per the brief's media plan
  // treating the hero and pathway sections as separate image needs.
  {
    id: "pathways-family-care-detail",
    path: `${MEDIA_ROOT}/medical/family-care.jpg`,
    width: 900,
    height: 700,
    aspectRatio: "9:7",
    alt: { en: "Family medicine consultation room at Blue Diamond Medical", ar: "غرفة استشارات طب الأسرة في بلو دايموند الطبية" },
    role: "service",
    status: "pending",
  },
  {
    id: "pathways-aesthetics-consultation-detail",
    path: `${MEDIA_ROOT}/aesthetics/consultation-room.jpg`,
    width: 900,
    height: 700,
    aspectRatio: "9:7",
    alt: { en: "Medical aesthetics consultation room at Blue Diamond Medical", ar: "غرفة استشارات التجميل الطبي في بلو دايموند الطبية" },
    role: "treatment",
    status: "pending",
  },
  {
    id: "medical-services-overview",
    path: `${MEDIA_ROOT}/medical/services-overview.jpg`,
    width: 900,
    height: 700,
    aspectRatio: "9:7",
    alt: { en: "Physician consultation at Blue Diamond Medical", ar: "استشارة طبية في بلو دايموند الطبية" },
    role: "service",
    status: "pending",
  },
  {
    id: "skinmedica-collection",
    path: `${MEDIA_ROOT}/shop/skinmedica-collection.jpg`,
    width: 900,
    height: 700,
    aspectRatio: "9:7",
    alt: { en: "SkinMedica professional skincare collection", ar: "مجموعة العناية بالبشرة الطبية سكين ميديكا" },
    role: "product",
    status: "pending",
  },
  // Live aesthetic treatments only — generated from src/features/aesthetics/data/treatments.ts
  // so a treatment gated off (cosmetic-botox, skin-tightening) never gets a
  // stray manifest/image reference here; the homepage showcase filters to
  // sourceVerified, published treatments the same way.
  ...treatments.map(
    (t): ImageKitAsset => ({
      id: `treatment-${t.id}`,
      path: `${MEDIA_ROOT}/treatments/${t.id}.jpg`,
      width: 900,
      height: 700,
      aspectRatio: "9:7",
      alt: { en: `${t.title.en} at Blue Diamond Medical`, ar: `${t.title.ar} في بلو دايموند الطبية` },
      role: "treatment",
      status: "pending",
    }),
  ),
  // Technology devices — generated from src/features/technologies/data.ts.
  // "potenza-device" above predates this pass and is kept as the canonical
  // entry for Potenza rather than duplicated.
  ...technologies
    .filter((t) => t.id !== "potenza")
    .map(
      (t): ImageKitAsset => ({
        id: `technology-${t.id}-device`,
        path: `${MEDIA_ROOT}/technologies/${t.id}-device.jpg`,
        width: 800,
        height: 800,
        aspectRatio: "1:1",
        alt: { en: `${t.title.en} device at Blue Diamond Medical`, ar: `جهاز ${t.title.ar} في بلو دايموند الطبية` },
        role: "technology",
        status: "pending",
      }),
    ),
  // Medical-service card imagery ("HEADER, DISCLAIMER REMOVAL, COUNTERS
  // AND SERVICE-CARD INTERACTIONS" pass) — generated from
  // src/features/medical-services/data.ts, plus one manual entry for Uninsured
  // Services (a real published route with its own page, but not part of
  // that content array).
  ...medicalServices.map(
    (s): ImageKitAsset => ({
      id: `medical-service-${s.id}`,
      path: `${MEDIA_ROOT}/medical/${s.id}.jpg`,
      width: 900,
      height: 700,
      aspectRatio: "9:7",
      alt: { en: `${s.title.en} at Blue Diamond Medical`, ar: `${s.title.ar} في بلو دايموند الطبية` },
      role: "service",
      status: "pending",
    }),
  ),
  /**
   * The Uninsured Services card on the Medical Care hub.
   *
   * Supplied by the client on 2026-09-07 in
   * BLUE_DIAMOND_NEW_IMAGES_FEELSTACK_READY_2026-09-07, imported through
   * FeelStack `POST /media/import` (which put the bytes in ImageKit and
   * recorded the MediaAsset row), approved by the `bd-media-reviewer`
   * identity, and re-verified byte-for-byte against the supplied SHA-256
   * with `?tr=orig-true`. AI-generated EDITORIAL imagery: not a Blue Diamond
   * patient, not named clinic staff, not before/after evidence.
   *
   * sha256 cf1953858f9b0e6d959363db2838f1a0f813c87ff30120ae66d25cc0db49f051.
   * The path this entry carried before was a `.jpg` placeholder that never
   * existed in the library; 1122x1402 is the supplied original.
   */
  {
    id: "medical-service-uninsured-services",
    path: `${MEDIA_ROOT}/medical/uninsured-services.png`,
    width: 1122,
    height: 1402,
    aspectRatio: "4:5",
    alt: {
      en: "Editorial image of a physician reviewing an administrative medical form with a patient",
      ar: "صورة تحريرية لطبيبة تراجع نموذجاً طبياً إدارياً مع مريضة",
    },
    role: "service",
    status: "approved",
  },
  /**
   * The Botox card on the Medical Care hub.
   *
   * Distinct from `botox-consultation` above, which names an unshipped plan
   * under a `/botox/` namespace the media library does not have. This is the
   * asset that exists.
   *
   * Supplied by the client on 2026-09-07 in
   * BLUE_DIAMOND_NEW_IMAGES_FEELSTACK_READY_2026-09-07, imported through
   * FeelStack `POST /media/import` (which put the bytes in ImageKit and
   * recorded the MediaAsset row), approved by the `bd-media-reviewer`
   * identity, and re-verified byte-for-byte against the supplied SHA-256
   * with `?tr=orig-true`. AI-generated EDITORIAL imagery: not a Blue Diamond
   * patient, not named clinic staff, not before/after evidence.
   *
   * sha256 b8b2518a7157aa58534db324f3334d8cab6c0488ef30050b2116ec6b15f09f2a.
   */
  {
    id: "medical-botox-card",
    path: `${MEDIA_ROOT}/medical/botox.png`,
    width: 1536,
    height: 1024,
    aspectRatio: "3:2",
    alt: {
      en: "Editorial image of a therapeutic injection for migraine management",
      ar: "صورة تحريرية لحقن علاجي للمساعدة في إدارة الشقيقة",
    },
    role: "treatment",
    status: "approved",
  },
  /**
   * The TempSure Vitalia aesthetic-treatment lead image.
   *
   * Supplied by the client on 2026-09-07 in
   * BLUE_DIAMOND_NEW_IMAGES_FEELSTACK_READY_2026-09-07, imported through
   * FeelStack `POST /media/import` (which put the bytes in ImageKit and
   * recorded the MediaAsset row), approved by the `bd-media-reviewer`
   * identity, and re-verified byte-for-byte against the supplied SHA-256
   * with `?tr=orig-true`. AI-generated EDITORIAL imagery: not a Blue Diamond
   * patient, not named clinic staff, not before/after evidence.
   *
   * sha256 7e7bc713f840c6228b1529fbd48de6829e838bb43aeaf2fec417330301f8adb3.
   * A discreet consultation image, deliberately: it illustrates the
   * conversation about the treatment, not the procedure.
   */
  {
    id: "treatment-tempsure-vitalia",
    path: `${MEDIA_ROOT}/treatments/tempsure-vitalia.png`,
    width: 1254,
    height: 1254,
    aspectRatio: "1:1",
    alt: {
      en: "Editorial consultation about TempSure Vitalia treatment",
      ar: "صورة تحريرية لاستشارة حول علاج TempSure Vitalia",
    },
    role: "treatment",
    status: "approved",
  },
  /**
   * The two concerns the client supplied artwork for.
   *
   * Every other concern's picture comes from its FeelStack `card` assignment,
   * which is why the generated block below still describes them as pending
   * placeholders. Unwanted Hair and Hair Loss are the two concerns with no
   * publishable CMS entry to hang an assignment on — Unwanted Hair has no
   * content entry at all and Hair Loss exists only as a draft pair, so the
   * public resolver 404s both — and they are, not coincidentally, the two the
   * client commissioned images for. Until those entries exist and are
   * published, the repo owns these two placements; see docs/MEDIA.md.
   *
   * Supplied by the client on 2026-09-07 in
   * BLUE_DIAMOND_NEW_IMAGES_FEELSTACK_READY_2026-09-07, imported through
   * FeelStack `POST /media/import` (which put the bytes in ImageKit and
   * recorded the MediaAsset row), approved by the `bd-media-reviewer`
   * identity, and re-verified byte-for-byte against the supplied SHA-256
   * with `?tr=orig-true`. AI-generated EDITORIAL imagery: not a Blue Diamond
   * patient, not named clinic staff, not before/after evidence.
   *
   *   unwanted-hair 1efbc29133ce8a4b397015d72a0bc74ccabd4b3ee736f82b60f2e3f0036a2b3c
   *   hair-loss     acd6eaca49f50afc9e7f224751c41c43e62cf47b366a735572d1b63017e41d83
   *
   * 3:2 originals rendered inside the explorer's square preview — see
   * `concernRepoArt` in src/features/concerns/media.ts for the framing.
   */
  {
    id: "concern-unwanted-hair",
    path: `${MEDIA_ROOT}/concerns/unwanted-hair.png`,
    width: 1536,
    height: 1024,
    aspectRatio: "3:2",
    alt: {
      en: "Editorial image of laser hair reduction on a lower leg",
      ar: "صورة تحريرية لعلاج تقليل الشعر بالليزر على الساق",
    },
    role: "concern",
    status: "approved",
  },
  {
    id: "concern-hair-loss",
    path: `${MEDIA_ROOT}/concerns/hair-loss.png`,
    width: 1536,
    height: 1024,
    aspectRatio: "3:2",
    alt: {
      en: "Editorial image of a platelet-rich plasma scalp treatment",
      ar: "صورة تحريرية لعلاج فروة الرأس بالبلازما الغنية بالصفائح",
    },
    role: "concern",
    status: "approved",
  },
  // Concern-explorer imagery — generated from src/features/concerns/data.ts,
  // minus the two above, whose real assets are inventoried explicitly.
  ...concerns
    .filter((c) => !SUPPLIED_CONCERN_ART.has(c.id))
    .map(
      (c): ImageKitAsset => ({
        id: `concern-${c.id}`,
        path: `${MEDIA_ROOT}/concerns/${c.id}.jpg`,
        width: 900,
        height: 900,
        aspectRatio: "1:1",
        alt: { en: `${c.title.en} — Blue Diamond Medical Aesthetics`, ar: `${c.title.ar} — بلو دايموند للتجميل الطبي` },
        role: "concern",
        status: "pending",
      }),
    ),
];

/**
 * One manifest entry by id, for a page that renders a specific known asset.
 *
 * Until the Our Team hero, nothing read this file at runtime: it was an audit
 * trail, and pages passed `path`/`width`/`status` to `ImageKitImage` as
 * literals that `tests/unit/image-usage.spec.ts` then checked back against the
 * manifest. That works while every entry is `pending` and the values are
 * inert, but `status` is the approval gate — the one field that decides
 * whether real bytes or a placeholder reach a visitor. Copied into a page it
 * becomes a second source of truth, and a reviewer setting this entry back to
 * `pending` would not take the photograph off the page.
 *
 * So the promotion decision is read from here rather than restated at the
 * usage site. Throws rather than returning undefined: a page asking for an
 * asset that is not inventoried is a build-time mistake, and failing loudly
 * beats rendering a silent placeholder that looks like a missing photo.
 */
export function manifestAsset(id: string): ImageKitAsset {
  const asset = imageManifest.find((a) => a.id === id);
  if (!asset) throw new Error(`image-manifest.ts: no asset with id "${id}"`);
  return asset;
}

/**
 * One manifest entry by id, but ONLY if it is approved.
 *
 * The counterpart to `manifestAsset` for a caller that is asking "does this
 * repository own publishable artwork for X?" rather than "give me X". Absence
 * and `pending` are the same answer to that question — no picture — so this
 * returns undefined for both instead of throwing, and the caller falls back to
 * whatever it already draws when a CMS assignment is missing.
 *
 * Keeping the `status` check here rather than at the call sites means the
 * approval gate stays in one place: setting an entry back to `pending` takes
 * the asset off every page that reads it through this function.
 */
export function approvedManifestAsset(id: string): ImageKitAsset | undefined {
  const asset = imageManifest.find((a) => a.id === id);
  return asset?.status === "approved" ? asset : undefined;
}

/**
 * The manifest entry for a library PATH, or undefined when the manifest does
 * not describe it.
 *
 * Deliberately does not throw, unlike `manifestAsset`. Its caller is the SEO
 * metadata builder, which runs during static generation for every route: a
 * throw there fails the whole build over one social-card image, which is a
 * worse outcome than omitting the card. Absence and unapproved are handled the
 * same way at the call site, because they mean the same thing to a crawler —
 * there is no image here that we are willing to publish.
 */
export function manifestAssetByPath(path: string): ImageKitAsset | undefined {
  return imageManifest.find((a) => a.path === path);
}
