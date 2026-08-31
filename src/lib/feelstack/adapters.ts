import { z } from "zod";
import type { Locale } from "./contracts";
import type { Bilingual } from "@/types/common";
import type { FeelstackResolveEnvelope, FeelstackFaq, FeelstackRelation } from "./transport";
import { primaryForSlot, type ResolvedMedia } from "./media";

/**
 * Transport -> domain adapter boundary.
 *
 * FeelStack stores ONE ENTRY PER LOCALE, linked by `translationGroupId`. Blue
 * Diamond's domain models predate that and carry `Bilingual` (`{ en, ar }`)
 * fields. The mismatch is real and this module is where it is reconciled — in
 * exactly one place, so feature modules keep their existing types and never see
 * a FeelStack envelope.
 *
 * The reconciliation deliberately does NOT fetch both locales. Runtime content
 * is locale-specific: `/en/...` requests `locale=en` and renders the English
 * entry, `/ar/...` requests `locale=ar` and renders the Arabic entry. Issuing a
 * second request per page to rebuild a two-language object would double CMS load
 * to synthesise a shape the renderer never needs — a template reads
 * `field[locale]` and nothing else.
 */

/**
 * Fills the requested locale and leaves the other side EMPTY.
 *
 * This is a safety decision, not laziness. The alternative — mirroring the same
 * string into both slots — would mean an accidental read of the other locale
 * silently returns text in the wrong language, which on a medical site is the
 * exact failure `./locale-integrity` exists to prevent. An empty string renders
 * as visibly missing and is trivially assertable in a test, so a cross-locale
 * read fails loudly instead of lying.
 */
export function localizedBilingual(locale: Locale, value: string): Bilingual {
  return locale === "en" ? { en: value, ar: "" } : { en: "", ar: value };
}

/** Same rule for list fields. */
export function localizedBilingualList(locale: Locale, values: readonly string[]): { en: string[]; ar: string[] } {
  return locale === "en" ? { en: [...values], ar: [] } : { en: [], ar: [...values] };
}

/**
 * Everything an entity adapter is allowed to see: the validated per-locale
 * fields plus the first-class sidecars FeelStack resolves alongside them.
 *
 * `fields` is already parsed by the caller's field schema, so an adapter never
 * touches `unknown`.
 */
export interface AdapterInput<F> {
  locale: Locale;
  /** Entry id — the CMS identity, never the public URL. */
  id: string;
  /** Entry title, which FeelStack stores as a column rather than a field. */
  title?: string;
  fields: F;
  /** First-class FAQs, already filtered to this locale by the backend. */
  faqs: readonly FeelstackFaq[];
  /** Real relation rows: relationKey + targetType + targetId. */
  relations: readonly FeelstackRelation[];
  /** Resolved public path for this locale, from the route registration. */
  path: string;
  /**
   * Media assigned to this entity, already validated item-by-item and sorted by
   * (slot, sortOrder). Invalid rows were dropped upstream in the resolver, so an
   * adapter never sees a partial asset and never has to decide what to do about
   * one. Empty when the CMS returned no media, when every row was rejected, or
   * when this build is serving static content.
   */
  media: readonly ResolvedMedia[];
}

/** Convenience for adapters: the first asset in a slot, or undefined. */
export function mediaForSlot(
  input: Pick<AdapterInput<unknown>, "media">,
  slot: string,
): ResolvedMedia | undefined {
  return primaryForSlot(input.media, slot);
}

export type EntityAdapter<F, T> = (input: AdapterInput<F>) => T;

/**
 * Binds a per-locale field schema to an adapter.
 *
 * Field schemas describe ONE locale's values (plain `string`, not `Bilingual`),
 * because that is what a FeelStack entry holds. Anything modelling `{ en, ar }`
 * at this layer is describing a shape the CMS cannot return.
 */
export interface EntityContract<F, T> {
  /** FeelStack content-type key, e.g. "medical-service". */
  contentType: string;
  fields: z.ZodType<F>;
  adapt: EntityAdapter<F, T>;
}

export function defineEntityContract<F, T>(contract: EntityContract<F, T>): EntityContract<F, T> {
  return contract;
}

/** Pulls target ids for one relation key, preserving the CMS sort order. */
export function relatedIds(relations: readonly FeelstackRelation[], relationKey: string): string[] {
  return relations
    .filter((relation) => relation.relationKey === relationKey)
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((relation) => relation.targetId);
}

/** First-class FAQs -> the domain's bilingual FAQ shape, single-locale-filled. */
export function adaptFaqs(locale: Locale, faqs: readonly FeelstackFaq[]) {
  return faqs.map((faq) => ({
    question: localizedBilingual(locale, faq.question),
    answer: localizedBilingual(locale, faq.answer),
  }));
}

/**
 * Builds the adapter input from a validated envelope. Kept separate from the
 * resolver so it can be unit-tested against a captured envelope without any
 * network or env setup.
 */
export function toAdapterInput<F>(
  envelope: FeelstackResolveEnvelope,
  locale: Locale,
  fields: F,
  /**
   * Already-validated media. Passed in rather than parsed here because
   * rejected rows must be LOGGED, and logging belongs with the resolver that
   * holds the requestId — not in a pure adapter helper. Defaults to empty so
   * every existing caller and captured-envelope test keeps working unchanged.
   */
  media: readonly ResolvedMedia[] = [],
): AdapterInput<F> {
  return {
    locale,
    id: envelope.data.id,
    title: envelope.data.title,
    fields,
    faqs: envelope.relations?.faqs ?? [],
    relations: envelope.relations?.items ?? [],
    path: envelope.route.path,
    media,
  };
}
