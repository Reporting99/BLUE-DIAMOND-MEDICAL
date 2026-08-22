import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, MapPin, Phone, Stethoscope, Sparkles, Search, Cpu } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Button } from "@/components/ui/button";
import { ImageKitImage } from "@/components/shared/ImageKitImage";
import { ClinicSchema } from "@/components/shared/schema/ClinicSchema";
import { FaqPageSchema } from "@/components/shared/schema/FaqPageSchema";
import { ConcernExplorer } from "@/features/concerns/components/ConcernExplorer";
import { StatsCounters } from "@/features/home/components/StatsCounters";
import { SiteClosingExperience } from "@/components/layout/SiteClosingExperience";
import { getDictionary, isLocale, type Locale } from "@/i18n/config";
import { getRoute, href } from "@/lib/routing";
import { getBookingUrl, type BookingChannel } from "@/config/booking";
import { siteConfig } from "@/config/site";
import { getOpenStatus, statutoryHolidayNotice } from "@/config/clinic-hours";
import { doctors } from "@/features/doctors";
import { technologies } from "@/features/technologies/data";
import { treatments } from "@/features/aesthetics/data/treatments";
import { concerns } from "@/features/concerns/data";
import { medicalServices } from "@/features/medical-services/data";
import { products, availabilityNotice } from "@/features/products/data";
import { formatPrice } from "@/types/pricing";
import { getRouteMetadata } from "@/lib/seo/metadata";
import type { AestheticTreatment, Technology } from "@/types/aesthetics";
import type { Bilingual } from "@/types/medical-service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return getRouteMetadata("home", safeLocale, {
    description: {
      en: "Family medicine, walk-in care, and physician-led medical aesthetics at Blue Diamond Medical Clinic in West Springs, Calgary. Male and female physicians accepting new patients.",
      ar: "طب الأسرة، والرعاية بدون موعد، والتجميل الطبي بإشراف طبي في عيادة بلو دايموند الطبية في ويست سبرينغز، كالغاري. أطباء وطبيبات يستقبلون مرضى جددًا.",
    },
    ogImagePath: "/blue-diamond/hero/homepage-hero.jpg",
  });
}

/**
 * Homepage-only copy, grounded in Blue-Diamond-Medical-Website-Content-Extraction_1.docx
 * — see docs/CONTENT_COVERAGE_REPORT.md. Kept local to this file rather
 * than the shared i18n dictionary since it isn't reused elsewhere (the
 * dictionary's `home.*` keys still carry the hero/pathways/doctors/
 * location/final-CTA strings that ARE simple enough to live there).
 * "PREMIUM UNIFIED HOMEPAGE REDESIGN" pass: merges bluediamondmedical.ca
 * and bluediamondmedicalaesthetics.ca content into one homepage. No new
 * facts are introduced anywhere below — every section either reuses an
 * existing typed content array (treatments/technologies/concerns/
 * medicalServices/products/doctors) or restates a fact already published
 * elsewhere on the site (booking channels, hours, address).
 */
