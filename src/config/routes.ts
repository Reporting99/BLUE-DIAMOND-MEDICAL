import type { RouteEntry } from "@/types/route";
import { medicalServices } from "@/content/medical-services";
import { medicalBotoxHub, medicalBotoxConditions } from "@/content/medical-botox";
import { legalPages } from "@/content/legal-pages";
import { productCategories, productConcerns, products } from "@/content/products";
import { treatments, gatedTreatments } from "@/content/treatments";
import { concerns } from "@/content/concerns";
import { technologies } from "@/content/technologies";

/**
 * Central bilingual route registry. Nav, breadcrumbs, hreflang, canonical
 * tags, and the sitemap all read from this single list — see
 * docs/EN_AR_ROUTE_MAPPING.md and docs/ROUTE_INVENTORY.md.
 *
 * This registry currently covers the routes actually implemented in this
 * build pass. Routes described in the master brief but not yet built
 * (individual treatment/concern/service pages, the Botox sub-pages, Health
 * Hub articles, shop, legal pages, etc.) are tracked as "planned" in
 * docs/ROUTE_INVENTORY.md and intentionally absent here — an unregistered
 * route cannot be linked from nav or the sitemap, which is what keeps the
 * brief's "never link to an empty page" rule enforceable by construction.
 */
export const routes: RouteEntry[] = [
  {
    id: "home",
    templateType: "homepage",
    path: { en: "/", ar: "/" },
    title: {
      en: "Blue Diamond Medical Clinic — Family Medicine & Medical Aesthetics, Calgary",
      ar: "عيادة بلو دايموند الطبية — طب الأسرة والتجميل الطبي، كالغاري",
    },
    indexing: "index",
    inSitemap: true,
    inNav: false,
  },
  {
    id: "medical-hub",
    templateType: "hub",
    path: { en: "/medical", ar: "/الرعاية-الطبية" },
    title: { en: "Medical Care", ar: "الرعاية الطبية" },
    indexing: "index",
    inSitemap: true,
    inNav: true,
  },
  // Generated from src/content/medical-services.ts so slug/title never
  // drift between the content data and the route registry.
  ...medicalServices.map(
    (service): RouteEntry => ({
      id: `medical-${service.id}`,
      templateType: "medical-service",
      path: { en: `/medical/${service.slug}`, ar: `/الرعاية-الطبية/${service.slugAr}` },
      title: service.title,
      indexing: "index",
      inSitemap: true,
      inNav: false,
      parentId: "medical-hub",
    }),
  ),
  // Gated — see src/content/medical-botox.ts for why the whole subtree
  // stays behind medicalBotoxDetailPagesEnabled.
  {
    id: "medical-botox-hub",
    templateType: "hub",
    path: { en: "/medical/botox", ar: "/الرعاية-الطبية/بوتوكس" },
    title: medicalBotoxHub.title,
    requiresFeature: "medicalBotoxDetailPagesEnabled",
    indexing: "noindex",
    inSitemap: false,
    inNav: false,
    parentId: "medical-hub",
  },
  ...medicalBotoxConditions.map(
    (c): RouteEntry => ({
      id: `medical-botox-${c.id}`,
      templateType: "medical-botox",
      path: { en: `/medical/botox/${c.slug}`, ar: `/الرعاية-الطبية/بوتوكس/${c.slugAr}` },
      title: c.title,
      requiresFeature: c.requiresFeature,
      indexing: "noindex",
      inSitemap: false,
      inNav: false,
      parentId: "medical-botox-hub",
    }),
  ),
  {
    id: "medical-uninsured-services",
    templateType: "pricing",
    path: { en: "/medical/uninsured-services", ar: "/الرعاية-الطبية/الخدمات-غير-المشمولة" },
    title: { en: "Uninsured Services & Fees", ar: "الخدمات والرسوم غير المشمولة" },
    indexing: "index",
    inSitemap: true,
    inNav: false,
    parentId: "medical-hub",
  },
  {
    id: "aesthetics-hub",
    templateType: "hub",
    path: { en: "/aesthetics", ar: "/التجميل-الطبي" },
    title: { en: "Medical Aesthetics", ar: "التجميل الطبي" },
    indexing: "index",
    inSitemap: true,
    inNav: true,
  },
  {
    id: "aesthetics-treatments-hub",
    templateType: "hub",
    path: { en: "/aesthetics/treatments", ar: "/التجميل-الطبي/العلاجات" },
    title: { en: "Treatments", ar: "العلاجات" },
    indexing: "index",
    inSitemap: true,
    inNav: false,
    parentId: "aesthetics-hub",
  },
  ...treatments.map(
    (t): RouteEntry => ({
      id: `treatment-${t.id}`,
      templateType: "aesthetic-treatment",
      path: { en: `/aesthetics/treatments/${t.slug}`, ar: `/التجميل-الطبي/العلاجات/${t.slugAr}` },
      title: t.title,
      indexing: "index",
      inSitemap: true,
      inNav: false,
      parentId: "aesthetics-treatments-hub",
    }),
  ),
  // Gated: routes exist, typed content exists, template exists — see
  // src/content/treatments.ts `gatedTreatments` for why they stay disabled.
  ...gatedTreatments.map(
    (t): RouteEntry => ({
      id: `treatment-${t.id}`,
      templateType: "aesthetic-treatment",
      path: { en: `/aesthetics/treatments/${t.slug}`, ar: `/التجميل-الطبي/العلاجات/${t.slugAr}` },
      title: t.title,
      requiresFeature: t.requiresFeature,
      indexing: "noindex",
      inSitemap: false,
      inNav: false,
      parentId: "aesthetics-treatments-hub",
    }),
  ),
  {
    id: "aesthetics-concerns-hub",
    templateType: "hub",
    path: { en: "/aesthetics/concerns", ar: "/التجميل-الطبي/المخاوف-الجمالية" },
    title: { en: "Concerns", ar: "المخاوف الجمالية" },
    indexing: "index",
    inSitemap: true,
    inNav: false,
    parentId: "aesthetics-hub",
  },
  ...concerns.map(
    (c): RouteEntry => ({
      id: `concern-${c.id}`,
      templateType: "concern",
      path: { en: `/aesthetics/concerns/${c.slug}`, ar: `/التجميل-الطبي/المخاوف-الجمالية/${c.slugAr}` },
      title: c.title,
      indexing: "index",
      inSitemap: true,
      inNav: false,
      parentId: "aesthetics-concerns-hub",
    }),
  ),
  {
    id: "aesthetics-technologies-hub",
    templateType: "hub",
    path: { en: "/aesthetics/technologies", ar: "/التجميل-الطبي/التقنيات" },
    title: { en: "Technologies", ar: "التقنيات" },
    indexing: "index",
    inSitemap: true,
    inNav: false,
    parentId: "aesthetics-hub",
  },
  ...technologies.map(
    (tech): RouteEntry => ({
      id: `technology-${tech.id}`,
      templateType: "technology",
      path: { en: `/aesthetics/technologies/${tech.slug}`, ar: `/التجميل-الطبي/التقنيات/${tech.slugAr}` },
      title: tech.title,
      indexing: "index",
      inSitemap: true,
      inNav: false,
      parentId: "aesthetics-technologies-hub",
    }),
  ),
  {
    id: "aesthetics-pricing",
    templateType: "pricing",
    path: { en: "/aesthetics/pricing", ar: "/التجميل-الطبي/الأسعار" },
    title: { en: "Aesthetics Pricing", ar: "أسعار التجميل الطبي" },
    requiresFeature: "aestheticPricingEnabled",
    indexing: "noindex",
    inSitemap: false,
    inNav: false,
    parentId: "aesthetics-hub",
  },
  {
    id: "aesthetics-consultation",
    templateType: "static",
    path: { en: "/aesthetics/consultation", ar: "/التجميل-الطبي/طلب-استشارة" },
    title: { en: "Request a Consultation", ar: "طلب استشارة" },
    requiresFeature: "consultationFormEnabled",
    indexing: "noindex",
    inSitemap: false,
    inNav: false,
    parentId: "aesthetics-hub",
  },
  {
    id: "aesthetics-before-after",
    templateType: "static",
    path: { en: "/aesthetics/before-after", ar: "/التجميل-الطبي/قبل-وبعد" },
    title: { en: "Before & After", ar: "قبل وبعد" },
    requiresFeature: "beforeAfterEnabled",
    indexing: "noindex",
    inSitemap: false,
    inNav: false,
    parentId: "aesthetics-hub",
  },
  {
    id: "botox-hub",
    templateType: "hub",
    path: { en: "/botox", ar: "/بوتوكس" },
    title: { en: "Botox", ar: "البوتوكس" },
    indexing: "index",
    inSitemap: true,
    inNav: true,
  },
  {
    id: "doctors-index",
    templateType: "hub",
    path: { en: "/doctors", ar: "/الأطباء" },
    title: { en: "Our Doctors", ar: "أطباؤنا" },
    indexing: "index",
    inSitemap: true,
    inNav: true,
  },
  {
    id: "doctor-farhat",
    templateType: "doctor-profile",
    path: { en: "/doctors/mohamed-farhat", ar: "/الأطباء/محمد-فرحات" },
    title: { en: "Dr. Mohamed Farhat", ar: "د. محمد فرحات" },
    indexing: "index",
    inSitemap: true,
    inNav: false,
    parentId: "doctors-index",
  },
  {
    id: "doctor-saeed",
    templateType: "doctor-profile",
    path: { en: "/doctors/omaima-saeed", ar: "/الأطباء/أميمة-سعيد" },
    title: { en: "Dr. Omaima Saeed", ar: "د. أميمة سعيد" },
    indexing: "index",
    inSitemap: true,
    inNav: false,
    parentId: "doctors-index",
  },
  {
    id: "doctor-hamdi",
    templateType: "doctor-profile",
    path: { en: "/doctors/reem-hamdi", ar: "/الأطباء/ريم-حمدي" },
    title: { en: "Dr. Reem Hamdi", ar: "د. ريم حمدي" },
    indexing: "index",
    inSitemap: true,
    inNav: false,
    parentId: "doctors-index",
  },
  {
    id: "doctor-omonijo",
    templateType: "doctor-profile",
    path: { en: "/doctors/omonijo", ar: "/الأطباء/أومونيجو" },
    title: { en: "Dr. Omonijo", ar: "د. أومونيجو" },
    indexing: "index",
    inSitemap: true,
    inNav: false,
    parentId: "doctors-index",
  },
  {
    id: "doctor-bakare",
    templateType: "doctor-profile",
    path: { en: "/doctors/bakare", ar: "/الأطباء/باكاري" },
    title: { en: "Dr. Bakare", ar: "د. باكاري" },
    indexing: "index",
    inSitemap: true,
    inNav: false,
    parentId: "doctors-index",
  },
  {
    id: "doctor-gwea",
    templateType: "doctor-profile",
    path: { en: "/doctors/ahmed-gwea", ar: "/الأطباء/أحمد-جويع" },
    title: { en: "Dr. Ahmed Gwea", ar: "د. أحمد جويع" },
    indexing: "index",
    inSitemap: true,
    inNav: false,
    parentId: "doctors-index",
  },
  {
    id: "patient-resources-hub",
    templateType: "hub",
    path: { en: "/patient-resources", ar: "/موارد-المرضى" },
    title: { en: "Patient Resources", ar: "موارد المرضى" },
    indexing: "index",
    inSitemap: true,
    inNav: true,
  },
  {
    id: "health-hub",
    templateType: "hub",
    path: { en: "/health-hub", ar: "/المركز-المعرفي" },
    title: { en: "Health Hub", ar: "المركز المعرفي" },
    indexing: "index",
    inSitemap: true,
    inNav: true,
  },
  {
    id: "about",
    templateType: "static",
    path: { en: "/about", ar: "/من-نحن" },
    title: { en: "About Blue Diamond Medical", ar: "عن بلو دايموند الطبية" },
    indexing: "index",
    inSitemap: true,
    inNav: true,
  },
  {
    id: "careers",
    templateType: "static",
    path: { en: "/careers", ar: "/الوظائف" },
    title: { en: "Careers", ar: "الوظائف" },
    requiresFeature: "careersFormEnabled",
    indexing: "index",
    inSitemap: true,
    inNav: false,
    parentId: "about",
  },
  // Gated — see src/content/legal-pages.ts.
  ...legalPages.map(
    (p): RouteEntry => ({
      id: `legal-${p.id}`,
      templateType: "legal",
      path: { en: `/${p.slug}`, ar: `/${p.slugAr}` },
      title: p.title,
      requiresFeature: "legalPagesEnabled",
      indexing: "noindex",
      inSitemap: false,
      inNav: false,
    }),
  ),
  {
    id: "contact",
    templateType: "contact",
    path: { en: "/contact", ar: "/تواصل-معنا" },
    title: { en: "Contact Us", ar: "تواصل معنا" },
    indexing: "index",
    inSitemap: true,
    inNav: true,
  },
  // Live — "COMPLETE SKINMEDICA NAVIGATION AND PRODUCT-DETAIL FLOW" pass.
  // Title is "SkinMedica Products" (not generic "Shop") since this
  // catalogue carries SkinMedica exclusively — used in breadcrumbs and
  // nav, so it needed to be accurate, not just gated content.
  {
    id: "shop-hub",
    templateType: "static",
    path: { en: "/shop", ar: "/المتجر" },
    title: { en: "SkinMedica Products", ar: "منتجات SkinMedica" },
    requiresFeature: "shopEnabled",
    indexing: "index",
    inSitemap: true,
    inNav: false,
  },
  ...productCategories.map(
    (c): RouteEntry => ({
      id: `shop-category-${c.id}`,
      templateType: "static",
      path: { en: `/shop/category/${c.slug}`, ar: `/المتجر/فئة/${c.slugAr}` },
      title: c.name,
      requiresFeature: "shopEnabled",
      indexing: "noindex",
      inSitemap: false,
      inNav: false,
      parentId: "shop-hub",
    }),
  ),
  ...productConcerns.map(
    (c): RouteEntry => ({
      id: `shop-concern-${c.id}`,
      templateType: "static",
      path: { en: `/shop/concern/${c.slug}`, ar: `/المتجر/مخاوف/${c.slugAr}` },
      title: c.name,
      requiresFeature: "shopEnabled",
      indexing: "noindex",
      inSitemap: false,
      inNav: false,
      parentId: "shop-hub",
    }),
  ),
  // Live, indexed, in sitemap — every approved product gets a real
  // published detail page.
  ...products.map(
    (p): RouteEntry => ({
      id: `shop-product-${p.id}`,
      templateType: "product",
      path: { en: `/shop/${p.slug}`, ar: `/المتجر/${p.slugAr}` },
      title: p.name,
      requiresFeature: "shopEnabled",
      indexing: "index",
      inSitemap: true,
      inNav: false,
      parentId: "shop-hub",
    }),
  ),
  // Cart/checkout/shipping-returns use their own separate flag —
  // deliberately NOT `shopEnabled` — so publishing the catalogue never
  // exposes these bare placeholder stubs (no real cart/payment/shipping
  // exists; brief: "Do not activate... Cart. Checkout."). Always noindex
  // regardless of flag state.
  {
    id: "shop-cart",
    templateType: "static",
    path: { en: "/shop/cart", ar: "/المتجر/سلة-المشتريات" },
    title: { en: "Cart", ar: "سلة المشتريات" },
    requiresFeature: "shopCheckoutEnabled",
    indexing: "noindex",
    inSitemap: false,
    inNav: false,
    parentId: "shop-hub",
  },
  {
    id: "shop-checkout",
    templateType: "static",
    path: { en: "/shop/checkout", ar: "/المتجر/الدفع" },
    title: { en: "Checkout", ar: "الدفع" },
    requiresFeature: "shopCheckoutEnabled",
    indexing: "noindex",
    inSitemap: false,
    inNav: false,
    parentId: "shop-hub",
  },
  {
    id: "shop-shipping-returns",
    templateType: "static",
    path: { en: "/shop/shipping-returns", ar: "/المتجر/الشحن-والإرجاع" },
    title: { en: "Shipping & Returns", ar: "الشحن والإرجاع" },
    requiresFeature: "shopCheckoutEnabled",
    indexing: "noindex",
    inSitemap: false,
    inNav: false,
    parentId: "shop-hub",
  },
  {
    id: "book-appointment",
    templateType: "booking-hub",
    path: { en: "/book-appointment", ar: "/حجز-موعد" },
    title: { en: "Book an Appointment", ar: "احجز موعدًا" },
    indexing: "index",
    inSitemap: true,
    inNav: true,
  },
];

export function getRoute(id: string): RouteEntry | undefined {
  return routes.find((r) => r.id === id);
}

export function localePath(id: string, locale: "en" | "ar"): string {
  const route = getRoute(id);
  if (!route) throw new Error(`Unknown route id: ${id}`);
  return route.path[locale];
}

export function navRoutes(): RouteEntry[] {
  return routes.filter((r) => r.inNav);
}

/** Full locale-prefixed href for a route id, e.g. href("contact", "ar") -> "/ar/تواصل-معنا". */
export function href(id: string, locale: "en" | "ar"): string {
  return `/${locale}${localePath(id, locale)}`;
}
