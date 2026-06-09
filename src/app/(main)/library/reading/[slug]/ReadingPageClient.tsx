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
import Link from "next/link";
import { BookmarkCheck, Clock, Gauge, Languages, MapPin, Mic, Minimize2, ScanText, Sparkles, Type } from "lucide-react";
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
import {
  ReadingArticle,
  type ReadingProgressSnapshot,
} from "@/components/features/reading/components/ReadingArticle";
import { ReadingVocabularyCollector } from "@/components/features/reading/components/ReadingVocabularyCollector";

// ======================
// TIPE DATA
// ======================
interface ReadingPageClientProps {
  data: ReadingData;
}

function formatReadingDuration(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  if (minutes < 60) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  const hours = Math.floor(minutes / 60);
  const leftoverMinutes = minutes % 60;
  return `${hours}j ${leftoverMinutes}m`;
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
  const legacyReadingSourceId = data._id || data.id || data.title;
  const readingSourceId = data.slug || legacyReadingSourceId;
  const savedProgress = useUIStore((state) => {
    if (!readingSourceId) return undefined;
    return (
      state.readingProgressMap[readingSourceId] ||
      (legacyReadingSourceId ? state.readingProgressMap[legacyReadingSourceId] : undefined)
    );
  });
  const updateReadingProgress = useUIStore((state) => state.updateReadingProgress);
  const recordLearningEvent = useUIStore((state) => state.recordLearningEvent);
  const [isLocallyCompleted, setIsLocallyCompleted] = useState(false);
  const isCompleted = !!(lessonId && completedLessons[lessonId]) || isLocallyCompleted;
  const [readingSnapshot, setReadingSnapshot] = useState<ReadingProgressSnapshot>(() => ({
    activeParagraphIndex: savedProgress?.lastParagraphIndex || 0,
    elapsedSeconds: savedProgress?.elapsedSeconds || 0,
    totalParagraphs: paragraphs.length,
    hasResumed: !!savedProgress && (
      savedProgress.lastParagraphIndex > 0 || savedProgress.elapsedSeconds > 0
    ),
  }));
  const readingSnapshotRef = React.useRef(readingSnapshot);
  const lastPersistedReadingRef = React.useRef({
    elapsedSeconds: savedProgress?.elapsedSeconds || 0,
    paragraphIndex: savedProgress?.lastParagraphIndex || 0,
  });
  const hasRecordedStartRef = React.useRef(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedQuizzes = data.quizzes ? formatQuizzes(data.quizzes as any) : [];
  const hasQuiz = formattedQuizzes.length > 0;

  React.useEffect(() => {
    readingSnapshotRef.current = readingSnapshot;
  }, [readingSnapshot]);

  React.useEffect(() => {
    if (!readingSourceId || hasRecordedStartRef.current) return;
    hasRecordedStartRef.current = true;
    recordLearningEvent({
      type: "reading_started",
      source: {
        type: "reading",
        id: readingSourceId,
        slug: data.slug || readingSourceId,
        title: data.title,
        href: data.slug ? `/library/reading/${data.slug}` : undefined,
        level: data.jlpt_level || data.difficulty,
      },
    });
  }, [data.difficulty, data.jlpt_level, data.slug, data.title, readingSourceId, recordLearningEvent]);

  const readingCharacterCount = React.useMemo(
    () => paragraphs.join("").replace(/\s/g, "").length,
    [paragraphs]
  );

  const estimatedReadingUnits = Math.max(1, Math.round(readingCharacterCount / 5));
  const elapsedMinutes = readingSnapshot.elapsedSeconds / 60;
  const readingPace =
    elapsedMinutes >= 0.25 ? Math.round(estimatedReadingUnits / elapsedMinutes) : 0;
  const currentParagraph = Math.min(
    readingSnapshot.activeParagraphIndex + 1,
    Math.max(readingSnapshot.totalParagraphs || paragraphs.length, 1)
  );
  const totalParagraphs = readingSnapshot.totalParagraphs || paragraphs.length;
  const readingCompletionPercent =
    totalParagraphs > 0 ? Math.round((currentParagraph / totalParagraphs) * 100) : 0;

  const handleReadingProgressChange = React.useCallback(
    (progress: ReadingProgressSnapshot) => {
      setReadingSnapshot(progress);
      if (!readingSourceId) return;

      const lastPersisted = lastPersistedReadingRef.current;
      const movedParagraph = progress.activeParagraphIndex !== lastPersisted.paragraphIndex;
      const elapsedDelta = progress.elapsedSeconds - lastPersisted.elapsedSeconds;

      if (!movedParagraph && elapsedDelta < 5) return;

      updateReadingProgress(readingSourceId, {
        elapsedSeconds: progress.elapsedSeconds,
        lastParagraphIndex: progress.activeParagraphIndex,
        sourceTitle: data.title,
        totalParagraphs: progress.totalParagraphs,
      });
      lastPersistedReadingRef.current = {
        elapsedSeconds: progress.elapsedSeconds,
        paragraphIndex: progress.activeParagraphIndex,
      };
    },
    [data.title, readingSourceId, updateReadingProgress]
  );

  const handleComplete = () => {
    if (!lessonId || isCompleted) return;
    const currentProgress = readingSnapshotRef.current;
    setIsLocallyCompleted(true);
    addXP(100);
    completeLesson(lessonId);
    updateReadingProgress(readingSourceId, {
      completedAt: Date.now(),
      elapsedSeconds: currentProgress.elapsedSeconds,
      lastParagraphIndex: currentProgress.activeParagraphIndex,
      sourceTitle: data.title,
      totalParagraphs: currentProgress.totalParagraphs || paragraphs.length,
    });

    useUIStore.getState().addNotification({
      title: "Materi Selesai!",
      message: "Selamat! Anda mendapatkan +100 XP dari membaca.",
      type: "success",
    });
    recordLearningEvent({
      type: "reading_completed",
      source: {
        type: "reading",
        id: readingSourceId,
        slug: data.slug || readingSourceId,
        title: data.title,
        href: data.slug ? `/library/reading/${data.slug}` : undefined,
        level: data.jlpt_level || data.difficulty,
      },
      metrics: {
        elapsedSeconds: currentProgress.elapsedSeconds,
      },
    });
  };

  const [isZenMode, setIsZenMode] = useState(false);
  const [fontSize, setFontSize] = useState<"standard" | "large" | "extra">("large");
  const toolParams = React.useMemo(() => {
    const params = new URLSearchParams({
      source: "reading",
      slug: data.slug || data._id || data.id || "",
    });
    const level = data.jlpt_level || data.difficulty;
    if (level) params.set("level", level.toUpperCase());
    return params.toString();
  }, [data._id, data.difficulty, data.id, data.jlpt_level, data.slug]);

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
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">
                    Pengaturan Membaca
                  </span>
                  {readingSnapshot.hasResumed && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-primary">
                      <MapPin size={10} aria-hidden="true" />
                      Lanjut Paragraf {currentParagraph}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild variant="outline" size="sm" className="rounded-xl">
                  <Link href={`/tools/shadowing?${toolParams}`}>
                    <Mic size={14} aria-hidden="true" />
                    Shadowing
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="rounded-xl">
                  <Link href={`/tools/text-analyzer?${toolParams}`}>
                    <ScanText size={14} aria-hidden="true" />
                    Analyzer
                  </Link>
                </Button>
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

            <div className="grid overflow-hidden rounded-2xl border border-border/60 bg-muted/10 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3 border-b border-border/50 p-4 sm:border-r lg:border-b-0">
                <Clock size={17} className="text-primary" aria-hidden="true" />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    Waktu
                  </p>
                  <p className="font-mono text-lg font-black text-foreground">
                    {formatReadingDuration(readingSnapshot.elapsedSeconds)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 border-b border-border/50 p-4 lg:border-b-0 lg:border-r">
                <BookmarkCheck size={17} className="text-success" aria-hidden="true" />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    Posisi
                  </p>
                  <p className="font-mono text-lg font-black text-foreground">
                    {currentParagraph}/{totalParagraphs}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 border-b border-border/50 p-4 sm:border-b-0 sm:border-r">
                <Gauge size={17} className="text-warning" aria-hidden="true" />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    Pace
                  </p>
                  <p className="font-mono text-lg font-black text-foreground">
                    {readingPace || "-"}
                    <span className="ml-1 text-[10px] text-muted-foreground">unit/mnt</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4">
                <MapPin size={17} className="text-secondary" aria-hidden="true" />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    Progress
                  </p>
                  <p className="font-mono text-lg font-black text-foreground">
                    {readingCompletionPercent}%
                  </p>
                </div>
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
          sourceId={readingSourceId}
          sourceTitle={data.title}
          savedProgress={savedProgress}
          onProgressChange={handleReadingProgressChange}
        />

        {!isZenMode && lessonId && (
          <ReadingVocabularyCollector sourceId={lessonId} />
        )}

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
