/**
 * @file routes.ts
 * @description Single Source of Truth luring-ready untuk pemetaan seluruh URI internal aplikasi NihongoRoute guna menjamin perutean yang rapi, konsisten, dan mudah dipelihara.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { slugify } from "./utils";

// ==========================================
// DAFTAR KONSTANTA RUTE (ROUTES)
// ==========================================
export const ROUTES = {
  // ==========================================
  // GLOBAL & DASHBOARD
  // ==========================================
  HOME: "/",
  DASHBOARD: "/dashboard",
  LEARNING_HUB: "/learning-hub",
  SUPPORT: "/support",
  TERMS: "/terms",
  PRIVACY: "/privacy",
  CONTACT: "/support/contact",

  // ======================
  // LIBRARY (CONTENT)
  // ======================
  LIBRARY: {
    ROOT: "/library",
    VOCAB: (slug: string) => `/library/vocab/${slug}`,
    KANJI: (slug: string) => `/library/kanji/${slug}`, // Menggunakan slug ASCII untuk stabilitas static
    GRAMMAR: (slug: string) => `/library/grammar/${slug}`,
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
    dashboard: "Beranda",
    library: "Pustaka",
    vocab: "Kosakata",
    kanji: "Kanji",
    grammar: "Tata Bahasa",
    reading: "Bacaan",
    listening: "Listening",
    courses: "Kursus",
    exams: "Ujian",
    "learning-hub": "Learning Hub",
    cheatsheet: "Referensi Kilat",
    support: "Bantuan",
    settings: "Pengaturan",
    review: "Hafalan",
    share: "Bagikan",
    social: "Komunitas",
    tools: "Peralatan",
    kana: "Kana Master",
    flashcards: "Flashcards",
    survival: "Mode Bertahan",
    writing: "Latihan Menulis",
    "weak-points": "Weak Point Trainer",
    "text-analyzer": "Text Analyzer",
    conjugation: "Konjugasi",
    dictionary: "Kamus Terpadu",
    particles: "Particle Trainer",
    "kanji-similarity": "Kanji Mirip",
    "sentence-builder": "Sentence Builder",
    "jlpt-drill": "JLPT Mini Drill",
    "counter-trainer": "Counter Trainer",
    shadowing: "Shadowing Recorder",
    "forgot-password": "Lupa Password",
    "update-password": "Ubah Password",
    privacy: "Kebijakan Privasi",
    terms: "Syarat & Ketentuan",
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

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export function getBreadcrumbItems(pathname: string | null | undefined): BreadcrumbItem[] {
  const normalizedPathname = pathname?.split("?")[0]?.replace(/\/+$/, "") || "/";
  const segments = normalizedPathname.split("/").filter(Boolean);

  if (segments.length === 0 || segments[0] === "dashboard") {
    return [{ active: true, label: "Beranda" }];
  }

  const items: BreadcrumbItem[] = [{ href: ROUTES.DASHBOARD, label: "Beranda" }];

  segments.forEach((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const isLast = index === segments.length - 1;

    items.push({
      active: isLast,
      href: isLast ? undefined : href,
      label: getRouteLabel(segment),
    });
  });

  return items;
}

export function getCurrentRouteLabel(pathname: string | null | undefined): string {
  const breadcrumbs = getBreadcrumbItems(pathname);
  return breadcrumbs[breadcrumbs.length - 1]?.label || "Beranda";
}

export function getParentRouteLabel(pathname: string | null | undefined): string | null {
  const breadcrumbs = getBreadcrumbItems(pathname);
  return breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2]?.label || null : null;
}
