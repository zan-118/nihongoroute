/**
 * @file ReadingPageClient.tsx
 * @description Komponen klien interaktif untuk sesi membaca artikel (Dokkai Session).
 * Menampilkan teks bacaan dengan furigana interaktif, kosakata terkait, dan kuis pemahaman inline.
 */

"use client";

// ======================
// IMPOR
// ======================
import React, { useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Minimize2 } from "lucide-react";
import { ReadingProvider } from "@/components/features/reading/components/ReadingContext";
import { cn } from "@/lib/utils";
import { useReadingLogic } from "@/components/features/reading/hooks/useReadingLogic";
import { ReadingData } from "@/components/features/reading/types";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/useUserStore";
import { useUIStore } from "@/store/useUIStore";
import { formatQuizzes } from "@/lib/utils/lesson-utils";
import QuizEngine from "@/components/features/exams/quiz-engine/QuizEngine";

// Komponen Pendukung
import { ReadingNavbar } from "@/components/features/reading/components/ReadingNavbar";
import { ReadingSidebar } from "@/components/features/reading/components/ReadingSidebar";
import { ReadingArticle } from "@/components/features/reading/components/ReadingArticle";
import { ReadingMobileToolbar } from "@/components/features/reading/components/ReadingMobileToolbar";

// ======================
// TIPE DATA
// ======================
interface ReadingPageClientProps {
  data: ReadingData;
}

// ======================
// EKSEKUSI UTAMA
// ======================

