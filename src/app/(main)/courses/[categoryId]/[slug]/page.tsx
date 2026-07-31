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
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { FileText, Book, Edit, MessageSquare, BookOpen, Lightbulb, GraduationCap } from "@/components/ui/icons";

import QuizEngine from "@/features/exams/components/quiz-engine/QuizEngine";
import ContentBlockRenderer from "@/components/features/lessons/ContentBlockRenderer";

// Komponen Modular
import { LessonHeader } from "@/components/features/lessons/LessonHeader";
import { IllustrationGallery } from "@/components/ui/IllustrationGallery";
import { VocabSection } from "@/components/features/lessons/VocabSection";
import { KanjiSection } from "@/components/features/lessons/KanjiSection";
import { DialogueSection } from "@/components/features/lessons/DialogueSection";
import { PracticeSection } from "@/components/features/lessons/PracticeSection";
import { LessonNavigation } from "@/components/features/lessons/LessonNavigation";
import { MarkCompleteButton } from "@/components/features/lessons/MarkCompleteButton";

// Integrasi Database & Utilitas
import { getLessonData, getLessonStaticParams } from "@/actions/lessons.actions";
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

/**
 * Route parameters for the dynamic lesson page.
 */
interface Props {
  params: Promise<{ categoryId: string; slug: string }>;
}



// ======================
// METADATA SEO
// ======================

/**
 * Generates dynamic SEO metadata for the lesson page.
 *
 * @param props - Component properties containing route parameters.
 * @returns Metadata object for Next.js.
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

export const dynamicParams = true;
export const revalidate = 3600;

/**
 * Generate static params for lesson/course detail pages (ISR).
 */
export async function generateStaticParams() {
  return await getLessonStaticParams(100);
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Dynamic lesson page component.
 * Renders content blocks, vocabulary, kanji, dialogues, readings, cheatsheets, and quizzes.
 *
 * @param props - Component properties containing route parameters.
 */
export default async function LessonPage({ params }: Props) {
  const { categoryId, slug } = await params;
  // Decode URL parameters to handle special characters.
  const decodedCategoryId = decodeURIComponent(categoryId);
  const decodedSlug = decodeURIComponent(slug);

  const data = await getLessonData(decodedCategoryId, decodedSlug);
  const lesson = data?.lesson;
  const nav = data?.nav || [];

  if (!lesson) return notFound();

  const { prevLesson, nextLesson } = getLessonNavigation(nav, slug);
  // Determine if lesson is a general article or structured course unit.
  const isSideQuest = lesson.categoryType === "general" || lesson.categoryType === "article";
  const formattedQuizzes = formatQuizzes(lesson.quizzes || lesson.questions || []);
  const lessonPath = `/courses/${encodeRouteSegment(decodedCategoryId)}/${encodeRouteSegment(decodedSlug)}`;

  // Cast lists to unknown first to bypass strict type checking.
  const vocabList = (lesson.vocabList || lesson.vocab_list || []) as unknown[];
  const kanjiList = (lesson.kanjiList || lesson.kanji_list || []) as unknown[];
  const listeningList = (lesson.listeningList || lesson.listening_list || []) as unknown[];
  const readingList = (lesson.readingList || lesson.reading_list || []) as unknown[];

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
      <div className="absolute top-0 right-0 size-[360px] bg-primary/5 blur-[65px] rounded-full pointer-events-none ambient-glow will-change-transform" />
      <div className="absolute bottom-0 left-0 size-[300px] bg-secondary/5 blur-[55px] rounded-full pointer-events-none ambient-glow will-change-transform" />

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
            const linkCls = "px-3.5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider bg-muted/40 dark:bg-card/40 border border-border/60 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 whitespace-nowrap shrink-0 flex items-center gap-1.5 group";
            // Generate jump links dynamically based on content availability.
            const jumpLinks: { href: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; show: boolean }[] = [
              { href: "#article-content", label: "Artikel", icon: FileText, show: !!lesson.articles },
              { href: "#vocabulary", label: "Kosakata", icon: Book, show: vocabList.length > 0 },
              { href: "#kanji", label: "Kanji", icon: GraduationCap, show: kanjiList.length > 0 },
              { href: "#scenario", label: "Dialog", icon: MessageSquare, show: listeningList.length > 0 },
              { href: "#quiz", label: "Kuis", icon: Edit, show: formattedQuizzes.length > 0 },
            ].filter((l) => l.show);
            if (jumpLinks.length === 0) return null;
            return (
              <nav className="sticky top-4 z-40 mb-10 py-3.5 px-1 rounded-2xl bg-background/70 border border-border/60 shadow-lg glass backdrop-blur-md">
                <div className="flex gap-2 items-center overflow-x-auto scrollbar-none px-3">
                  <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/70 shrink-0 mr-1 hidden sm:inline-block">Pintasan:</span>
                  {jumpLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <a key={link.href} href={link.href} className={linkCls}>
                        <Icon size={12} className="text-muted-foreground group-hover:text-primary transition-colors" />
                        <span>{link.label}</span>
                      </a>
                    );
                  })}
                </div>
              </nav>
            );
          })()}

          <div className="space-y-14 md:space-y-20 mb-16 md:mb-24">
            {!!lesson.articles && (
              <section id="article-content" className="prose-custom">
                <ContentBlockRenderer
                  blocks={lesson.articles as import("@/types/database").ContentBlock[]}
                  vocabList={(lesson.vocabList || lesson.vocab_list || []) as import("@/components/features/lessons/VocabSection").VocabLessonItem[]}
                  kanjiList={(lesson.kanjiList || lesson.kanji_list || []) as import("@/components/features/lessons/KanjiSection").KanjiLessonItem[]}
                />
              </section>
            )}

            <DialogueSection listeningList={(lesson.listeningList || lesson.listening_list || []) as import("@/components/features/lessons/DialogueSection").DialogueItem[]} />

            <PracticeSection lesson={lesson as import("@/components/features/lessons/PracticeSection").LessonPracticeData} />

            {/* Render quiz engine if questions exist, otherwise show completion button. */}
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