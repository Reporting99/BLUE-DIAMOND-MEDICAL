import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageSchema } from "@/components/shared/schema";
import { isLocale, type Locale } from "@/i18n/config";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { getRoute } from "@/lib/routing";
import { resolvePageHeroImage } from "@/lib/feelstack/page-hero-media";
import { siteConfig } from "@/config/site";

/** Single source for this page's description: consumed by both generateMetadata
 * and the page's JSON-LD node, so the two can never drift apart (brief §9). */
const PAGE_DESCRIPTION = {
  en: "Join Blue Diamond Medical in Calgary. We welcome qualified medical professionals who want to provide excellent patient care in a well-supported clinic.",
  ar: "انضموا إلى فريق عيادة بلو دايموند الطبية في ويست سبرينغز، كالغاري.",
} as const;

/**
 * The client approved an exact <title> for the English careers page which is
 * not "<route title> · <site name>". Arabic is deliberately absent: no Arabic
 * title was supplied, so that locale keeps the route-registry title and the
 * layout's template rather than carrying a translated guess.
 */
const PAGE_TITLE = {
  en: "Careers at Blue Diamond Medical | Join Our Team",
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return getRouteMetadata("careers", safeLocale, {
    description: PAGE_DESCRIPTION,
    title: PAGE_TITLE,
  });
}

/**
 * WHY THIS PAGE HAS NO UPLOAD FORM.
 *
 * The legacy /join-our-team page carried a Name/Phone/Email/Attach-Resume +
 * reCAPTCHA form. Reproducing it here would need three capabilities this
 * build does not have: a configured delivery provider (see
 * src/lib/forms/delivery.ts — CONTACT_DELIVERY_PROVIDER is unset, so even the
 * contact form fails closed), a private document store, and a captcha
 * credential pair. A résumé is employment data: it must not go to ImageKit or
 * the FeelStack media library, both of which are public asset stores, and
 * standing up an ad-hoc upload path to a public directory would be worse than
 * having no form at all.
 *
 * So the application route on this page is the clinic's own careers mailbox,
 * which is where the legacy form delivered anyway. The approved field list is
 * preserved as the things an applicant is asked to send. When a private
 * application backend is approved, the form replaces this section; the copy
 * around it does not change.
 */
