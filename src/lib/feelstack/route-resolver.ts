// No `import "server-only"` here deliberately — see cache-tags.ts /
// page-resolver.ts for why; transitively guarded via `./client`.
import { listRoutes } from "./client";
import { getFeelstackContentMode } from "./content-mode";
import { routes as localRoutes } from "@/config/routes";
import type { Locale } from "./contracts";

/**
 * Route existence resolver — brief §5 ("Use the route resolver to confirm
 * whether a route exists" rather than pattern-matching on error prose).
 * In "static" mode (this build's default) it is authoritative from the
 * local route registry alone, since that registry is still the single
 * source of truth for what's published (`src/config/routes.ts`,
 * `src/config/features.ts`).
 */
export async function routeExists(path: string, locale: Locale): Promise<boolean> {
  const mode = getFeelstackContentMode();
  const localMatch = localRoutes.some((r) => r.path[locale] === path);

  if (mode === "static") return localMatch;

  // hybrid/cms: a route is live if either FeelStack or the local registry
  // says so (hybrid = union of both sources during migration).
  if (localMatch) return true;
  const cmsRoutes = await listRoutes(locale);
  return cmsRoutes.some((r) => r.path === path);
}