const homepageCopy = {
  en: {
    // Approved values only (brief §12) — the counter component animates
    // toward these exact numbers, never invents different ones. `from`
    // matches the brief's own recommended starting points (0, 0, 2000).
    trustStats: [
      { from: 0, to: 6, label: "Physicians" },
      { from: 0, to: 28, suffix: "+", label: "Years of Family Medicine Experience" },
      { from: 2000, to: 2022, label: "Serving Calgary Since" },
    ],
    trustLine: ["West Springs, Calgary", "Family Medical Care", "Medical Aesthetics Consultation", "Potenza · Elite iQ™ · TempSure · Ultra"],
    findByNeedEyebrow: "START HERE",
    findByNeedHeading: "Find the right place to begin",
    findByNeedIntro: "Explore care and treatment information by medical service, aesthetic treatment, skin concern, or technology.",
    findByNeed: [
      { label: "Medical service", caption: "Family medicine, chronic care, and more", routeId: "medical-hub", icon: "stethoscope" as const },
      { label: "Aesthetic treatment", caption: "RF micro-needling, laser, and more", routeId: "aesthetics-treatments-hub", icon: "sparkles" as const },
      { label: "Skin concern", caption: "Browse by what you're noticing", routeId: "aesthetics-concerns-hub", icon: "search" as const },
      { label: "Technology", caption: "The devices behind the treatments", routeId: "aesthetics-technologies-hub", icon: "cpu" as const },
    ],
    medicalDepthEyebrow: "MEDICAL CARE",
    medicalDepthHeading: "Care for every stage of life.",
    medicalDepthIntro: "Comprehensive AHS-insured family medicine and walk-in care for patients and families in West Springs.",
    medicalDepthCta: "Explore all medical services",
    // Card title/short text come straight from each service's own
    // `summary`/`whoItsFor` in src/features/medical-services/data.ts — never
    // re-typed here — so only the per-card CTA label (descriptive, not a
    // repeated "Learn More") lives in this object.
    medicalCardCtas: {
      "eye-screening": "Explore Eye Screening",
      "after-hours-care": "View After-Hours Care",
      "chronic-disease-management": "View Chronic Disease Management",
      "preventive-care": "Learn About Preventive Care",
      "weight-management": "Explore Weight Management",
      "pain-management": "Explore Pain Management",
      "minor-procedures": "View Minor Procedures",
      "uninsured-services": "View Uninsured Services",
    } as Record<string, string>,
    // Uninsured Services has its own real published route
    // (medical-uninsured-services) but isn't part of the medicalServices
    // content array, so its card text is authored here — grounded in the
    // same approved facts already used on that page (fee tables listed
    // in advance), nothing new invented.
    uninsuredServicesCard: {
      title: { en: "Uninsured Services", ar: "الخدمات غير المشمولة بالتأمين" },
      short: { en: "Forms, notes, and other uninsured services, with fees listed in advance.", ar: "نماذج ومذكرات وخدمات أخرى غير مشمولة بالتأمين، برسوم معلنة مسبقًا." },
      long: { en: "Care and paperwork that Alberta Health doesn't cover — travel and work forms, medical notes, and similar administrative requests — priced and listed on our uninsured-services page before your visit.", ar: "رعاية ومعاملات لا يغطيها التأمين الصحي لألبرتا — كنماذج السفر والعمل والمذكرات الطبية وطلبات إدارية مشابهة — مع أسعار معلنة على صفحة الخدمات غير المشمولة قبل زيارتكم." },
    },
    otherServiceFactsHeading: "Also included in every visit",
    otherServiceFacts: ["General Family Medicine", "Walk-In Care", "Vaccination", "Onsite Pediatrician", "Mental Health", "Women's Health"],
    medicalGuidance: [
      { label: "New patients", body: "Family-doctor and walk-in appointments are both available — book through the family-doctor or walk-in pathway below." },
      { label: "Walk-in visitors", body: "Walk-ins have been welcomed consistently since the clinic opened in July 2022." },
      { label: "Existing patients", body: "Book your next appointment through the same external booking system as always." },
      { label: "External booking", body: "All booking is completed through Mika, Euclid, Jane, or by phone — never on this website." },
    ],
    treatmentsEyebrow: "MEDICAL AESTHETICS",
    treatmentsHeading: "Featured aesthetic treatments.",
    treatmentsIntro: "Physician-led treatments, delivered with the same clinical standards as every other visit.",
    treatmentsCta: "Explore all aesthetic treatments",
    techEyebrow: "TECHNOLOGY BEHIND THE TREATMENT",
    techHeading: "The devices behind your treatment.",
    techIntro: "Every device we use is introduced here — what it is, how it works, and which treatments and concerns it addresses.",
    journeyEyebrow: "YOUR VISIT",
    journeyHeading: "Your visit, made simple.",
    journeySteps: [
      { t: "Choose a service", d: "Medical care or medical aesthetics — or explore both." },
      { t: "Review information", d: "Read what the service or treatment involves before you book." },
      { t: "Book through the approved system", d: "Mika, Euclid, Jane, or a phone call — never on this website." },
      { t: "Attend your consultation or appointment", d: "Every aesthetics treatment starts with a physician consultation." },
    ],
    doctorsEyebrow: "OUR PHYSICIANS",
    productsEyebrow: "SKINMEDICA",
    productsHeading: "Medical-grade skincare, recommended by your physician.",
    productsIntro: "Blue Diamond Medical carries SkinMedica, a professional skincare line. Availability and pricing are confirmed in person, not through online checkout.",
    productsCta: "View All SkinMedica Products",
    resourcesEyebrow: "PATIENT RESOURCES",
    resourcesHeading: "Useful patient resources.",
    resources: [
      { label: "Patient resources", body: "Clinic policies, no-show fees, and appointment guidance.", routeId: "patient-resources-hub" },
      { label: "Uninsured services", body: "Forms, notes, and fees for services outside AHS coverage.", routeId: "medical-uninsured-services" },
      { label: "After-hours care", body: "PCN partnerships for guidance outside clinic hours.", routeId: "medical-after-hours-care" },
      { label: "Contact the clinic", body: "Questions we haven't answered here.", routeId: "contact" },
    ],
    locationEyebrow: "OUR COMMUNITY",
    bookingHeading: "Find the right appointment.",
    bookingPaths: [
      { channel: "family-doctor" as BookingChannel, label: "EXISTING PATIENT" },
      { channel: "walk-in" as BookingChannel, label: "NEW OR WALK-IN PATIENT" },
      { channel: "aesthetics-consultation" as BookingChannel, label: "MEDICAL AESTHETICS" },
    ],
    callCard: { label: "CALL THE CLINIC", value: siteConfig.clinic.phoneDisplay },
    faqEyebrow: "QUESTIONS, ANSWERED",
    faqHeading: "Questions, answered.",
    faqs: [
      { q: "Do you accept walk-in patients?", a: "Yes. Blue Diamond Medical has consistently welcomed walk-in patients since opening in West Springs in July 2022, alongside scheduled family medicine appointments." },
      { q: "Where is the clinic located?", a: "23-8 Weston Drive SW, Calgary, Alberta T3H 5P2, in West Springs." },
      { q: "What are your hours?", a: "Monday to Friday, 8:00 a.m. to 7:00 p.m. Closed all statutory holidays." },
      { q: "Are bookings completed on this website?", a: "No. This website provides information only — every booking is completed through Mika, Euclid, Jane, or by calling the clinic directly." },
      { q: "How do I book a medical aesthetics consultation?", a: "Every aesthetics treatment begins with a physician consultation — book through our aesthetics consultation pathway, or call the clinic directly." },
      { q: "Where are Elite iQ™ treatments performed?", a: "At Citizen Studio, a separate address from the West Springs clinic — see the laser hair removal treatment page for details." },
      { q: "How can I ask about SkinMedica products?", a: "Contact the clinic directly. Product availability and current pricing are confirmed in person, not online." },
      { q: "Can SkinMedica products be purchased online?", a: "No. Online purchasing is not currently available." },
      { q: "Is Botox covered by insurance?", a: "Botox for migraine, bruxism/TMJ, and hyperhidrosis is covered by a combination of provincial health insurance and our compassionate program. Cosmetic Botox is not insured." },
    ],
    finalActions: { explorMedical: "Explore Medical Care", exploreAesthetics: "Explore Medical Aesthetics" },
  },
  ar: {
    trustStats: [
      { from: 0, to: 6, label: "أطباء" },
      { from: 0, to: 28, prefix: "+", label: "عامًا من خبرة طب الأسرة" },
      { from: 2000, to: 2022, label: "نخدم كالغاري منذ" },
    ],
    trustLine: ["ويست سبرينغز، كالغاري", "الرعاية الطبية للأسرة", "استشارة تجميل طبي", "بوتنزا · إيليت آي كيو™ · تمبشور · الترا"],
    findByNeedEyebrow: "ابدأوا من هنا",
    findByNeedHeading: "اعثروا على نقطة البداية المناسبة",
    findByNeedIntro: "استكشفوا المعلومات والخيارات العلاجية حسب الخدمة الطبية، أو العلاج التجميلي، أو مخاوف البشرة، أو التقنية.",
    findByNeed: [
      { label: "خدمة طبية", caption: "طب الأسرة، الرعاية المزمنة، والمزيد", routeId: "medical-hub", icon: "stethoscope" as const },
      { label: "علاج تجميلي", caption: "الإبر الدقيقة، الليزر، والمزيد", routeId: "aesthetics-treatments-hub", icon: "sparkles" as const },
      { label: "مخاوف البشرة", caption: "تصفّحوا حسب ما تلاحظونه", routeId: "aesthetics-concerns-hub", icon: "search" as const },
      { label: "التقنية", caption: "الأجهزة المستخدمة في العلاجات", routeId: "aesthetics-technologies-hub", icon: "cpu" as const },
    ],
    medicalDepthEyebrow: "الرعاية الطبية",
    medicalDepthHeading: "رعاية تناسب كل مرحلة من مراحل الحياة.",
    medicalDepthIntro: "طب أسرة شامل ورعاية بدون موعد مشمولة بالتأمين الصحي للمرضى والعائلات في ويست سبرينغز.",
    medicalDepthCta: "استكشفوا جميع الخدمات الطبية",
    medicalCardCtas: {
      "eye-screening": "استكشفوا فحص العين",
      "after-hours-care": "عرض الرعاية خارج أوقات الدوام",
      "chronic-disease-management": "عرض إدارة الأمراض المزمنة",
      "preventive-care": "تعرّفوا على الرعاية الوقائية",
      "weight-management": "استكشفوا إدارة الوزن",
      "pain-management": "استكشفوا إدارة الألم",
      "minor-procedures": "عرض الإجراءات البسيطة",
      "uninsured-services": "عرض الخدمات غير المشمولة",
    } as Record<string, string>,
    uninsuredServicesCard: {
      title: { en: "Uninsured Services", ar: "الخدمات غير المشمولة بالتأمين" },
      short: { en: "Forms, notes, and other uninsured services, with fees listed in advance.", ar: "نماذج ومذكرات وخدمات أخرى غير مشمولة بالتأمين، برسوم معلنة مسبقًا." },
      long: { en: "Care and paperwork that Alberta Health doesn't cover — travel and work forms, medical notes, and similar administrative requests — priced and listed on our uninsured-services page before your visit.", ar: "رعاية ومعاملات لا يغطيها التأمين الصحي لألبرتا — كنماذج السفر والعمل والمذكرات الطبية وطلبات إدارية مشابهة — مع أسعار معلنة على صفحة الخدمات غير المشمولة قبل زيارتكم." },
    },
    otherServiceFactsHeading: "مشمول أيضًا في كل زيارة",
    otherServiceFacts: ["طب الأسرة العام", "الرعاية بدون موعد", "التطعيمات", "طبيب أطفال في العيادة", "الصحة النفسية", "صحة المرأة"],
    medicalGuidance: [
      { label: "المرضى الجدد", body: "مواعيد طبيب الأسرة والزيارات بدون موعد متاحة كلاهما — احجزوا عبر مسار طبيب الأسرة أو بدون موعد أدناه." },
      { label: "زوار بدون موعد", body: "يُرحَّب بالحالات بدون موعد مسبق باستمرار منذ افتتاح العيادة في يوليو 2022." },
      { label: "المرضى الحاليون", body: "احجزوا موعدكم القادم عبر نفس نظام الحجز الخارجي المعتاد." },
      { label: "الحجز الخارجي", body: "يتم الحجز بالكامل عبر Mika أو Euclid أو Jane أو الهاتف — وليس أبدًا عبر هذا الموقع." },
    ],
    treatmentsEyebrow: "التجميل الطبي",
    treatmentsHeading: "علاجات تجميلية مميزة.",
    treatmentsIntro: "علاجات بإشراف طبي، تُقدَّم بنفس المعايير السريرية المعتمدة في كل زيارة.",
    treatmentsCta: "استكشفوا جميع العلاجات التجميلية",
    techEyebrow: "التقنية وراء العلاج",
    techHeading: "الأجهزة وراء علاجكم.",
    techIntro: "نقدّم هنا كل جهاز نستخدمه — ما هو، وكيف يعمل، وما هي العلاجات والمخاوف التي يعالجها.",
    journeyEyebrow: "زيارتكم",
    journeyHeading: "زيارتكم، بكل بساطة.",
    journeySteps: [
      { t: "اختاروا الخدمة", d: "الرعاية الطبية أو التجميل الطبي — أو استكشفوا كليهما." },
      { t: "اطّلعوا على المعلومات", d: "اقرأوا ما تتضمنه الخدمة أو العلاج قبل الحجز." },
      { t: "احجزوا عبر النظام المعتمد", d: "Mika أو Euclid أو Jane أو اتصال هاتفي — وليس أبدًا عبر هذا الموقع." },
      { t: "احضروا استشارتكم أو موعدكم", d: "يبدأ كل علاج تجميلي باستشارة طبية." },
    ],
    doctorsEyebrow: "أطباؤنا",
    productsEyebrow: "سكين ميديكا",
    productsHeading: "عناية طبية بالبشرة، يوصي بها طبيبكم.",
    productsIntro: "تقدّم بلو دايموند الطبية منتجات سكين ميديكا، وهي خط عناية بالبشرة احترافي. يتم تأكيد التوفر والسعر حضوريًا، وليس عبر الدفع الإلكتروني.",
    productsCta: "استعرضي جميع منتجات SkinMedica",
    resourcesEyebrow: "موارد المرضى",
    resourcesHeading: "موارد مفيدة للمرضى.",
    resources: [
      { label: "موارد المرضى", body: "سياسات العيادة، ورسوم عدم الحضور، وإرشادات المواعيد.", routeId: "patient-resources-hub" },
      { label: "الخدمات غير المشمولة بالتأمين", body: "نماذج ومذكرات ورسوم للخدمات خارج تغطية التأمين الصحي.", routeId: "medical-uninsured-services" },
      { label: "الرعاية خارج أوقات الدوام", body: "شراكات شبكة الرعاية الأولية للإرشاد خارج ساعات العمل.", routeId: "medical-after-hours-care" },
      { label: "تواصلوا مع العيادة", body: "أسئلة لم نُجب عنها هنا.", routeId: "contact" },
    ],
    locationEyebrow: "مجتمعنا",
    bookingHeading: "اعثروا على الموعد المناسب.",
    bookingPaths: [
      { channel: "family-doctor" as BookingChannel, label: "مريض حالي" },
      { channel: "walk-in" as BookingChannel, label: "مريض جديد أو بدون موعد" },
      { channel: "aesthetics-consultation" as BookingChannel, label: "التجميل الطبي" },
    ],
    callCard: { label: "اتصلوا بالعيادة", value: siteConfig.clinic.phoneDisplay },
    faqEyebrow: "الأسئلة الشائعة",
    faqHeading: "الأسئلة الشائعة.",
    faqs: [
      { q: "هل تستقبلون مرضى بدون موعد مسبق؟", a: "نعم. تستقبل بلو دايموند الطبية مرضى بدون موعد مسبق باستمرار منذ افتتاحها في ويست سبرينغز في يوليو 2022، إلى جانب مواعيد طب الأسرة المحجوزة." },
      { q: "أين تقع العيادة؟", a: "23-8 Weston Drive SW، كالغاري، ألبرتا T3H 5P2، في حي ويست سبرينغز." },
      { q: "ما هي ساعات العمل؟", a: "من الإثنين إلى الجمعة، من 8:00 صباحًا حتى 7:00 مساءً. مغلقون في جميع العطلات الرسمية." },
      { q: "هل تتم عملية الحجز عبر هذا الموقع؟", a: "لا. يقدّم هذا الموقع معلومات فقط — ويتم كل حجز عبر Mika أو Euclid أو Jane، أو بالاتصال المباشر بالعيادة." },
      { q: "كيف أحجز استشارة تجميل طبي؟", a: "يبدأ كل علاج تجميلي باستشارة طبية — احجزوا عبر مسار استشارة التجميل الطبي، أو اتصلوا بالعيادة مباشرة." },
      { q: "أين تُجرى علاجات Elite iQ™؟", a: "في Citizen Studio، وهو عنوان منفصل عن عيادة ويست سبرينغز — راجعوا صفحة علاج إزالة الشعر بالليزر للتفاصيل." },
      { q: "كيف أسأل عن منتجات سكين ميديكا؟", a: "تواصلوا مع العيادة مباشرة. يتم تأكيد التوفر والسعر الحالي حضوريًا، وليس عبر الإنترنت." },
      { q: "هل يمكن شراء منتجات سكين ميديكا عبر الإنترنت؟", a: "لا. الشراء عبر الإنترنت غير متاح حاليًا." },
      { q: "هل البوتوكس مشمول بالتأمين الصحي؟", a: "يُغطّى بوتوكس الشقيقة وصرير الأسنان (TMJ) والتعرق الزائد جزئيًا بالتأمين الصحي الحكومي وبرنامج العيادة التعاطفي. البوتوكس التجميلي غير مشمول بالتأمين." },
    ],
    finalActions: { explorMedical: "استكشفوا الرعاية الطبية", exploreAesthetics: "استكشفوا التجميل الطبي" },
  },
} as const;

