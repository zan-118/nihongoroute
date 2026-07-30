"use client";

/**
 * @file ListeningWorkspace.tsx
 * @description Komponen Workspace terintegrasi baru untuk Graded Listening (Choukai).
 * Menyatukan StickerScene visual novel, transkrip karaoke flat, dictation practice, kuis,
 * dan sticky bottom media control bar ke dalam satu kesatuan visual yang kohesif.
 */

import React, { useState, useMemo, useRef, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  Mic,
  ScanText,
  Volume2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ClipboardPenLine,
  Target,
  Languages,
  Play,
  Pause,
  Headphones,
  PenTool
} from "@/components/ui/icons";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StickerScene } from "@/components/ui/StickerScene";
import { IllustrationGallery } from "@/components/ui/IllustrationGallery";
import { SmartJapanese } from "@/components/ui/japanese";
import AudioController from "@/components/features/reading/components/AudioController";
import { useLineTTS } from "../hooks/useLineTTS";
import { evaluateDictation, extractDictationText } from "@/lib/dictation";
import { TranscriptLine, QuizItem } from "../types";

/**
 * Props for ListeningWorkspace component.
 */
interface ListeningWorkspaceProps {
  /** Array of transcript lines containing text, translation, and timing data */
  transcript: TranscriptLine[];
  /** Index of the currently active transcript line */
  activeIndex: number;
  /** Callback to seek audio playback to a specific timestamp */
  seekToLine: (startTime: number) => void;
  /** Optional URL of the audio file */
  audioUrl?: string;
  /** Optional callback triggered on audio playback time updates */
  onTimeUpdate?: (time: number) => void;
  /** Optional external seek timestamp to trigger audio updates */
  externalSeek?: number;
  /** Optional list of quiz questions related to the audio */
  quiz?: QuizItem[];
  /** Optional background image URL for the visualizer scene */
  imageUrl?: string;
  /** Optional list of illustrations to display when no speaker is present */
  illustrations?: { title?: string; content: string }[];
  /** Callback triggered when the quiz is completed, returning the final score */
  onQuizComplete: (score: number) => void;
  /** Query parameters or identifiers for tools */
  toolParams: string;
  /** Title of the listening exercise */
  title: string;
}

/**
 * Represents a node structure in PortableText format.
 */
interface PortableTextNode {
  /** Text content of the node */
  text?: string;
  /** Child nodes containing text segments */
  children?: { text?: string }[];
}

/**
 * Extracts plain text from a transcript line's text field, handling both strings and PortableText arrays.
 * @param text - Raw text field from TranscriptLine.
 * @returns Extracted plain text string.
 */
function extractLineText(text: TranscriptLine["text"]): string {
  if (typeof text === "string") return text;
  if (Array.isArray(text)) {
    // Parse PortableText block structure
    return (text as unknown as PortableTextNode[])
      .map((block) =>
        block?.children?.map((c) => c?.text || "").join("") || block?.text || ""
      )
      .join(" ");
  }
  return String(text || "");
}

/**
 * ListeningWorkspace component.
 * Provides interactive transcript, dictation practice, and quiz modes for Japanese listening practice.
 */
