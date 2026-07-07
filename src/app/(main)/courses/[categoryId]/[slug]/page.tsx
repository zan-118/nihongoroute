/**
 * @file page.tsx
 * @description Halaman ruang kelas dinamis untuk materi pembelajaran tunggal.
 * Menangani Portable Text, Kuis, Audio, dan modul SRS.
 * @module LessonPage
 */

// ======================
// IMPOR
// ======================
import React from "react";
import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";

import QuizEngine from "@/components/features/exams/quiz-engine/QuizEngine";
import ContentBlockRenderer from "@/components/features/lessons/ContentBlockRenderer";

// Komponen Modular
import { LessonHeader } from "@/components/features/lessons/LessonHeader";
import { IllustrationGallery } from "@/components/ui/IllustrationGallery";
import { VocabSection } from "@/components/features/lessons/VocabSection";
import { KanjiSection } from "@/components/features/lessons/KanjiSection";
import { DialogueSection } from "@/components/features/lessons/DialogueSection";
import { ReadingSection } from "@/components/features/lessons/ReadingSection";
import { CheatsheetSection } from "@/components/features/lessons/CheatsheetSection";
import { PracticeSection } from "@/components/features/lessons/PracticeSection";
import { LessonNavigation } from "@/components/features/lessons/LessonNavigation";
import { MarkCompleteButton } from "@/components/features/lessons/MarkCompleteButton";

// Integrasi Database & Utilitas
import { createClient } from "@/lib/supabase/server";
import { getLibraryItemBySlug } from "@/actions/library.actions";
import { formatQuizzes, getLessonNavigation } from "@/lib/utils/lesson-utils";
import {
  breadcrumbJsonLd,
  createPageMetadata,
  encodeRouteSegment,
  learningResourceJsonLd,
} from "@/lib/seo";

// ======================
// TIPE DATA
// ======================
interface Props {
  params: Promise<{ categoryId: string; slug: string }>;
}

// ======================
// FUNGSI PEMBANTU
// ======================

/**
 * Menarik data materi lengkap secara paralel dari Supabase dan Sanity CMS.
 *
 * @param {string} categoryId Slug ID kategori kursus.
 * @param {string} slug Slug materi pelajaran.
 */
const getLessonData = cache(async (categoryId: string, slug: string) => {
  const supabase = await createClient();

  // 1. Ambil Kategori & Pelajaran secara paralel
  const [categoryRes, lesson] = await Promise.all([
    supabase
      .from("course_categories")
      .select("id, title, type")
      .eq("slug", categoryId.toLowerCase())
      .single(),
    getLibraryItemBySlug("lessons", slug)
  ]);

  const category = categoryRes.data;
  if (!category) return null;

  if (lesson) {
    lesson.levelTitle = category.title;
    lesson.categoryType = category.type;
    lesson.levelCode = categoryId;
  }

  // 2. Dapatkan Navigasi (gabungkan Supabase & Sanity)
  let dbLessons = [];
  if (category.type === "general" || category.type === "article") {
    const { data } = await supabase
      .from("articles")
      .select("id, title, slug, category_id, order_number, summary")
      .eq("category_id", category.id)
      .order("order_number", { ascending: true });
    dbLessons = data || [];
  } else {
    const { data } = await supabase
      .from("lessons")
      .select("id, title, slug, category_id, order_number, summary")
      .eq("category_id", category.id)
      .order("order_number", { ascending: true });
    dbLessons = data || [];
  }

  const supabaseLessons = dbLessons.map((l) => ({
    _id: l.id,
    title: l.title,
    slug: l.slug,
    category_id: l.category_id,
    order_number: l.order_number,
    summary: l.summary
  }));

  const nav = supabaseLessons.sort((a, b) => (a.order_number || 0) - (b.order_number || 0));

  return { lesson, nav };
});

// ======================
// METADATA SEO
// ======================

