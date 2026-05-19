/**
 * @file routes.ts
 * @description Single Source of Truth untuk semua URL di NihongoRoute.
 * Memastikan perutean yang rapi, konsisten, dan mudah dikelola.
 * @module lib/routes
 */

import { slugify } from "./utils";

export const ROUTES = {
  // ======================
  // GLOBAL & DASHBOARD
  // ======================
  HOME: "/",
  DASHBOARD: "/dashboard",
  SUPPORT: "/support",
  TERMS: "/terms",
  PRIVACY: "/privacy",
  CONTACT: "/support/contact",

  // ======================
  // LIBRARY (CONTENT)
  // ======================
  LIBRARY: {
    ROOT: "/library",
    VOCAB: (slug: string) => `/library/vocab/${slugify(slug)}`,
    KANJI: (character: string) => `/library/kanji/${character}`, // Kanji biasanya pake karakter tunggal
    GRAMMAR: (slug: string) => `/library/grammar/${slugify(slug)}`,
    READING: (slug: string) => `/library/reading/${slugify(slug)}`,
    CHEATSHEET: "/library/cheatsheet",
  },

  // ======================
  // COURSES (LEARNING)
  // ======================
  COURSES: {
    ROOT: "/courses",
    CATEGORY: (categoryId: string) => `/courses/${slugify(categoryId)}`,
    LESSON: (categoryId: string, lessonSlug: string) => 
      `/courses/${slugify(categoryId)}/${slugify(lessonSlug)}`,
  },

  // ======================
  // EXAMS & ASSESSMENT
  // ======================
  EXAMS: {
    ROOT: "/exams",
    SESSION: (id: string) => `/exams/${id}`,
  },

  // ======================
  // AUTH
  // ======================
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
  },
} as const;

/**
 * Mendapatkan label yang "rapih" untuk segmen breadcrumb.
 */
export function getRouteLabel(segment: string): string {
  const labels: Record<string, string> = {
    library: "Pustaka",
    vocab: "Kosakata",
    kanji: "Kanji",
    grammar: "Tata Bahasa",
    reading: "Bacaan",
    courses: "Kursus",
    exams: "Ujian",
    dashboard: "Dasbor",
    cheatsheet: "Referensi Kilat",
    support: "Bantuan",
  };

  if (labels[segment.toLowerCase()]) {
    return labels[segment.toLowerCase()];
  }

  // Fallback: Format slug menjadi teks yang rapi (Hapus -, Capitalize)
  const decoded = decodeURIComponent(segment).replace(/-/g, ' ');
  
  // Jika terlalu panjang, ringkas (untuk kerapihan di mobile)
  const formatted = decoded.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  return formatted.length > 30 ? formatted.substring(0, 27) + "..." : formatted;
}
