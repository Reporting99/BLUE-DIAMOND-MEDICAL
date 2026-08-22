export interface FeeRow {
  item: { en: string; ar: string };
  price: string;
}

export interface FeeGroup {
  heading: { en: string; ar: string };
  rows: FeeRow[];
}

/** Source: Blue-Diamond-Medical-Website-Content-Extraction_1.docx (Services + Appointment pages). */
export const noShowFees: FeeGroup = {
  heading: { en: "No-Show Fees", ar: "رسوم عدم الحضور" },
  rows: [
    { item: { en: "Regular", ar: "عدم الحضور العادي" }, price: "$40" },
    { item: { en: "Full Medical (CPX)", ar: "الفحص الطبي الشامل (CPX)" }, price: "$100" },
    { item: { en: "Paediatric Appointments Follow-up", ar: "متابعة مواعيد الأطفال" }, price: "$100" },
    { item: { en: "Driver's Medical", ar: "الفحص الطبي لرخصة القيادة" }, price: "$125" },
    { item: { en: "Paediatric Appointments", ar: "مواعيد الأطفال" }, price: "$200" },
    { item: { en: "Euclid Eye Health Appointments", ar: "مواعيد فحص العين (Euclid)" }, price: "$50" },
  ],
};

export const uninsuredFeeGroups: FeeGroup[] = [
  {
    heading: { en: "Forms", ar: "النماذج" },
    rows: [
      { item: { en: "Attending Physician Statement", ar: "إفادة الطبيب المعالج" }, price: "$50+ (billed to provider)" },
      { item: { en: "Short Term Disability", ar: "إعاقة قصيرة الأمد" }, price: "$50+" },
      { item: { en: "Certificates", ar: "الشهادات" }, price: "$50+" },
      { item: { en: "Blue Cross Special Authorization", ar: "تفويض خاص من Blue Cross" }, price: "$35" },
      { item: { en: "Long Term Disability", ar: "إعاقة طويلة الأمد" }, price: "$150" },
      { item: { en: "Handicap Parking Placard", ar: "بطاقة موقف ذوي الإعاقة" }, price: "$50" },
      { item: { en: "Medical Authorization Form", ar: "نموذج التفويض الطبي" }, price: "$35" },
    ],
  },
  {
    heading: { en: "Treatments", ar: "العلاجات" },
    rows: [
      { item: { en: "Medical for Emigration", ar: "الفحص الطبي للهجرة" }, price: "$400" },
      { item: { en: "Injections", ar: "الحقن" }, price: "$20" },
      { item: { en: "Pregnancy Confirmation", ar: "تأكيد الحمل" }, price: "$5" },
      { item: { en: "Skin Tag Removal", ar: "إزالة الزوائد الجلدية" }, price: "$60" },
      { item: { en: "Wart Treatment", ar: "علاج الثآليل" }, price: "$10" },
      { item: { en: "Medical Supplies", ar: "المستلزمات الطبية" }, price: "$5+" },
    ],
  },
  {
    heading: { en: "Administrative Tasks", ar: "المهام الإدارية" },
    rows: [
      { item: { en: "Transfer of Records", ar: "نقل السجلات" }, price: "$50+" },
      { item: { en: "Insurance Request", ar: "طلب التأمين" }, price: "$150+ (billed to provider)" },
      { item: { en: "Photocopies", ar: "نسخ المستندات" }, price: "$5+" },
      { item: { en: "Driver's Medical (under 75 years)", ar: "الفحص الطبي لرخصة القيادة (دون 75 عامًا)" }, price: "$125" },
      { item: { en: "Sick Note", ar: "شهادة مرضية" }, price: "$35" },
      { item: { en: "School / Sport / Fitness Notes", ar: "شهادات مدرسية / رياضية / لياقة بدنية" }, price: "$50+" },
      { item: { en: "Lawyer Request", ar: "طلب محامٍ" }, price: "$150+ (billed to lawyers)" },
      { item: { en: "Massage / Physio / Chiro / Orthotics Note", ar: "شهادة تدليك / علاج طبيعي / تقويم العمود الفقري / تقويم العظام" }, price: "$20" },
      { item: { en: "Driver's Medical (75 years and older)", ar: "الفحص الطبي لرخصة القيادة (75 عامًا فأكثر)" }, price: "$100" },
    ],
  },
];
