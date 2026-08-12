/**
 * @file recommendations.ts
 * @description Generator rekomendasi ekosistem belajar dari event, progres reading, dan bank kosakata.
 */

import type { LearningEvent } from "@/lib/learning-events";
import type {
  EcosystemCourseMetadataItem,
  EcosystemLessonItem,
  EcosystemRecommendation,
  EcosystemReadingProgress,
  EcosystemVocabEntry,
} from "./types";
import { drillHref, normalizedLevel, safeQuery, sourceParams } from "./urls";

/**
 * Add recommendation if unique or higher priority.
 */
function pushUnique(
 items: EcosystemRecommendation[],
 recommendation: EcosystemRecommendation
) {
 const existingIndex = items.findIndex(
 (item) => item.href === recommendation.href || item.id === recommendation.id
 );
 if (existingIndex >= 0) {
 // Keep item with higher priority.
 if (recommendation.priority > items[existingIndex].priority) {
 items[existingIndex] = recommendation;
 }
 return;
 }
 items.push(recommendation);
}

/**
 * Generate recommendations from single event.
 */
function recommendationsFromEvent(event: LearningEvent): EcosystemRecommendation[] {
 const items: EcosystemRecommendation[] = [];
 const source = event.source;
 const params = sourceParams(source);
 const title = source.title || "materi ini";
 const kind = event.details?.kind;
 const sourceHref = source.href;

 // Handle reading events.
 if (source.type === "reading") {
 pushUnique(items, {
 id: `${event.id}-shadowing`,
 title: "Latih Baca Nyaring",
 description: `Ambil kalimat dari ${title} untuk shadowing.`,
 href: `/tools/shadowing?${params}`,
 category: "tool",
 priority: event.type === "reading_completed" ? 98 : 80,
 });
 pushUnique(items, {
 id: `${event.id}-analyzer`,
 title: "Bongkar Teks",
 description: "Temukan vocab, kanji, dan grammar dari bacaan terakhir.",
 href: `/tools/text-analyzer?${params}`,
 category: "tool",
 priority: 88,
 });
 }

 // Handle listening events.
 if (source.type === "listening") {
 pushUnique(items, {
 id: `${event.id}-shadowing`,
 title: "Ulangi dengan Shadowing",
 description: `Latih intonasi dari ${title}.`,
 href: `/tools/shadowing?${params}`,
 category: "tool",
 priority: event.type === "listening_completed" ? 98 : 82,
 });
 pushUnique(items, {
 id: `${event.id}-analyzer`,
 title: "Analisis Transkrip",
 description: "Buka kosakata dan pola grammar dari transkrip.",
 href: `/tools/text-analyzer?${params}`,
 category: "tool",
 priority: 84,
 });
 }

 // Handle vocabulary events.
 if (source.type === "vocab") {
 pushUnique(items, {
 id: `${event.id}-vocab-drill`,
 title: "Drill Kosakata Ini",
 description: `Tes ulang arti dan bacaan ${title}.`,
 href: drillHref(source, "vocab"),
 category: "tool",
 priority: 90,
 });
 pushUnique(items, {
 id: `${event.id}-counter`,
 title: "Cek Counter",
 description: "Latih kata bantu bilangan yang cocok jika kata ini punya konteks benda.",
 href: `/tools/counter-trainer?${params}`,
 category: "tool",
 priority: 72,
 });
 }

 // Handle kanji events.
 if (source.type === "kanji") {
 pushUnique(items, {
 id: `${event.id}-kanji-writing`,
 title: "Tulis Kanji",
 description: "Latih urutan goresan dari kanji yang baru muncul.",
 href: `/tools/writing?char=${safeQuery(source.slug || source.title || source.id)}`,
 category: "tool",
 priority: 90,
 });
 pushUnique(items, {
 id: `${event.id}-kanji-drill`,
 title: "Drill Kanji",
 description: "Uji arti dan bacaan kanji ini.",
 href: drillHref(source, "kanji"),
 category: "tool",
 priority: 82,
 });
 }

 // Handle grammar events.
 if (source.type === "grammar") {
 pushUnique(items, {
 id: `${event.id}-grammar-drill`,
 title: "Drill Grammar",
 description: `Uji pola ${title} dalam sesi singkat.`,
 href: drillHref(source, "grammar"),
 category: "tool",
 priority: 90,
 });
 }

 // Handle incorrect drill answers.
 if (event.type === "jlpt_drill_answered" && event.details?.isCorrect === false) {
 pushUnique(items, {
 id: `${event.id}-retry-drill`,
 title: "Ulangi Titik Salah",
 description: event.details.prompt
 ? `Jawaban tadi meleset pada ${event.details.prompt}.`
 : "Ulangi drill dengan tipe yang sama.",
 href: drillHref(source, kind && kind !== "mixed" ? kind : undefined),
 category: "review",
 priority: 100,
 });
 if (sourceHref) {
 pushUnique(items, {
 id: `${event.id}-open-source`,
 title: "Buka Sumber",
 description: "Balik sebentar ke materi asal untuk menguatkan konteks.",
 href: sourceHref,
 category: "library",
 priority: 94,
 });
 }
 }

 // Handle incorrect counter answers.
 if (event.type === "counter_answered" && event.details?.isCorrect === false) {
 pushUnique(items, {
 id: `${event.id}-counter-retry`,
 title: "Ulangi Counter",
 description: "Perkuat kategori counter yang baru salah.",
 href: `/tools/counter-trainer?${params}`,
 category: "review",
 priority: 98,
 });
 }

 // Handle incorrect conjugation checks.
 if (event.type === "conjugation_checked" && event.details?.isCorrect === false) {
 const params = new URLSearchParams();
 if (event.details.prompt) params.set("verb", event.details.prompt);
 if (event.details.focus) params.set("group", event.details.focus);
 if (event.details.text) params.set("form", event.details.text);
 if (source.title) params.set("sourceTitle", source.title);
 if (source.href) params.set("sourceHref", source.href);

 pushUnique(items, {
 id: `${event.id}-conjugation-retry`,
 title: "Ulangi Konjugasi",
 description: "Jawaban bentuk kata kerja belum tepat. Coba target bentuk ini lagi.",
 href: `/tools/conjugation?${params.toString()}`,
 category: "review",
 priority: 98,
 });
 if (source.href) {
 pushUnique(items, {
 id: `${event.id}-conjugation-source`,
 title: "Buka Vocab",
 description: "Balik ke detail kata untuk melihat bentuk dan contoh.",
 href: source.href,
 category: "library",
 priority: 76,
 });
 }
 }

 // Handle low accuracy drill sessions.
 if (
 event.type === "jlpt_drill_completed" &&
 typeof event.metrics?.accuracy === "number" &&
 event.metrics.accuracy < 80
 ) {
 pushUnique(items, {
 id: `${event.id}-accuracy-retry`,
 title: "Perbaiki Akurasi",
 description: `Akurasi sesi ${event.metrics.accuracy}%. Ulangi dengan set kecil.`,
 href: drillHref(source, kind && kind !== "mixed" ? kind : undefined),
 category: "review",
 priority: 96,
 });
 }

 // Handle shadowing recordings.
 if (event.type === "shadowing_recorded") {
 pushUnique(items, {
 id: `${event.id}-shadowing-again`,
 title: "Rekam Sekali Lagi",
 description: "Bandingkan tempo baru dengan target.",
 href: `/tools/shadowing?${params}`,
 category: "review",
 priority: 86,
 });
 if (sourceHref) {
 pushUnique(items, {
 id: `${event.id}-source`,
 title: "Buka Materi Asal",
 description: "Dengar atau baca ulang sumber kalimat shadowing.",
 href: sourceHref,
 category: "library",
 priority: 76,
 });
 }
 }

 return items;
}

