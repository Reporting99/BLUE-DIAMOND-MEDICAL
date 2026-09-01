/**
 * Which CMS media slot a concern surface reads, in preference order.
 *
 * A leaf module on purpose: the CMS contract (server, zod) and the listing
 * resolver (server, network) both need these constants, and the detail page and
 * the explorer must not be able to disagree about them. Keeping them here means
 * neither side has to import the other's dependencies to share one decision.
 *
 * THE ORDER ENCODES FRAME SIZE, NEVER ENTITY IDENTITY. Every concern owns a
 * `card` asset; Skin Laxity additionally owns a `section` one, shot for a large
 * feature frame. A preference list can only ever reorder the assignments that
 * already belong to the concern being rendered, so no arrangement of it can
 * put one concern's photograph on another concern's surface — that property is
 * structural rather than a rule someone has to remember.
 */

/**
 * A large editorial frame: the concern detail page's hero and the explorer's
 * preview panel. An explicit `hero` first, so an editor who assigns one wins;
 * then the purpose-shot `section` feature; then the card asset, which is what
 * the eight concerns owning no feature asset correctly land on.
 */
export const CONCERN_FEATURE_SLOTS = ["hero", "section", "card", "gallery"] as const;
