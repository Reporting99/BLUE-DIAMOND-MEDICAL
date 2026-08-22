"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ImageKitImage } from "@/components/media/ImageKitImage";
import { concerns } from "@/content/concerns";
import { getRoute, href } from "@/config/routes";
import type { Locale } from "@/i18n/config";

const copy = {
  en: {
    eyebrow: "By concern",
    heading: "Explore information and treatment options",
    intro: "Browse by what you're noticing, and see the approved treatments and technologies that may be relevant — a starting point for your consultation, not a diagnosis.",
    viewAll: "View all concerns",
  },
  ar: {
    eyebrow: "حسب المخاوف",
    heading: "استكشفوا المعلومات وخيارات العلاج",
    intro: "تصفّحوا حسب ما تلاحظونه، واطّلعوا على العلاجات والتقنيات المعتمدة ذات الصلة — نقطة بداية لاستشارتكم، وليست تشخيصًا.",
    viewAll: "عرض جميع المخاوف",
  },
};

/**
 * Bilingual concern-explorer — brief Part 2 §14, enriched in the "PREMIUM
 * UNIFIED HOMEPAGE REDESIGN" pass with a large preview image that follows
 * keyboard focus/hover (brief §6: "a large central editorial image...
 * selected concern changes the supporting image and explanation...
 * accessible keyboard controls"). Deliberately does NOT gate concern links
 * behind a click-to-select pattern: every concern stays a real, always-
 * rendered `<Link>` at all times — only the preview panel reacts to
 * focus/hover — so this remains fully crawlable and keyboard-navigable
 * (Tab moves focus through real links, which is what drives the preview;
 * Enter/click navigates normally, nothing is intercepted) whether or not
 * JavaScript has hydrated yet. Reused on the homepage and the concerns hub
 * itself, so both stay in sync automatically as concerns are added.
 */
export function ConcernExplorer({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [activeId, setActiveId] = useState(concerns[0]?.id);
  const active = concerns.find((c) => c.id === activeId) ?? concerns[0];

  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.1em] text-primary uppercase">{t.eyebrow}</p>
      <h2 className="mt-3 text-display-2 font-heading lg:text-display-2-lg">{t.heading}</h2>
      <p className="mt-3 max-w-2xl text-body text-text-secondary">{t.intro}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[5fr_7fr] lg:items-start">
        {active ? (
          <div className="facet-corner relative aspect-square overflow-hidden rounded-lg lg:sticky lg:top-24">
            <ImageKitImage
              path={`/concerns/${active.id}.jpg`}
              preset="concern"
              role="concern"
              status="pending"
              alt={{ en: `${active.title.en} — Blue Diamond Medical Aesthetics`, ar: `${active.title.ar} — بلو دايموند للتجميل الطبي` }}
              locale={locale}
              width={600}
              height={600}
              className="h-full w-full"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 p-6"
              style={{ background: "linear-gradient(0deg, rgba(29,86,120,0.82) 0%, rgba(29,86,120,0) 65%)" }}
            >
              <p className="text-h4 font-heading text-white">{active.title[locale]}</p>
              <p className="mt-2 line-clamp-2 text-sm text-white/85">{active.summary[locale]}</p>
            </div>
          </div>
        ) : null}

        <ul className="grid gap-3 sm:grid-cols-2">
          {concerns.map((concern) => {
            const route = getRoute(`concern-${concern.id}`)!;
            return (
              <li key={concern.id}>
                <Link
                  href={`/${locale}${route.path[locale]}`}
                  onFocus={() => setActiveId(concern.id)}
                  onMouseEnter={() => setActiveId(concern.id)}
                  className={`group flex h-full flex-col justify-between rounded-lg border p-5 transition-colors ${
                    concern.id === activeId ? "border-primary" : "border-border hover:border-primary"
                  }`}
                >
                  <div>
                    <h3 className="font-heading text-h4">{concern.title[locale]}</h3>
                    <p className="mt-2 text-sm text-text-secondary">{concern.summary[locale]}</p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <Link href={href("aesthetics-concerns-hub", locale)} className="mt-8 inline-flex items-center gap-1 font-medium text-primary hover:text-primary-hover">
        {t.viewAll} <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
      </Link>
    </div>
  );
}
