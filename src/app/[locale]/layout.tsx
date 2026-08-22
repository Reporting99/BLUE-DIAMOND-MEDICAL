import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ImageKitProvider } from "@imagekit/next";
import { dirFor, isLocale, locales, type Locale } from "@/i18n/config";
import { fontVariables } from "@/lib/fonts";
import { siteConfig } from "@/config/site";
import { imagekitConfig } from "@/config/imagekit";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/layout/ScrollReveal";
import "../globals.css";

// This is the true root layout — see the note in the (removed) app/layout.tsx
// history and node_modules/next/dist/docs/.../file-conventions/layout.md:
// "The root layout can be under a dynamic segment, for example when
// implementing internationalization with app/[lang]/layout.js." It owns
// <html>/<body> so `lang`/`dir` are correct per locale on first paint.
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.name,
      template: `%s · ${siteConfig.name}`,
    },
    alternates: {
      canonical: `${siteConfig.url}/${safeLocale}`,
      languages: {
        "en-CA": `${siteConfig.url}/en`,
        "ar-CA": `${siteConfig.url}/ar`,
        "x-default": `${siteConfig.url}/en`,
      },
    },
    openGraph: {
      locale: safeLocale === "ar" ? "ar_CA" : "en_CA",
      siteName: siteConfig.name,
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} dir={dirFor(locale)} className={fontVariables}>
      <body>
        {/* One centralized ImageKit provider (brief §8) — every ImageKitImage
            instance inherits urlEndpoint from here instead of repeating it. */}
        <ImageKitProvider urlEndpoint={imagekitConfig.urlEndpoint}>
          <Header locale={locale} />
          <main id="main-content">{children}</main>
          <Footer locale={locale} />
          <ScrollReveal />
        </ImageKitProvider>
      </body>
    </html>
  );
}
