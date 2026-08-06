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
import { Bookmark, Clock, Gauge, LayoutGrid, MapPin, Mic, Minimize2, ScanText, Sparkles, Zap, BarChart } from "@/components/ui/icons";
import { ReadingProvider } from "@/features/library/reading/components/ReadingContext";
import { cn } from "@/lib/utils";
import { useReadingLogic } from "@/features/library/reading/hooks/useReadingLogic";
import { ReadingData } from "@/features/library/reading/types";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/useUserStore";
import { useUIStore } from "@/store/useUIStore";
import { formatQuizzes } from "@/lib/utils/lesson-utils";
import QuizEngine from "@/features/exams/components/quiz-engine/QuizEngine";
import AudioController from "@/features/library/reading/components/AudioController";

// Komponen Pendukung
import { IllustrationGallery } from "@/components/ui/IllustrationGallery";
import ReadingWorkspace from "@/features/library/reading/components/ReadingWorkspace";
import { ReadingVocabularyCollector } from "@/features/library/reading/components/ReadingVocabularyCollector";

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

/**
 * Format seconds into readable duration string.
 * @param seconds Time in seconds.
 */
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

/**
 * Internal content component containing reading workspace logic and layout.
 */
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
 React.useEffect(() => {
 readingSnapshotRef.current = readingSnapshot;
 }, [readingSnapshot]);

 // Record start event once on mount.
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

 // Count characters excluding whitespace for pace calculation.
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

 // Handle paragraph change and persist progress.
 const handleParagraphChange = React.useCallback(
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
 React.useEffect(() => {
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
 const handleComplete = React.useCallback(() => {
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
 
 // Build query parameters for external tools.
 const toolParams = React.useMemo(() => {
 const params = new URLSearchParams({
 source: "reading",
 slug: data.slug || data._id || data.id || "",
 });
 const level = data.jlpt_level || data.difficulty;
 if (level) params.set("level", level.toUpperCase());
 return params.toString();
 }, [data._id, data.difficulty, data.id, data.jlpt_level, data.slug]);

 // Cycle through font size options.
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
 `}} />
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
 "max-w-none w-full px-8 relative z-10 transition-all duration-1000",
 isZenMode ? "pt-12 sm:pt-20" : "pt-4 md:pt-6"
 )}
 >
 {/* Ramping Left-Aligned Header */}
 {!isZenMode && (
 <div className="flex flex-col gap-1.5 mb-10 pb-6 border-b border-border/40">
 <div className="flex items-center gap-2">
 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">
 Graded Reading
 </span>
 {data.jlpt_level && (
 <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-[4px] bg-primary/10 text-primary border border-primary/20">
 {data.jlpt_level}
 </span>
 )}
 </div>
 <h1 className="text-2xl md:text-4xl text-foreground tracking-tight leading-tight uppercase">
 {data.title}
 </h1>
 </div>
 )}



 {/* Ilustrasi Pendukung (Collapsible) */}
 {!isZenMode && (
 <div className="w-full mb-6">
 <Button
 variant="outline"
 onClick={() => setShowVisuals(!showVisuals)}
 className="w-full py-4 rounded-lg border-dashed border-primary/20 hover:border-primary/50 bg-primary/5 hover:bg-primary/10 transition-all flex items-center justify-center gap-2 group"
 >
 <Sparkles size={14} className={cn("text-primary transition-transform duration-300", showVisuals && "rotate-45")} />
 <span className="text-xs font-black uppercase tracking-wider">
 {showVisuals ? "Sembunyikan Ilustrasi Cerita" : "Lihat Ilustrasi Cerita (AI Generated)"}
 </span>
 </Button>

 <AnimatePresence>
 {showVisuals && (
 <m.div
 initial={{ height: 0, opacity: 0, marginTop: 0 }}
 animate={{ height: "auto", opacity: 1, marginTop: 16 }}
 exit={{ height: 0, opacity: 0, marginTop: 0 }}
 transition={{ duration: 0.3 }}
 className="overflow-hidden"
 >
 <IllustrationGallery
 illustrations={data.illustrations}
 fallbackImage={typeof data.image_url === "string" ? data.image_url : undefined}
 title={data.title}
 />
 </m.div>
 )}
 </AnimatePresence>
 </div>
 )}

 {/* Panel Kontrol Layar Lengket (Sticky Bottom Control Bar) */}
 {!isZenMode && (
 <div className="fixed bottom-0 left-0 right-0 md:bottom-6 md:left-78 md:right-6 z-50 rounded-t-xl rounded-b-none md:rounded-xl border-t border-x-0 border-b-0 md:border border-border bg-card p-3 pb-safe md:p-4 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 md:gap-4 animate-in slide-in- duration-500 pointer-events-auto">
 {/* Sisi Kiri: Audio & Playback Controller */}
 <div className="flex-1 w-full lg:max-w-xs">
 {!!(data.audioUrl || (!data.isTTSDisabled && typeof data.body === "string" ? data.body : undefined)) && (
 <AudioController
 audioUrl={data.audioUrl}
 textToSpeak={typeof data.body === "string" ? data.body : undefined}
 isTTSDisabled={data.isTTSDisabled}
 compact={true}
 header={false}
 />
 )}
 </div>

 {/* Sisi Tengah: Ramping Stats Row */}
 <div className="hidden md:flex items-center gap-4 text-xs font-mono border-x border-border/40 px-4 py-1">
 <span className="flex items-center gap-1.5 text-muted-foreground">
 <Clock size={14} className="text-primary" /> <span>{formatReadingDuration(readingSnapshot.elapsedSeconds)}</span>
 </span>
 <span className="flex items-center gap-1.5 text-muted-foreground">
 <Zap size={14} className="text-warning" /> <span>{readingPace || "-"} <span className="text-[9px] text-muted-foreground font-sans">u/m</span></span>
 </span>
 <span className="flex items-center gap-1.5 text-muted-foreground">
 <BarChart size={14} className="text-success" /> <span>{readingCompletionPercent}%</span>
 </span>
 </div>

 {/* Sisi Kanan: Toggles Mode Membaca, Font Size, Kosakata, dan Terjemahan */}
 <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 justify-center lg:justify-end w-full lg:w-auto">
 {/* Mode Select */}
 <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/20 border border-border/80">
 {modes.map((m) => (
 <Button
 key={m.id}
 variant={mode === m.id ? "default" : "ghost"}
 size="sm"
 onClick={() => setMode(m.id as "kanji" | "furigana" | "romaji" | "hiragana")}
 className={cn(
 "rounded-lg px-2 py-1 h-7 text-[9px] font-black uppercase tracking-wider transition-all",
 mode === m.id && "shadow-md shadow-primary/20 text-primary-foreground bg-primary"
 )}
 title={m.label}
 >
 {m.label}
 </Button>
 ))}
 </div>

 {/* Font Size Select */}
 <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/20 border border-border/80">
 {(["standard", "large", "extra"] as const).map((sz) => (
 <Button
 key={sz}
 variant={fontSize === sz ? "default" : "ghost"}
 size="sm"
 onClick={() => setFontSize(sz)}
 className={cn(
 "rounded-lg px-2 py-1 h-7 text-[9px] font-black uppercase tracking-wider transition-all",
 fontSize === sz && "shadow-md shadow-primary/20 text-primary-foreground bg-primary"
 )}
 >
 {sz === "standard" ? "S" : sz === "large" ? "M" : "L"}
 </Button>
 ))}
 </div>

 {/* Kosakata Drawer Toggle */}
 <Button
 variant={isVocabOpen ? "default" : "outline"}
 size="sm"
 onClick={() => setIsVocabOpen(!isVocabOpen)}
 className={cn(
 "rounded-xl px-3 py-1.5 h-9 text-[9px] font-black uppercase tracking-wider transition-all gap-1 border border-border/80",
 isVocabOpen 
 ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 border-transparent animate-pulse" 
 : "bg-muted/10 text-muted-foreground hover:text-foreground hover:bg-muted/20"
 )}
 >
 <span>KOSAKATA</span>
 </Button>

 {/* Translation Toggle */}
 <Button
 variant={showTranslation ? "default" : "outline"}
 size="sm"
 onClick={toggleTranslation}
 className={cn(
 "rounded-xl px-3 py-1.5 h-9 text-[9px] font-black uppercase tracking-wider transition-all gap-1 border border-border/80",
 showTranslation 
 ? "bg-success hover:bg-success/90 text-success-foreground shadow-md shadow-success/20 border-transparent" 
 : "bg-muted/10 text-muted-foreground hover:text-foreground hover:bg-muted/20"
 )}
 >
 <LayoutGrid size={11} />
 <span>IND: {showTranslation ? "ON" : "OFF"}</span>
 </Button>

 {/* Zen Mode Toggle */}
 <Button
 variant="outline"
 size="sm"
 onClick={() => setIsZenMode(true)}
 className="rounded-xl px-3 py-1.5 h-9 text-[9px] font-black uppercase tracking-wider bg-muted/10 text-muted-foreground hover:text-foreground hover:bg-muted/20 border border-border/80"
 >
 ZEN
 </Button>
 </div>
 </div>
 )}

 <ReadingWorkspace
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
 activeParagraphIndex={readingSnapshot.activeParagraphIndex}
 onParagraphChange={handleParagraphChange}
 />

 {/* Kosakata Slide-Over Sheet Drawer */}
 <AnimatePresence>
 {isVocabOpen && (
 <>
 {/* Backdrop */}
 <m.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 0.5 }}
 exit={{ opacity: 0 }}
 onClick={() => setIsVocabOpen(false)}
 className="fixed inset-0 bg-background/80 backdrop-blur-sm z-100 cursor-pointer"
 />
 {/* Panel Drawer */}
 <m.div
 initial={{ x: "100%" }}
 animate={{ x: 0 }}
 exit={{ x: "100%" }}
 transition={{ type: "spring", damping: 25, stiffness: 200 }}
 className="fixed top-0 right-0 bottom-0 w-full sm:w-105 bg-background/95 border-l border-border z-101 shadow-2xl p-6 overflow-y-auto glass flex flex-col"
 >
 <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
 <div className="flex items-center gap-2">
 <Sparkles size={16} className="text-primary animate-pulse" />
 <span className="text-xs font-black uppercase tracking-widest text-foreground">
 Kosakata Terkumpul
 </span>
 </div>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => setIsVocabOpen(false)}
 className="rounded-xl text-[10px] font-black uppercase h-8"
 >
 Tutup
 </Button>
 </div>

 <div className="flex-1 overflow-y-auto custom-scrollbar">
 {lessonId && (
 <ReadingVocabularyCollector sourceId={lessonId} />
 )}
 </div>
 </m.div>
 </>
 )}
 </AnimatePresence>

 {/* Kuis Membaca Inline — tampil setelah artikel, tanpa overlay */}
 {hasQuiz && !isZenMode && (
 <div className="mt-16">
 <div className="flex items-center gap-4 mb-10">
 <div className="flex-1 h-px bg-linear- " />
 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 shrink-0">
 Kuis Pemahaman
 </span>
 <div className="flex-1 h-px bg-linear- " />
 </div>
 <div className="rounded-[2.5rem] border border-border/60 bg-card/30 p-6 shadow-2xl">
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