function ReadingPageContent({ data }: ReadingPageClientProps) {
  const {
    mode,
    showTranslation,
    paragraphs,
    hiraganaParagraphs,
    romajiParagraphs,
    translationParagraphs,
    modes,
    toggleTranslation,
    setMode,
  } = useReadingLogic(data);

  const completeLesson = useUserStore((state) => state.completeLesson);
  const addXP = useUserStore((state) => state.addXP);
  const completedLessons = useUserStore((state) => state.completedLessons);

  const lessonId = data._id || data.id || "";
  const [isLocallyCompleted, setIsLocallyCompleted] = useState(false);
  const isCompleted = !!(lessonId && completedLessons[lessonId]) || isLocallyCompleted;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedQuizzes = data.quizzes ? formatQuizzes(data.quizzes as any) : [];
  const hasQuiz = formattedQuizzes.length > 0;

  const handleComplete = () => {
    if (!lessonId || isCompleted) return;
    setIsLocallyCompleted(true);
    addXP(100);
    completeLesson(lessonId);

    useUIStore.getState().addNotification({
      title: "Materi Selesai!",
      message: "Selamat! Anda mendapatkan +100 XP dari membaca.",
      type: "success",
    });
  };

  const [isZenMode, setIsZenMode] = useState(false);
  const [fontSize, setFontSize] = useState<"standard" | "large" | "extra">("large");

  const toggleFontSize = () => {
    setFontSize((prev) =>
      prev === "standard" ? "large" : prev === "large" ? "extra" : "standard"
    );
  };

  return (
    <div
      className={cn(
        "min-h-screen transition-all duration-700 relative",
        isZenMode ? "bg-background pb-20" : "bg-background/95 pb-40"
      )}
    >
      {/* Pancaran Latar Belakang Imersif */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] size-[60%] bg-primary/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] size-[60%] bg-success/5 blur-[150px] rounded-full animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--foreground-rgb),0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--foreground-rgb),0.01)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none opacity-20" />
      </div>

      {/* Bilah Navigasi Atas */}
      <AnimatePresence>
        {!isZenMode && (
          <ReadingNavbar
            title={data.title}
            difficulty={data.difficulty}
            mode={mode}
            modes={modes}
            onModeChange={(id) =>
              setMode(id as "kanji" | "furigana" | "romaji" | "hiragana")
            }
            onZenModeToggle={() => setIsZenMode(true)}
          />
        )}
      </AnimatePresence>

      {/* Tombol Melayang Keluar untuk Mode Zen */}
      <AnimatePresence>
        {isZenMode && (
          <m.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="fixed top-8 right-8 z-[100]"
          >
            <Button
              size="lg"
              className="rounded-full size-14 bg-background/80 backdrop-blur-xl border border-border shadow-2xl group hover:border-primary/40 transition-all"
              onClick={() => setIsZenMode(false)}
              aria-label="Keluar Mode Zen"
            >
              <Minimize2
                size={24}
                className="text-muted-foreground group-hover:text-primary transition-colors"
              />
            </Button>
          </m.div>
        )}
      </AnimatePresence>

      {/* Kontainer Membaca Utama */}
      <div
        className={cn(
          "max-w-4xl mx-auto px-6 relative z-10 transition-all duration-1000",
          isZenMode ? "pt-24 md:pt-40" : "pt-32 md:pt-48"
        )}
      >
        {/* Dekorasi Header Imersif */}
        {!isZenMode && (
          <div className="flex flex-col items-center mb-24 md:mb-32 text-center">
            <div className="flex items-center gap-3 mb-8">
              <div className="size-1.5 rounded-full bg-primary animate-ping" />
              <span className="text-primary font-black text-[10px] md:text-xs uppercase tracking-[0.4em]">
                Graded Reading Experience
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-[0.9] mb-12 max-w-3xl drop-shadow-2xl">
              {data.title}
            </h1>
            <div className="h-1.5 w-32 bg-gradient-to-r from-primary/0 via-primary to-primary/0 rounded-full" />
          </div>
        )}

        {/* Bilah Samping Melayang untuk Audio & Pengaturan (Desktop) */}
        <ReadingSidebar
          audioUrl={data.audioUrl}
          textToSpeak={data.body as string}
          isTTSDisabled={data.isTTSDisabled}
          fontSize={fontSize}
          onFontSizeToggle={toggleFontSize}
          showTranslation={showTranslation}
          onTranslationToggle={toggleTranslation}
        />

        {/* Artikel */}
        <ReadingArticle
          paragraphs={paragraphs}
          hiraganaParagraphs={hiraganaParagraphs}
          romajiParagraphs={romajiParagraphs}
          translationParagraphs={translationParagraphs}
          mode={mode}
          fontSize={fontSize}
          showTranslation={showTranslation}
          isZenMode={isZenMode}
          onComplete={handleComplete}
          isCompleted={isCompleted}
        />

        {/* Kuis Membaca Inline — tampil setelah artikel, tanpa overlay */}
        {hasQuiz && !isZenMode && (
          <div className="mt-16">
            <div className="flex items-center gap-4 mb-10">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 shrink-0">
                Kuis Pemahaman
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>
            <div className="rounded-[2.5rem] border border-border/60 bg-card/30 backdrop-blur-xl p-6 shadow-2xl">
              <QuizEngine questions={formattedQuizzes} lessonId={lessonId} />
            </div>
          </div>
        )}
      </div>

      {/* Bilah Alat Seluler */}
      <AnimatePresence>
        {!isZenMode && (
          <ReadingMobileToolbar
            onFontSizeToggle={toggleFontSize}
            showTranslation={showTranslation}
            onTranslationToggle={toggleTranslation}
            audioUrl={data.audioUrl}
            textToSpeak={typeof data.body === "string" ? data.body : undefined}
            isTTSDisabled={data.isTTSDisabled}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Komponen utama ReadingPageClient: Menyediakan modul pembaca graded reading interaktif
 * dengan fitur Furigana/Romaji switcher, popup kamus klik-kata, audio sinkronisasi, dan mode Zen.
 *
 * @param {ReadingPageClientProps} props Properti komponen graded reading.
 * @returns {JSX.Element} Antarmuka graded reading terbungkus provider konteks.
 */
export default function ReadingPageClient({ data }: ReadingPageClientProps) {
  return (
    <ReadingProvider>
      <ReadingPageContent data={data} />
    </ReadingProvider>
  );
}
