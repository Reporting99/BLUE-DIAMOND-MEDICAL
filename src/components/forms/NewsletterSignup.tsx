import { features } from "@/config/features";
import type { Locale } from "@/i18n/config";

/**
 * Newsletter signup — brief §37 (`newsletterEnabled: false`). Built as a
 * standalone, self-gating component (rather than a page, since the brief
 * treats it as a footer/section widget) so it can be dropped into the
 * footer or a page once enabled — it renders nothing while the flag is
 * off, and is not referenced by any page yet, so it has no effect on the
 * live site today. No email-list provider is configured either way.
 */
export function NewsletterSignup({ locale }: { locale: Locale }) {
  if (!features.newsletterEnabled) return null;

  const copy = {
    en: { heading: "Stay in touch", placeholder: "Your email", submit: "Subscribe" },
    ar: { heading: "ابقوا على تواصل", placeholder: "بريدكم الإلكتروني", submit: "اشتراك" },
  }[locale];

  return (
    <form className="flex flex-col gap-3">
      <h2 className="text-h4 font-heading">{copy.heading}</h2>
      <div className="flex gap-2">
        <input
          type="email"
          placeholder={copy.placeholder}
          aria-label={copy.placeholder}
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {copy.submit}
        </button>
      </div>
    </form>
  );
}
