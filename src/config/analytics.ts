/**
 * Google Analytics 4 configuration.
 *
 * A GA4 Measurement ID is public (it is sent to every visitor's browser in
 * plain text), unlike an API key or secret, so — same reasoning as
 * `DEFAULT_URL_ENDPOINT` in src/config/imagekit.ts — the approved production
 * ID is safe to commit as the default here, not held back behind a CI
 * secret/variable that would have to be provisioned out-of-band before the
 * very first launch build could carry it.
 *
 * `NEXT_PUBLIC_GA_MEASUREMENT_ID` still overrides this (e.g. a staging GA4
 * property), and an explicit empty value disables analytics entirely — the
 * same override/opt-out shape imagekit.ts uses. The member expression is
 * written out in full (not destructured) because webpack replaces
 * `process.env.NEXT_PUBLIC_…` textually.
 */
const DEFAULT_GA_MEASUREMENT_ID = "G-7DV360JLG2";

const RAW_GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function resolveGaId(raw: string | undefined): string | null {
  if (raw === undefined) return DEFAULT_GA_MEASUREMENT_ID;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export const gaMeasurementId = resolveGaId(RAW_GA_ID);

export const analyticsIsConfigured = gaMeasurementId !== null;
