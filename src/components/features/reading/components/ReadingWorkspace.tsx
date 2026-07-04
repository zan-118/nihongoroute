"use client";

/**
 * @file ReadingWorkspace.tsx
 * @description Komponen Workspace terintegrasi baru untuk Graded Reading (Dokkai).
 * Menampilkan artikel bahasa Jepang dengan tipografi digital (Medium-style) tanpa boks kartu kaku,
 * mendukung hover kamus klik-kata, scroll progress, dan sinkronisasi E2E.
 */

import React, { useRef, useEffect, useState, useCallback } from "react";
import { m, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { Volume2, Loader2, Sparkles, CheckCircle2, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import FuriganaDisplay from "@/components/ui/FuriganaDisplay";
import { fetchTTSAudio, speakWithWebSpeech, detectVoice, TTS_VOICES } from "@/lib/tts";

interface ReadingWorkspaceProps {
  paragraphs: string[];
  hiraganaParagraphs: string[];
  romajiParagraphs: string[];
  translationParagraphs: string[];
  mode: "kanji" | "furigana" | "romaji" | "hiragana";
  fontSize: "standard" | "large" | "extra";
  showTranslation: boolean;
  isZenMode: boolean;
  onComplete?: () => void;
  isCompleted?: boolean;
  sourceId?: string;
  sourceTitle?: string;
  savedProgress?: { lastParagraphIndex: number; elapsedSeconds: number };
  onProgressChange?: (progress: { activeParagraphIndex: number; elapsedSeconds: number; totalParagraphs: number; hasResumed: boolean }) => void;
}

const FONT_SIZE_CLASSES = {
  standard: "text-lg sm:text-xl md:text-2xl leading-[1.8]",
  large: "text-xl sm:text-2xl md:text-3xl leading-[1.8]",
  extra: "text-2xl sm:text-3xl md:text-4xl leading-[1.8]",
} as const;

export default function ReadingWorkspace({
  paragraphs,
  hiraganaParagraphs,
  romajiParagraphs,
  translationParagraphs,
  mode,
  fontSize,
  showTranslation,
  isZenMode,
  onComplete,
  isCompleted = false,
  sourceId,
  sourceTitle = "Bacaan",
  savedProgress,
  onProgressChange,
}: ReadingWorkspaceProps) {
  const [activeIdx, setActiveIdx] = useState(savedProgress?.lastParagraphIndex || 0);
  const [elapsedSeconds, setElapsedSeconds] = useState(savedProgress?.elapsedSeconds || 0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll Progress Bar
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Paragraph TTS Logic
  const [speakingIdx, setSpeakingIdx] = useState(-1);
  const [loadingIdx, setLoadingIdx] = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSelfPlayingRef = useRef(false);
  const requestIdRef = useRef(0);

  const stopTTS = useCallback(() => {
    requestIdRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingIdx(-1);
    setLoadingIdx(-1);
  }, []);

  const speakParagraph = useCallback(async (text: string, idx: number) => {
    if (speakingIdx === idx || loadingIdx === idx) {
      stopTTS();
      return;
    }

    // Pause other native audios
    window.dispatchEvent(new CustomEvent("nihongoroute_pause_native_audio"));
    isSelfPlayingRef.current = true;
    window.dispatchEvent(new CustomEvent("nihongoroute_pause_line_tts"));

    stopTTS();
    const currentRequestId = requestIdRef.current + 1;
    requestIdRef.current = currentRequestId;
    setLoadingIdx(idx);

    const voice = detectVoice("indah", idx); // default narrator voice
    const ttsUrl = await fetchTTSAudio(text, voice, "medium");

    if (currentRequestId !== requestIdRef.current) return;

    if (ttsUrl) {
      if (!audioRef.current) audioRef.current = new Audio();
      const audio = audioRef.current;
      audio.src = ttsUrl;
      audio.oncanplay = () => {
        if (currentRequestId !== requestIdRef.current) return;
        setLoadingIdx(-1);
        setSpeakingIdx(idx);
      };
      audio.onended = () => setSpeakingIdx(-1);
      audio.onerror = () => {
        setLoadingIdx(-1);
        setSpeakingIdx(-1);
      };
      audio.play().catch(() => setLoadingIdx(-1));
      return;
    }

    // Fallback Web Speech
    setLoadingIdx(-1);
    setSpeakingIdx(idx);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      utterance.onend = () => setSpeakingIdx(-1);
      utterance.onerror = () => setSpeakingIdx(-1);
      window.speechSynthesis.speak(utterance);
    }
  }, [speakingIdx, loadingIdx, stopTTS]);

  // Track elapsed seconds
  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCompleted]);

  // Report progress change
  useEffect(() => {
    if (onProgressChange) {
      const hasResumed = !!savedProgress && (
        savedProgress.lastParagraphIndex > 0 || savedProgress.elapsedSeconds > 0
      );
      onProgressChange({
        activeParagraphIndex: activeIdx,
        elapsedSeconds,
        totalParagraphs: paragraphs.length,
        hasResumed,
      });
    }
  }, [activeIdx, elapsedSeconds, paragraphs.length, onProgressChange, savedProgress]);

  // Stop TTS on clean up
  useEffect(() => {
    return () => {
      stopTTS();
    };
  }, [stopTTS]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Scroll Progress Bar at the top of viewport */}
      <m.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50 shadow-[0_2px_10px_rgba(var(--primary-rgb),0.3)]"
        style={{ scaleX }}
      />

      {/* Distraction-Free Article Feed */}
      <div className="flex flex-col gap-10 md:gap-14 max-w-3xl mx-auto py-6">
        {paragraphs.map((para, idx) => {
          const isActive = idx === activeIdx;
          const isSpeaking = idx === speakingIdx;
          const isLoading = idx === loadingIdx;

          return (
            <div
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={cn(
                "group relative pl-4 border-l-2 transition-all duration-300 cursor-pointer",
                isActive
                  ? "border-primary/60 pl-6"
                  : "border-transparent opacity-85 hover:opacity-100 hover:border-border/60"
              )}
            >
              {/* Furigana Text Display */}
              <div className={cn("font-japanese tracking-wide select-text break-all", FONT_SIZE_CLASSES[fontSize])}>
                <FuriganaDisplay
                  text={para}
                  furigana={hiraganaParagraphs[idx] || ""}
                  romaji={romajiParagraphs[idx] || ""}
                  mode={mode}
                  interactive={true}
                />
              </div>

              {/* Translation Display */}
              <AnimatePresence>
                {(isActive || showTranslation) && translationParagraphs[idx] && (
                  <m.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs sm:text-sm text-muted-foreground/80 leading-relaxed italic border-t border-border/30 pt-3 mt-3 max-w-2xl select-text"
                  >
                    {translationParagraphs[idx]}
                  </m.p>
                )}
              </AnimatePresence>

              {/* Volume Speak Controls */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakParagraph(para, idx);
                }}
                className={cn(
                  "absolute top-1 right-[-32px] p-2 rounded-xl bg-muted/5 border border-border/40 hover:bg-muted/15 transition-all",
                  "opacity-0 group-hover:opacity-100 focus:opacity-100",
                  (isSpeaking || isLoading) && "opacity-100"
                )}
                aria-label="Putar baris audio"
              >
                {isLoading ? (
                  <Loader2 size={13} className="text-primary animate-spin" />
                ) : (
                  <Volume2 size={13} className={cn(isSpeaking && "text-success animate-bounce")} />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* completion Action Button */}
      {!isCompleted && onComplete && (
        <div className="max-w-3xl mx-auto mt-16 text-center border-t border-border/40 pt-10">
          <Button
            onClick={onComplete}
            className="rounded-2xl px-12 py-6 bg-gradient-to-r from-primary to-primary/95 text-white shadow-lg shadow-primary/20 font-black uppercase tracking-wider text-xs hover:scale-105 active:scale-95 transition-all"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" /> Tandai Selesai Membaca
          </Button>
        </div>
      )}
    </div>
  );
}
