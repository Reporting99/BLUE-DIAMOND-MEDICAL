import type { PricingGroup } from "@/types/pricing";
import type { AestheticPriceRow } from "../pricing-types";

/**
 * Approved aesthetic treatment pricing — brief §19.
 *
 * All 81 rows of the client-approved pricing workbook
 * (`BLUE_DIAMOND_AESTHETIC_PRICING_APPROVED_2026-08-23.xlsx`), reconciled to
 * the canonical treatment taxonomy in `docs/APPROVED_AESTHETIC_PRICING_MATRIX.md`
 * and carrying that document's stable `PR-0xx` IDs.
 *
 * Rules this file is required to hold to (docs/CONTENT_GAPS_AND_APPROVALS.md,
 * GAP-003):
 *  - No price is estimated, rounded, converted or inferred.
 *  - No package or multi-session price is created — the workbook contains none.
 *  - No "starting from" wording is introduced — the workbook contains none.
 *  - Repeated area names across different treatments stay separate records
 *    (e.g. "Neck" is five different prices on five different treatments).
 *  - The three ampoule add-ons are `publicDisplay: false` pending GAP-014.
 */

const potenza = { en: "Potenza", ar: "Potenza" };
const ampoule = {
  en: "Specialized topicals (AMPOULE)",
  ar: "مستحضرات موضعية متخصصة (أمبولة)",
};
const ultraTopical = {
  en: "Ultra Laser + Specialized topical can be added",
  ar: "ليزر Ultra + يمكن إضافة مستحضر موضعي متخصص",
};
const eliteIq = { en: "Elite iQ", ar: "Elite iQ" };
const eliteIqRejuvenation = {
  en: "Elite iQ Skin Rejuvenation",
  ar: "تجديد البشرة باستخدام Elite iQ",
};

const rfRegular = {
  en: "RF Micro-Needling — Regular tip",
  ar: "الإبر الدقيقة بالترددات الراديوية — رأس عادي",
};
const rfBody = {
  en: "RF Micro-Needling — Body",
  ar: "الإبر الدقيقة بالترددات الراديوية — الجسم",
};
const rfFusion = {
  en: "RF Micro-Needling — Fusion / Infusion",
  ar: "الإبر الدقيقة بالترددات الراديوية — Fusion / Infusion",
};
const ultraGroup = { en: "Ultra Treatment", ar: "علاج الترا" };
const ultraPrp = { en: "Ultra + PRP", ar: "الترا + البلازما" };
const tempSureEnvi = { en: "TempSure Envi", ar: "TempSure Envi" };
const tempSureFlexSure = { en: "TempSure FlexSure", ar: "TempSure FlexSure" };
const vitalia = { en: "TempSure Vitalia", ar: "تمبشور فيتاليا" };
const laserRejuvenation = { en: "Laser Rejuvenation", ar: "تجديد البشرة بالليزر" };
const veinTreatment = { en: "Vein Treatment", ar: "علاج الأوردة" };
const lhr = { en: "Laser Hair Removal", ar: "إزالة الشعر بالليزر" };
const prpMicroneedling = { en: "PRP Microneedling", ar: "الإبر الدقيقة بالبلازما" };
const prpInjections = { en: "PRP Injections", ar: "حقن البلازما" };
const addOn = { en: "Ampoule / Addition", ar: "أمبولة / إضافة" };