// Real, live medical-service routes only — verified against the route
// registry ("HEADER, DISCLAIMER REMOVAL, COUNTERS AND SERVICE-CARD
// INTERACTIONS" pass §7). "General Family Medicine," "Walk-In Care,"
// "Vaccination," "Pediatrics," "Mental Health," and "Women's Health" have
// no dedicated page — they're shown as a plain informational strip below
// the cards (`otherServiceFacts`), never as a dead/fake-linked card.
const SERVICE_CARD_ORDER = [
  "eye-screening",
  "after-hours-care",
  "chronic-disease-management",
  "preventive-care",
  "weight-management",
  "pain-management",
  "minor-procedures",
];

// Technologies in the brief's exact required numbered order (01 Potenza, 02
// Elite iQ, 03 TempSure, 04 Ultra, 05 TempSure Vitalia) — not the order
// they happen to appear in src/features/technologies/data.ts.
const TECH_SHOWCASE_ORDER = ["potenza", "elite-iq", "tempsure", "ultra", "tempsure-vitalia"];

// Featured treatments for the homepage's asymmetric showcase — all 8 are
// live, published treatments (never the gated cosmetic-botox/
// skin-tightening pages). One large + two medium + five compact editorial
// entries, not four uniform cards.
const TREATMENT_SHOWCASE_ORDER = [
  "rf-microneedling",
  "laser-hair-removal",
  "radio-frequency",
  "laser-skin-treatments",
  "ultra",
  "prp-hair-restoration",
  "prp-skin-rejuvenation",
  "tempsure-vitalia",
];

