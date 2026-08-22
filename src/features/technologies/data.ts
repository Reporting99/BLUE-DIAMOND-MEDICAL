import type { Technology } from "./types";

/** Source: Blue-Diamond-Medical-Website-Content-Extraction_1.docx ("Our Technologies" page). */
export const technologies: Technology[] = [
  {
    id: "elite-iq",
    slug: "elite-iq",
    slugAr: "إيليت-آي-كيو",
    title: { en: "Elite iQ™", ar: "إيليت آي كيو™" },
    manufacturer: "Cynosure",
    summary: {
      en: "Cynosure's Elite iQ™ device offers quick, personalized laser hair treatments using the Skintel™ device — the first Health Canada and FDA cleared melanin reader on the market — allowing safe treatment of all skin types and areas.",
      ar: "يوفر جهاز Elite iQ™ من Cynosure علاجات ليزر مخصصة وسريعة لإزالة الشعر باستخدام جهاز Skintel™ — أول قارئ ميلانين معتمد من هيئة الصحة الكندية وإدارة الغذاء والدواء الأمريكية — مما يتيح علاجًا آمنًا لجميع أنواع البشرة والمناطق.",
    },
    howItWorks: {
      en: "Before treatment, the Skintel™ device reads your skin's melanin level directly, rather than estimating it from a visual skin-type chart. The Elite iQ™ laser then uses that reading to calibrate its settings to your skin specifically.",
      ar: "قبل العلاج، يقرأ جهاز Skintel™ مستوى الميلانين في بشرتكم مباشرة، بدلًا من تقديره اعتمادًا على مخطط بصري لنوع البشرة. بعد ذلك، يستخدم ليزر Elite iQ™ تلك القراءة لضبط إعداداته خصيصًا لبشرتكم.",
    },
    whatItAddresses: {
      en: "Unwanted hair, across a range of skin types and treatment areas, made possible by the melanin-reading calibration step.",
      ar: "الشعر غير المرغوب فيه، عبر مجموعة من أنواع البشرة ومناطق العلاج، بفضل خطوة المعايرة بقراءة الميلانين.",
    },
    appointmentInvolves: {
      en: "A Skintel™ reading followed by laser passes over the treatment area. All Elite iQ™ treatments are performed at Citizen Studio, not the West Springs clinic — see the laser hair removal treatment page for the address.",
      ar: "قراءة بجهاز Skintel™ تليها جلسات ليزر على منطقة العلاج. تُجرى جميع علاجات Elite iQ™ في Citizen Studio، وليس في عيادة ويست سبرينغز — راجعوا صفحة علاج إزالة الشعر بالليزر للعنوان.",
    },
    safetyNote: {
      en: "The melanin-reading step exists specifically to support safe treatment across a range of skin types; individual suitability is still assessed during a consultation.",
      ar: "توجد خطوة قراءة الميلانين خصيصًا لدعم العلاج الآمن عبر مجموعة من أنواع البشرة؛ ويُقيَّم مدى الملاءمة الفردية دائمًا خلال الاستشارة.",
    },
    faqs: [
      {
        question: { en: "What makes Elite iQ™ different from a standard laser hair removal device?", ar: "ما الذي يميز Elite iQ™ عن جهاز ليزر عادي لإزالة الشعر؟" },
        answer: {
          en: "The Skintel™ melanin reader — it measures your skin's melanin directly rather than relying on a general skin-type estimate, which is what allows the laser settings to be calibrated to you specifically.",
          ar: "قارئ الميلانين Skintel™ — إذ يقيس ميلانين بشرتكم مباشرة بدلًا من الاعتماد على تقدير عام لنوع البشرة، وهو ما يتيح ضبط إعدادات الليزر خصيصًا لكم.",
        },
      },
      {
        question: { en: "Where are Elite iQ™ treatments performed?", ar: "أين تُجرى علاجات Elite iQ™؟" },
        answer: {
          en: "At Citizen Studio, a separate location from the West Springs clinic.",
          ar: "في Citizen Studio، وهو موقع منفصل عن عيادة ويست سبرينغز.",
        },
      },
      {
        question: { en: "Is Elite iQ™ suitable for every skin type?", ar: "هل Elite iQ™ مناسب لجميع أنواع البشرة؟" },
        answer: {
          en: "The Skintel™ calibration step is designed to support treatment across a range of skin types, but individual suitability is confirmed during a consultation.",
          ar: "صُممت خطوة المعايرة بجهاز Skintel™ لدعم العلاج عبر مجموعة من أنواع البشرة، إلا أن الملاءمة الفردية تُؤكَّد خلال الاستشارة.",
        },
      },
      {
        question: { en: "What's the manufacturer of the Elite iQ™ device?", ar: "من الشركة المصنّعة لجهاز Elite iQ™؟" },
        answer: {
          en: "Cynosure.",
          ar: "Cynosure.",
        },
      },
      {
        question: { en: "How do I book a consultation for a treatment using this device?", ar: "كيف أحجز استشارة لعلاج يستخدم هذا الجهاز؟" },
        answer: {
          en: "Book a consultation through Jane App — see the laser hair removal treatment page for the direct link.",
          ar: "احجزوا استشارة عبر تطبيق Jane — راجعوا صفحة علاج إزالة الشعر بالليزر للرابط المباشر.",
        },
      },
    ],
    relatedTreatmentIds: ["laser-hair-removal"],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
  {
    id: "potenza",
    slug: "potenza",
    slugAr: "بوتنزا",
    title: { en: "Potenza", ar: "بوتنزا" },
    manufacturer: "Cynosure",
    summary: {
      en: "A one-of-a-kind radio-frequency micro-needling system, ideal for skin tightening and smoothing all over the body — for fine lines or tightening after rapid weight loss or post-birth.",
      ar: "نظام فريد للإبر الدقيقة بالترددات الراديوية، مثالي لشدّ البشرة وتنعيمها في مختلف مناطق الجسم — للخطوط الدقيقة أو الشدّ بعد فقدان وزن سريع أو بعد الولادة.",
    },
    howItWorks: {
      en: "Potenza combines micro-needling — fine needles creating controlled micro-injuries in the skin — with radio-frequency energy delivered through those same needles, adding a tightening effect to the skin's natural response to micro-injury.",
      ar: "يجمع Potenza بين الإبر الدقيقة — إبر رفيعة تُحدث إصابات دقيقة متحكمًا بها في البشرة — وطاقة الترددات الراديوية المُوصَّلة عبر الإبر نفسها، مما يضيف تأثير شدّ إلى استجابة البشرة الطبيعية للإصابة الدقيقة.",
    },
    whatItAddresses: {
      en: "Skin tightening and smoothing across the body, including fine lines or laxity following rapid weight loss or after childbirth.",
      ar: "شدّ البشرة وتنعيمها في مختلف مناطق الجسم، بما يشمل الخطوط الدقيقة أو ترهل البشرة بعد فقدان وزن سريع أو بعد الولادة.",
    },
    faqs: [
      {
        question: { en: "What's the difference between Potenza and standard micro-needling?", ar: "ما الفرق بين Potenza والإبر الدقيقة التقليدية؟" },
        answer: {
          en: "Potenza adds radio-frequency energy delivered through the needles, combining the micro-injury response of standard micro-needling with an additional tightening effect.",
          ar: "يضيف Potenza طاقة الترددات الراديوية المُوصَّلة عبر الإبر، فيجمع بين استجابة الإصابة الدقيقة للإبر الدقيقة التقليدية وتأثير شدّ إضافي.",
        },
      },
      {
        question: { en: "Who is Potenza treatment suited for?", ar: "لمن يناسب علاج Potenza؟" },
        answer: {
          en: "It's commonly used for skin tightening after rapid weight loss or childbirth, and for fine lines generally — suitability for your specific goals is confirmed during a consultation.",
          ar: "يُستخدم عادةً لشدّ البشرة بعد فقدان وزن سريع أو الولادة، وللخطوط الدقيقة بشكل عام — ويُؤكَّد مدى الملاءمة لأهدافكم المحددة خلال الاستشارة.",
        },
      },
      {
        question: { en: "Which treatment uses the Potenza device?", ar: "أي علاج يستخدم جهاز Potenza؟" },
        answer: {
          en: "RF Micro-Needling.",
          ar: "الإبر الدقيقة بالترددات الراديوية.",
        },
      },
      {
        question: { en: "What's the manufacturer of the Potenza device?", ar: "من الشركة المصنّعة لجهاز Potenza؟" },
        answer: {
          en: "Cynosure.",
          ar: "Cynosure.",
        },
      },
    ],
    relatedTreatmentIds: ["rf-microneedling"],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
  {
    id: "tempsure",
    slug: "tempsure",
    slugAr: "تمبشور",
    title: { en: "TempSure", ar: "تمبشور" },
    manufacturer: "Cynosure",
    summary: {
      en: "A non-invasive tool for tightening and firming skin all over the body, with zero downtime.",
      ar: "أداة غير جراحية لشدّ البشرة وتماسكها في مختلف مناطق الجسم، دون أي فترة تعافٍ.",
    },
    howItWorks: {
      en: "TempSure uses radio-frequency energy to gently heat the deeper layers of the skin, encouraging a natural tightening and firming response without breaking the skin's surface.",
      ar: "يستخدم TempSure طاقة الترددات الراديوية لتسخين الطبقات العميقة من البشرة بلطف، مما يحفّز استجابة طبيعية للشدّ والتماسك دون كسر سطح البشرة.",
    },
    whatItAddresses: {
      en: "Skin tightening and firming across the body.",
      ar: "شدّ البشرة وتماسكها في مختلف مناطق الجسم.",
    },
    faqs: [
      {
        question: { en: "Does TempSure treatment involve any downtime?", ar: "هل يتطلب علاج TempSure أي فترة تعافٍ؟" },
        answer: {
          en: "No — it's a non-invasive treatment with zero downtime.",
          ar: "لا — فهو علاج غير جراحي دون أي فترة تعافٍ.",
        },
      },
      {
        question: { en: "How does TempSure tighten skin without surgery?", ar: "كيف يشدّ TempSure البشرة دون جراحة؟" },
        answer: {
          en: "It heats the deeper layers of the skin using radio-frequency energy, which encourages the skin's own natural tightening response.",
          ar: "يسخّن الطبقات العميقة من البشرة باستخدام طاقة الترددات الراديوية، مما يحفّز استجابة البشرة الطبيعية للشدّ.",
        },
      },
      {
        question: { en: "Which treatment uses the TempSure device?", ar: "أي علاج يستخدم جهاز TempSure؟" },
        answer: {
          en: "Radio Frequency treatment.",
          ar: "علاج الترددات الراديوية.",
        },
      },
    ],
    relatedTreatmentIds: ["radio-frequency"],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
  {
    id: "ultra",
    slug: "ultra",
    slugAr: "الترا",
    title: { en: "Ultra", ar: "الترا" },
    manufacturer: "Cynosure",
    summary: {
      en: "A low-downtime laser that rejuvenates skin, giving it a brighter tone and improved texture, with treatments customized to your needs and schedule.",
      ar: "ليزر بتعافٍ محدود يُجدّد البشرة ويمنحها لونًا أكثر إشراقًا وملمسًا أفضل، بعلاجات مخصصة تناسب احتياجاتكم وجدولكم.",
    },
    howItWorks: {
      en: "Ultra is a laser treatment that works on the skin's surface layers to improve tone and texture, with a low-downtime profile.",
      ar: "الترا هو علاج بالليزر يعمل على الطبقات السطحية من البشرة لتحسين اللون والملمس، ويتميز بفترة تعافٍ محدودة.",
    },
    whatItAddresses: {
      en: "Overall skin tone and texture, with treatments customized to individual needs and scheduling.",
      ar: "لون البشرة وملمسها بشكل عام، مع علاجات مخصصة تناسب الاحتياجات الفردية والجدول الزمني.",
    },
    faqs: [
      {
        question: { en: "How much downtime does an Ultra treatment involve?", ar: "كم تستغرق فترة التعافي بعد علاج الترا؟" },
        answer: {
          en: "Ultra has a low-downtime profile compared to more intensive resurfacing lasers, and treatments are customized to your schedule.",
          ar: "يتميز الترا بفترة تعافٍ محدودة مقارنة بأجهزة الليزر الأكثر كثافة لتجديد سطح البشرة، وتُخصَّص العلاجات وفق جدولكم الزمني.",
        },
      },
      {
        question: { en: "What does Ultra treatment improve?", ar: "ما الذي يحسّنه علاج الترا؟" },
        answer: {
          en: "Skin tone and texture, giving a brighter, smoother appearance.",
          ar: "لون البشرة وملمسها، مما يمنحها مظهرًا أكثر إشراقًا ونعومة.",
        },
      },
    ],
    relatedTreatmentIds: ["ultra"],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
  {
    id: "tempsure-vitalia",
    slug: "tempsure-vitalia",
    slugAr: "تمبشور-فيتاليا",
    title: { en: "TempSure Vitalia", ar: "تمبشور فيتاليا" },
    manufacturer: "Cynosure",
    summary: {
      en: "Equipment addressing many pelvic floor issues and sexual health concerns women experience at all ages and stages of life.",
      ar: "جهاز يُعالج العديد من مشاكل قاع الحوض والصحة الجنسية التي تواجهها النساء في مختلف الأعمار ومراحل الحياة.",
    },
    howItWorks: {
      en: "TempSure Vitalia uses radio-frequency energy in a non-surgical approach designed for pelvic floor and sexual health concerns.",
      ar: "يستخدم TempSure Vitalia طاقة الترددات الراديوية بأسلوب غير جراحي مصمم لمعالجة مشاكل قاع الحوض والصحة الجنسية.",
    },
    whatItAddresses: {
      en: "Pelvic floor issues and sexual health concerns women may experience at various ages and life stages.",
      ar: "مشاكل قاع الحوض ومخاوف الصحة الجنسية التي قد تواجهها النساء في مختلف الأعمار ومراحل الحياة.",
    },
    faqs: [
      {
        question: { en: "Is TempSure Vitalia surgical?", ar: "هل TempSure Vitalia علاج جراحي؟" },
        answer: {
          en: "No — it's a non-surgical, radio-frequency-based approach.",
          ar: "لا — هو أسلوب غير جراحي يعتمد على الترددات الراديوية.",
        },
      },
      {
        question: { en: "Who might consider TempSure Vitalia?", ar: "لمن يمكن أن يكون TempSure Vitalia مناسبًا؟" },
        answer: {
          en: "Women experiencing pelvic floor or sexual health concerns at any age or life stage — suitability is assessed during a consultation.",
          ar: "النساء اللواتي يواجهن مشاكل في قاع الحوض أو الصحة الجنسية في أي عمر أو مرحلة من الحياة — ويُقيَّم مدى الملاءمة خلال الاستشارة.",
        },
      },
    ],
    relatedTreatmentIds: ["tempsure-vitalia"],
    relatedDoctorIds: ["mohamed-farhat"],
    sourceVerified: true,
  },
];

export function getTechnology(slug: string): Technology | undefined {
  return technologies.find((t) => t.slug === slug);
}
