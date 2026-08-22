import { Fraunces, IBM_Plex_Sans, IBM_Plex_Sans_Arabic, IBM_Plex_Mono } from "next/font/google";

// Type system — docs/UI_UX_FOUNDATION.md §3. Each face is subset to the
// script it's actually used for, avoiding unnecessary payload and layout
// shift (next/font self-hosts + inlines size-adjust metrics automatically).
export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-plex-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const plexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-plex-sans-arabic",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const fontVariables = `${fraunces.variable} ${plexSans.variable} ${plexSansArabic.variable} ${plexMono.variable}`;
