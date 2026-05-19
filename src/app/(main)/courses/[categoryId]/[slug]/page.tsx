/**
 * @file page.tsx
 * @description Halaman ruang kelas dinamis untuk materi pembelajaran tunggal.
 * Menangani Portable Text, Kuis, Audio, dan modul SRS.
 * @module LessonPage
 */

import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import QuizEngine from "@/components/features/exams/quiz-engine/QuizEngine";
import ContentBlockRenderer from "@/components/features/lessons/ContentBlockRenderer";

// Extracted Components
import { LessonHeader } from "@/components/features/lessons/LessonHeader";
import { VocabSection } from "@/components/features/lessons/VocabSection";
import { KanjiSection } from "@/components/features/lessons/KanjiSection";
import { DialogueSection } from "@/components/features/lessons/DialogueSection";
import { ReadingSection } from "@/components/features/lessons/ReadingSection";
import { CheatsheetSection } from "@/components/features/lessons/CheatsheetSection";
import { PracticeSection } from "@/components/features/lessons/PracticeSection";
import { LessonNavigation } from "@/components/features/lessons/LessonNavigation";
import { MarkCompleteButton } from "@/components/features/lessons/MarkCompleteButton";

// Database & Utils
import { createClient } from "@/lib/supabase/server";
import { getLibraryItemBySlug } from "@/actions/library.actions";
import { formatQuizzes, getLessonNavigation } from "@/lib/utils/lesson-utils";
import { getSanityLessonsByCategory } from "@/lib/queries";

interface Props {
  params: Promise<{ categoryId: string; slug: string }>;
}

/**
 * Menarik data materi lengkap secara paralel.
 */
async function getLessonData(categoryId: string, slug: string) {
  const supabase = await createClient();
  
  // 1. Fetch Category & Lesson in parallel
  const [categoryRes, lesson] = await Promise.all([
    supabase
      .from("course_categories")
      .select("id, title, type")
      .eq("slug", categoryId)
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

  // 2. Get Navigation (depends on category.id)
  const nav = await getSanityLessonsByCategory(categoryId, category.id);

  return { lesson, nav };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoryId, slug } = await params;
  const decodedCategoryId = decodeURIComponent(categoryId);
  const decodedSlug = decodeURIComponent(slug);

  const data = await getLessonData(decodedCategoryId, decodedSlug);
  const lesson = data?.lesson;
  if (!lesson) return { title: "Pelajaran Tidak Ditemukan | NihongoRoute" };
  return {
    title: lesson.seoTitle ?? `${lesson.title} | NihongoRoute`,
    description: lesson.seoDescription ?? lesson.summary,
  };
}

export default async function LessonPage({ params }: Props) {
  const { categoryId, slug } = await params;
  const decodedCategoryId = decodeURIComponent(categoryId);
  const decodedSlug = decodeURIComponent(slug);

  const data = await getLessonData(decodedCategoryId, decodedSlug);
  const lesson = data?.lesson;
  const nav = data?.nav || [];

  if (!lesson) return notFound();

  const { prevLesson, nextLesson } = getLessonNavigation(nav, slug);
  const isSideQuest = lesson.categoryType === "general";
  const formattedQuizzes = formatQuizzes(lesson.quizzes || lesson.questions || []);

  return (
    <div className="w-full text-foreground px-4 md:px-8 relative overflow-hidden flex flex-col flex-1 transition-colors duration-300">
      {/* Background Ambient Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col flex-1">
        <article className="flex-1 min-w-0">
          <LessonHeader 
            title={lesson.title} 
            summary={lesson.summary} 
            isSideQuest={isSideQuest} 
            lesson={lesson} 
          />

          <div className="space-y-24 mb-24">
            {(lesson.articles || lesson.content_blocks) && (
              <section className="prose-custom">
                <ContentBlockRenderer 
                  blocks={lesson.articles || lesson.content_blocks} 
                  vocabList={lesson.vocabList || lesson.vocab_list}
                  kanjiList={lesson.kanjiList || lesson.kanji_list}
                />
              </section>
            )}

            <DialogueSection listeningList={lesson.listeningList || lesson.listening_list} />

            <ReadingSection readingList={lesson.readingList || lesson.reading_list} />

            <CheatsheetSection cheatsheets={lesson.cheatsheets} />

            <PracticeSection lesson={lesson} />

            {formattedQuizzes.length > 0 ? (
              <section>
                <div className="flex items-center gap-4 mb-10">
                  <h2 className="text-xl font-black uppercase tracking-tight text-foreground flex items-center gap-3">
                    <span className="text-2xl">答え</span> Uji Pemahaman
                  </h2>
                  <div className="h-[1px] flex-1 bg-border" />
                </div>
                <QuizEngine questions={formattedQuizzes} lessonId={lesson._id || lesson.id} />
              </section>
            ) : (
              <section className="flex justify-center my-12">
                <MarkCompleteButton 
                  lessonId={lesson._id || lesson.id} 
                  nextLessonSlug={nextLesson?.slug}
                  categoryId={categoryId}
                />
              </section>
            )}
          </div>

          <LessonNavigation 
            prevLesson={prevLesson} 
            nextLesson={nextLesson} 
            levelCode={lesson.levelCode} 
            categoryId={categoryId} 
          />

          <footer className="mt-20 pt-10 border-t border-border/50 text-center">
            <p className="text-muted-foreground text-xs">
              &copy; {new Date().getFullYear()} NihongoRoute. All rights reserved.
            </p>
          </footer>
        </article>
      </div>
    </div>
  );
}
