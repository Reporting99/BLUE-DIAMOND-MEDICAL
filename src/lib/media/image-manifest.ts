import type { ImageKitAsset } from "@/types/media";
import { doctors } from "@/features/doctors";
import { treatments } from "@/features/aesthetics/data/treatments";
import { technologies } from "@/features/technologies/data";
import { concerns } from "@/features/concerns/data";
import { medicalServices } from "@/features/medical-services/data";
import { MEDIA_ROOT } from "@/config/imagekit";

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
export const imageManifest: ImageKitAsset[] = [
  {
    id: "homepage-hero",
    path: `${MEDIA_ROOT}/hero/homepage-hero.jpg`,
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
  {
    id: "medical-service-uninsured-services",
    path: `${MEDIA_ROOT}/medical/uninsured-services.jpg`,
    width: 900,
    height: 700,
    aspectRatio: "9:7",
    alt: { en: "Uninsured services at Blue Diamond Medical", ar: "الخدمات غير المشمولة بالتأمين في بلو دايموند الطبية" },
    role: "service",
    status: "pending",
  },
  // Concern-explorer imagery — generated from src/features/concerns/data.ts.
  ...concerns.map(
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