export default async function CareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";

  /**
   * ARABIC IS A CLIENT DEPENDENCY (docs/CONTENT_MODEL.md, and the same rule
   * /about applies to its aesthetics section). The client approved this
   * page's new English wording only. Machine-translating recruitment copy is
   * exactly what the content model forbids, so the Arabic page keeps the
   * approved Arabic it already published and omits every section for which no
   * Arabic was supplied — rather than publishing English text under /ar.
   */
  const copy = {
    en: {
      eyebrow: "Careers at Blue Diamond Medical",
      title: "Work With Us in West Springs",
      intro:
        "Blue Diamond Medical welcomes qualified medical professionals who take thoughtful, respectful, high-quality patient care seriously. Good care starts with a well-supported clinical team, so we look for people who look after their patients and themselves.",
      // Sentence case, like every other section heading on the site ("Our
      // mission", "Submit your application", "Your privacy"). The client-approved
      // <title> keeps its Title Case "… | Join Our Team" — that is a title, not
      // a heading, and PAGE_TITLE above is untouched.
      joinHeading: "Join our team",
      joinBody:
        "We would like to hear from qualified and eligible medical professionals who want to work in a welcoming, collaborative clinic. If that sounds like the practice you are looking for, please introduce yourself and send us your résumé.",
      joinSupporting:
        "Tell us about your experience and the type of opportunity you are seeking. Our team will review your application and contact you if your background aligns with a current or future opportunity at Blue Diamond Medical.",
      applyHeading: "Submit your application",
      includeHeading: "Please include",
      include: [
        "Your full name",
        "A phone number where we can reach you",
        "Your email address",
        "Your résumé, attached",
        "An optional message about the opportunity you are seeking",
      ],
      cta: "Email your application",
      privacyHeading: "Your privacy",
      privacy:
        "The information you provide will be used only to review and respond to your employment application. Please do not include personal health information in your résumé or message.",
    },
    ar: {
      eyebrow: null,
      title: "انضم إلى فريقنا",
      intro:
        "تبحث بلو دايموند الطبية عن كوادر طبية مؤهلة وملتزمة بتقديم رعاية استثنائية للمرضى دون التفريط بعافيتها الشخصية. أرسلوا سيرتكم الذاتية عبر البريد الإلكتروني للتقديم.",
      joinHeading: null,
      joinBody: null,
      joinSupporting: null,
      applyHeading: null,
      includeHeading: null,
      include: null,
      cta: "أرسل طلبك عبر البريد الإلكتروني",
      privacyHeading: null,
      privacy: null,
    },
  }[locale];

  const ownRoute = getRoute("careers")!;
  const hero = await resolvePageHeroImage(ownRoute.path.en, locale);

  const mailto = `mailto:${siteConfig.careersEmail}`;
  const emailButton = (
    <Button size="lg" render={<a href={mailto} />}>
      <Mail className="me-1 size-4" aria-hidden="true" />
      {copy.cta}
    </Button>
  );

  return (
    <>
      <PageSchema
        locale={locale}
        type="WebPage"
        name={ownRoute.title[locale]}
        description={PAGE_DESCRIPTION[locale]}
        path={ownRoute.path[locale]}
      />
      {/* No JobPosting node anywhere on this page: no vacancy, employment
          type, salary or closing date has been supplied, and JobPosting
          without them is a schema.org violation and a Google penalty risk.
          WebPage above describes what this page actually is. */}
      <PageHero
        locale={locale}
        eyebrow={copy.eyebrow ?? undefined}
        title={copy.title}
        body={copy.intro}
        image={hero}
        imageRole="location"
        seed="careers"
        measure="article"
        imageAlt={{
          en: "A clinical team reviewing notes together around a table",
          ar: "فريق طبي يراجع الملاحظات معًا حول طاولة",
        }}
        breadcrumbs={<Breadcrumbs locale={locale} items={[{ label: ownRoute.title[locale] }]} />}
        actions={emailButton}
      />

      {copy.joinHeading && copy.joinBody && copy.joinSupporting ? (
        <section className="section-y">
          <Container className="max-w-3xl">
            <h2 data-reveal="up" className="text-h3 font-heading">
              {copy.joinHeading}
            </h2>
            <p data-reveal="up" className="mt-3 text-body-lg text-text-secondary">
              {copy.joinBody}
            </p>
            <p data-reveal="up" className="mt-4 text-body-lg text-text-secondary">
              {copy.joinSupporting}
            </p>

            {copy.applyHeading && copy.include && copy.includeHeading ? (
              <>
                <h2 data-reveal="up" className="mt-12 text-h3 font-heading">
                  {copy.applyHeading}
                </h2>
                {/* The address is a real mailto link AND readable text, so it
                    works for a visitor with no mail client configured as much
                    as for one who clicks it. */}
                <p data-reveal="up" className="mt-3 text-body-lg text-text-secondary">
                  Email your application to{" "}
                  <a
                    href={mailto}
                    className="font-medium text-primary underline underline-offset-4 hover:text-primary-hover"
                  >
                    {siteConfig.careersEmail}
                  </a>{" "}
                  and attach your résumé.
                </p>

                <h3 data-reveal="up" className="mt-8 text-h4 font-heading">
                  {copy.includeHeading}
                </h3>
                <ul data-reveal="up" className="mt-3 flex list-disc flex-col gap-2 ps-5 text-body-lg text-text-secondary">
                  {copy.include.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <div data-reveal="up" className="mt-8">
                  {emailButton}
                </div>

                {/* Who and where, in the visitor's own words rather than a
                    keyword line: the page has to identify the employer and
                    the city it hires in without stuffing "Calgary medical
                    jobs" into the copy. Sourced from siteConfig so it cannot
                    drift from the address the rest of the site publishes. */}
                <p data-reveal="up" className="mt-8 text-body text-text-secondary">
                  {siteConfig.clinic.name} — {siteConfig.clinic.address.line1},{" "}
                  {siteConfig.clinic.address.neighborhood}, {siteConfig.clinic.address.city},{" "}
                  {siteConfig.clinic.address.region} {siteConfig.clinic.address.postalCode}
                </p>
              </>
            ) : null}

            {copy.privacyHeading && copy.privacy ? (
              <div
                data-reveal="up"
                className="mt-12 rounded-md border border-border bg-surface px-4 py-4 sm:px-5"
              >
                <h2 className="text-h4 font-heading">{copy.privacyHeading}</h2>
                <p className="mt-2 text-body text-text-secondary">{copy.privacy}</p>
              </div>
            ) : null}
          </Container>
        </section>
      ) : null}

      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
