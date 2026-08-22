export interface Dictionary {
  common: {
    bookAppointment: string;
    learnMore: string;
    call: string;
    address: string;
    hours: string;
    phone: string;
    fax: string;
    skipToContent: string;
  };
  nav: {
    home: string;
    services: string;
    treatments: string;
    medicalAesthetics: string;
    ourTeam: string;
    about: string;
    contact: string;
    viewAllTreatments: string;
    openMenu: string;
    closeMenu: string;
    languageSwitch: string;
  };
  home: {
    heroEyebrow: string;
    heroTitle: string;
    heroBody: string;
    heroCtaPrimary: string;
    heroCtaSecondary: string;
    pathwaysTitle: string;
    pathwaysMedicalTitle: string;
    pathwaysMedicalBody: string;
    pathwaysAestheticsTitle: string;
    pathwaysAestheticsBody: string;
    servicesTitle: string;
    servicesBody: string;
    botoxTitle: string;
    botoxBody: string;
    doctorsTitle: string;
    doctorsBody: string;
    locationTitle: string;
    locationBody: string;
    healthHubTitle: string;
    healthHubBody: string;
    finalCtaTitle: string;
    finalCtaBody: string;
  };
  footer: {
    tagline: string;
    connect: string;
    rightsReserved: string;
  };
}

const en: Dictionary = {
  common: {
    bookAppointment: "Book Appointment",
    learnMore: "Learn more",
    call: "Call",
    address: "Address",
    hours: "Hours",
    phone: "Phone",
    fax: "Fax",
    skipToContent: "Skip to content",
  },
  nav: {
    // Nav labels are intentionally distinct from each destination page's own
    // <title>/H1 (e.g. "Our Team" here vs. "Our Doctors" on the page itself)
    // — see src/config/navigation.ts.
    home: "Home",
    services: "Services",
    treatments: "Treatments",
    medicalAesthetics: "Medical Aesthetics",
    ourTeam: "Our Team",
    about: "About",
    contact: "Contact",
    viewAllTreatments: "View all treatments",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    languageSwitch: "العربية",
  },
  home: {
    heroEyebrow: "Family Medicine · Physician-Led Medical Aesthetics · West Springs, Calgary",
    heroTitle: "Medical Care and Physician-Led Aesthetics in Calgary",
    heroBody:
      "One Blue Diamond Medical experience — family medicine, walk-in care, and physician-led medical aesthetics, together in West Springs.",
    heroCtaPrimary: "Explore Medical Care",
    heroCtaSecondary: "Explore Medical Aesthetics",
    pathwaysTitle: "Two ways to be cared for, one clinic",
    pathwaysMedicalTitle: "Medical Care",
    pathwaysMedicalBody:
      "Family medicine, walk-in visits, chronic disease management, preventive care, and more — six physicians, one clinic.",
    pathwaysAestheticsTitle: "Medical Aesthetics",
    pathwaysAestheticsBody:
      "Physician-led RF micro-needling, skin tightening, laser treatments, and Botox — delivered by the same clinical team.",
    servicesTitle: "What we offer",
    servicesBody:
      "Our practice opened on July 4, 2022 in West Springs and has consistently welcomed walk-in patients ever since. Founded by Dr. Mohamed Farhat, who brings more than 28 years of family medicine experience, Blue Diamond Medical now houses six family physicians.",
    botoxTitle: "Medical Botox",
    botoxBody:
      "Botox for migraines, bruxism, and hyperhidrosis, alongside cosmetic Botox — administered by Dr. Farhat, starting with a consultation.",
    doctorsTitle: "Blue Diamond Medical Team",
    doctorsBody: "Six family physicians, one clinic, one standard of care.",
    locationTitle: "Visit us in West Springs",
    locationBody:
      "We love our patients, so feel free to visit during normal business hours. Closed all statutory holidays.",
    healthHubTitle: "From the Health Hub",
    healthHubBody: "Guidance from our clinical team, in plain language.",
    finalCtaTitle: "Ready to find the right place to begin?",
    finalCtaBody: "Book with your doctor, a walk-in visit, or a medical aesthetics consultation.",
  },
  footer: {
    tagline: "Family medicine and physician-led medical aesthetics in West Springs, Calgary.",
    connect: "Connect with us",
    rightsReserved: "All rights reserved.",
  },
};

export default en;
