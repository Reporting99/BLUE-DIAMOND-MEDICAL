import type { Bilingual } from "./medical-service";

export type HealthHubCategory =
  | "family-health"
  | "womens-health"
  | "mental-health"
  | "medical-aesthetics"
  | "skin-and-hair"
  | "treatment-guides"
  | "clinic-news";

export interface HealthHubArticle {
  id: string;
  slug: string;
  slugAr: string;
  category: HealthHubCategory;
  title: Bilingual;
  /** Answer-first summary shown on cards and used as the meta description. */
  summary: Bilingual;
  author: string;
  /** Medical reviewer name — required before publish for any clinical content. */
  medicalReviewer?: string;
  publishedAt: string; // ISO date
  updatedAt?: string; // ISO date
  body: Bilingual;
  relatedDoctorIds?: string[];
  relatedServiceRouteIds?: string[];
  faqs?: { question: Bilingual; answer: Bilingual }[];
  sources?: { label: string; url: string }[];
}