/**
 * Generate recommendations from active reading progress.
 */
function recommendationsFromReadingProgress(
 readingProgressMap: Record<string, EcosystemReadingProgress>
): EcosystemRecommendation[] {
 return Object.values(readingProgressMap)
 .filter((entry) => !entry.completedAt && entry.totalParagraphs > 0)
 .sort((a, b) => b.updatedAt - a.updatedAt)
 .slice(0, 2)
 .map((entry) => ({
 id: `continue-reading-${entry.sourceId}`,
 title: "Lanjutkan Reading",
 description: `Terakhir di paragraf ${entry.lastParagraphIndex + 1}/${entry.totalParagraphs}.`,
 href: `/library/reading/${safeQuery(entry.sourceId)}`,
 category: "continue" as const,
 priority: 78,
 }));
}

/**
 * Generate recommendations from vocabulary bank.
 */
function recommendationsFromVocabBank(
 bank: Record<string, EcosystemVocabEntry>
): EcosystemRecommendation[] {
 return Object.values(bank)
 .filter((entry) => entry.slug || entry.jlpt)
 .sort((a, b) => b.hitCount - a.hitCount)
 .slice(0, 2)
 .map((entry, index) => {
 const level = normalizedLevel(entry.jlpt);
 const params = new URLSearchParams({
 source: "vocab",
 slug: entry.slug || entry.word,
 });
 if (level) params.set("level", level);

 return {
 id: `vocab-bank-${entry.slug || entry.word}-${index}`,
 title: "Ubah Kata Jadi Latihan",
 description: `${entry.word} sering muncul di reading kamu.`,
 href: `/tools/jlpt-drill?kind=vocab&${params.toString()}`,
 category: "tool" as const,
 priority: 74 - index,
 };
 });
}

