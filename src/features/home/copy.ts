// Homepage-only copy and showcase ordering. Extracted from the route file so
// src/app/[locale]/page.tsx composes sections rather than carrying content.
import { siteConfig } from "@/config/site";
import type { BookingChannel } from "@/config/booking";

/**
 * Homepage-only copy, grounded in Blue-Diamond-Medical-Website-Content-Extraction_1.docx
 * — see docs/CONTENT_MODEL.md. Kept local to this file rather
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
export const homepageCopy = {
  en: {
    // Approved values only (brief §12) — the counter component animates
    // toward these exact numbers, never invents different ones. `from`
    // matches the brief's own recommended starting points (0, 0, 2000).
    trustStats: [
      { from: 0, to: 6, label: "Physicians" },
      // CL-028 — the approved biography states "over 30 years"; this counter
      // restates the same fact and is moved with it.
      { from: 0, to: 30, suffix: "+", label: "Years of Family Medicine Experience" },
      { from: 2000, to: 2022, label: "Serving Calgary Since" },
    ],
    trustLine: ["West Springs, Calgary", "Family Medical Care", "Medical Aesthetics Consultation", "Potenza · Elite iQ™ · TempSure · Ultra"],
    findByNeedEyebrow: "START HERE",
    findByNeedHeading: "Find the right place to begin",
    findByNeedIntro: "Explore care and treatment information by medical service, by what you'd like to treat, or by the technology behind it.",
    findByNeed: [
      { label: "Medical service", caption: "Family medicine, chronic care, and more", routeId: "medical-hub", icon: "stethoscope" as const },
      // One aesthetics row, not two. "Aesthetic treatment" and "Skin concern"
      // were separate entries pointing into two parallel catalogues; the
      // Treatments hub IS the concern list now, so a second row would be a
      // duplicate link under a different noun.
      { label: "Aesthetic treatment", caption: "Browse by what you're noticing", routeId: "aesthetics-treatments-hub", icon: "sparkles" as const },
      { label: "Technology", caption: "The devices behind the treatments", routeId: "aesthetics-technologies-hub", icon: "cpu" as const },
    ],
    medicalDepthEyebrow: "MEDICAL CARE",
    medicalDepthHeading: "Care for every stage of life",
    medicalDepthIntro: "Family medicine and walk-in care for patients and families in West Springs, Calgary.",
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
    medicalGuidance: [
      { label: "Registered patients", body: "Book online with your own family physician through Mikata, or call the clinic." },
      { label: "New patients and walk-ins", body: "Call the clinic or come to reception — walk-ins have been welcomed consistently since the clinic opened in July 2022." },
      { label: "Medical aesthetics", body: "For all aesthetic treatment appointments, book a 20-minute consultation with Dr. Farhat." },
      { label: "Minor procedures", body: "Booked by phone or in person only — minor procedures cannot be booked online." },
    ],
    treatmentsEyebrow: "MEDICAL AESTHETICS",
    treatmentsHeading: "Featured aesthetic treatments",
    treatmentsIntro: "Physician-led treatments, delivered with the same clinical standards as every other visit.",
    treatmentsCta: "Explore all aesthetic treatments",
    techEyebrow: "OUR TECHNOLOGY",
    techHeading: "The devices behind your treatment",
    techIntro: "Every device we use is introduced here — what it is, how it works, and which treatments and concerns it addresses.",
    journeyEyebrow: "YOUR VISIT",
    journeyHeading: "Your visit, made simple",
    journeySteps: [
      { t: "Choose a service", d: "Medical care or medical aesthetics — or explore both." },
      { t: "Review information", d: "Read what the service or treatment involves before you book." },
      { t: "Book your appointment", d: "Use Mikata, Skip the Waiting Room or Euclid, depending on your appointment, or book by phone or in person." },
      { t: "Attend your consultation or appointment", d: "Every aesthetics treatment starts with a physician consultation." },
    ],
    doctorsEyebrow: "OUR PHYSICIANS",
    productsEyebrow: "PROFESSIONAL SKINCARE",
    productsHeading: "Medical-grade skincare, recommended by your physician",
    productsIntro: "Blue Diamond Medical carries the Myriade professional skincare line. Availability and pricing are confirmed in person, not through online checkout.",
    productsCta: "View all products",
    resourcesEyebrow: "PATIENT RESOURCES",
    resourcesHeading: "Useful patient resources",
    resources: [
      { label: "Patient resources", body: "Clinic policies, no-show fees, and appointment guidance.", routeId: "patient-resources-hub" },
      { label: "Uninsured services", body: "Forms, notes, and fees for services not covered by Alberta Health.", routeId: "medical-uninsured-services" },
      { label: "After-hours care", body: "PCN partnerships for guidance outside clinic hours.", routeId: "medical-after-hours-care" },
      { label: "Contact the clinic", body: "Questions we haven't answered here.", routeId: "contact" },
    ],
    // Location card. The FACTS it shows — business name, address, phone, fax,
    // map target — are not here: they come from src/config/locations.ts, so
    // English and Arabic cannot drift apart. Only presentation strings below.
    location: {
      eyebrow: "VISIT US",
      heading: "See us in person",
      body: "You are welcome to visit during regular business hours. Our team is happy to answer questions about laser treatments, RF microneedling, and radiofrequency skin tightening.",
      addressLabel: "Address",
      phoneLabel: "Phone",
      faxLabel: "Fax",
      mapTitle: "Interactive map showing Blue Diamond Medical Aesthetics at 23-8 Weston Drive SW, Calgary",
      directions: "Get Directions",
      eliteIQHeading: "Elite iQ™ treatment location",
      eliteIQBody: "All Elite iQ™ treatments are performed exclusively at Citizen Studio.",
      eliteIQDirections: "Directions to Citizen Studio",
    },
    bookingHeading: "Find the right appointment",
    bookingPaths: [
      { channel: "family-doctor" as BookingChannel, label: "REGISTERED / CURRENT PATIENT" },
      { channel: "walk-in" as BookingChannel, label: "NEW OR WALK-IN PATIENT" },
      { channel: "aesthetics-consultation" as BookingChannel, label: "MEDICAL AESTHETICS" },
    ],
    callCard: { label: "CALL THE CLINIC", value: siteConfig.clinic.phoneDisplay },
    faqEyebrow: "COMMON QUESTIONS",
    faqHeading: "Questions, answered",
    faqs: [
      { q: "Do you accept walk-in patients?", a: "Yes. Blue Diamond Medical has consistently welcomed walk-in patients since opening in West Springs in July 2022, alongside scheduled family medicine appointments." },
      { q: "Where is the clinic located?", a: "23-8 Weston Drive SW, Calgary, Alberta T3H 5P2, in West Springs." },
      { q: "What are your hours?", a: "Monday to Saturday, 8:00 a.m. to 7:00 p.m. Closed Sundays and statutory holidays." },
      { q: "Are bookings completed on this website?", a: "No. This website provides information only — booking is completed through Mikata for registered patients, Skip the Waiting Room for new patients and walk-ins, Euclid for eye screening, by calling the clinic, or in person at reception." },
      { q: "How do I book a medical aesthetics consultation?", a: "For all aesthetic treatment appointments, book a 20-minute consultation with Dr. Farhat — through our aesthetics consultation pathway, or call the clinic directly." },
      { q: "Where are Elite iQ™ treatments performed?", a: "At Citizen Studio, a separate address from the West Springs clinic — see the laser hair removal treatment page for details." },
      { q: "How can I ask about the skincare products you carry?", a: "Contact the clinic directly. Product availability and current pricing are confirmed in person, not online." },
      { q: "Can skincare products be purchased online?", a: "No. Online purchasing is not currently available." },
      { q: "Is Botox covered by insurance?", a: "Coverage for medical Botox depends on the condition and your insurance eligibility. Provincial coverage, private insurance or the clinic's compassionate program may help with costs. Ask the clinic to confirm your coverage before treatment. Cosmetic Botox is uninsured." },
    ],
    finalActions: { explorMedical: "Explore Medical Care", exploreAesthetics: "Explore Medical Aesthetics" },
  },
  ar: {
    trustStats: [
      { from: 0, to: 6, label: "أطباء" },
      { from: 0, to: 30, prefix: "+", label: "عامًا من خبرة طب الأسرة" },
      { from: 2000, to: 2022, label: "نخدم كالغاري منذ" },
    ],
    trustLine: ["ويست سبرينغز، كالغاري", "الرعاية الطبية للأسرة", "استشارة تجميل طبي", "بوتنزا · إيليت آي كيو™ · تمبشور · الترا"],
    findByNeedEyebrow: "ابدأوا من هنا",
    findByNeedHeading: "اعثروا على نقطة البداية المناسبة",
    findByNeedIntro: "استكشفوا المعلومات والخيارات العلاجية حسب الخدمة الطبية، أو حسب ما ترغبون في علاجه، أو حسب التقنية المستخدمة.",
    findByNeed: [
      { label: "خدمة طبية", caption: "طب الأسرة، الرعاية المزمنة، والمزيد", routeId: "medical-hub", icon: "stethoscope" as const },
      { label: "علاج تجميلي", caption: "تصفّحوا حسب ما تلاحظونه", routeId: "aesthetics-treatments-hub", icon: "sparkles" as const },
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
    medicalGuidance: [
      { label: "المرضى المسجّلون", body: "احجزوا عبر الإنترنت مع طبيب أسرتكم من خلال نظام Mikata، أو اتصلوا بالعيادة." },
      { label: "المرضى الجدد والزيارات بدون موعد", body: "اتصلوا بالعيادة أو توجّهوا إلى الاستقبال — يُرحَّب بالحالات بدون موعد باستمرار منذ افتتاح العيادة في يوليو 2022." },
      { label: "التجميل الطبي", body: "تبدأ جميع مواعيد العلاجات التجميلية باستشارة مدتها 20 دقيقة مع الطبيب." },
      { label: "الإجراءات البسيطة", body: "تُحجز عبر الهاتف أو بالحضور شخصيًا فقط — ولا يمكن حجزها عبر الإنترنت." },
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
      { t: "احجزوا عبر النظام المعتمد", d: "Mikata أو Skip the Waiting Room أو Euclid أو اتصال هاتفي أو الحضور شخصيًا — وليس أبدًا عبر هذا الموقع." },
      { t: "احضروا استشارتكم أو موعدكم", d: "يبدأ كل علاج تجميلي باستشارة طبية." },
    ],
    doctorsEyebrow: "أطباؤنا",
    productsEyebrow: "ميرياد",
    productsHeading: "عناية طبية بالبشرة، يوصي بها طبيبكم.",
    productsIntro: "تقدّم بلو دايموند الطبية منتجات ميرياد، وهي خط عناية بالبشرة احترافي. يتم تأكيد التوفر والسعر حضوريًا، وليس عبر الدفع الإلكتروني.",
    productsCta: "استعرضي جميع المنتجات",
    resourcesEyebrow: "موارد المرضى",
    resourcesHeading: "موارد مفيدة للمرضى.",
    resources: [
      { label: "موارد المرضى", body: "سياسات العيادة، ورسوم عدم الحضور، وإرشادات المواعيد.", routeId: "patient-resources-hub" },
      { label: "الخدمات غير المشمولة بالتأمين", body: "نماذج ومذكرات ورسوم للخدمات خارج تغطية التأمين الصحي.", routeId: "medical-uninsured-services" },
      { label: "الرعاية خارج أوقات الدوام", body: "شراكات شبكة الرعاية الأولية للإرشاد خارج ساعات العمل.", routeId: "medical-after-hours-care" },
      { label: "تواصلوا مع العيادة", body: "أسئلة لم نُجب عنها هنا.", routeId: "contact" },
    ],
    location: {
      eyebrow: "زيارتنا",
      heading: "زورونا في عيادتنا",
      body: "نحن نقدّر عملاءنا، فلا تترددوا في زيارتنا خلال ساعات العمل المعتادة للاستفسار عن العلاج بالليزر، والإبر الدقيقة التجميلية، وموجات الترددات الراديوية.",
      addressLabel: "العنوان",
      phoneLabel: "الهاتف",
      faxLabel: "الفاكس",
      mapTitle: "خريطة تفاعلية توضح موقع Blue Diamond Medical Aesthetics في 23-8 Weston Drive SW، كالغاري",
      directions: "الحصول على الاتجاهات",
      eliteIQHeading: "موقع علاجات Elite iQ™",
      eliteIQBody: "تُجرى جميع علاجات Elite iQ™ حصريًا في Citizen Studio.",
      eliteIQDirections: "الاتجاهات إلى Citizen Studio",
    },
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
      { q: "ما هي ساعات العمل؟", a: "من الإثنين إلى السبت، من 8:00 صباحًا حتى 7:00 مساءً. مغلقون يوم الأحد وفي جميع العطلات الرسمية." },
      { q: "هل تتم عملية الحجز عبر هذا الموقع؟", a: "لا. يقدّم هذا الموقع معلومات فقط — ويتم الحجز عبر Mikata للمرضى المسجّلين، وعبر Skip the Waiting Room للمرضى الجدد والزيارات بدون موعد، وعبر Euclid لفحص العين، أو بالاتصال المباشر بالعيادة، أو بالحضور إلى الاستقبال." },
      { q: "كيف أحجز استشارة تجميل طبي؟", a: "يبدأ كل علاج تجميلي باستشارة طبية — احجزوا عبر مسار استشارة التجميل الطبي، أو اتصلوا بالعيادة مباشرة." },
      { q: "أين تُجرى علاجات Elite iQ™؟", a: "في Citizen Studio، وهو عنوان منفصل عن عيادة ويست سبرينغز — راجعوا صفحة علاج إزالة الشعر بالليزر للتفاصيل." },
      { q: "كيف أسأل عن المنتجات؟", a: "تواصلوا مع العيادة مباشرة. يتم تأكيد التوفر والسعر الحالي حضوريًا، وليس عبر الإنترنت." },
      { q: "هل يمكن شراء المنتجات عبر الإنترنت؟", a: "لا. الشراء عبر الإنترنت غير متاح حاليًا." },
      { q: "هل البوتوكس مشمول بالتأمين الصحي؟", a: "يُغطّى بوتوكس الشقيقة وصرير الأسنان (TMJ) والتعرق الزائد جزئيًا بالتأمين الصحي الحكومي وبرنامج العيادة التعاطفي. البوتوكس التجميلي غير مشمول بالتأمين." },
    ],
    finalActions: { explorMedical: "استكشفوا الرعاية الطبية", exploreAesthetics: "استكشفوا التجميل الطبي" },
  },
} as const;

// Real, live medical-service routes only — verified against the route
// registry ("HEADER, DISCLAIMER REMOVAL, COUNTERS AND SERVICE-CARD
// INTERACTIONS" pass §7). "General Family Medicine," "Walk-In Care,"
// "Vaccination," "Pediatrics," "Mental Health," and "Women's Health" have
// no dedicated page, so none of them appears as a dead/fake-linked card
// here. (They previously also had a plain informational strip below the
// cards, `otherServiceFacts` — removed 2026-09-09, client instruction.)
export const SERVICE_CARD_ORDER = [
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
export const TECH_SHOWCASE_ORDER = ["potenza", "elite-iq", "tempsure", "ultra", "tempsure-vitalia"];

// Featured treatments for the homepage's asymmetric showcase — all 8 are
// live, published treatments (never the gated cosmetic-botox/
// skin-tightening pages). One large + two medium + five compact editorial
// entries, not four uniform cards.
export const TREATMENT_SHOWCASE_ORDER = [
  "rf-microneedling",
  "laser-hair-removal",
  "radio-frequency",
  "laser-skin-treatments",
  "ultra",
  "prp-hair-restoration",
  "prp-skin-rejuvenation",
  "tempsure-vitalia",
];

// Six Myriade products, one from each of the six retail groupings the
// supplied Products Flyer uses (Daily Care, Brightening, Purifying,
// Anti-Aging and Repairing, Sun Care, Kits) — editorial variety rather than
// six from the same shelf.
//
// These were six SkinMedica products until 2026-09-07. That line is archived
// (src/config/features.ts), so `products` no longer contains any of those ids
// and home/queries.ts, which drops ids it cannot resolve, would have rendered
// the homepage's product section with an empty grid under a live heading.
// Professional-use items are deliberately absent: this row links into the
// retail catalogue, not the treatment room.
export const PRODUCT_SHOWCASE_IDS = [
  "the-cleanser",
  "c-serum",
  "charcoal-purifier",
  "collagen-activator-serum",
  "mineral-sunscreen-spf-30",
  "normal-skin-kit",
];