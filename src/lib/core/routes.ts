/**
 * @file routes.ts
 * @description Single Source of Truth URI route mapping registry for NihongoRoute internal navigation.
 */

// Import & Dependencies

import { slugify } from "@/lib/utils";

// Application Route Registry

/**
 * Application route registry. Map internal URIs.
 */
export const ROUTES = {

 // GLOBAL & DASHBOARD

 HOME: "/",
 DASHBOARD: "/dashboard",
 SUPPORT: "/support",
 TERMS: "/terms",
 PRIVACY: "/privacy",
 CONTACT: "/support/contact",

 // LIBRARY (CONTENT)

 LIBRARY: {
 ROOT: "/library",
 VOCAB: (slug: string) => `/library/vocab/${slug}`,
 KANJI: (slug: string) => `/library/kanji/${slug}`, // Menggunakan slug ASCII untuk stabilitas static
 GRAMMAR: (slug: string) => `/library/grammar/${slug}`,
 READING: (slug: string) => `/library/reading/${slug}`,
 LISTENING: (slug: string) => `/library/listening/${slug}`,
 CHEATSHEET: "/library/cheatsheet",
 },

 // COURSES (LEARNING)

 COURSES: {
 ROOT: "/courses",
 CATEGORY: (categoryId: string) => `/courses/${slugify(categoryId)}`,
 LESSON: (categoryId: string, lessonSlug: string) => 
 `/courses/${slugify(categoryId)}/${slugify(lessonSlug)}`,
 },

 // EXAMS & ASSESSMENT

 EXAMS: {
 ROOT: "/exams",
 SESSION: (id: string) => `/exams/${id}`,
 },

 // AUTH

 AUTH: {
 LOGIN: "/login",
 FORGOT_PASSWORD: "/forgot-password",
 },

 // GLOBAL

 REVIEW: "/review",
 SETTINGS: "/settings",
 SHARE: "/share",
 SOCIAL: "/social",

 // TOOLS

 TOOLS: {
 ROOT: "/tools",
 KANA: "/tools/kana",
 TEXT_ANALYZER: "/tools/text-analyzer",
 CONJUGATION: "/tools/conjugation",
 PARTICLES: "/tools/particles",
 KANJI_SIMILARITY: "/tools/kanji-similarity",
 SENTENCE_BUILDER: "/tools/sentence-builder",
 JLPT_DRILL: "/tools/jlpt-drill",
 COUNTER_TRAINER: "/tools/counter-trainer",
 SHADOWING: "/tools/shadowing",
 DICTATION: "/tools/dictation",
 FLASHCARDS: "/tools/flashcards",
 SURVIVAL: "/tools/survival",
 WEAK_POINTS: "/tools/weak-points",
 DICTIONARY: "/tools/dictionary",
 WRITING: "/tools/writing",
 },
} as const;

/**
 * Get readable label for route segment.
 * @param segment - URL path segment.
 * @returns Readable label string.
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

 // Check predefined map. Return match.
 if (labels[segment.toLowerCase()]) {
 return labels[segment.toLowerCase()];
 }

 // Fallback: Format slug menjadi teks yang rapi (Hapus -, Capitalize)
 // Decode URL. Replace hyphens with spaces.
 const decoded = decodeURIComponent(segment).replace(/-/g, ' ');
 
 // Jika terlalu panjang, ringkas (untuk kerapihan di mobile)
 // Capitalize first letter of each word.
 const formatted = decoded.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
 // Truncate long labels for mobile display.
 return formatted.length > 30 ? formatted.substring(0, 27) + "..." : formatted;
}

/**
 * Breadcrumb item structure.
 */
export interface BreadcrumbItem {
 label: string;
 href?: string;
 active?: boolean;
}

/**
 * Generate breadcrumb list from pathname.
 * @param pathname - Current URL path.
 * @returns Array of breadcrumb items.
 */
export function getBreadcrumbItems(pathname: string | null | undefined): BreadcrumbItem[] {
 // Strip query params. Remove trailing slashes.
 const normalizedPathname = pathname?.split("?")[0]?.replace(/\/+$/, "") || "/";
 // Split path. Remove empty segments.
 const segments = normalizedPathname.split("/").filter(Boolean);

 // Return default home breadcrumb if root or dashboard.
 if (segments.length === 0 || segments[0] === "dashboard") {
 return [{ active: true, label: "Beranda" }];
 }

 const items: BreadcrumbItem[] = [{ href: ROUTES.DASHBOARD, label: "Beranda" }];

 segments.forEach((segment, index) => {
 // Build cumulative path for current segment.
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

/**
 * Get label of current active route.
 * @param pathname - Current URL path.
 * @returns Active route label.
 */
export function getCurrentRouteLabel(pathname: string | null | undefined): string {
 const breadcrumbs = getBreadcrumbItems(pathname);
 return breadcrumbs[breadcrumbs.length - 1]?.label || "Beranda";
}

/**
 * Get label of parent route.
 * @param pathname - Current URL path.
 * @returns Parent route label or null.
 */
export function getParentRouteLabel(pathname: string | null | undefined): string | null {
 const breadcrumbs = getBreadcrumbItems(pathname);
 return breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2]?.label || null : null;
}