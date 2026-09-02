import { test, expect } from "@playwright/test";

/**
 * SHARED_MEDIA_EN_AR_PARITY — the same canonical entity must show the same
 * language-neutral MediaAsset in English and in Arabic.
 *
 * THE DEFECT THIS EXISTS FOR, and why nothing else caught it. A media
 * assignment is keyed on the LOCALIZED entity row
 * (`entity_media_assignments` is unique on
 * projectId/entityType/entityId/slot/sortOrder, and the EN and AR rows of one
 * entity have different entityIds). `localeMode: "shared"` describes the
 * BINARY — one file, no translated text — it does NOT mean one assignment
 * serves both locales. So each locale carries its own row, and the two rows
 * are only equal because someone kept them equal.
 *
 * On 2026-09-01 the three technology cards were re-pointed from their
 * abstract placeholder tiles to real device photography. Only the English
 * rows were re-pointed. The Arabic rows kept the 2026-08-31 abstract cards,
 * and `/ar` quietly rendered different pictures than `/en` for the same three
 * devices. `/medical/eye-screening` had the same shape with a slot missing
 * entirely: EN carried a `hero`, AR carried none, so the Arabic page fell
 * back while English rendered.
 *
 * Nothing failed. Both locales returned 200, every image loaded, every
 * assignment was `approved` and `shared`, and no fixture-based test could see
 * it because assignments are EDITORIAL DATA that changes without a deploy —
 * a captured fixture would either go stale or pin the drift as correct.
 * Catching this class requires reading the live CMS, which is what this does.
 *
 * WHY THIS SKIPS IN CI, deliberately. CI builds without FEELSTACK_* on
 * purpose (.github/workflows/ci.yml: "every ImageKit/FeelStack-dependent code
 * path is designed to fail closed to local fallback content when these are
 * unset"). There is no CMS to ask, so this test cannot guard a pull request.
 * It is an OPERATIONAL check — run it against a configured environment after
 * any media re-assignment. Reporting it as a CI gate would be a lie.
 */

const API = process.env.FEELSTACK_API_URL;
const SITE = process.env.FEELSTACK_SITE_KEY;

interface Media {
  id: string;
  slot: string | null;
  localeMode: string | null;
  approvalStatus: string | null;
  path: string | null;
}
interface Envelope {
  data?: { id?: string } | null;
  route?: { alternates?: { locale: string; path: string }[] | null } | null;
  media?: Media[] | null;
}

async function resolve(path: string, locale: string): Promise<Envelope> {
  const url = `${API}/public/v1/sites/${SITE}/resolve?path=${encodeURIComponent(path)}&locale=${locale}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`resolve ${locale} ${path} -> ${res.status}`);
  return (await res.json()) as Envelope;
}

/** Only assignments a visitor can actually see. */
const visible = (m: Media[] | null | undefined) =>
  (m ?? []).filter((x) => x.approvalStatus === "approved");

test.describe("shared media resolves identically in EN and AR", () => {
  test.skip(!API || !SITE, "FEELSTACK_API_URL/FEELSTACK_SITE_KEY unset — no CMS to ask (expected in CI)");
  test.slow();

  test("every EN/AR pair shows the same MediaAsset in the same slot", async () => {
    const listed = await fetch(`${API}/public/v1/sites/${SITE}/routes?page=1&limit=200`);
    const routes = ((await listed.json()) as { items: { path: string; locale: string }[] }).items;

    const mismatches: string[] = [];
    const arMissing: string[] = [];
    let pairs = 0;

    for (const route of routes.filter((r) => r.locale === "en")) {
      const en = await resolve(route.path, "en");
      const arPath = (en.route?.alternates ?? []).find((a) => a.locale === "ar")?.path;
      if (!arPath) continue; // app-owned route with no CMS Arabic twin
      const ar = await resolve(arPath, "ar");
      pairs += 1;

      const enBySlot = new Map(visible(en.media).map((m) => [m.slot ?? "", m]));
      const arBySlot = new Map(visible(ar.media).map((m) => [m.slot ?? "", m]));

      for (const [slot, e] of enBySlot) {
        // Only language-neutral media is required to match. A genuinely
        // localized asset (text burnt into the image) is allowed to differ,
        // and says so with localeMode.
        if (e.localeMode !== "shared") continue;
        const a = arBySlot.get(slot);
        if (!a) {
          arMissing.push(`${route.path} [${slot}] EN=${e.path} AR=(none)`);
        } else if (a.id !== e.id) {
          mismatches.push(`${route.path} [${slot}] EN=${e.path} AR=${a.path}`);
        }
      }
    }

    expect(pairs, "no EN/AR pairs were compared — the route inventory looks wrong").toBeGreaterThan(0);
    // AR_PLACEHOLDER_WHILE_EN_HAS_MEDIA: English shows a real picture, Arabic
    // falls back to the FacetTile for the same entity and slot.
    expect(arMissing, "EN has approved shared media the AR twin lacks").toEqual([]);
    // EN_AR_SHARED_MEDIA_ID_MISMATCHES: both render, but different pictures.
    expect(mismatches, "EN and AR resolve different MediaAssets for one slot").toEqual([]);
  });
});
