import type { NextConfig } from "next";

// ImageKit is the only permitted remote image host — see
// docs/UI_UX_FOUNDATION.md §8 and docs/MEDIA.md § "Image Replacement Manifest".
// No unrestricted wildcard image policy. When NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
// is unset (no ImageKit account provisioned yet), remotePatterns stays empty —
// every image renders through the FacetTile fallback instead.
const imageKitEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];

if (imageKitEndpoint) {
  try {
    const url = new URL(imageKitEndpoint);
    remotePatterns.push({
      protocol: url.protocol.replace(":", "") as "https" | "http",
      hostname: url.hostname,
      pathname: `${url.pathname.replace(/\/$/, "")}/**`,
    });
  } catch {
    // Malformed endpoint — fail closed, no remote patterns allowed.
  }
}

const nextConfig: NextConfig = {
  // Required by the Blue/Green release model (ops/deploy/deploy-blue-diamond):
  // the deployable artifact is a self-contained server plus static assets,
  // started directly by systemd as `node server.js`, with no `npm install` on
  // the production host. Without this, `npm run build` produces no
  // .next/standalone and the packaging step in the deploy workflow fails.
  //
  // Build-output shape only -- no effect on routing, rendering, or any
  // application behaviour.
  output: "standalone",
  images: {
    remotePatterns,
  },
};

export default nextConfig;
