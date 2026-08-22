"use client";

/**
 * @file ReadingWorkspace.tsx
 * @description Komponen Workspace terintegrasi baru untuk Graded Reading (Dokkai).
 * Menampilkan artikel bahasa Jepang dengan tipografi digital (Medium-style) tanpa boks kartu kaku,
 * mendukung hover kamus klik-kata, scroll progress, dan sinkronisasi E2E.
 */

import React, { useRef, useEffect, useState, useCallback } from "react";
import { m, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { VolumeUp, Loader, Check, Bookmark } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FuriganaDisplay } from "@/components/ui/japanese";
import { fetchTTSAudio, speakWithWebSpeech, detectVoice, TTS_VOICES } from "@/lib/tts";

/**
 * Props for the ReadingWorkspace component.
 */
interface ReadingWorkspaceProps {
 /** Array of raw Japanese paragraphs */
 paragraphs: string[];
 /** Array of hiragana readings corresponding to each paragraph */
 hiraganaParagraphs: string[];
 /** Array of translations corresponding to each paragraph */
 translationParagraphs: string[];
 /** Current display mode for Japanese text */
 mode: "kanji" | "furigana" | "hiragana";
 /** Font size configuration */
 fontSize: "standard" | "large" | "extra";
 /** Toggle to show or hide translations */
 showTranslation: boolean;
 /** Toggle for distraction-free zen mode */
 isZenMode: boolean;
 /** Callback triggered when reading is completed */
 onComplete?: () => void;
 /** Completion status of the reading material */
 isCompleted?: boolean;
 /** Unique identifier for the reading source */
 sourceId?: string;
 /** Title of the reading source */
 sourceTitle?: string;
 /** Index of the currently active paragraph */
 activeParagraphIndex: number;
 /** Callback triggered when the active paragraph changes */
 onParagraphChange?: (index: number) => void;
}

/**
 * Tailwind CSS classes mapping for different font size options.
 */
const FONT_SIZE_CLASSES = {
 standard: "text-lg sm:text-xl md:text-2xl leading-[1.8]",
 large: "text-xl sm:text-2xl md:text-3xl leading-[1.8]",
 extra: "text-2xl sm:text-3xl md:text-4xl leading-[1.8]",
} as const;

/**
 * ReadingWorkspace component.
 * Provides an interactive reading environment with TTS, translation toggles, and scroll tracking.
 */
function ReadingWorkspace({
 paragraphs,
 hiraganaParagraphs,
 translationParagraphs,
 mode,
 fontSize,
 showTranslation,
 isZenMode,
 onComplete,
 isCompleted = false,
 sourceId,
 sourceTitle = "Bacaan",
 activeParagraphIndex,
 onParagraphChange,
}: ReadingWorkspaceProps) {
 // Reference to the main container element
 const containerRef = useRef<HTMLDivElement>(null);

 // Scroll Progress Bar tracking
 const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
 const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

 // Paragraph TTS Logic states
 const [speakingIdx, setSpeakingIdx] = useState(-1);
 const [loadingIdx, setLoadingIdx] = useState(-1);
 const audioRef = useRef<HTMLAudioElement | null>(null);
 const isSelfPlayingRef = useRef(false);
 const requestIdRef = useRef(0);

 /**
 * Stops any active TTS playback and resets state.
 */
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

 /**
 * Plays TTS audio for a specific paragraph.
 * Falls back to Web Speech API if external TTS fails.
 */
 const speakParagraph = useCallback(async (text: string, idx: number) => {
 if (speakingIdx === idx || loadingIdx === idx) {
 stopTTS();
 return;
 }

 // PauseCircle other native audio players on the page
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

 // Fallback Web Speech API
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

 // Stop TTS on component unmount
 useEffect(() => {
 return () => {
 stopTTS();
 };
 }, [stopTTS]);

 return (
 <div ref={containerRef} className="relative w-full">
 {/* Scroll Progress Bar at the top of viewport */}
 <m.div
 className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50 shadow-sm"
 style={{ scaleX }}
 />

 {/* Distraction-Free Article Feed */}
 <div className="flex flex-col gap-10 md:gap-14 max-w-3xl mx-auto py-6">
 {paragraphs.map((para, idx) => {
 const isActive = idx === activeParagraphIndex;
 const isSpeaking = idx === speakingIdx;
 const isLoading = idx === loadingIdx;

 return (
 <div
 key={idx}
 onClick={() => onParagraphChange?.(idx)}
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
 "absolute top-1 -right-8 p-2 rounded-xl bg-muted/5 border border-border/40 hover:bg-muted/15 transition-all",
 "opacity-0 group-hover:opacity-100 focus:opacity-100",
 (isSpeaking || isLoading) && "opacity-100"
 )}
 aria-label="Putar baris audio"
 >
 {isLoading ? (
 <Loader size={13} className="text-primary animate-spin" />
 ) : (
 <VolumeUp size={13} className={cn(isSpeaking && "text-success animate-bounce")} />
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
 className="rounded-lg px-12 py-6 bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-black uppercase tracking-wider text-xs hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all"
 >
 <Check className="mr-2 h-4 w-4" /> Tandai Selesai Membaca
 </Button>
 </div>
 )}
 </div>
 );
}

export default React.memo(ReadingWorkspace);