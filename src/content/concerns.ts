import type { AestheticConcern } from "@/types/aesthetics";

/**
 * Source: Blue-Diamond-Medical-Website-Content-Extraction_1.docx. Several
 * concern pages on the legacy site linked their "learn more" to
 * /laser-hair-removal even where the concern (redness, spider veins, sun
 * damage) has nothing to do with hair removal and everything to do with
 * general laser skin treatment — the extraction doc itself flags a similar
 * mislink elsewhere ("Ultra Treatment — links to /prp-therapy, mislabeled").
 * Rather than propagate that apparent CMS bug, those concerns are
 * cross-linked here to Laser Skin Treatments, whose own content explicitly
 * covers redness, spider veins, and pigmentation. Flagged with
 * `correctedFromSource: true`. See docs/CONTENT_MODEL.md.
 */
export const concerns: AestheticConcern[] = [
  {
    id: "acne-scars",
    slug: "acne-scars",
    slugAr: "ندبات-حب-الشباب",
    title: { en: "Acne Scars", ar: "ندبات حب الشباب" },
    summary: {
      en: "Comprehensive care for acne scarring — medical consultations, prescriptions where necessary, and RF micro-needling and laser treatments to reduce scarring, under the supervision of one of our physicians.",
      ar: "رعاية شاملة لندبات حب الشباب — استشارات طبية، ووصفات عند الحاجة، وعلاجات بالإبر الدقيقة بالترددات الراديوية والليزر لتقليل الندبات، تحت إشراف أحد أطبائنا.",
    },
    relatedTreatmentIds: ["rf-microneedling"],
    faqs: [
      {
        question: { en: "How does care for acne scarring start?", ar: "كيف تبدأ رعاية ندبات حب الشباب؟" },
        answer: {
          en: "With a medical consultation — from there, a physician may recommend a prescription where necessary, alongside treatments like RF micro-needling and laser.",
          ar: "تبدأ باستشارة طبية — وبناءً عليها، قد يوصي الطبيب بوصفة طبية عند الحاجة، إلى جانب علاجات مثل الإبر الدقيقة بالترددات الراديوية والليزر.",
        },
      },
      {
        question: { en: "Is this care physician-supervised?", ar: "هل هذه الرعاية تحت إشراف طبي؟" },
        answer: {
          en: "Yes — every step, from consultation to treatment, is supervised by one of our physicians.",
          ar: "نعم — تخضع كل خطوة، من الاستشارة إلى العلاج، لإشراف أحد أطبائنا.",
        },
      },
      {
        question: { en: "Which treatment is used for acne scarring?", ar: "ما العلاج المستخدم لندبات حب الشباب؟" },
        answer: {
          en: "RF micro-needling is the treatment linked to this concern; a physician will confirm what's appropriate for your specific scarring during your consultation.",
          ar: "تُستخدم الإبر الدقيقة بالترددات الراديوية لهذه المخاوف؛ وسيؤكد الطبيب ما يناسب حالة ندباتكم تحديدًا خلال الاستشارة.",
        },
      },
      {
        question: { en: "Will a prescription always be part of my care?", ar: "هل ستكون الوصفة الطبية جزءًا من رعايتي دائمًا؟" },
        answer: {
          en: "Not necessarily — prescriptions are provided where necessary, based on your physician's assessment.",
          ar: "ليس بالضرورة — تُقدَّم الوصفات عند الحاجة، بناءً على تقييم طبيبكم.",
        },
      },
      {
        question: { en: "How do I book a consultation?", ar: "كيف أحجز استشارة؟" },
        answer: {
          en: "Through Jane App, our external booking system for aesthetics consultations.",
          ar: "عبر تطبيق Jane، نظام الحجز الخارجي الخاص باستشارات التجميل الطبي لدينا.",
        },
      },
    ],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
  {
    id: "rosacea-redness",
    slug: "rosacea-redness",
    slugAr: "الوردية-والاحمرار",
    title: { en: "Rosacea & Redness", ar: "الوردية والاحمرار" },
    summary: {
      en: "The gentle flush of rosacea can escalate into redness that's distressing to live with. We take a holistic approach, starting with a full medical consultation to discuss what can be achieved — laser treatments often work best for this condition.",
      ar: "قد يتطور احمرار الوردية الخفيف إلى احمرار مزعج. نتبع نهجًا شاملًا يبدأ باستشارة طبية كاملة لمناقشة النتائج الممكنة — وغالبًا ما تكون علاجات الليزر الأنسب لهذه الحالة.",
    },
    relatedTreatmentIds: ["laser-skin-treatments"],
    correctedFromSource: true,
    faqs: [
      {
        question: { en: "Where does treatment for rosacea and redness start?", ar: "من أين يبدأ علاج الوردية والاحمرار؟" },
        answer: {
          en: "With a full medical consultation to discuss what can realistically be achieved for your specific presentation.",
          ar: "تبدأ باستشارة طبية كاملة لمناقشة النتائج الممكنة واقعيًا لحالتكم تحديدًا.",
        },
      },
      {
        question: { en: "What treatment is generally used for rosacea and redness?", ar: "ما العلاج المستخدم عادةً للوردية والاحمرار؟" },
        answer: {
          en: "Laser treatments often work best for this condition — Laser Skin Treatments is the relevant treatment page.",
          ar: "غالبًا ما تكون علاجات الليزر الأنسب لهذه الحالة — وصفحة علاجات الليزر للبشرة هي الصفحة ذات الصلة.",
        },
      },
      {
        question: { en: "Will rosacea come back after treatment?", ar: "هل تعود الوردية بعد العلاج؟" },
        answer: {
          en: "Results and their duration vary by individual — your physician will discuss realistic expectations for your case during the consultation.",
          ar: "تختلف النتائج ومدتها من شخص لآخر — سيناقش طبيبكم التوقعات الواقعية لحالتكم خلال الاستشارة.",
        },
      },
      {
        question: { en: "Is rosacea the same as general facial redness?", ar: "هل الوردية هي نفسها الاحمرار العام للوجه؟" },
        answer: {
          en: "Rosacea is one cause of facial redness; a physician consultation is the way to understand what's contributing to your specific redness.",
          ar: "الوردية هي أحد أسباب احمرار الوجه؛ والاستشارة الطبية هي الوسيلة لفهم ما يسهم في احمرار وجهكم تحديدًا.",
        },
      },
    ],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
  {
    id: "dry-skin",
    slug: "dry-skin",
    slugAr: "جفاف-البشرة",
    title: { en: "Dry Skin", ar: "جفاف البشرة" },
    summary: {
      en: "Calgary's climate is unusually harsh on skin. Using RF micro-needling to infuse topicals — including moisturizers and pigment regulators — we help skin stay nourished and glowing for months after treatment.",
      ar: "يُعد مناخ كالغاري قاسيًا بشكل خاص على البشرة. باستخدام الإبر الدقيقة بالترددات الراديوية لإدخال المستحضرات الموضعية — بما فيها المرطبات ومنظمات الصبغة — نساعد البشرة على البقاء رطبة ومشرقة لأشهر بعد العلاج.",
    },
    relatedTreatmentIds: ["rf-microneedling"],
    faqs: [
      {
        question: { en: "Why is Calgary's climate mentioned for dry skin care?", ar: "لماذا يُذكر مناخ كالغاري عند الحديث عن العناية بالبشرة الجافة؟" },
        answer: {
          en: "Calgary's climate is unusually harsh on skin, which is part of why ongoing nourishment support can be worthwhile for many patients here.",
          ar: "مناخ كالغاري قاسٍ بشكل خاص على البشرة، وهو أحد أسباب أهمية دعم الترطيب المستمر لكثير من المرضى هنا.",
        },
      },
      {
        question: { en: "How does RF micro-needling help with dry skin?", ar: "كيف تساعد الإبر الدقيقة بالترددات الراديوية في علاج جفاف البشرة؟" },
        answer: {
          en: "It's used to infuse topicals — including moisturizers and pigment regulators — helping skin stay nourished for months after treatment.",
          ar: "تُستخدم لإدخال المستحضرات الموضعية — بما فيها المرطبات ومنظمات الصبغة — مما يساعد البشرة على البقاء رطبة لأشهر بعد العلاج.",
        },
      },
      {
        question: { en: "How long does the nourishing effect last?", ar: "كم تدوم فائدة الترطيب؟" },
        answer: {
          en: "Effects can last for months after treatment, though this varies by individual.",
          ar: "قد تستمر الفائدة لأشهر بعد العلاج، إلا أن ذلك يختلف من شخص لآخر.",
        },
      },
    ],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
  {
    id: "fine-lines-wrinkles",
    slug: "fine-lines-wrinkles",
    slugAr: "الخطوط-الدقيقة-والتجاعيد",
    title: { en: "Fine Lines & Wrinkles", ar: "الخطوط الدقيقة والتجاعيد" },
    summary: {
      en: "State-of-the-art technologies to smooth and erase fine lines and wrinkles, alongside skin-tightening options for all skin types — bespoke treatments as individual as you are.",
      ar: "تقنيات متطورة لتنعيم الخطوط الدقيقة والتجاعيد ومحوها، إلى جانب خيارات شدّ البشرة لمختلف أنواعها — علاجات مخصصة تناسب كل حالة.",
    },
    relatedTreatmentIds: ["rf-microneedling", "radio-frequency"],
    faqs: [
      {
        question: { en: "What treatments address fine lines and wrinkles?", ar: "ما العلاجات التي تعالج الخطوط الدقيقة والتجاعيد؟" },
        answer: {
          en: "RF micro-needling and radio-frequency skin-tightening are the two treatments connected to this concern, suited to different skin types.",
          ar: "الإبر الدقيقة بالترددات الراديوية وشدّ البشرة بالترددات الراديوية هما العلاجان المرتبطان بهذه المخاوف، ويناسبان أنواع بشرة مختلفة.",
        },
      },
      {
        question: { en: "Is treatment the same for everyone?", ar: "هل العلاج نفسه لكل الأشخاص؟" },
        answer: {
          en: "No — treatments are bespoke, tailored to your specific skin during a consultation.",
          ar: "لا — العلاجات مخصصة وتُصمَّم بحسب بشرتكم تحديدًا خلال الاستشارة.",
        },
      },
      {
        question: { en: "Do these treatments also help with skin tightening, not just lines?", ar: "هل تساعد هذه العلاجات أيضًا على شدّ البشرة، وليس فقط الخطوط؟" },
        answer: {
          en: "Yes — skin-tightening options are available alongside the line-smoothing treatments, for all skin types.",
          ar: "نعم — تتوفر خيارات شدّ البشرة إلى جانب علاجات تنعيم الخطوط، لمختلف أنواع البشرة.",
        },
      },
    ],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
  {
    id: "skin-laxity",
    slug: "skin-laxity",
    slugAr: "ترهل-البشرة",
    title: { en: "Skin Laxity", ar: "ترهل البشرة" },
    summary: {
      en: "Radio-frequency waves promote collagen and elastin production to tighten and smooth skin all over the body — a quick, pain-free treatment (about 15 minutes) with easy, visible results and no downtime.",
      ar: "تُحفّز موجات الترددات الراديوية إنتاج الكولاجين والإيلاستين لشدّ البشرة وتنعيمها في مختلف مناطق الجسم — علاج سريع وغير مؤلم (نحو 15 دقيقة) بنتائج واضحة ودون تعافٍ.",
    },
    relatedTreatmentIds: ["radio-frequency"],
    faqs: [
      {
        question: { en: "How does radio-frequency treatment address skin laxity?", ar: "كيف يعالج علاج الترددات الراديوية ترهل البشرة؟" },
        answer: {
          en: "It promotes collagen and elastin production, which helps tighten and smooth skin across the body.",
          ar: "يحفّز إنتاج الكولاجين والإيلاستين، مما يساعد على شدّ البشرة وتنعيمها في مختلف مناطق الجسم.",
        },
      },
      {
        question: { en: "How long does a session take?", ar: "كم تستغرق الجلسة؟" },
        answer: {
          en: "About 15 minutes.",
          ar: "نحو 15 دقيقة.",
        },
      },
      {
        question: { en: "Is there downtime after treatment?", ar: "هل هناك فترة تعافٍ بعد العلاج؟" },
        answer: {
          en: "No downtime is associated with this treatment.",
          ar: "لا يرتبط هذا العلاج بأي فترة تعافٍ.",
        },
      },
    ],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
  {
    id: "spider-veins",
    slug: "spider-veins",
    slugAr: "الأوردة-العنكبوتية",
    title: { en: "Spider Veins", ar: "الأوردة العنكبوتية" },
    summary: {
      en: "Damaged blood vessels under the skin that can appear red, blue, or purple — generally harmless but unsightly. Laser treatments can remove them from anywhere on the body quickly and painlessly.",
      ar: "أوعية دموية تالفة تحت الجلد قد تظهر باللون الأحمر أو الأزرق أو الأرجواني — غير ضارة عادةً لكنها مزعجة جماليًا. يمكن لعلاجات الليزر إزالتها من أي منطقة في الجسم بسرعة ودون ألم.",
    },
    relatedTreatmentIds: ["laser-skin-treatments"],
    correctedFromSource: true,
    faqs: [
      {
        question: { en: "Are spider veins a health concern?", ar: "هل الأوردة العنكبوتية مشكلة صحية؟" },
        answer: {
          en: "They're generally harmless but can be unsightly — treatment is typically for cosmetic reasons, though your physician will assess your specific case.",
          ar: "غير ضارة عادةً لكنها قد تكون مزعجة جماليًا — ويكون العلاج عادةً لأسباب تجميلية، إلا أن طبيبكم سيقيّم حالتكم تحديدًا.",
        },
      },
      {
        question: { en: "Where on the body can spider veins be treated?", ar: "أين على الجسم يمكن علاج الأوردة العنكبوتية؟" },
        answer: {
          en: "Anywhere on the body.",
          ar: "في أي منطقة من الجسم.",
        },
      },
      {
        question: { en: "What causes the discoloration in spider veins?", ar: "ما سبب تغير اللون في الأوردة العنكبوتية؟" },
        answer: {
          en: "They're damaged blood vessels under the skin, which can appear red, blue, or purple.",
          ar: "هي أوعية دموية تالفة تحت الجلد، وقد تظهر باللون الأحمر أو الأزرق أو الأرجواني.",
        },
      },
    ],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
  {
    id: "sun-damage-pigmentation",
    slug: "sun-damage-pigmentation",
    slugAr: "تلف-الشمس-والتصبغ",
    title: { en: "Sun Damage & Pigmentation", ar: "تلف الشمس والتصبغ" },
    summary: {
      en: "Sun spots and liver spots from time in the sun can be easily reduced using our state-of-the-art laser technologies.",
      ar: "يمكن تقليل بقع الشمس والبقع الكبدية الناتجة عن التعرض للشمس بسهولة باستخدام تقنيات الليزر المتطورة لدينا.",
    },
    relatedTreatmentIds: ["laser-skin-treatments", "ultra"],
    correctedFromSource: true,
    faqs: [
      {
        question: { en: "What causes sun spots and pigmentation?", ar: "ما سبب بقع الشمس والتصبغ؟" },
        answer: {
          en: "Time in the sun, over the years.",
          ar: "التعرض للشمس على مدى سنوات.",
        },
      },
      {
        question: { en: "What treatments address sun damage and pigmentation?", ar: "ما العلاجات التي تعالج تلف الشمس والتصبغ؟" },
        answer: {
          en: "Laser Skin Treatments and the Ultra laser are the two treatments connected to this concern.",
          ar: "علاجات الليزر للبشرة وليزر الترا هما العلاجان المرتبطان بهذه المخاوف.",
        },
      },
      {
        question: { en: "Is sun damage/pigmentation the same as \"liver spots\"?", ar: "هل تلف الشمس/التصبغ هو نفسه \"البقع الكبدية\"؟" },
        answer: {
          en: "Liver spots are one common form of this — both are addressed by the same treatment pathway.",
          ar: "البقع الكبدية هي أحد الأشكال الشائعة لهذا التصبغ — ويُعالج كلاهما بنفس مسار العلاج.",
        },
      },
    ],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
  {
    id: "skin-revitalization",
    slug: "skin-revitalization",
    slugAr: "تجديد-البشرة",
    title: { en: "Skin Revitalization", ar: "تجديد البشرة" },
    summary: {
      en: "Harsh weather and daily stresses can leave skin looking tired. We can refresh skin in under 45 minutes, exposing a natural glow and reducing the appearance of fine lines and wrinkles.",
      ar: "قد يترك الطقس القاسي وضغوط الحياة اليومية أثرهما على مظهر البشرة. يمكننا تجديد نضارة البشرة خلال أقل من 45 دقيقة، وإظهار توهجها الطبيعي، وتقليل ظهور الخطوط الدقيقة والتجاعيد.",
    },
    relatedTreatmentIds: ["laser-skin-treatments", "rf-microneedling"],
    faqs: [
      {
        question: { en: "How long does a skin revitalization treatment take?", ar: "كم يستغرق علاج تجديد البشرة؟" },
        answer: {
          en: "Under 45 minutes.",
          ar: "أقل من 45 دقيقة.",
        },
      },
      {
        question: { en: "What does skin revitalization address?", ar: "ما الذي يعالجه تجديد البشرة؟" },
        answer: {
          en: "Skin that looks tired from harsh weather and daily stress, including the appearance of fine lines and wrinkles.",
          ar: "البشرة التي تبدو متعبة بسبب الطقس القاسي وضغوط الحياة اليومية، بما يشمل ظهور الخطوط الدقيقة والتجاعيد.",
        },
      },
      {
        question: { en: "Which treatments are used for skin revitalization?", ar: "ما العلاجات المستخدمة لتجديد البشرة؟" },
        answer: {
          en: "Laser Skin Treatments and RF micro-needling.",
          ar: "علاجات الليزر للبشرة والإبر الدقيقة بالترددات الراديوية.",
        },
      },
    ],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
  {
    id: "razor-bumps",
    slug: "razor-bumps",
    slugAr: "حبوب-الحلاقة",
    title: { en: "Razor Bumps", ar: "حبوب الحلاقة" },
    summary: {
      en: "Uncomfortable and prone to infection when combined with ingrown hairs. Our technologies can remove razor bumps, treat the underlying cause, and give you smoother, softer skin with minimally invasive treatment.",
      ar: "مزعجة وقابلة للإصابة عند اقترانها بالشعر النامي تحت الجلد. يمكن لتقنياتنا إزالة حبوب الحلاقة، وعلاج السبب الجذري، ومنحكم بشرة أنعم وأكثر نعومة بعلاج طفيف التوغل.",
    },
    relatedTreatmentIds: ["laser-hair-removal"],
    faqs: [
      {
        question: { en: "Why are razor bumps a concern beyond appearance?", ar: "لماذا تُعدّ حبوب الحلاقة مشكلة تتجاوز المظهر؟" },
        answer: {
          en: "They're uncomfortable and prone to infection, especially when combined with ingrown hairs.",
          ar: "فهي مزعجة وقابلة للإصابة، خصوصًا عند اقترانها بالشعر النامي تحت الجلد.",
        },
      },
      {
        question: { en: "Does treatment just remove the bumps, or address the cause?", ar: "هل يقتصر العلاج على إزالة الحبوب أم يعالج السبب أيضًا؟" },
        answer: {
          en: "Both — treatment addresses the underlying cause as well as the visible bumps.",
          ar: "كلاهما — يعالج العلاج السبب الجذري إلى جانب الحبوب الظاهرة.",
        },
      },
      {
        question: { en: "Which treatment is used for razor bumps?", ar: "ما العلاج المستخدم لحبوب الحلاقة؟" },
        answer: {
          en: "Laser hair removal.",
          ar: "إزالة الشعر بالليزر.",
        },
      },
      {
        question: { en: "Is this a minimally invasive treatment?", ar: "هل هذا علاج طفيف التوغل؟" },
        answer: {
          en: "Yes.",
          ar: "نعم.",
        },
      },
    ],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
];

export function getConcern(slug: string): AestheticConcern | undefined {
  return concerns.find((c) => c.slug === slug);
}
