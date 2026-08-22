import type { PricingGroup } from "@/types/pricing";

/**
 * Aesthetic treatment pricing — brief §19. Empty: no approved aesthetics
 * prices were supplied (only uninsured *medical* fees and the legacy
 * SkinMedica product price list exist — see docs/CONTENT_APPROVAL_MATRIX.md).
 * The type model, currency formatting, and page template are fully built
 * so publishing real prices is a matter of populating this array once
 * approved, not new code. Gated behind `aestheticPricingEnabled`.
 */
export const aestheticsPricingGroups: PricingGroup[] = [];
