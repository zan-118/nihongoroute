/**
 * @file ReadingPageClient.tsx
 * @description Orkestrator tipis untuk sesi membaca artikel (Dokkai Session).
 * Menyimpan state bersama (progress, zen, vocab, font, mode) dan menyusun
 * panel-panel yang dipecah ke folder components/ + utils/reading-metrics.ts.
 */

"use client";

// ======================
// IMPOR
// ======================
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { AnimatePresence, m } from "framer-motion";
import { FullscreenExit } from "@/components/ui/icons";
import { ReadingProvider } from "@/features/library/reading/components/ReadingContext";
import { cn } from "@/lib/utils";
import { useReadingLogic } from "@/features/library/reading/hooks/useReadingLogic";
import { ReadingData } from "@/features/library/reading/types";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/useUserStore";
import { useUIStore } from "@/store/useUIStore";
import { formatQuizzes } from "@/lib/utils/lesson-utils";
import ReadingWorkspace from "@/features/library/reading/components/ReadingWorkspace";

// Komponen Pendukung
import { ReadingPageHeader } from "@/features/library/reading/components/ReadingPageHeader";
import { ReadingVisuals } from "@/features/library/reading/components/ReadingVisuals";
import { ReadingControlBar } from "@/features/library/reading/components/ReadingControlBar";
import { VocabularyDrawer } from "@/features/library/reading/components/VocabularyDrawer";
import { ReadingQuizSection } from "@/features/library/reading/components/ReadingQuizSection";
import { computeReadingMetrics } from "@/features/library/reading/utils/reading-metrics";

/**
 * Snapshot structure for tracking reading progress.
 */
interface ReadingProgressSnapshot {
  activeParagraphIndex: number;
  elapsedSeconds: number;
  totalParagraphs: number;
  hasResumed: boolean;
}

// ======================
// TIPE DATA
// ======================
/**
 * Props for the ReadingPageClient component.
 */
