import type { Locale } from "./contracts";
import type { FeelstackResolveEnvelope } from "./transport";

/**
 * Cross-locale content integrity.
 *
 * FeelStack resolves a request for a locale it has no published route for by
 * falling back to the DEFAULT-locale route
 * (`public-route-resolver.service.ts`: if the locale-specific lookup misses and
 * `locale !== defaultLocale`, it retries against `defaultLocale`), then reports
 * the substitution honestly:
 *
 *     requestedLocale: "ar", resolvedLocale: "en", usedFallback: true
 *
 * For a general site that is a convenience. For a bilingual MEDICAL site it is
 * a hazard with three separate costs, and the frontend — not the CMS — is the
 * only layer that can refuse it:
 *
 *   1. Clinical. An Arabic-speaking patient is shown English text describing a
 *      procedure, dosage or eligibility rule they may not read accurately.
 *   2. SEO. Two URLs serve identical English content, with hreflang claiming
 *      one of them is Arabic — duplicate content plus a false language signal.
 *   3. Schema. JSON-LD generated from that payload asserts English medical
 *      facts under an Arabic `inLanguage`.
 *
 * The rule is therefore absolute and centralized here rather than repeated per
 * page: a localized entity renders only when the CMS resolved EXACTLY the
 * locale that was asked for. Anything else is treated as that locale's content
 * being absent — never as a reason to show the other language.
 */

export type LocaleIntegrityResult =
  | { ok: true }
  | { ok: false; reason: "cross-locale-fallback" | "locale-mismatch"; requested: Locale; resolved: string };

/**
 * Three independent signals are checked, not one, because they can disagree and
 * any single one of them being wrong is enough to leak the wrong language:
 * `usedFallback` is the backend's own admission, while `resolvedLocale` and
 * `route.locale` are the observable facts about what was actually returned.
 */
export function checkLocaleIntegrity(
  envelope: FeelstackResolveEnvelope,
  requested: Locale,
): LocaleIntegrityResult {
  const { route } = envelope;

  if (route.usedFallback) {
    return { ok: false, reason: "cross-locale-fallback", requested, resolved: route.resolvedLocale };
  }
  if (route.resolvedLocale !== requested) {
    return { ok: false, reason: "locale-mismatch", requested, resolved: route.resolvedLocale };
  }
  // `route.locale` is the row actually served. It should equal resolvedLocale;
  // if the backend ever diverges these two, trust neither and refuse.
  if (route.locale !== requested) {
    return { ok: false, reason: "locale-mismatch", requested, resolved: route.locale };
  }
  return { ok: true };
}