/**
 * Build list of ecosystem recommendations.
 */
export function buildEcosystemRecommendations({
 events,
 readingProgressMap,
 readingVocabularyBank,
 completedLessons,
 courseMetadata,
 limit = 5,
}: {
 events: LearningEvent[];
 readingProgressMap?: Record<string, EcosystemReadingProgress>;
 readingVocabularyBank?: Record<string, EcosystemVocabEntry>;
 completedLessons?: Record<string, { completedAt: number; updatedAt: number }>;
 courseMetadata?: EcosystemCourseMetadataItem[];
 limit?: number;
}) {
 const recommendations: EcosystemRecommendation[] = [];
 
 const safeCompletedLessons = completedLessons || {};
 // Suntikkan rekomendasi pelajaran aktif berikutnya jika ada data kurikulum
 if (courseMetadata && courseMetadata.length > 0) {
 // Cek prioritas aksara dasar (Hiragana, Katakana, & Kanji) sebelum melanjutkan materi pelajaran utama
 let activeLesson: EcosystemLessonItem | undefined;
 let activeCategorySlug = "";
 let activeCategoryTitle = "";

 const articlesCategory = courseMetadata.find(c => c.slug === "articles");
 const hiraganaArticle = articlesCategory?.lessons?.find((l: EcosystemLessonItem) => l.slug === "panduan-lengkap-hiragana");
 const katakanaArticle = articlesCategory?.lessons?.find((l: EcosystemLessonItem) => l.slug === "panduan-lengkap-katakana");
 const kanjiArticle = articlesCategory?.lessons?.find((l: EcosystemLessonItem) => l.slug === "mengenal-kanji-sistem-tulisan-ketiga");

 const hasCompletedHiragana = hiraganaArticle && safeCompletedLessons[hiraganaArticle.id || hiraganaArticle._id || '']?.completedAt;
 const hasCompletedKatakana = katakanaArticle && safeCompletedLessons[katakanaArticle.id || katakanaArticle._id || '']?.completedAt;
 const hasCompletedKanji = kanjiArticle && safeCompletedLessons[kanjiArticle.id || kanjiArticle._id || '']?.completedAt;

 if (hiraganaArticle && !hasCompletedHiragana) {
 activeLesson = hiraganaArticle;
 activeCategorySlug = "articles";
 activeCategoryTitle = "Panduan Aksara";
 } else if (katakanaArticle && !hasCompletedKatakana) {
 activeLesson = katakanaArticle;
 activeCategorySlug = "articles";
 activeCategoryTitle = "Panduan Aksara";
 } else if (kanjiArticle && !hasCompletedKanji) {
 activeLesson = kanjiArticle;
 activeCategorySlug = "articles";
 activeCategoryTitle = "Panduan Aksara";
 }

 let isNew = false;
 if (!activeLesson) {
 // Jika aksara dasar sudah dikuasai, baru lakukan pencarian progres kelas pelajaran utama (N5-N1)
 const stats = courseMetadata
 .filter(c => c.slug !== "articles") // Kecualikan kategori artikel umum
 .map((cat: EcosystemCourseMetadataItem) => {
 const lessons = cat.lessons || [];
 const completedInCat = lessons.filter((lesson: EcosystemLessonItem) => {
 const record = safeCompletedLessons[lesson.id || lesson._id || ''];
 return record && record.completedAt;
 });
 const totalLessons = lessons.length;
 const progress = totalLessons > 0 ? (completedInCat.length / totalLessons) * 100 : 0;
 const lastUpdate = lessons.reduce((max: number, lesson: EcosystemLessonItem) => {
 const ts = safeCompletedLessons[lesson.id || lesson._id || '']?.updatedAt || 0;
 return ts > max ? ts : max;
 }, 0);
 return { ...cat, lessons, progress, lastUpdate, completedCount: completedInCat.length, totalLessons };
 });

 let active: typeof stats[number] | undefined = stats
 .filter(s => s.progress > 0 && s.progress < 100)
 .sort((a, b) => b.lastUpdate - a.lastUpdate)[0];

 if (!active) {
 active = stats.find(s => s.progress < 100);
 }

 if (active && active.lessons && active.lessons.length > 0) {
 const nextLessonIndex = active.lessons.findIndex((l: EcosystemLessonItem) => !safeCompletedLessons[l.id || l._id || '']?.completedAt);
 activeLesson = active.lessons[nextLessonIndex] || active.lessons[0];
 activeCategorySlug = active.slug;
 activeCategoryTitle = active.title || 'JLPT';
 
 const completedCount = Object.values(safeCompletedLessons).filter((l) => (l as { completedAt?: unknown })?.completedAt).length;
 isNew = completedCount === 0;
 }
 } else {
 isNew = true; // Rekomendasi aksara dasar dianggap onboarding baru bagi pengguna
 }

 if (activeLesson && activeCategorySlug) {
 recommendations.push({
 id: `active-lesson-${activeLesson.id || activeLesson._id}`,
 title: isNew ? `Mulai: ${activeLesson.title}` : `Lanjut: ${activeLesson.title}`,
 description: isNew
 ? `Mulai belajar bab pertama tingkat ${activeCategoryTitle}. (Ubah tingkat di menu Materi)`
 : `Pelajaran aktif selanjutnya di tingkat ${activeCategoryTitle}.`,
 href: `/courses/${activeCategorySlug}/${activeLesson.slug}`,
 category: "continue" as const,
 priority: 200 // Prioritas tertinggi mutlak
 });

 // Tambahkan kuis pelajaran aktif jika bukan artikel
 if (!activeCategorySlug.includes("articles")) {
 const cleanTitle = activeLesson.title.replace("Mulai: ", "").replace("Lanjut: ", "");
 recommendations.push({
 id: `active-quiz-${activeLesson.id || activeLesson._id}`,
 title: `Kuis: ${cleanTitle}`,
 description: `Uji pemahamanmu untuk materi ${cleanTitle}.`,
 href: `/courses/${activeCategorySlug}/${activeLesson.slug}#quiz`,
 category: "tool" as const,
 priority: 190
 });
 }
 }
 }

 // Rekomendasikan artikel umum berikutnya yang belum dibaca dari kategori articles agar tidak terabaikan
 if (courseMetadata && courseMetadata.length > 0) {
 const articlesCategory = courseMetadata.find(c => c.slug === "articles");
 if (articlesCategory && articlesCategory.lessons) {
 const nextArticle = articlesCategory.lessons.find((l: EcosystemLessonItem) => {
 // Lewati artikel onboarding aksara karena sudah ditangani secara khusus
 if (
 l.slug === "panduan-lengkap-hiragana" ||
 l.slug === "panduan-lengkap-katakana" ||
 l.slug === "mengenal-kanji-sistem-tulisan-ketiga"
 ) {
 return false;
 }
 return !safeCompletedLessons[l.id || l._id || ""]?.completedAt;
 });

 if (nextArticle) {
 recommendations.push({
 id: `article-recommendation-${nextArticle.id || nextArticle._id}`,
 title: `Baca Artikel: ${nextArticle.title}`,
 description: nextArticle.description || nextArticle.summary || "Tinjau wawasan budaya dan tips bahasa Jepang hari ini.",
 href: `/courses/articles/${nextArticle.slug}`,
 category: "library" as const,
 priority: 110, // Berada di bawah pelajaran aktif tetapi tetap direkomendasikan
 });
 }
 }
 }

 // Tambahkan bacaan aktif yang belum selesai dari library jika ada
 const unfinishedReading = Object.values(readingProgressMap || {})
 .filter((entry) => !entry.completedAt && entry.totalParagraphs > 0)
 .sort((a, b) => b.updatedAt - a.updatedAt)[0];

 if (unfinishedReading) {
 recommendations.push({
 id: `continue-reading-${unfinishedReading.sourceId}`,
 title: "Lanjutkan Bacaan Aktif",
 description: `Mulai dari paragraf ${unfinishedReading.lastParagraphIndex + 1}/${unfinishedReading.totalParagraphs}.`,
 href: `/library/reading/${unfinishedReading.sourceId}`,
 category: "continue" as const,
 priority: 120
 });
 }

 return recommendations
 .sort((a, b) => b.priority - a.priority)
 .slice(0, limit);
}