interface ReadingPageClientProps {
  data: ReadingData;
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Internal content component containing reading workspace logic and layout.
 */
function ReadingPageContent({ data }: ReadingPageClientProps) {
  const {
    mode,
    showTranslation,
    paragraphs,
    hiraganaParagraphs,
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

  // Get saved progress from global UI store.
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
  const [showVisuals, setShowVisuals] = useState(false);
  const isCompleted = !!(lessonId && completedLessons[lessonId]) || isLocallyCompleted;

  // Initialize reading snapshot state from saved progress.
  const [readingSnapshot, setReadingSnapshot] = useState<ReadingProgressSnapshot>(() => ({
    activeParagraphIndex: savedProgress?.lastParagraphIndex || 0,
    elapsedSeconds: savedProgress?.elapsedSeconds || 0,
    totalParagraphs: paragraphs.length,
    hasResumed: !!savedProgress && (
      savedProgress.lastParagraphIndex > 0 || savedProgress.elapsedSeconds > 0
    ),
  }));

  // Keep mutable ref of snapshot to prevent effect re-runs.
  const readingSnapshotRef = React.useRef(readingSnapshot);

  // Track last persisted values to throttle store updates.
  const lastPersistedReadingRef = React.useRef({
    elapsedSeconds: savedProgress?.elapsedSeconds || 0,
    paragraphIndex: savedProgress?.lastParagraphIndex || 0,
  });
  const hasRecordedStartRef = React.useRef(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedQuizzes = data.quizzes ? formatQuizzes(data.quizzes as any) : [];
  const hasQuiz = formattedQuizzes.length > 0;

  // Sync snapshot ref with state changes.
  useEffect(() => {
    readingSnapshotRef.current = readingSnapshot;
  }, [readingSnapshot]);

  // Record start event once on mount.
  useEffect(() => {
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

  // Count characters excluding whitespace for pace calculation.
  const readingCharacterCount = useMemo(
    () => paragraphs.join("").replace(/\s/g, "").length,
    [paragraphs]
  );

  // Derived reading metrics (pace, percent, etc.).
  const metrics = useMemo(
    () =>
      computeReadingMetrics({
        activeParagraphIndex: readingSnapshot.activeParagraphIndex,
        elapsedSeconds: readingSnapshot.elapsedSeconds,
        totalParagraphs: readingSnapshot.totalParagraphs,
        fallbackParagraphCount: paragraphs.length,
        characterCount: readingCharacterCount,
      }),
    [
      readingSnapshot.activeParagraphIndex,
      readingSnapshot.elapsedSeconds,
      readingSnapshot.totalParagraphs,
      paragraphs.length,
      readingCharacterCount,
    ]
  );

  // Handle paragraph change and persist progress.
  const handleParagraphChange = useCallback(
    (index: number) => {
      let seconds = 0;
      setReadingSnapshot((prev) => {
        seconds = prev.elapsedSeconds;
        return { ...prev, activeParagraphIndex: index };
      });

      if (readingSourceId) {
        updateReadingProgress(readingSourceId, {
          elapsedSeconds: seconds,
          lastParagraphIndex: index,
          sourceTitle: data.title,
          totalParagraphs: paragraphs.length,
        });
        lastPersistedReadingRef.current = {
          elapsedSeconds: seconds,
          paragraphIndex: index,
        };
      }
    },
    [data.title, paragraphs.length, readingSourceId, updateReadingProgress]
  );

  // Increment elapsed time every second. Persist to store every 5 seconds.
  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      let nextSeconds = 0;
      let activeIndex = 0;

      setReadingSnapshot((prev) => {
        nextSeconds = prev.elapsedSeconds + 1;
        activeIndex = prev.activeParagraphIndex;
        return {
          ...prev,
          elapsedSeconds: nextSeconds,
        };
      });

      // Persist ke store setiap 5 detik (di luar updater callback)
      if (readingSourceId) {
        const lastPersisted = lastPersistedReadingRef.current;
        const elapsedDelta = nextSeconds - lastPersisted.elapsedSeconds;

        if (elapsedDelta >= 5) {
          updateReadingProgress(readingSourceId, {
            elapsedSeconds: nextSeconds,
            lastParagraphIndex: activeIndex,
            sourceTitle: data.title,
            totalParagraphs: paragraphs.length,
          });
          lastPersistedReadingRef.current = {
            elapsedSeconds: nextSeconds,
            paragraphIndex: activeIndex,
          };
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isCompleted, readingSourceId, data.title, paragraphs.length, updateReadingProgress]);

  // Mark lesson complete, award XP, and record completion event.
  const handleComplete = useCallback(() => {
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
      message: "Selamat! Kamu dapat +100 XP dari membaca.",
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
  }, [lessonId, isCompleted, addXP, completeLesson, readingSourceId, data.title, data.slug, data.jlpt_level, data.difficulty, paragraphs.length, updateReadingProgress, recordLearningEvent]);

  const [isZenMode, setIsZenMode] = useState(false);
  const [isVocabOpen, setIsVocabOpen] = useState(false);
  const [fontSize, setFontSize] = useState<"standard" | "large" | "extra">("large");

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
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--foreground)/0.01)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground)/0.01)_1px,transparent_1px)] bg-size-[100px_100px] pointer-events-none opacity-20" />
      </div>

      {/* Style Override untuk Zen Mode */}
      {isZenMode && (
        <style dangerouslySetInnerHTML={{ __html: `
          aside, .bg-background > aside, .bg-background > div > div:first-child {
            display: none !important;
          }
          .bg-background > div {
            padding-left: 0 !important;
          }
        ` }} />
      )}

      {/* Tombol Melayang Keluar untuk Mode Zen */}
      <AnimatePresence>
        {isZenMode && (
          <m.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="fixed top-8 right-8 z-100"
          >
            <Button
              size="lg"
              className="rounded-full size-14 bg-background/80 border border-border shadow-2xl group hover:border-primary/40 transition-all"
              onClick={() => setIsZenMode(false)}
              aria-label="Keluar Mode Zen"
            >
              <FullscreenExit
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
          "max-w-none w-full px-8 relative z-10 transition-all duration-1000",
          isZenMode ? "pt-12 sm:pt-20" : "pt-4 md:pt-6"
        )}
      >
        {/* Ramping Left-Aligned Header */}
        {!isZenMode && (
          <ReadingPageHeader title={data.title} jlptLevel={data.jlpt_level} />
        )}

        {/* Ilustrasi Pendukung (Collapsible) */}
        {!isZenMode && (
          <ReadingVisuals
            illustrations={data.illustrations}
            imageUrl={data.image_url}
            title={data.title}
            showVisuals={showVisuals}
            onToggleVisuals={() => setShowVisuals((v) => !v)}
          />
        )}

        {/* Panel Kontrol Layar Lengket (Sticky Bottom Control Bar) */}
        {!isZenMode && (
          <ReadingControlBar
            audioUrl={data.audioUrl}
            isTTSDisabled={data.isTTSDisabled}
            textToSpeak={typeof data.body === "string" ? data.body : undefined}
            elapsedSeconds={readingSnapshot.elapsedSeconds}
            readingPace={metrics.readingPace}
            readingCompletionPercent={metrics.readingCompletionPercent}
            modes={modes}
            mode={mode}
            onModeChange={(next) => setMode(next)}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            isVocabOpen={isVocabOpen}
            onToggleVocab={() => setIsVocabOpen((v) => !v)}
            showTranslation={showTranslation}
            onToggleTranslation={toggleTranslation}
            onZenMode={() => setIsZenMode(true)}
          />
        )}

        <ReadingWorkspace
          paragraphs={paragraphs}
          hiraganaParagraphs={hiraganaParagraphs}
          translationParagraphs={translationParagraphs}
          mode={mode}
          fontSize={fontSize}
          showTranslation={showTranslation}
          isZenMode={isZenMode}
          onComplete={handleComplete}
          isCompleted={isCompleted}
          sourceId={readingSourceId}
          sourceTitle={data.title}
          activeParagraphIndex={readingSnapshot.activeParagraphIndex}
          onParagraphChange={handleParagraphChange}
        />

        {/* Kosakata Slide-Over Sheet Drawer */}
        <VocabularyDrawer
          open={isVocabOpen}
          onClose={() => setIsVocabOpen(false)}
          lessonId={lessonId}
        />

        {/* Kuis Membaca Inline — tampil setelah artikel, tanpa overlay */}
        {hasQuiz && !isZenMode && (
          <ReadingQuizSection quizzes={formattedQuizzes} lessonId={lessonId} />
        )}
      </div>
    </div>
  );
}

/**
 * Komponen utama ReadingPageClient: Menyediakan modul pembaca graded reading interaktif
 * dengan fitur switcher Furigana, popup kamus klik-kata, audio sinkronisasi, dan mode Zen.
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