/**
 * Menghasilkan metadata SEO dinamis untuk halaman detail materi pelajaran.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoryId, slug } = await params;
  const decodedCategoryId = decodeURIComponent(categoryId);
  const decodedSlug = decodeURIComponent(slug);

  const data = await getLessonData(decodedCategoryId, decodedSlug);
  const lesson = data?.lesson;
  if (!lesson) return { title: "Pelajaran Tidak Ditemukan | NihongoRoute" };

  return createPageMetadata({
    title: lesson.seoTitle ?? `${lesson.title} | NihongoRoute`,
    description:
      lesson.seoDescription ??
      lesson.summary ??
      `Pelajari materi bahasa Jepang ${lesson.title} di NihongoRoute.`,
    path: `/courses/${encodeRouteSegment(decodedCategoryId)}/${encodeRouteSegment(decodedSlug)}`,
    type: "article",
    keywords: [
      String(lesson.title || ""),
      String(lesson.levelTitle || decodedCategoryId).toUpperCase(),
      "materi bahasa Jepang",
      "belajar JLPT",
    ].filter(Boolean),
  });
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Halaman utama ruang kelas pelajaran untuk menyajikan Portable Text materi, dialog menyimak, bacaan, dan kuis uji pemahaman.
 */
export default async function LessonPage({ params }: Props) {
  const { categoryId, slug } = await params;
  const decodedCategoryId = decodeURIComponent(categoryId);
  const decodedSlug = decodeURIComponent(slug);

  const data = await getLessonData(decodedCategoryId, decodedSlug);
  const lesson = data?.lesson;
  const nav = data?.nav || [];

  if (!lesson) return notFound();

  const { prevLesson, nextLesson } = getLessonNavigation(nav, slug);
  const isSideQuest = lesson.categoryType === "general" || lesson.categoryType === "article";
  const formattedQuizzes = formatQuizzes(lesson.quizzes || lesson.questions || []);
  const lessonPath = `/courses/${encodeRouteSegment(decodedCategoryId)}/${encodeRouteSegment(decodedSlug)}`;

  const vocabList = (lesson.vocabList || lesson.vocab_list || []) as unknown[];
  const kanjiList = (lesson.kanjiList || lesson.kanji_list || []) as unknown[];
  const listeningList = (lesson.listeningList || lesson.listening_list || []) as unknown[];
  const readingList = (lesson.readingList || lesson.reading_list || []) as unknown[];
  const cheatsheets = (lesson.cheatsheets || []) as unknown[];

  return (
    <>
    <JsonLd
      data={[
        breadcrumbJsonLd([
          { name: "Beranda", path: "/" },
          { name: "Rute Belajar", path: "/courses" },
          { name: String(lesson.levelTitle || decodedCategoryId), path: `/courses/${encodeRouteSegment(decodedCategoryId)}` },
          { name: String(lesson.title || "Pelajaran"), path: lessonPath },
        ]),
        learningResourceJsonLd({
          name: String(lesson.title || "Pelajaran NihongoRoute"),
          description:
            String(lesson.summary || lesson.seoDescription || `Materi belajar bahasa Jepang ${lesson.title}.`),
          path: lessonPath,
          educationalLevel: String(lesson.levelTitle || decodedCategoryId).toUpperCase(),
          teaches: [
            ...(vocabList.length ? ["Kosakata bahasa Jepang"] : []),
            ...(kanjiList.length ? ["Kanji"] : []),
            ...(readingList.length ? ["Membaca bahasa Jepang"] : []),
            ...(listeningList.length ? ["Menyimak bahasa Jepang"] : []),
          ],
          timeRequired:
            typeof lesson.estimated_minutes === "number"
              ? `PT${lesson.estimated_minutes}M`
              : null,
        }),
      ]}
    />
    <div className="w-full text-foreground px-4 md:px-8 relative overflow-hidden flex flex-col flex-1 transition-colors duration-300">
      {/* Dekorasi Ambient Latar Belakang */}
      <div className="absolute top-0 right-0 size-[360px] bg-primary/5 blur-[65px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 size-[300px] bg-secondary/5 blur-[55px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col flex-1">
        <article className="flex-1 min-w-0">
          <LessonHeader
            title={lesson.title || ""}
            summary={lesson.summary || ""}
            isSideQuest={isSideQuest}
            lesson={lesson as import("@/components/features/lessons/DownloadOfflineButton").LessonData}
          />

          {/* Ilustrasi Pelajaran */}
          {(lesson.image_url || lesson.imageUrl) && (
            <div className="mb-10">
              <IllustrationGallery
                fallbackImage={lesson.image_url || lesson.imageUrl || undefined}
                title={lesson.title || undefined}
              />
            </div>
          )}

          {/* JUMP LINKS SHORTCUT MENU */}
          {(() => {
            const linkCls = "px-3.5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider bg-muted/40 dark:bg-card/40 border border-border/60 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 whitespace-nowrap shrink-0 flex items-center gap-1.5";
            const jumpLinks: { href: string; label: string; show: boolean }[] = [
              { href: "#article-content", label: "📄 Artikel", show: !!(lesson.articles || lesson.content_blocks) },
              { href: "#vocabulary", label: "📖 Kosakata", show: vocabList.length > 0 },
              { href: "#kanji", label: "🖌️ Kanji", show: kanjiList.length > 0 },
              { href: "#scenario", label: "💬 Dialog", show: listeningList.length > 0 },
              { href: "#reading", label: "📚 Bacaan", show: readingList.length > 0 },
              { href: "#cheatsheet", label: "💡 Referensi", show: cheatsheets.length > 0 },
              { href: "#quiz", label: "✏️ Kuis", show: formattedQuizzes.length > 0 },
            ].filter((l) => l.show);
            if (jumpLinks.length === 0) return null;
            return (
              <nav className="sticky top-4 z-40 mb-10 py-3.5 px-1 rounded-2xl bg-background/70 border border-border/60 shadow-lg glass backdrop-blur-md">
                <div className="flex gap-2 items-center overflow-x-auto scrollbar-none px-3">
                  <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/70 shrink-0 mr-1 hidden sm:inline-block">Pintasan:</span>
                  {jumpLinks.map((link) => (
                    <a key={link.href} href={link.href} className={linkCls}>
                      {link.label}
                    </a>
                  ))}
                </div>
              </nav>
            );
          })()}

          <div className="space-y-14 md:space-y-20 mb-16 md:mb-24">
            {!!(lesson.articles || lesson.content_blocks) && (
              <section id="article-content" className="prose-custom">
                <ContentBlockRenderer
                  blocks={(lesson.articles || lesson.content_blocks) as import("@/types/database").ContentBlock[]}
                  vocabList={(lesson.vocabList || lesson.vocab_list || []) as import("@/components/features/lessons/VocabSection").VocabLessonItem[]}
                  kanjiList={(lesson.kanjiList || lesson.kanji_list || []) as import("@/components/features/lessons/KanjiSection").KanjiLessonItem[]}
                />
              </section>
            )}

            <DialogueSection listeningList={(lesson.listeningList || lesson.listening_list || []) as import("@/components/features/lessons/DialogueSection").DialogueItem[]} />

            <ReadingSection readingList={(lesson.readingList || lesson.reading_list || []) as import("@/components/features/lessons/ReadingSection").ReadingLessonItem[]} />

            <CheatsheetSection cheatsheets={(lesson.cheatsheets || []) as import("@/components/features/lessons/CheatsheetSection").CheatsheetData[]} />

            <PracticeSection lesson={lesson as import("@/components/features/lessons/PracticeSection").LessonPracticeData} />

            {formattedQuizzes.length > 0 ? (
              <section id="quiz">
                <div className="flex items-center gap-4 mb-10">
                  <h2 className="text-xl uppercase tracking-tight text-foreground flex items-center gap-3">
                    <span className="text-2xl">答え</span> Uji Pemahaman
                  </h2>
                  <div className="h-[1px] flex-1 bg-border" />
                </div>
                <QuizEngine questions={formattedQuizzes} lessonId={lesson._id || lesson.id || ""} />
              </section>
            ) : (
              <section className="flex justify-center my-12">
                <MarkCompleteButton
                  lessonId={lesson._id || lesson.id || ""}
                  nextLessonSlug={nextLesson?.slug}
                  categoryId={categoryId}
                />
              </section>
            )}
          </div>

          <LessonNavigation
            prevLesson={prevLesson}
            nextLesson={nextLesson}
            levelCode={lesson.levelCode || ""}
            categoryId={categoryId}
          />

          <footer className="mt-14 md:mt-20 pt-8 border-t border-border/40 text-center">
            <p className="text-muted-foreground/60 text-[10px] font-medium tracking-wider uppercase" suppressHydrationWarning={true}>
              &copy; {new Date().getFullYear()} NihongoRoute
            </p>
          </footer>
        </article>
      </div>
    </div>
    </>
  );
}
