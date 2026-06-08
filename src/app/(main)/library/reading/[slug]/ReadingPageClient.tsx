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
import { Minimize2, Sparkles, Type, Languages } from "lucide-react";
import { ReadingProvider } from "@/components/features/reading/components/ReadingContext";
import { cn } from "@/lib/utils";
import { useReadingLogic } from "@/components/features/reading/hooks/useReadingLogic";
import { ReadingData } from "@/components/features/reading/types";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/useUserStore";
import { useUIStore } from "@/store/useUIStore";
import { formatQuizzes } from "@/lib/utils/lesson-utils";
import QuizEngine from "@/components/features/exams/quiz-engine/QuizEngine";
import AudioController from "@/components/features/reading/components/AudioController";

// Komponen Pendukung
import { ReadingNavbar } from "@/components/features/reading/components/ReadingNavbar";
import { ReadingArticle } from "@/components/features/reading/components/ReadingArticle";

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
        <div className="absolute inset-0 bg-[linear-gradient(rgb(var(--foreground-rgb)/0.01)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--foreground-rgb)/0.01)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none opacity-20" />
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
          isZenMode ? "pt-12 sm:pt-24 md:pt-40" : "pt-20 sm:pt-32 md:pt-48"
        )}
      >
        {/* Dekorasi Header Imersif */}
        {!isZenMode && (
          <div className="flex flex-col items-center mb-12 md:mb-24 text-center">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-1.5 rounded-full bg-primary animate-ping" />
              <span className="text-primary font-black text-[10px] md:text-xs uppercase tracking-[0.4em]">
                Graded Reading Experience
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-[1.1] md:leading-[0.9] mb-8 max-w-3xl drop-shadow-2xl">
              {data.title}
            </h1>
            <div className="h-1.5 w-32 bg-gradient-to-r from-primary/0 via-primary to-primary/0 rounded-full" />
          </div>
        )}



        {/* Panel Kontrol Premium (Notion/Medium Reader style) */}
        {!isZenMode && (
          <div className="border border-border/80 bg-card/40 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_0_50px_rgb(var(--primary-rgb)/0.03)] mb-8 flex flex-col gap-6 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">
                  Pengaturan Membaca
                </span>
              </div>
              
              {/* Pill buttons for Text & Translation Settings */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Mode Selector */}
                <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-muted/20 border border-border">
                  {modes.map((m) => (
                    <Button
                      key={m.id}
                      variant={mode === m.id ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setMode(m.id as "kanji" | "furigana" | "romaji" | "hiragana")}
                      className={cn(
                        "rounded-lg px-2.5 py-1.5 h-auto text-[10px] font-black uppercase tracking-wider transition-all",
                        mode === m.id && "shadow-md shadow-primary/20 text-primary-foreground bg-primary"
                      )}
                    >
                      {React.createElement(m.icon, { size: 12, className: "mr-1" })}
                      {m.label}
                    </Button>
                  ))}
                </div>

                {/* Font Size Selector */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/20 border border-border">
                  {(["standard", "large", "extra"] as const).map((sz) => (
                    <Button
                      key={sz}
                      variant={fontSize === sz ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setFontSize(sz)}
                      className={cn(
                        "rounded-lg px-3 py-1.5 h-auto text-[10px] font-black uppercase tracking-wider transition-all",
                        fontSize === sz && "shadow-md shadow-primary/20 text-primary-foreground bg-primary"
                      )}
                    >
                      <Type size={12} className="mr-1" />
                      {sz === "standard" ? "Standard" : sz === "large" ? "Besar" : "Ekstra"}
                    </Button>
                  ))}
                </div>

                {/* Translation Toggle */}
                <Button
                  variant={showTranslation ? "default" : "outline"}
                  size="sm"
                  onClick={toggleTranslation}
                  className={cn(
                    "rounded-xl px-4 py-1.5 h-9 text-[10px] font-black uppercase tracking-wider transition-all gap-1.5 border border-border/85",
                    showTranslation 
                      ? "bg-success hover:bg-success/90 text-success-foreground shadow-md shadow-success/20 border-transparent" 
                      : "bg-muted/10 text-muted-foreground hover:text-foreground hover:bg-muted/20"
                  )}
                >
                  <Languages size={14} />
                  <span>Terjemahan: {showTranslation ? "ON" : "OFF"}</span>
                </Button>
              </div>
            </div>

            {/* Audio Section */}
            {!!(data.audioUrl || (!data.isTTSDisabled && typeof data.body === "string" ? data.body : undefined)) && (
              <div className="w-full flex flex-col gap-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Audio & Pengisi Suara (TTS)
                </span>
                <div className="w-full rounded-2xl bg-muted/10 border border-border/40 p-1">
                  <AudioController
                    audioUrl={data.audioUrl}
                    textToSpeak={typeof data.body === "string" ? data.body : undefined}
                    isTTSDisabled={data.isTTSDisabled}
                    compact={false}
                    header={true}
                  />
                </div>
              </div>
            )}
          </div>
        )}

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
