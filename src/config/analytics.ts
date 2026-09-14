/**
 * Google Analytics 4 configuration.
 *
 * Deliberately NO fallback constant — same rule as `SITE_URL` in
 * src/config/site-url.ts ("no fallback constant... must degrade honestly").
 * A baked-in default was tried here first and caused the opposite of its
 * intent: GitHub Actions resolves an unset `vars.X` to the EMPTY STRING, not
 * `undefined`, so `${{ vars.NEXT_PUBLIC_GA_MEASUREMENT_ID }}` in the deploy
 * workflow reliably set `process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID` to `""`
 * even when no repo variable existed — which this file's old logic then read
 * as "explicitly disabled", shipping a production build with NO GA tag.
 * There is no way to tell "unset" and "empty" apart in that pipeline, so the
 * only reliable rule is: an explicit non-empty value turns GA on, anything
 * else — unset, blank, whitespace — turns it off. No environment can be
 * silently defaulted into tracking.
 *
 * The production build sets the real value directly in
 * .github/workflows/deploy-production.yml (a literal, not a `vars.`
 * reference — see the comment there for why). Local dev, CI's own validate
 * build (ci.yml), and any future preview build all leave this unset and
 * correctly ship with analytics off.
 *
 * A GA4 Measurement ID is public (it is sent to every visitor's browser in
 * plain text), unlike an API key or secret, so committing it as a literal in
 * the deploy workflow is safe — same reasoning as `DEFAULT_URL_ENDPOINT` in
 * src/config/imagekit.ts.
 *
 * The member expression is written out in full (not destructured) because
 * webpack replaces `process.env.NEXT_PUBLIC_…` textually.
 */
const RAW_GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function resolveGaId(raw: string | undefined): string | null {
  const trimmed = (raw ?? "").trim();
  return trimmed.length > 0 ? trimmed : null;
}

export const gaMeasurementId = resolveGaId(RAW_GA_ID);

export const analyticsIsConfigured = gaMeasurementId !== null;