export const aestheticPriceRows: AestheticPriceRow[] = [
  // ── RF Micro-Needling · Potenza — workbook rows 5–20 ──────────────────────
  { id: "PR-001", treatmentId: "rf-microneedling", group: rfRegular, area: { en: "Perioral (smile lines)", ar: "حول الفم (خطوط الابتسامة)" }, priceCents: 35000, notes: potenza, technologyIds: ["potenza"], publicDisplay: true, source: "workbook" },
  { id: "PR-002", treatmentId: "rf-microneedling", group: rfRegular, area: { en: "Periorbital (eyes)", ar: "حول العينين" }, priceCents: 35000, notes: potenza, technologyIds: ["potenza"], publicDisplay: true, source: "workbook" },
  { id: "PR-003", treatmentId: "rf-microneedling", group: rfRegular, area: { en: "Full Face", ar: "كامل الوجه" }, priceCents: 75000, notes: potenza, technologyIds: ["potenza"], publicDisplay: true, source: "workbook" },
  { id: "PR-004", treatmentId: "rf-microneedling", group: rfRegular, area: { en: "Full Face with Fusion Upgrade", ar: "كامل الوجه مع ترقية Fusion" }, priceCents: 95000, notes: potenza, technologyIds: ["potenza"], publicDisplay: true, source: "workbook" },
  { id: "PR-005", treatmentId: "rf-microneedling", group: rfRegular, area: { en: "Cheeks", ar: "الخدان" }, priceCents: 45000, notes: potenza, technologyIds: ["potenza"], publicDisplay: true, source: "workbook" },
  { id: "PR-006", treatmentId: "rf-microneedling", group: rfRegular, area: { en: "Forehead", ar: "الجبهة" }, priceCents: 45000, notes: potenza, technologyIds: ["potenza"], publicDisplay: true, source: "workbook" },
  { id: "PR-007", treatmentId: "rf-microneedling", group: rfRegular, area: { en: "Neck", ar: "الرقبة" }, priceCents: 65000, notes: potenza, technologyIds: ["potenza"], publicDisplay: true, source: "workbook" },
  { id: "PR-008", treatmentId: "rf-microneedling", group: rfRegular, area: { en: "Face and Neck", ar: "الوجه والرقبة" }, priceCents: 125000, notes: potenza, technologyIds: ["potenza"], publicDisplay: true, source: "workbook" },
  { id: "PR-009", treatmentId: "rf-microneedling", group: rfBody, area: { en: "Decolletage", ar: "أعلى الصدر" }, priceCents: 65000, notes: potenza, technologyIds: ["potenza"], publicDisplay: true, source: "workbook" },
  { id: "PR-010", treatmentId: "rf-microneedling", group: rfBody, area: { en: "Abdomen (Full)", ar: "البطن بالكامل" }, priceCents: 140000, notes: potenza, technologyIds: ["potenza"], publicDisplay: true, source: "workbook" },
  { id: "PR-011", treatmentId: "rf-microneedling", group: rfBody, area: { en: "Abdomen (Upper and Lower)", ar: "البطن العلوي والسفلي" }, priceCents: 75000, notes: potenza, technologyIds: ["potenza"], publicDisplay: true, source: "workbook" },
  { id: "PR-012", treatmentId: "rf-microneedling", group: rfBody, area: { en: "Arms (Back)", ar: "الجزء الخلفي من الذراعين" }, priceCents: 80000, notes: potenza, technologyIds: ["potenza"], publicDisplay: true, source: "workbook" },
  { id: "PR-013", treatmentId: "rf-microneedling", group: rfFusion, area: { en: "Small Area (Eyes, Cheeks, Forehead, etc.)", ar: "منطقة صغيرة (العينان، الخدان، الجبهة، إلخ)" }, priceCents: 85000, notes: ampoule, technologyIds: ["potenza"], publicDisplay: true, source: "workbook" },
  { id: "PR-014", treatmentId: "rf-microneedling", group: rfFusion, area: { en: "Neck", ar: "الرقبة" }, priceCents: 110000, notes: ampoule, technologyIds: ["potenza"], publicDisplay: true, source: "workbook" },
  { id: "PR-015", treatmentId: "rf-microneedling", group: rfFusion, area: { en: "Full Face", ar: "كامل الوجه" }, priceCents: 125000, notes: ampoule, technologyIds: ["potenza"], publicDisplay: true, source: "workbook" },
  { id: "PR-016", treatmentId: "rf-microneedling", group: rfFusion, area: { en: "Full Face & Neck", ar: "كامل الوجه والرقبة" }, priceCents: 155000, notes: ampoule, technologyIds: ["potenza"], publicDisplay: true, source: "workbook" },

  // ── Ultra — workbook rows 21–28, 79, 80 ───────────────────────────────────
  { id: "PR-017", treatmentId: "ultra", group: ultraGroup, area: { en: "Full Face", ar: "كامل الوجه" }, priceCents: 75000, notes: ultraTopical, technologyIds: ["ultra"], publicDisplay: true, source: "workbook" },
  { id: "PR-018", treatmentId: "ultra", group: ultraGroup, area: { en: "Moderate — Full Face", ar: "متوسط — كامل الوجه" }, priceCents: 55000, notes: ultraTopical, technologyIds: ["ultra"], publicDisplay: true, source: "workbook" },
  { id: "PR-019", treatmentId: "ultra", group: ultraGroup, area: { en: "Ultra-Light Glow Full Face", ar: "Ultra-Light Glow — كامل الوجه" }, priceCents: 35000, notes: ultraTopical, technologyIds: ["ultra"], publicDisplay: true, source: "workbook" },
  { id: "PR-020", treatmentId: "ultra", group: ultraGroup, area: { en: "Neck", ar: "الرقبة" }, priceCents: 42500, notes: ultraTopical, technologyIds: ["ultra"], publicDisplay: true, source: "workbook" },
  { id: "PR-021", treatmentId: "ultra", group: ultraGroup, area: { en: "Full Face + Neck", ar: "كامل الوجه + الرقبة" }, priceCents: 90000, notes: ultraTopical, technologyIds: ["ultra"], publicDisplay: true, source: "workbook" },
  { id: "PR-022", treatmentId: "ultra", group: ultraGroup, area: { en: "Decolletage", ar: "أعلى الصدر" }, priceCents: 60000, notes: ultraTopical, technologyIds: ["ultra"], publicDisplay: true, source: "workbook" },
  { id: "PR-023", treatmentId: "ultra", group: ultraGroup, area: { en: "Small Area", ar: "منطقة صغيرة" }, priceCents: 42500, notes: ultraTopical, technologyIds: ["ultra"], publicDisplay: true, source: "workbook" },
  // Named combined protocol, not a multi-session package. The workbook's AREA
  // cell holds the protocol name, so `area` stays null — no body area invented.
  { id: "PR-024", treatmentId: "ultra", group: { en: "Ultra + Potenza — Ultra Skin Solutions", ar: "الترا + Potenza — Ultra Skin Solutions" }, area: null, priceCents: 130000, notes: ultraTopical, technologyIds: ["ultra", "potenza"], publicDisplay: true, source: "workbook" },
  { id: "PR-075", treatmentId: "ultra", group: ultraPrp, area: { en: "Face", ar: "الوجه" }, priceCents: 75000, technologyIds: ["ultra"], publicDisplay: true, source: "workbook" },
  { id: "PR-076", treatmentId: "ultra", group: ultraPrp, area: { en: "Hair Restoration", ar: "استعادة الشعر" }, priceCents: 75000, technologyIds: ["ultra"], publicDisplay: true, source: "workbook" },

  // ── Radio Frequency · TempSure — workbook rows 29–35, 38 ──────────────────
  { id: "PR-025", treatmentId: "radio-frequency", group: tempSureEnvi, area: { en: "Perioral (smile lines)", ar: "حول الفم (خطوط الابتسامة)" }, priceCents: 30000, technologyIds: ["tempsure"], publicDisplay: true, source: "workbook" },
  { id: "PR-026", treatmentId: "radio-frequency", group: tempSureEnvi, area: { en: "Periorbital (eyes)", ar: "حول العينين" }, priceCents: 30000, technologyIds: ["tempsure"], publicDisplay: true, source: "workbook" },
  { id: "PR-027", treatmentId: "radio-frequency", group: tempSureEnvi, area: { en: "Full Face", ar: "كامل الوجه" }, priceCents: 65000, technologyIds: ["tempsure"], publicDisplay: true, source: "workbook" },
  { id: "PR-028", treatmentId: "radio-frequency", group: tempSureEnvi, area: { en: "Cheeks", ar: "الخدان" }, priceCents: 35000, technologyIds: ["tempsure"], publicDisplay: true, source: "workbook" },
  { id: "PR-029", treatmentId: "radio-frequency", group: tempSureEnvi, area: { en: "Forehead", ar: "الجبهة" }, priceCents: 35000, technologyIds: ["tempsure"], publicDisplay: true, source: "workbook" },
  { id: "PR-030", treatmentId: "radio-frequency", group: tempSureEnvi, area: { en: "Neck", ar: "الرقبة" }, priceCents: 35000, technologyIds: ["tempsure"], publicDisplay: true, source: "workbook" },
  { id: "PR-031", treatmentId: "radio-frequency", group: tempSureEnvi, area: { en: "Face and Neck", ar: "الوجه والرقبة" }, priceCents: 80000, technologyIds: ["tempsure"], publicDisplay: true, source: "workbook" },
  { id: "PR-034", treatmentId: "radio-frequency", group: tempSureFlexSure, area: { en: "Large", ar: "منطقة كبيرة" }, priceCents: 80000, notes: { en: "2–4 weeks between treatments", ar: "فاصل 2–4 أسابيع بين الجلسات" }, technologyIds: ["tempsure"], publicDisplay: true, source: "workbook" },

  // ── TempSure Vitalia — workbook rows 36–37 ────────────────────────────────
  { id: "PR-032", treatmentId: "tempsure-vitalia", group: vitalia, area: { en: "Area", ar: "منطقة" }, priceCents: 50000, technologyIds: ["tempsure-vitalia"], publicDisplay: true, source: "workbook" },
  { id: "PR-033", treatmentId: "tempsure-vitalia", group: vitalia, area: { en: "Full", ar: "كامل" }, priceCents: 100000, technologyIds: ["tempsure-vitalia"], publicDisplay: true, source: "workbook" },

  // ── Laser Skin Treatments · Elite iQ — workbook rows 39–45 ────────────────
  { id: "PR-035", treatmentId: "laser-skin-treatments", group: laserRejuvenation, area: { en: "Full Face", ar: "كامل الوجه" }, priceCents: 32500, notes: eliteIqRejuvenation, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-036", treatmentId: "laser-skin-treatments", group: laserRejuvenation, area: { en: "Partial Face", ar: "جزء من الوجه" }, priceCents: 25000, notes: eliteIqRejuvenation, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-037", treatmentId: "laser-skin-treatments", group: laserRejuvenation, area: { en: "Face, Neck & Chest", ar: "الوجه والرقبة والصدر" }, priceCents: 50000, notes: eliteIqRejuvenation, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-038", treatmentId: "laser-skin-treatments", group: laserRejuvenation, area: { en: "Neck", ar: "الرقبة" }, priceCents: 25000, notes: eliteIqRejuvenation, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-039", treatmentId: "laser-skin-treatments", group: laserRejuvenation, area: { en: "Chest", ar: "الصدر" }, priceCents: 32500, notes: eliteIqRejuvenation, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-040", treatmentId: "laser-skin-treatments", group: laserRejuvenation, area: { en: "Hands (Both)", ar: "اليدان" }, priceCents: 32500, notes: eliteIqRejuvenation, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-041", treatmentId: "laser-skin-treatments", group: veinTreatment, area: { en: "4 x 4 cm Sq Area", ar: "مساحة 4 × 4 سم" }, priceCents: 30000, notes: { en: "Leg veins / spider veins", ar: "أوردة الساق / الأوردة العنكبوتية" }, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },

  // ── Laser Hair Removal · Elite iQ — workbook rows 46–76 ───────────────────
  { id: "PR-042", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Full Abdomen", ar: "البطن بالكامل" }, priceCents: 15000, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-043", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Areola", ar: "الهالة حول الحلمة" }, priceCents: 7500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-044", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Full Arms", ar: "الذراعان بالكامل" }, priceCents: 26500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-045", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Arm (Upper/Lower)", ar: "الذراع (علوي/سفلي)" }, priceCents: 16500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-046", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Back", ar: "الظهر" }, priceCents: 34500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-047", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Back and Shoulders", ar: "الظهر والكتفان" }, priceCents: 39500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-048", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Back (Lower)", ar: "أسفل الظهر" }, priceCents: 15500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-049", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Beard & Front Neck", ar: "اللحية ومقدمة الرقبة" }, priceCents: 16500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-050", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Bikini, Brazilian", ar: "بيكيني برازيلي" }, priceCents: 17500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-051", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Bikini, Playboy", ar: "بيكيني Playboy" }, priceCents: 15500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-052", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Bikini, Standard (Female)", ar: "بيكيني عادي (نساء)" }, priceCents: 9500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-053", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Bikini, Standard (Male)", ar: "بيكيني عادي (رجال)" }, priceCents: 17500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-054", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Brows (Between)", ar: "بين الحاجبين" }, priceCents: 5500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-055", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Cheeks", ar: "الخدان" }, priceCents: 7500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-056", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Chest", ar: "الصدر" }, priceCents: 22500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-057", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Chin", ar: "الذقن" }, priceCents: 5500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-058", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Derriere", ar: "الأرداف" }, priceCents: 19500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-059", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Ears", ar: "الأذنان" }, priceCents: 6500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-060", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Face Lower (Woman)", ar: "الجزء السفلي من الوجه (نساء)" }, priceCents: 16500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-061", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Feet and Toes", ar: "القدمان وأصابع القدم" }, priceCents: 9500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-062", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Hands & Fingers", ar: "اليدان والأصابع" }, priceCents: 9500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-063", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Happy Trail", ar: "الخط أسفل البطن" }, priceCents: 9500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-064", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Legs (Full)", ar: "الساقان بالكامل" }, priceCents: 37500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-065", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Legs (Upper or Lower)", ar: "الساقان (علوي أو سفلي)" }, priceCents: 23500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-066", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Lip (Upper)", ar: "الشفة العليا" }, priceCents: 5500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-067", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Neck (Back)", ar: "خلف الرقبة" }, priceCents: 8500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-068", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Neck (Front)", ar: "مقدمة الرقبة" }, priceCents: 8500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-069", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Perineum", ar: "منطقة العجان" }, priceCents: 9500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-070", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Shoulders", ar: "الكتفان" }, priceCents: 15500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-071", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Sideburns", ar: "السوالف" }, priceCents: 7500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },
  { id: "PR-072", treatmentId: "laser-hair-removal", group: lhr, area: { en: "Underarms", ar: "تحت الإبطين" }, priceCents: 9500, notes: eliteIq, technologyIds: ["elite-iq"], publicDisplay: true, source: "workbook" },

  // ── PRP — workbook rows 77, 78, 81, 82 ────────────────────────────────────
  { id: "PR-073", treatmentId: "prp-skin-rejuvenation", group: prpMicroneedling, area: { en: "Full Face", ar: "كامل الوجه" }, priceCents: 85000, publicDisplay: true, source: "workbook" },
  // Workbook cell E78 is empty. Resolved by the client approval email of
  // 2026-08-23: "PRP microneedling for the neck is priced at $850, the same as
  // the face." Not inferred from the face price — quoted from the email.
  { id: "PR-074", treatmentId: "prp-skin-rejuvenation", group: prpMicroneedling, area: { en: "Neck", ar: "الرقبة" }, priceCents: 85000, publicDisplay: true, source: "client-email" },
  { id: "PR-077", treatmentId: "prp-skin-rejuvenation", group: prpInjections, area: { en: "Dark Circles / Under Eye", ar: "الهالات الداكنة / تحت العين" }, priceCents: 45000, publicDisplay: true, source: "workbook" },
  { id: "PR-078", treatmentId: "prp-hair-restoration", group: prpInjections, area: { en: "Hair Restoration", ar: "استعادة الشعر" }, priceCents: 75000, publicDisplay: true, source: "workbook" },

  // ── Ampoule add-ons — workbook rows 83–85 ─────────────────────────────────
  // Commercially approved, clinically held: GAP-014 (clinician sign-off on the
  // topical-infusion agent list). `publicDisplay: false` keeps the approved
  // price stored and classified while publishing no price, indication,
  // benefit or suitability claim anywhere. Flip only with clinician sign-off.
  { id: "PR-079", treatmentId: null, group: addOn, area: { en: "Tranexamic Acid Ampoule", ar: "أمبولة حمض الترانيكساميك" }, priceCents: 12000, publicDisplay: false, source: "workbook" },
  { id: "PR-080", treatmentId: null, group: addOn, area: { en: "Vitamin C Ampoule", ar: "أمبولة فيتامين C" }, priceCents: 6000, publicDisplay: false, source: "workbook" },
  { id: "PR-081", treatmentId: null, group: addOn, area: { en: "Vitamin A Ampoule", ar: "أمبولة فيتامين A" }, priceCents: 6000, publicDisplay: false, source: "workbook" },
];

/** Rows cleared for publication. The only filter any rendering surface uses. */
export const publishedPriceRows: AestheticPriceRow[] = aestheticPriceRows.filter((row) => row.publicDisplay);

/**
 * Published prices for one treatment, in workbook order, grouped by the
 * workbook's TREATMENTS column so a treatment page can render "Regular tip",
 * "Body" and "Fusion / Infusion" as separate blocks rather than one flat list.
 */
export function getTreatmentPricing(treatmentId: string): PricingGroup[] {
  const rows = publishedPriceRows.filter((row) => row.treatmentId === treatmentId);
  return groupRows(rows);
}

/**
 * The full published price list, for `/aesthetics/pricing`. Same records as
 * the treatment pages — grouped, never duplicated.
 */
export const aestheticsPricingGroups: PricingGroup[] = groupRows(publishedPriceRows);

function groupRows(rows: AestheticPriceRow[]): PricingGroup[] {
  const groups: PricingGroup[] = [];
  for (const row of rows) {
    let group = groups.find((candidate) => candidate.heading.en === row.group.en);
    if (!group) {
      group = { heading: row.group, items: [] };
      groups.push(group);
    }
    group.items.push({
      id: row.id,
      // A row whose AREA cell named the protocol rather than a body area
      // (PR-024) labels itself with the group heading instead.
      label: row.area ?? row.group,
      priceCents: row.priceCents,
      approvalStatus: "approved",
      notes: row.notes,
    });
  }
  return groups;
}