export default function ListeningWorkspace({
  transcript,
  activeIndex,
  seekToLine,
  audioUrl,
  onTimeUpdate,
  externalSeek,
  quiz = [],
  imageUrl,
  illustrations = [],
  onQuizComplete,
  toolParams,
  title,
}: ListeningWorkspaceProps) {
  // Active workspace tab state
  const [activeTab, setActiveTab] = useState<"study" | "dictation" | "quiz">("study");
  // Toggle translation visibility state
  const [showTranslation, setShowTranslation] = useState(false);
  // Toggle transcript text visibility state
  const [isTranscriptHidden, setIsTranscriptHidden] = useState(false);

  // Dictation States
  // Filter and clean transcript lines suitable for dictation practice
  const dictationLines = useMemo(
    () =>
      transcript
        .map((line, index) => ({
          ...line,
          index,
          cleanText: extractDictationText(line.text).trim(),
        }))
        .filter((line) => line.cleanText.length > 0),
    [transcript]
  );
  const [dictationIndex, setDictationIndex] = useState(0);
  const [dictationAnswer, setDictationAnswer] = useState("");
  const [dictationAttempts, setDictationAttempts] = useState<Record<string, { isPassed: boolean; accuracy: number }>>({});
  const [showDictationAnswer, setShowDictationAnswer] = useState(false);

  // Quiz States
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // TTS Line Hook for fallback audio playback
  const {
    speakingIndex,
    loadingIndex,
    speakLine,
    stopLineTTS,
    rate,
    setRate,
    isPlayingPlaylist,
    playlistIndex,
    playPlaylist,
    pausePlaylist,
  } = useLineTTS({ rate: "medium", lines: transcript });

  // Determine active line index based on playlist or manual audio sync
  const currentActiveIndex = isPlayingPlaylist ? playlistIndex : activeIndex;
  const activeLineRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active transcript line into view
  useEffect(() => {
    if (activeLineRef.current && scrollContainerRef.current) {
      const parent = scrollContainerRef.current;
      const child = activeLineRef.current;
      const parentRect = parent.getBoundingClientRect();
      const childRect = child.getBoundingClientRect();
      const relativeTop = childRect.top - parentRect.top + parent.scrollTop;
      const targetScroll = relativeTop - parentRect.height / 2 + childRect.height / 2;
      parent.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
  }, [currentActiveIndex]);

  // Dictation Calculations
  const dictationActiveLine = dictationLines[dictationIndex];
  const dictationAttempt = dictationActiveLine ? dictationAttempts[dictationActiveLine._key] : undefined;
  const dictationPassedCount = Object.values(dictationAttempts).filter((a) => a.isPassed).length;
  const dictationScore = dictationLines.length > 0 ? Math.round((dictationPassedCount / dictationLines.length) * 100) : 0;

  /**
   * Evaluates user's dictation input against the clean target text.
   */
  const handleCheckDictation = () => {
    if (!dictationActiveLine) return;
    const evaluation = evaluateDictation(dictationActiveLine.cleanText, dictationAnswer);
    setDictationAttempts((prev) => ({
      ...prev,
      [dictationActiveLine._key]: { isPassed: evaluation.isPassed, accuracy: evaluation.accuracy },
    }));
  };

  /**
   * Advances to the next dictation line and triggers audio playback.
   */
  const handleNextDictation = () => {
    if (dictationIndex < dictationLines.length - 1) {
      const nextLine = dictationLines[dictationIndex + 1];
      setDictationIndex(dictationIndex + 1);
      setDictationAnswer("");
      setShowDictationAnswer(false);
      if (audioUrl) {
        seekToLine(nextLine.startTime);
      } else {
        speakLine(nextLine, nextLine.index);
      }
    }
  };

  // Speaker Alignment Memo: Assigns left/right layout positions to speakers dynamically
  const speakerSides = useMemo(() => {
    const sides: Record<string, "left" | "right"> = {};
    let nonNarratorCount = 0;
    transcript.forEach((line) => {
      if (line.speaker) {
        const lower = line.speaker.toLowerCase().trim();
        const isNarrator = lower === "narrator" || lower === "narator" || lower === "instruction";
        if (!isNarrator && !sides[line.speaker]) {
          sides[line.speaker] = nonNarratorCount % 2 === 0 ? "left" : "right";
          nonNarratorCount++;
        }
      }
    });
    return sides;
  }, [transcript]);

  /**
   * Submits quiz answers, calculates score, and triggers completion callback.
   */
  const handleSubmitQuiz = () => {
    if (quizSubmitted) return;
    let correct = 0;
    quiz.forEach((q) => {
      const selected = quizAnswers[q._id];
      const option = q.options.find((o) => o.text === selected);
      if (option?.isCorrect) correct++;
    });
    setQuizScore(correct);
    setQuizSubmitted(true);
    onQuizComplete(correct);
  };

  return (
    <div className="w-full flex flex-col pb-40 md:pb-28">
      {/* Tab Selector Workspace */}
      <div className="flex w-full p-1 rounded-lg bg-muted/20 border border-border/80 mb-6 glass">
        <Button
          variant={activeTab === "study" ? "default" : "ghost"}
          onClick={() => setActiveTab("study")}
          className={cn(
            "flex-1 rounded-xl py-3 text-xs font-black uppercase tracking-wider transition-all h-10 flex items-center justify-center gap-1.5",
            activeTab === "study" && "shadow-md shadow-primary/20 text-primary-foreground bg-primary"
          )}
        >
          <Headphones size={14} />
          <span><span className="hidden sm:inline">Belajar & </span>Transkrip</span>
        </Button>
        <Button
          variant={activeTab === "dictation" ? "default" : "ghost"}
          disabled={dictationLines.length === 0}
          onClick={() => setActiveTab("dictation")}
          className={cn(
            "flex-1 rounded-xl py-3 text-xs font-black uppercase tracking-wider transition-all h-10 flex items-center justify-center gap-1.5",
            activeTab === "dictation" && "shadow-md shadow-primary/20 text-primary-foreground bg-primary"
          )}
        >
          <PenTool size={14} />
          <span><span className="hidden sm:inline">Latihan </span>Dikte</span>
        </Button>
        {quiz.length > 0 && (
          <Button
            variant={activeTab === "quiz" ? "default" : "ghost"}
            onClick={() => setActiveTab("quiz")}
            className={cn(
              "flex-1 rounded-xl py-3 text-xs font-black uppercase tracking-wider transition-all h-10 flex items-center justify-center gap-1.5",
              activeTab === "quiz" && "shadow-md shadow-primary/20 text-primary-foreground bg-primary"
            )}
          >
            <ClipboardPenLine size={14} />
            <span><span className="hidden sm:inline">Kuis </span>Pemahaman</span>
          </Button>
        )}
      </div>

      {/* Workspace Panels */}
      <AnimatePresence mode="wait">
        {activeTab === "study" && (
          <m.div
            key="study"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-6 w-full"
          >
            {/* Visualizer Stage */}
            {transcript.some((t) => t.speaker) ? (
              <StickerScene
                dialogue={transcript}
                activeIndex={currentActiveIndex}
                seekToLine={seekToLine}
                backgroundUrl={imageUrl}
                title="Peragaan Percakapan Interaktif"
                borderless={true}
              />
            ) : (
              <IllustrationGallery
                illustrations={illustrations}
                fallbackImage={imageUrl}
                title={title}
              />
            )}

            {/* Flat Conversation Transcript Feed */}
            <div className="relative w-full">
              <div
                ref={scrollContainerRef}
                className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4 relative z-10"
              >
                {transcript.map((line, idx) => {
                  const isActive = idx === currentActiveIndex;
                  const isSpeaking = speakingIndex === idx;
                  const isLoading = loadingIndex === idx;

                  const speaker = line.speaker;
                  let align = "self-start items-start text-left";
                  let bubbleClass = "rounded-lg rounded-tl-none bg-muted/10 border-border/80 hover:bg-muted/15";
                  let textAccent = "text-primary";

                  // Align bubbles based on speaker side mapping
                  if (speaker) {
                    const side = speakerSides[speaker];
                    if (side === "right") {
                      align = "self-end items-end text-right";
                      bubbleClass = "rounded-lg rounded-tr-none bg-primary/5 border-primary/20 hover:bg-primary/10";
                      textAccent = "text-secondary";
                    }
                  }

                  return (
                    <div key={line._key || idx} className={cn("flex flex-col w-full max-w-[85%] sm:max-w-[75%]", align)}>
                      <m.div
                        ref={isActive ? activeLineRef : null}
                        onClick={() => seekToLine(line.startTime)}
                        animate={{ scale: isActive ? 1.01 : 1, opacity: isActive ? 1 : 0.75 }}
                        className={cn(
                          "group relative p-4 pr-12 cursor-pointer transition-all duration-300 border rounded-lg w-full",
                          bubbleClass,
                          isActive && "border-primary/50 shadow-[0_0_15px_rgba(var(--primary-rgb),0.08)] scale-[1.01]"
                        )}
                      >
                        {/* Speaker Indicator */}
                        {speaker && (
                          <div className={cn("flex items-center gap-1.5 mb-1.5 text-[9px] font-black uppercase tracking-wider", textAccent)}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                            <span>{speaker}</span>
                          </div>
                        )}

                        {/* Japanese text */}
                        {!isTranscriptHidden ? (
                          <div className="text-base sm:text-lg font-japanese font-medium leading-relaxed text-foreground">
                            <SmartJapanese word={extractLineText(line.text)} furigana={line.furigana} />
                          </div>
                        ) : (
                          <div className="h-4 w-32 rounded bg-muted/20 animate-pulse" />
                        )}

                        {/* Translation */}
                        {(!isTranscriptHidden && (isActive || showTranslation)) && (
                          <p className="text-xs sm:text-sm text-muted-foreground/80 italic border-t border-border/40 pt-2 mt-2 leading-relaxed">
                            {line.translation}
                          </p>
                        )}

                        {/* Play button per line */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isSpeaking || isLoading) {
                              stopLineTTS();
                            } else {
                              speakLine(line, idx);
                            }
                          }}
                          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Putar baris audio"
                        >
                          <Volume2 size={14} className={cn(isSpeaking && "text-success animate-bounce")} />
                        </button>
                      </m.div>
                    </div>
                  );
                })}
              </div>
            </div>
          </m.div>
        )}

        {/* Dictation Practice Workspace */}
        {activeTab === "dictation" && dictationActiveLine && (
          <m.div
            key="dictation"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="w-full grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]"
          >
            {/* Left Side: Line list */}
            <div className="max-h-[80px] md:max-h-[350px] overflow-x-auto md:overflow-y-auto rounded-lg border border-border/80 bg-muted/5 p-2 custom-scrollbar flex flex-row md:flex-col gap-1.5 w-full">
              <div className="flex flex-row md:flex-col gap-1.5 w-full shrink-0">
                {dictationLines.map((line, index) => {
                  const attempt = dictationAttempts[line._key];
                  const isActive = index === dictationIndex;

                  return (
                    <button
                      key={line._key}
                      onClick={() => {
                        setDictationIndex(index);
                        setDictationAnswer("");
                        setShowDictationAnswer(false);
                        if (audioUrl) {
                          seekToLine(line.startTime);
                        } else {
                          speakLine(line, line.index);
                        }
                      }}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-xl border p-2.5 text-left transition-all text-xs font-black uppercase tracking-wider",
                        isActive
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border/60 bg-background/40 text-muted-foreground hover:bg-muted/10 hover:text-foreground"
                      )}
                    >
                      <span>Baris {index + 1}</span>
                      {attempt ? (
                        attempt.isPassed ? (
                          <CheckCircle2 size={13} className="text-success" />
                        ) : (
                          <XCircle size={13} className="text-destructive" />
                        )
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Side: Dictation input workspace */}
            <div className="flex flex-col gap-4">
              <div className="rounded-lg border border-border/80 bg-card/35 p-5 glass relative overflow-hidden">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/40">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                      Baris {dictationIndex + 1}
                    </span>
                    {dictationActiveLine.speaker && (
                      <p className="text-xs font-bold text-primary">{dictationActiveLine.speaker}</p>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (audioUrl) {
                        seekToLine(dictationActiveLine.startTime);
                      } else {
                        speakLine(dictationActiveLine, dictationActiveLine.index);
                      }
                    }}
                    className="rounded-xl h-8 text-[10px] font-bold"
                  >
                    <Volume2 size={12} className="mr-1" /> Putar Audio
                  </Button>
                </div>

                <textarea
                  value={dictationAnswer}
                  onChange={(e) => setDictationAnswer(e.target.value)}
                  placeholder="Ketik kalimat bahasa Jepang yang kamu dengar..."
                  className="min-h-[100px] w-full rounded-xl border border-border/80 bg-muted/10 p-3 text-base font-japanese outline-none placeholder:text-muted-foreground/60 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 resize-none"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleCheckDictation}
                      disabled={!dictationAnswer.trim()}
                      className="rounded-xl text-[10px] font-bold h-9"
                    >
                      Periksa Jawaban
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowDictationAnswer(!showDictationAnswer)}
                      className="rounded-xl text-[10px] font-bold h-9"
                    >
                      {showDictationAnswer ? "Sembunyikan" : "Lihat Kunci"}
                    </Button>
                  </div>

                  {dictationIndex < dictationLines.length - 1 && (
                    <Button
                      variant="ghost"
                      onClick={handleNextDictation}
                      className="rounded-xl text-[10px] font-bold h-9 gap-1"
                    >
                      <span>Lanjut</span> <ChevronRight size={12} />
                    </Button>
                  )}
                </div>

                {/* Score & evaluation details */}
                <AnimatePresence>
                  {dictationAttempt && (
                    <m.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-4 p-3 rounded-xl border border-border/80 bg-muted/5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2">
                        {dictationAttempt.isPassed ? (
                          <CheckCircle2 size={16} className="text-success" />
                        ) : (
                          <XCircle size={16} className="text-destructive" />
                        )}
                        <span className="text-xs font-bold">
                          {dictationAttempt.isPassed ? "Sangat Akurat!" : "Butuh Koreksi"}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-muted-foreground">
                        Akurasi: {dictationAttempt.accuracy}%
                      </span>
                    </m.div>
                  )}
                </AnimatePresence>

                {showDictationAnswer && (
                  <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs font-japanese font-medium text-primary leading-relaxed"
                  >
                    Kunci: {dictationActiveLine.cleanText}
                  </m.div>
                )}
              </div>

              {/* Dictation Analytics */}
              <div className="rounded-lg border border-border/80 bg-muted/5 p-4 flex justify-between items-center">
                <div>
                  <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground">Progres Dikte</span>
                  <p className="text-base font-black">{dictationPassedCount} / {dictationLines.length} Selesai</p>
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground">Nilai Akurasi</span>
                  <p className="text-base font-black text-primary">{dictationScore}%</p>
                </div>
              </div>
            </div>
          </m.div>
        )}

        {/* Quiz Practice Workspace */}
        {activeTab === "quiz" && quiz.length > 0 && (
          <m.div
            key="quiz"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-2xl mx-auto flex flex-col gap-6"
          >
            {quiz.map((item, index) => {
              const selected = quizAnswers[item._id];

              return (
                <Card key={item._id} className="p-6 border border-border bg-card/30 glass relative overflow-hidden">
                  <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-2 block">
                    Pertanyaan {index + 1}
                  </span>
                  <p className="text-base font-bold text-foreground mb-4 leading-relaxed">{item.question}</p>

                  <div className="flex flex-col gap-2">
                    {item.options.map((opt) => {
                      const isSelected = selected === opt.text;
                      const isCorrectOpt = opt.isCorrect;

                      let optStyle = "border-border bg-background/50 text-foreground hover:bg-muted/10";
                      if (isSelected) {
                        optStyle = "border-primary bg-primary/10 text-primary font-bold";
                      }
                      if (quizSubmitted) {
                        if (isCorrectOpt) {
                          optStyle = "border-success bg-success/15 text-success font-bold";
                        } else if (isSelected) {
                          optStyle = "border-destructive bg-destructive/15 text-destructive font-bold";
                        }
                      }

                      return (
                        <button
                          key={opt.text}
                          disabled={quizSubmitted}
                          onClick={() => setQuizAnswers((prev) => ({ ...prev, [item._id]: opt.text }))}
                          className={cn("w-full border p-3 rounded-xl text-left text-sm transition-all flex justify-between items-center", optStyle)}
                        >
                          <span>{opt.text}</span>
                          {quizSubmitted && isCorrectOpt && <CheckCircle2 size={14} className="text-success shrink-0" />}
                          {quizSubmitted && isSelected && !isCorrectOpt && <XCircle size={14} className="text-destructive shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && item.explanation && (
                    <m.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 p-3 rounded-xl bg-muted/10 text-xs text-muted-foreground leading-relaxed border border-border/60"
                    >
                      <strong>Penjelasan:</strong> {item.explanation}
                    </m.div>
                  )}
                </Card>
              );
            })}

            {!quizSubmitted ? (
              <Button onClick={handleSubmitQuiz} className="rounded-xl w-full py-4 font-black tracking-wider text-xs uppercase shadow-md shadow-primary/20">
                Kirim Jawaban Kuis
              </Button>
            ) : (
              <div className="p-5 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase text-primary tracking-widest block">Evaluasi Ujian</span>
                  <p className="text-base font-black text-foreground">Hasil kuis: {quizScore} / {quiz.length} Benar</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }} className="rounded-xl text-[10px] font-black uppercase">
                  Ulangi Kuis
                </Button>
              </div>
            )}
          </m.div>
        )}
      </AnimatePresence>

      {/* Floating Sticky Bottom Media Control Bar (Unified) */}
      <div className="fixed bottom-6 left-6 md:left-[calc(18rem+1.5rem)] right-6 z-50 rounded-2xl md:rounded-3xl border border-border bg-background/80  p-4 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 glass animate-in slide-in-from-bottom duration-500 pointer-events-auto">
        {/* Playback Controls & Progress Bar */}
        <div className="flex-1 w-full md:max-w-md">
          {audioUrl ? (
            <AudioController
              audioUrl={audioUrl}
              textToSpeak=""
              onTimeUpdate={onTimeUpdate}
              externalSeek={externalSeek}
              compact={true}
              header={false}
            />
          ) : (
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => isPlayingPlaylist ? pausePlaylist() : playPlaylist(transcript, currentActiveIndex >= 0 ? currentActiveIndex : 0)}
                className="rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 active:scale-90 w-10 h-10 flex items-center justify-center shrink-0"
                aria-label={isPlayingPlaylist ? "Pause Playlist" : "Putar Playlist"}
              >
                {isPlayingPlaylist ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
              </Button>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/70 mb-0.5">
                  AI Playlist
                </span>
                <span className="text-xs font-bold text-foreground">
                  {isPlayingPlaylist ? `Memutar ${currentActiveIndex + 1}/${transcript.length}` : "Siap?"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Settings & Toggle Controls */}
        <div className="flex flex-wrap items-center gap-2 justify-end">
          {/* Playback Rate pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/20 border border-border/80">
            {(["slow", "medium", "fast"] as const).map((r) => (
              <Button
                key={r}
                variant={rate === r ? "default" : "ghost"}
                size="sm"
                onClick={() => setRate(r)}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 h-7 text-[9px] font-black uppercase tracking-wider transition-all",
                  rate === r && "shadow-sm text-primary-foreground bg-primary"
                )}
              >
                {r === "slow" ? "0.75×" : r === "fast" ? "1.25×" : "1×"}
              </Button>
            ))}
          </div>

          {/* Translation Toggle */}
          <Button
            variant={showTranslation ? "default" : "outline"}
            size="sm"
            onClick={() => setShowTranslation(!showTranslation)}
            className={cn(
              "rounded-xl px-3 py-1.5 h-9 text-[9px] font-black uppercase tracking-wider transition-all gap-1 border border-border/80",
              showTranslation
                ? "bg-success hover:bg-success/90 text-success-foreground shadow-md shadow-success/20 border-transparent"
                : "bg-muted/10 text-muted-foreground hover:text-foreground hover:bg-muted/20"
            )}
          >
            <Languages size={11} />
            <span>IND: {showTranslation ? "ON" : "OFF"}</span>
          </Button>

          {/* Transcript Hide Toggle */}
          <Button
            variant={isTranscriptHidden ? "default" : "outline"}
            size="sm"
            onClick={() => setIsTranscriptHidden(!isTranscriptHidden)}
            className={cn(
              "rounded-xl px-3 py-1.5 h-9 text-[9px] font-black uppercase tracking-wider transition-all gap-1 border border-border/80",
              isTranscriptHidden
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 border-transparent"
                : "bg-muted/10 text-muted-foreground hover:text-foreground hover:bg-muted/20"
            )}
          >
            {isTranscriptHidden ? <EyeOff size={12} /> : <Eye size={12} />}
            <span>Teks: {isTranscriptHidden ? "HIDE" : "SHOW"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}