// Six approved SkinMedica products spanning six of the seven "Factor"
// groups, for editorial variety rather than six from the same group.
const PRODUCT_SHOWCASE_IDS = [
  "lumivive-system",
  "retinol-complex-05",
  "total-defence-repair-spf-34-tinted",
  "dermal-repair-cream",
  "scar-recovery-gel-large",
  "tns-advanced-plus-serum",
];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const dict = getDictionary(locale);
  const copy = homepageCopy[locale];
  const bookingHub = getRoute("book-appointment")!;
  const status = getOpenStatus();
  const featuredDoctors = doctors.slice(0, 3);

  const serviceCards = [
    ...SERVICE_CARD_ORDER.map((id) => {
      const service = medicalServices.find((s) => s.id === id);
      if (!service) return null;
      return {
        id: service.id,
        routeId: `medical-${service.id}`,
        title: service.title,
        short: service.summary,
        long: service.whoItsFor ?? service.summary,
        ctaLabel: copy.medicalCardCtas[service.id] ?? copy.medicalDepthCta,
      };
    }),
    {
      id: "uninsured-services",
      routeId: "medical-uninsured-services",
      title: copy.uninsuredServicesCard.title,
      short: copy.uninsuredServicesCard.short,
      long: copy.uninsuredServicesCard.long,
      ctaLabel: copy.medicalCardCtas["uninsured-services"] ?? copy.medicalDepthCta,
    },
  ].filter((c): c is NonNullable<typeof c> => Boolean(c));

  const techShowcase = TECH_SHOWCASE_ORDER.map((id) => technologies.find((t) => t.id === id)).filter((t): t is Technology => Boolean(t));
  const treatmentShowcase = TREATMENT_SHOWCASE_ORDER.map((id) => treatments.find((t) => t.id === id)).filter((t): t is AestheticTreatment => Boolean(t));
  const productShowcase = PRODUCT_SHOWCASE_IDS.map((id) => products.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p));

  const concernForTreatment = (treatmentId: string) => concerns.find((c) => c.relatedTreatmentIds.includes(treatmentId));

  const faqSchemaEntries = copy.faqs.map((faq) => ({ question: { en: faq.q, ar: faq.q }, answer: { en: faq.a, ar: faq.a } }));

  const findByNeedIcon = { stethoscope: Stethoscope, sparkles: Sparkles, search: Search, cpu: Cpu };

  return (
    <>
      <ClinicSchema locale={locale} />
      <FaqPageSchema faqs={faqSchemaEntries} locale={locale} />

      {/* ============ SECTION 1 — UNIFIED PREMIUM HERO ============ */}
      {/* No data-reveal anywhere in this section: H1, CTAs, and both
          images are LCP-critical/above-the-fold and must render
          immediately, per the brief's explicit "do not animate hero H1,
          hero CTA, LCP image, critical booking information" rule. */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(120% 70% at 85% 15%, var(--surface-blue-soft) 0%, transparent 60%), radial-gradient(90% 60% at 10% 90%, var(--surface-blue-mist) 0%, transparent 55%)",
          }}
        />
        {/* Extra top padding vs. other section-y content: the header is
            `fixed` (not `sticky`) on the homepage specifically so the
            hero can extend behind its transparent top-state, which means
            it no longer reserves any space in normal flow — this
            replaces that reserved space so the H1 doesn't render behind
            the floating header. */}
        <Container className="grid gap-10 pt-28 pb-14 lg:grid-cols-[6fr_6fr] lg:items-center lg:pt-36 lg:pb-20">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">{dict.home.heroEyebrow}</p>
            <h1 className="mt-4 text-display-1 font-heading lg:text-display-1-lg">{dict.home.heroTitle}</h1>
            <p className="mt-5 text-body-lg text-text-secondary">{dict.home.heroBody}</p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button size="lg" render={<Link href={href("medical-hub", locale)} />}>
                {dict.home.heroCtaPrimary}
                <ArrowRight className="ms-1 size-4 rtl:rotate-180" />
              </Button>
              <Button size="lg" variant="outline" render={<Link href={href("aesthetics-hub", locale)} />}>
                {dict.home.heroCtaSecondary}
                <ArrowRight className="ms-1 size-4 rtl:rotate-180" />
              </Button>
            </div>
            <Button size="lg" variant="ghost" className="mt-3" render={<Link href={`/${locale}${bookingHub.path[locale]}`} />}>
              {dict.common.bookAppointment}
            </Button>

            {/* Compact trust line — only verified items, no statistics. */}
            <p className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-text-secondary">
              {copy.trustLine.map((item, i) => (
                <span key={item} className="ltr-run">
                  {i > 0 ? <span aria-hidden="true" className="me-2 text-primary">·</span> : null}
                  {item}
                </span>
              ))}
            </p>
          </div>

          {/* Dual-image composition: medical care + medical aesthetics,
              joined by a restrained diamond-facet seam (each half clipped
              with a complementary diagonal notch). */}
          {/* min-w-0 on the grid and both cells: without it, CSS Grid's
              default `min-width: auto` lets each image's intrinsic
              width (800) force its column wider than the track — a real
              horizontal-overflow bug found by measuring scrollWidth at
              375/768/1024px, not visible at 1440px where the column
              happens to still exceed 800px unscaled. */}
          <div className="relative grid aspect-[4/5] min-w-0 grid-cols-2 gap-1 lg:aspect-[16/10]">
            <div
              className="relative min-w-0 overflow-hidden rounded-lg"
              style={{ clipPath: "polygon(0 0, 94% 0, 100% 100%, 0 100%)" }}
            >
              <ImageKitImage
                path="/blue-diamond/pathways/medical-care.jpg"
                preset="hero"
                role="hero"
                status="pending"
                alt={{ en: "Family medicine at Blue Diamond Medical", ar: "طب الأسرة في بلو دايموند الطبية" }}
                locale={locale}
                width={800}
                height={1000}
                preload
                className="h-full w-full"
              />
            </div>
            <div
              className="relative min-w-0 overflow-hidden rounded-lg"
              style={{ clipPath: "polygon(6% 0, 100% 0, 100% 100%, 0 100%)" }}
            >
              <ImageKitImage
                path="/blue-diamond/pathways/medical-aesthetics.jpg"
                preset="hero"
                role="treatment"
                status="pending"
                alt={{ en: "Physician-led medical aesthetics at Blue Diamond Medical", ar: "التجميل الطبي بإشراف طبي في بلو دايموند الطبية" }}
                locale={locale}
                width={800}
                height={1000}
                preload
                className="h-full w-full"
              />
            </div>
          </div>
        </Container>
      </section>

      <SectionTransition from="var(--background)" to="var(--surface-blue-soft)" />

      {/* TRUST STRIP — verified stats only, animated (StatsCounters). */}
      <section className="bg-surface-blue-soft">
        <Container className="py-14 lg:py-16">
          <StatsCounters stats={copy.trustStats} />
        </Container>
      </section>

      <SectionTransition from="var(--surface-blue-soft)" to="var(--background)" />

      {/* ============ SECTION 2 — TWO CLEAR CARE PATHWAYS ============ */}
      {/* Asymmetric weight on desktop: medical takes the wider column
          text-and-image editorial treatment; aesthetics leads with a
          larger image-led panel. Order reverses in RTL automatically via
          the grid's natural flow direction — no JS mirroring needed. */}
      <section className="section-y">
        <Container>
          <h2 data-reveal="up" className="text-display-2 font-heading lg:text-display-2-lg">
            {dict.home.pathwaysTitle}
          </h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-[5fr_7fr]">
            <div data-reveal="start" className="flex flex-col justify-center rounded-lg border border-border p-8">
              <Stethoscope className="size-7 text-primary" aria-hidden="true" />
              <h3 className="mt-4 text-h3 font-heading">{dict.home.pathwaysMedicalTitle}</h3>
              <p className="mt-3 text-body text-text-secondary">{dict.home.pathwaysMedicalBody}</p>
              <Link href={href("medical-hub", locale)} className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover">
                {copy.finalActions.explorMedical} <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
            </div>

            <Link
              data-reveal="end"
              href={href("aesthetics-hub", locale)}
              className="group relative isolate flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-lg p-9 text-white"
            >
              <ImageKitImage
                path="/blue-diamond/aesthetics/consultation-room.jpg"
                preset="treatment"
                role="treatment"
                status="pending"
                alt={{ en: "Medical aesthetics consultation room at Blue Diamond Medical", ar: "غرفة استشارات التجميل الطبي في بلو دايموند الطبية" }}
                locale={locale}
                width={900}
                height={700}
                className="absolute inset-0 -z-20 h-full w-full"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10"
                style={{ background: "linear-gradient(0deg, rgba(41,101,137,0.92) 0%, rgba(41,101,137,0.5) 60%, rgba(41,101,137,0.08) 100%)" }}
              />
              <Sparkles className="size-7" aria-hidden="true" />
              <h3 className="mt-4 text-h3 font-heading text-white">{dict.home.pathwaysAestheticsTitle}</h3>
              <p className="mt-3 max-w-sm text-body text-white/90">{dict.home.pathwaysAestheticsBody}</p>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold tracking-wide">
                {copy.finalActions.exploreAesthetics} <ArrowRight className="size-4 rtl:rotate-180" />
              </span>
            </Link>
          </div>
        </Container>
      </section>

      <SectionTransition from="var(--background)" to="var(--surface)" />

      {/* ============ SECTION 3 — FIND CARE BY NEED ============ */}
      <section className="section-y bg-surface">
        <Container>
          <p data-reveal="up" className="text-xs font-semibold tracking-[0.1em] text-primary uppercase">{copy.findByNeedEyebrow}</p>
          <h2 data-reveal="up" className="mt-3 text-display-2 font-heading lg:text-display-2-lg">{copy.findByNeedHeading}</h2>
          <p data-reveal="up" className="mt-3 max-w-2xl text-body text-text-secondary">{copy.findByNeedIntro}</p>

          <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {copy.findByNeed.map((item, i) => {
              const Icon = findByNeedIcon[item.icon];
              return (
                <Link
                  key={item.label}
                  data-reveal="up"
                  data-reveal-delay={String(i % 4)}
                  href={`/${locale}${getRoute(item.routeId)!.path[locale]}`}
                  className="group flex flex-col gap-3 bg-background p-7 transition-colors hover:bg-surface-blue-soft"
                >
                  <Icon className="size-6 text-primary" aria-hidden="true" />
                  <span className="font-heading text-h4">{item.label}</span>
                  <span className="text-sm text-text-secondary">{item.caption}</span>
                  <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      <SectionTransition from="var(--surface)" to="var(--background)" />

      {/* ============ SECTION 4 — MEDICAL CARE DEPTH ============ */}
      <section className="section-y bg-background">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div data-reveal="up" className="max-w-xl">
              <p className="text-xs font-semibold tracking-[0.1em] text-primary uppercase">{copy.medicalDepthEyebrow}</p>
              <h2 className="mt-3 text-display-2 font-heading lg:text-display-2-lg">{copy.medicalDepthHeading}</h2>
              <p className="mt-3 text-body text-text-secondary">{copy.medicalDepthIntro}</p>
            </div>
            <Link data-reveal="up" href={href("medical-hub", locale)} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover">
              {copy.medicalDepthCta} <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          </div>

          {/* Real image-backed cards, not empty bordered boxes: default
              state shows image + title + short summary; hover/focus
              swaps to the longer explanation + a descriptive CTA. First
              2 cards span 2 columns for editorial variety, not a uniform
              4-up grid. */}
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {serviceCards.map((card, i) => (
              <ServiceCard
                key={card.id}
                title={card.title}
                short={card.short}
                long={card.long}
                ctaLabel={card.ctaLabel}
                routeId={card.routeId}
                imageId={card.id}
                locale={locale}
                delay={i}
                className={i < 2 ? "col-span-2" : "col-span-2 sm:col-span-1"}
              />
            ))}
          </div>

          <div data-reveal="up" className="mt-10 border-t border-border pt-6">
            <p className="text-xs font-semibold tracking-[0.08em] text-primary uppercase">{copy.otherServiceFactsHeading}</p>
            <p className="mt-2 text-sm text-text-secondary">{copy.otherServiceFacts.join(" · ")}</p>
          </div>

          <div className="mt-10 grid gap-6 border-t border-border pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {copy.medicalGuidance.map((item, i) => (
              <div key={item.label} data-reveal="up" data-reveal-delay={String(i % 4)}>
                <p className="text-xs font-semibold tracking-[0.08em] text-primary uppercase">{item.label}</p>
                <p className="mt-2 text-sm text-text-secondary">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <SectionTransition from="var(--background)" to="var(--surface-blue-soft)" />

      {/* ============ SECTION 5 — FEATURED AESTHETIC TREATMENTS ============ */}
      {/* One large + two medium + five compact editorial entries —
          deliberately not a uniform card grid. Alternating aspect ratios
          across the three tiers. */}
      <section className="section-y bg-surface-blue-soft" style={{ "--text-secondary": "var(--grey-4)" } as React.CSSProperties}>
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div data-reveal="up" className="max-w-xl">
              <p className="text-xs font-semibold tracking-[0.1em] text-primary uppercase">{copy.treatmentsEyebrow}</p>
              <h2 className="mt-3 text-display-2 font-heading lg:text-display-2-lg">{copy.treatmentsHeading}</h2>
              <p className="mt-3 text-body text-text-secondary">{copy.treatmentsIntro}</p>
            </div>
            <Link data-reveal="up" href={href("aesthetics-treatments-hub", locale)} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover">
              {copy.treatmentsCta} <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          </div>

          {treatmentShowcase.length ? (
            <div className="mt-10 grid gap-4 lg:grid-cols-6">
              {treatmentShowcase.slice(0, 1).map((treatment) => (
                <TreatmentCard key={treatment.id} treatment={treatment} locale={locale} concern={concernForTreatment(treatment.id)} size="large" className="lg:col-span-4 lg:row-span-2" />
              ))}
              {treatmentShowcase.slice(1, 3).map((treatment, i) => (
                <TreatmentCard key={treatment.id} treatment={treatment} locale={locale} concern={concernForTreatment(treatment.id)} size="medium" className="lg:col-span-2" delay={i} />
              ))}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:col-span-6 lg:grid-cols-5">
                {treatmentShowcase.slice(3).map((treatment, i) => (
                  <TreatmentCard key={treatment.id} treatment={treatment} locale={locale} concern={concernForTreatment(treatment.id)} size="small" delay={i} />
                ))}
              </div>
            </div>
          ) : null}
        </Container>
      </section>

      <SectionTransition from="var(--surface-blue-soft)" to="var(--background)" />

      {/* ============ SECTION 6 — EXPLORE BY CONCERN ============ */}
      <section className="section-y bg-background">
        <Container>
          <ConcernExplorer locale={locale} />
        </Container>
      </section>

      <SectionTransition from="var(--background)" to="var(--blue-4)" />

      {/* ============ SECTION 7 — TECHNOLOGY BEHIND THE TREATMENT ============ */}
      {/* Dark editorial atmosphere. One large featured (Potenza, "01") +
          an asymmetric supporting grid for 02-05 — never a flat row of
          five identical machine cards. */}
      <section className="relative overflow-hidden bg-blue-4 px-4 py-[clamp(4.5rem,9vw,7.5rem)] lg:px-6">
        <span aria-hidden="true" className="pointer-events-none absolute -top-16 end-[-4rem] size-56 rotate-45 bg-white/5 lg:size-72" />
        <span aria-hidden="true" className="pointer-events-none absolute bottom-[-6rem] start-[-3rem] size-64 rotate-45 bg-white/5" />
        <Container>
          <div data-reveal="up" className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.14em] text-white/80 uppercase">{copy.techEyebrow}</p>
            <h2 className="mt-4 text-display-2 font-heading text-white lg:text-display-2-lg">{copy.techHeading}</h2>
            <p className="mt-4 text-body-lg text-white/85">{copy.techIntro}</p>
          </div>

          {techShowcase.length ? (
            <div className="mt-12 grid gap-6 lg:grid-cols-6">
              {techShowcase.slice(0, 1).map((tech, i) => (
                <TechnologyCard key={tech.id} technology={tech} locale={locale} number={i + 1} size="large" className="lg:col-span-4" />
              ))}
              <div className="grid gap-6 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1">
                {techShowcase.slice(1, 3).map((tech, i) => (
                  <TechnologyCard key={tech.id} technology={tech} locale={locale} number={i + 2} size="small" delay={i} />
                ))}
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:col-span-6 lg:grid-cols-2">
                {techShowcase.slice(3).map((tech, i) => (
                  <TechnologyCard key={tech.id} technology={tech} locale={locale} number={i + 4} size="medium" delay={i} />
                ))}
              </div>
            </div>
          ) : null}
        </Container>
      </section>

      <SectionTransition from="var(--blue-4)" to="var(--background)" />

      {/* ============ SECTION 8 — PATIENT JOURNEY ============ */}
      <section className="section-y bg-background">
        <Container>
          <p data-reveal="up" className="text-center text-xs font-semibold tracking-[0.1em] text-primary uppercase">{copy.journeyEyebrow}</p>
          <h2 data-reveal="up" className="mt-3 text-center text-display-2 font-heading lg:text-display-2-lg">{copy.journeyHeading}</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {copy.journeySteps.map((step, i) => (
              <div key={step.t} data-reveal="up" data-reveal-delay={String(Math.min(i, 3))} className="border-t-2 border-blue-1 pt-5">
                <div className="ltr-run font-heading text-h3 text-primary">{String(i + 1).padStart(2, "0")}</div>
                <p className="mt-3 font-semibold">{step.t}</p>
                <p className="mt-2 text-sm text-text-secondary">{step.d}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <SectionTransition from="var(--background)" to="var(--surface)" />

      {/* ============ SECTION 9 — DOCTORS AND CARE TEAM ============ */}
      <section className="section-y bg-surface">
        <Container>
          <div data-reveal="up" className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-[0.1em] text-primary uppercase">{copy.doctorsEyebrow}</p>
            <h2 className="mt-3 text-display-2 font-heading lg:text-display-2-lg">{dict.home.doctorsTitle}</h2>
            <p className="mt-3 text-body text-text-secondary">{dict.home.doctorsBody}</p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {featuredDoctors.map((doctor, i) => {
              const route = getRoute(doctor.routeId)!;
              return (
                <Link
                  key={doctor.id}
                  data-reveal="scale"
                  data-reveal-delay={String(Math.min(i, 3))}
                  href={`/${locale}${route.path[locale]}`}
                  className="group block overflow-hidden rounded-lg border border-border bg-background"
                >
                  <div className="facet-corner-sm relative aspect-[4/5] overflow-hidden">
                    <ImageKitImage
                      path={doctor.image.path}
                      preset="doctor-card"
                      role="doctor"
                      status={doctor.image.status}
                      alt={{ en: `Portrait of ${doctor.name.en}`, ar: `صورة ${doctor.name.ar}` }}
                      locale={locale}
                      width={480}
                      height={600}
                      className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-heading text-h4">{doctor.name[locale]}</p>
                    <p className="mt-1 text-sm text-text-secondary">{doctor.credentials[locale]}</p>
                  </div>
                </Link>
              );
            })}
          </div>
          <div data-reveal="up" className="mt-8 text-center">
            <Link href={href("doctors-index", locale)} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover">
              {dict.common.learnMore} <span className="sr-only">{locale === "ar" ? "عن أطبائنا" : "about our doctors"}</span>{" "}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          </div>
        </Container>
      </section>

      <SectionTransition from="var(--surface)" to="var(--background)" />

      {/* ============ SECTION 10 — SKINMEDICA PRODUCT COLLECTION ============ */}
      {/* Refined homepage preview only (4-6 featured products) — the full
          23-product catalogue lives at /shop, never on the homepage.
          Every card links to its own real detail page; the section CTA
          opens the catalogue itself, not Contact, since that's what "View
          All SkinMedica Products" actually points to — button wording
          must match its destination. */}
      <section className="section-y bg-background">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div data-reveal="up" className="max-w-xl">
              <p className="text-xs font-semibold tracking-[0.1em] text-primary uppercase">{copy.productsEyebrow}</p>
              <h2 className="mt-3 text-display-2 font-heading lg:text-display-2-lg">{copy.productsHeading}</h2>
              <p className="mt-3 text-body text-text-secondary">{copy.productsIntro}</p>
            </div>
            <Button data-reveal="up" render={<Link href={href("shop-hub", locale)} />}>
              {copy.productsCta}
            </Button>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {productShowcase.map((product, i) => (
              <Link
                key={product.id}
                href={href(`shop-product-${product.id}`, locale)}
                data-reveal="up"
                data-reveal-delay={String(i % 4)}
                className="group rounded-lg border border-border p-5 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div className="facet-corner-sm aspect-square overflow-hidden rounded">
                  <ImageKitImage
                    path={product.images[0]!.path}
                    preset="product"
                    role="product"
                    status={product.images[0]!.status}
                    alt={product.images[0]!.alt}
                    locale={locale}
                    width={400}
                    height={400}
                    className="h-full w-full transition-transform group-hover:scale-[1.02]"
                  />
                </div>
                <p className="mt-4 font-heading text-h5 group-hover:text-primary">{product.name[locale]}</p>
                {product.detail ? <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{product.detail.overview[locale]}</p> : null}
                <p className="mt-2 text-sm text-text-secondary">{product.sizeLabel}</p>
                <p className="mt-1 text-sm font-semibold text-text-body">{formatPrice(product.priceCents)}</p>
              </Link>
            ))}
          </div>

          <p data-reveal="up" className="mt-6 max-w-2xl text-sm text-text-secondary">{availabilityNotice[locale]}</p>
        </Container>
      </section>

      <SectionTransition from="var(--background)" to="var(--surface-blue-mist)" />

      {/* ============ SECTION 11 — PATIENT RESOURCES ============ */}
      <section className="section-y bg-surface-blue-mist" style={{ "--text-secondary": "var(--grey-4)" } as React.CSSProperties}>
        <Container>
          <p data-reveal="up" className="text-xs font-semibold tracking-[0.1em] text-primary uppercase">{copy.resourcesEyebrow}</p>
          <h2 data-reveal="up" className="mt-3 text-display-2 font-heading lg:text-display-2-lg">{copy.resourcesHeading}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {copy.resources.map((item, i) => (
              <Link
                key={item.label}
                data-reveal="up"
                data-reveal-delay={String(i % 4)}
                href={`/${locale}${getRoute(item.routeId)!.path[locale]}`}
                className="group flex flex-col gap-2 rounded-lg border border-border bg-background p-5 transition-colors hover:border-primary"
              >
                <span className="font-semibold">{item.label}</span>
                <span className="text-sm text-text-secondary">{item.body}</span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <SectionTransition from="var(--surface-blue-mist)" to="var(--background)" />

      {/* ============ SECTION 14 — FAQ ============ */}
      {/* FAQPage schema is emitted once at the top of the page from this
          exact `copy.faqs` array via FaqPageSchema — never a separate
          invented list. */}
      <section className="section-y bg-background">
        <Container className="max-w-3xl">
          <p data-reveal="up" className="text-center text-xs font-semibold tracking-[0.1em] text-primary uppercase">{copy.faqEyebrow}</p>
          <h2 data-reveal="up" className="mt-3 text-center text-display-2 font-heading lg:text-display-2-lg">{copy.faqHeading}</h2>
          <div className="mt-10 divide-y divide-border border-y border-border">
            {copy.faqs.map((faq, i) => (
              <details key={faq.q} data-reveal="up" data-reveal-delay={String(Math.min(i, 3))} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold marker:content-none">
                  {faq.q}
                  <span className="shrink-0 text-primary group-open:hidden">+</span>
                  <span className="hidden shrink-0 text-primary group-open:inline">−</span>
                </summary>
                <p className="mt-3 text-sm text-text-secondary">{faq.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <SectionTransition from="var(--background)" to="var(--surface)" />

      {/* ============ SECTION 15 — LOCATION AND CONTACT ============ */}
      <section className="section-y bg-surface" style={{ "--text-secondary": "var(--grey-4)" } as React.CSSProperties}>
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div data-reveal="start">
            <p className="text-xs font-semibold tracking-[0.1em] text-primary uppercase">{copy.locationEyebrow}</p>
            <h2 className="mt-3 text-display-2 font-heading lg:text-display-2-lg">{dict.home.locationTitle}</h2>
            <p className="mt-4 text-body-lg text-text-secondary">{dict.home.locationBody}</p>

            <dl className="mt-6 space-y-3 text-body">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <dd>
                  {siteConfig.clinic.address.line1}, {siteConfig.clinic.address.city} {siteConfig.clinic.address.region} {siteConfig.clinic.address.postalCode}
                </dd>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <dd>
                  <a className="ltr-run hover:text-primary" href={`tel:${siteConfig.clinic.phone}`}>
                    {siteConfig.clinic.phoneDisplay}
                  </a>
                </dd>
              </div>
            </dl>

            <div className="mt-4 rounded-md border border-border bg-background px-4 py-3 text-sm">
              <span className="font-medium">{status.label[locale]}</span>
              <span className="mx-2 text-text-secondary">·</span>
              <span className="text-text-secondary">{statutoryHolidayNotice[locale]}</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <Button variant="outline" render={<Link href={href("contact", locale)} />}>
                {locale === "ar" ? "الحصول على الاتجاهات" : "Get directions"}
              </Button>
              <Button render={<Link href={`/${locale}${bookingHub.path[locale]}`} />}>{dict.common.bookAppointment}</Button>
            </div>
          </div>

          <div data-reveal="end" className="facet-corner aspect-[4/3] overflow-hidden rounded-lg lg:aspect-auto lg:self-stretch">
            <ImageKitImage
              path="/blue-diamond/clinic/map-placeholder.jpg"
              preset="service"
              role="location"
              status="pending"
              alt={{ en: "Map to Blue Diamond Medical Clinic", ar: "خريطة الوصول إلى عيادة بلو دايموند الطبية" }}
              locale={locale}
              width={800}
              height={600}
              className="h-full w-full"
            />
          </div>
        </Container>
      </section>

      <SectionTransition from="var(--surface)" to="var(--background)" />

      {/* BOOKING PATHS — external systems, resolved centrally. */}
      <section className="section-y bg-background">
        <Container>
          <h2 data-reveal="up" className="text-center text-display-2 font-heading lg:text-display-2-lg">
            {copy.bookingHeading}
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {copy.bookingPaths.map((path, i) => {
              const dest = getBookingUrl(path.channel);
              return (
                <a
                  key={path.channel}
                  data-reveal="up"
                  data-reveal-delay={String(i % 4)}
                  href={dest.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-40 flex-col gap-2.5 rounded-lg border border-border bg-surface p-7 transition-colors hover:border-primary"
                >
                  <span className="text-xs font-semibold tracking-[0.08em] text-primary uppercase">{path.label}</span>
                  <span className="mt-auto text-h4 font-heading">{dest.label[locale]}</span>
                </a>
              );
            })}
            <a
              data-reveal="up"
              data-reveal-delay="3"
              href={`tel:${siteConfig.clinic.phone}`}
              className="flex min-h-40 flex-col gap-2.5 rounded-lg border border-border bg-surface p-7 transition-colors hover:border-primary"
            >
              <span className="text-xs font-semibold tracking-[0.08em] text-primary uppercase">{copy.callCard.label}</span>
              <span className="ltr-run mt-auto text-h4 font-heading">{copy.callCard.value}</span>
            </a>
          </div>
        </Container>
      </section>

      {/* ============ SECTION 16 — FINAL CONVERSION AREA ============ */}
      {/* One continuous closing atmosphere (light content → CTA → the
          footer's own deep-blue tone), not three flat rectangles — see
          SiteClosingExperience.tsx. Replaces the previous flat bg-blue-4
          CTA block + a separate manual gradient-seam div. */}
      <SiteClosingExperience locale={locale} variant="light" />
    </>
  );
}

/**
 * "Care for every stage of life" service card. Mobile (base styles):
 * plain stacked card — image, title, short summary, all always visible,
 * the whole card is one link. Desktop (`lg:`): converts into an
 * absolutely-positioned overlay card — image + title/short-summary shown
 * by default, swapping via opacity+translate to the longer explanation +
 * a descriptive CTA on hover *or* keyboard focus (`group-focus-within`,
 * which fires the instant the link itself receives focus — no extra JS).
 * The explanation is a real `absolute inset-0 opacity-0` element, never
 * `display:none` at the `lg:` breakpoint, so it stays genuinely animatable
 * and present for assistive tech and search engines at all times — a
 * `hidden`/`flex` toggle can't transition opacity at all, which is the
 * one thing tried first and rejected here.
 */
function ServiceCard({
  title,
  short,
  long,
  ctaLabel,
  routeId,
  imageId,
  locale,
  delay,
  className = "",
}: {
  title: Bilingual;
  short: Bilingual;
  long: Bilingual;
  ctaLabel: string;
  routeId: string;
  imageId: string;
  locale: Locale;
  delay: number;
  className?: string;
}) {
  const route = getRoute(routeId)!;
  return (
    <Link
      href={`/${locale}${route.path[locale]}`}
      data-reveal="up"
      data-reveal-delay={String(delay % 4)}
      className={`group relative isolate flex flex-col overflow-hidden rounded-lg border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:aspect-[4/5] lg:border-0 ${className}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden lg:absolute lg:inset-0 lg:aspect-auto">
        <ImageKitImage
          path={`/medical/${imageId}.jpg`}
          preset="service"
          role="service"
          status="pending"
          alt={{ en: `${title.en} at Blue Diamond Medical`, ar: `${title.ar} في بلو دايموند الطبية` }}
          locale={locale}
          width={600}
          height={450}
          className="h-full w-full transition-opacity duration-[380ms] lg:group-hover:opacity-0 lg:group-focus-within:opacity-0"
        />
      </div>

      <div className="relative flex flex-1 flex-col gap-1.5 p-5 lg:absolute lg:inset-0 lg:z-10 lg:justify-end lg:text-white lg:transition-opacity lg:duration-[380ms] lg:group-hover:opacity-0 lg:group-focus-within:opacity-0">
        <div
          aria-hidden="true"
          className="hidden lg:absolute lg:inset-0 lg:-z-10 lg:block"
          style={{ background: "linear-gradient(0deg, rgba(29,86,120,0.88) 0%, rgba(29,86,120,0.55) 55%, rgba(29,86,120,0.05) 100%)" }}
        />
        <h3 className="font-heading text-h5">{title[locale]}</h3>
        <p className="text-sm text-text-secondary lg:text-white/90">{short[locale]}</p>
      </div>

      {/* Desktop-only explanation overlay. Hidden (display:none) below
          `lg:` since mobile shows the short summary directly instead
          (brief's "preferred approach" — no hover on touch). */}
      <div className="pointer-events-none absolute inset-0 z-20 hidden translate-y-2 flex-col justify-between bg-primary p-5 text-white opacity-0 transition-[opacity,transform] duration-[380ms] lg:flex lg:group-hover:pointer-events-auto lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:pointer-events-auto lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100">
        <div>
          <h3 className="font-heading text-h5">{title[locale]}</h3>
          <p className="mt-2 text-sm text-white/90">{long[locale]}</p>
        </div>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">
          {ctaLabel} <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

/**
 * One card component rendering three visual tiers (large/medium/small) for
 * the treatment showcase, so the grid stays editorial rather than four
 * repeated identical cards. `size="small"` intentionally drops the image
 * for a compact, text-led editorial link — brief: "Smaller editorial
 * links."
 */
function TreatmentCard({
  treatment,
  locale,
  concern,
  size,
  className = "",
  delay = 0,
}: {
  treatment: AestheticTreatment;
  locale: Locale;
  concern?: { title: { en: string; ar: string } };
  size: "large" | "medium" | "small";
  className?: string;
  delay?: number;
}) {
  const route = getRoute(`treatment-${treatment.id}`)!;
  const linkHref = `/${locale}${route.path[locale]}`;

  if (size === "small") {
    return (
      <Link data-reveal="up" data-reveal-delay={String(delay % 4)} href={linkHref} className="group flex flex-col gap-2">
        <div className="aspect-square overflow-hidden rounded-md bg-background/60">
          <ImageKitImage
            path={`/treatments/${treatment.id}.jpg`}
            preset="treatment"
            role="treatment"
            status="pending"
            alt={{ en: `${treatment.title.en} at Blue Diamond Medical`, ar: `${treatment.title.ar} في بلو دايموند الطبية` }}
            locale={locale}
            width={300}
            height={300}
            className="h-full w-full transition-transform duration-300 group-hover:scale-[1.04]"
          />
        </div>
        <span className="text-sm font-semibold group-hover:text-primary">{treatment.title[locale]}</span>
      </Link>
    );
  }

  return (
    <Link
      data-reveal={size === "large" ? "start" : "up"}
      data-reveal-delay={size === "medium" ? String(delay % 4) : undefined}
      href={linkHref}
      className={`group relative isolate flex flex-col justify-end overflow-hidden rounded-lg p-7 text-white ${size === "large" ? "aspect-[4/3] lg:aspect-auto lg:min-h-[420px]" : "aspect-[4/3]"} ${className}`}
    >
      <ImageKitImage
        path={`/treatments/${treatment.id}.jpg`}
        preset="treatment"
        role="treatment"
        status="pending"
        alt={{ en: `${treatment.title.en} at Blue Diamond Medical`, ar: `${treatment.title.ar} في بلو دايموند الطبية` }}
        locale={locale}
        width={900}
        height={700}
        className="absolute inset-0 -z-20 h-full w-full"
      />
      {/* Darkens most of the card, not just the bottom third — a shorter
          aspect ratio (the "medium" size) can put the h3/p high enough
          that a steeper falloff left them over the near-white FacetTile
          placeholder with almost no darkening at all (a real contrast
          failure axe caught: 1.12:1 against white text). */}
      <div aria-hidden="true" className="absolute inset-0 -z-10" style={{ background: "linear-gradient(0deg, rgba(29,86,120,0.94) 0%, rgba(29,86,120,0.55) 60%, rgba(29,86,120,0.1) 100%)" }} />
      {concern ? <span className="text-xs font-semibold tracking-[0.08em] text-white/80 uppercase">{concern.title[locale]}</span> : null}
      <h3 className={`mt-2 font-heading text-white ${size === "large" ? "text-h2" : "text-h4"}`}>{treatment.title[locale]}</h3>
      <p className={`mt-2 text-white/85 ${size === "large" ? "max-w-md text-body" : "line-clamp-2 text-sm"}`}>{treatment.summary[locale]}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">
        <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
      </span>
    </Link>
  );
}

/**
 * Technology showcase card — three sizes matching the brief's "one large
 * featured + asymmetric supporting grid" spec for the dark section.
 */
function TechnologyCard({
  technology,
  locale,
  number,
  size,
  className = "",
  delay = 0,
}: {
  technology: Technology;
  locale: Locale;
  number: number;
  size: "large" | "medium" | "small";
  className?: string;
  delay?: number;
}) {
  const route = getRoute(`technology-${technology.id}`)!;
  const linkHref = `/${locale}${route.path[locale]}`;
  const relatedTreatmentTitles = technology.relatedTreatmentIds
    .map((id) => treatments.find((t) => t.id === id)?.title[locale])
    .filter((t): t is string => Boolean(t));

  return (
    <Link
      data-reveal={size === "large" ? "start" : "up"}
      data-reveal-delay={size !== "large" ? String(delay % 4) : undefined}
      href={linkHref}
      className={`group flex flex-col gap-4 rounded-lg border border-white/10 bg-white/5 p-6 text-white transition-colors hover:border-white/30 ${size === "large" ? "lg:flex-row lg:items-center lg:gap-8" : ""} ${className}`}
    >
      <div className={`relative aspect-square overflow-hidden rounded-md bg-white/5 ${size === "large" ? "w-full lg:w-64 lg:shrink-0" : size === "small" ? "w-16 shrink-0" : "w-full"}`}>
        <ImageKitImage
          path={technology.id === "potenza" ? "/technologies/potenza-device.jpg" : `/technologies/${technology.id}-device.jpg`}
          preset="technology"
          role="technology"
          status="pending"
          alt={{ en: `${technology.title.en} device at Blue Diamond Medical`, ar: `جهاز ${technology.title.ar} في بلو دايموند الطبية` }}
          locale={locale}
          width={size === "large" ? 500 : 200}
          height={size === "large" ? 500 : 200}
          className="h-full w-full"
        />
      </div>
      <div className={size === "small" ? "flex flex-1 items-center justify-between gap-3" : ""}>
        <div>
          <span className="ltr-run font-heading text-sm text-white/80">{String(number).padStart(2, "0")}</span>
          <h3 className={`font-heading text-white ${size === "large" ? "mt-1 text-h2" : "text-h5"}`}>{technology.title[locale]}</h3>
          {size !== "small" ? <p className={`mt-2 text-white/80 ${size === "large" ? "max-w-md text-body" : "line-clamp-2 text-sm"}`}>{technology.summary[locale]}</p> : null}
          {size === "large" && relatedTreatmentTitles.length ? (
            <p className="mt-3 text-sm text-white/80">{relatedTreatmentTitles.join(" · ")}</p>
          ) : null}
        </div>
        {size === "small" ? <ArrowRight className="size-4 shrink-0 text-white/80 rtl:rotate-180" aria-hidden="true" /> : null}
      </div>
    </Link>
  );
}
