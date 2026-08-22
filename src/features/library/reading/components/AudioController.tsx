/**
 * @file AudioController.tsx
 * @description Komponen pengendali audio — native file + Edge TTS AI Voice.
 * Native audio: pakai elemen <audio> HTML dengan CacheStorage offline.
 * TTS: pakai Edge TTS (neural, natural) via /api/tts, fallback ke Web Speech API.
 * Dua sumber audio dipisah dengan ref terpisah agar tidak konflik.
 */

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { PlayCircle, PauseCircle, CheckboxBlank, ErrorWarning, Refresh, Loader, DashboardSpeed } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCachedAudio } from "@/hooks/useCachedAudio";
import { fetchTTSAudio, speakWithWebSpeech, TTS_VOICES } from "@/lib/tts";

// TIPE DATA

/**
 * Props for the AudioController component.
 */
interface AudioControllerProps {
 /** URL of the native audio file. */
 audioUrl?: string;
 /** Text content to be spoken by TTS. */
 textToSpeak?: string;
 /** Disables TTS functionality if true. */
 isTTSDisabled?: boolean;
 /** Compact mode: icon and label only (sidebar). Header mode: horizontal player. Default: floating bar. */
 compact?: boolean;
 /** Renders as a header player if true. */
 header?: boolean;
 /** Callback triggered when audio playback time updates. */
 onTimeUpdate?: (time: number) => void;
 /** External seek time in seconds. */
 externalSeek?: number;
 /** Callback triggered on play/pause toggle. Return true to prevent default behavior. */
 onPlayPause?: () => boolean | void;
 /** Overrides the internal playing state. */
 isPlayingOverride?: boolean;
}

/** Available playback speed options. */
const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5] as const;

/** Type representing one of the available playback speed options. */
type SpeedOption = typeof SPEED_OPTIONS[number];

/**
 * Removes bracketed text and normalizes whitespace.
 * @param text - Raw input text.
 * @returns Cleaned text.
 */
const cleanText = (text: string) =>
 text.replace(/\[.*?\]/g, "").replace(/[\[\]]/g, "").replace(/\s+/g, " ").trim();

/**
 * Formats seconds into MM:SS format.
 * @param t - Time in seconds.
 * @returns Formatted time string.
 */
const formatTime = (t: number) => {
 const m = Math.floor(t / 60);
 const s = Math.floor(t % 60);
 return `${m}:${s.toString().padStart(2, "0")}`;
};

// KOMPONEN UTAMA

/**
 * AudioController component.
 * Handles native audio playback and TTS fallback.
 */
export default function AudioController({
 audioUrl,
 textToSpeak,
 isTTSDisabled,
 compact = false,
 header = false,
 onTimeUpdate,
 externalSeek,
 onPlayPause,
 isPlayingOverride,
}: AudioControllerProps) {

 // ── State ──────────────────────────────────────────────
 /** Cached version of the native audio URL. */
 const cachedAudioUrl = useCachedAudio(audioUrl);

 const [isPlaying, setIsPlaying] = useState(false);
 const [isTTS, setIsTTS] = useState(false);
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [duration, setDuration] = useState(0);
 const [currentTime, setCurrentTime] = useState(0);
 const [playbackSpeed, setPlaybackSpeed] = useState<SpeedOption>(1);
 const [showSpeedMenu, setShowSpeedMenu] = useState(false);

 // ── Refs ───────────────────────────────────────────────
 /** Elemen <audio> untuk native file */
 const nativeAudioRef = useRef<HTMLAudioElement | null>(null);
  /** Elemen Audio() untuk TTS: terpisah dari native */
 const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
 /** Fungsi stop untuk Web Speech API fallback */
 const stopSpeechRef = useRef<(() => void) | null>(null);
 /** Tracking seek agar tidak double-trigger */
 const lastSeekRef = useRef<number | undefined>(undefined);
 /** Tracks active TTS request ID to prevent race conditions. */
 const ttsRequestIdRef = useRef(0);
 /** Tracks last rendered time to throttle updates. */
 const lastRenderedTimeRef = useRef(0);
 /** Tracks pending time update for requestAnimationFrame. */
 const pendingTimeRef = useRef<number | null>(null);
 /** requestAnimationFrame ID. */
 const timeUpdateFrameRef = useRef<number | null>(null);
 /** Mutable ref for callback to avoid effect re-runs. */
 const onTimeUpdateRef = useRef(onTimeUpdate);
 
 /** Tracks active blob URL for cleanup. */
 const ttsObjectUrlRef = useRef<string | null>(null);

 /** Revokes active blob URL to prevent memory leaks. */
 const cleanupTTSObjectUrl = useCallback(() => {
 if (ttsObjectUrlRef.current) {
 URL.revokeObjectURL(ttsObjectUrlRef.current);
 ttsObjectUrlRef.current = null;
 }
 }, []);

 // ── Helpers ────────────────────────────────────────────
 /** Cancels pending animation frame. */
 const cancelTimeUpdateFrame = useCallback(() => {
 if (timeUpdateFrameRef.current !== null) {
 cancelAnimationFrame(timeUpdateFrameRef.current);
 timeUpdateFrameRef.current = null;
 }
 pendingTimeRef.current = null;
 }, []);

 /** Throttles time updates to parent component. */
 const publishCurrentTime = useCallback((time: number, force = false) => {
 if (!force && Math.abs(time - lastRenderedTimeRef.current) < 0.2) {
 return;
 }

 lastRenderedTimeRef.current = time;
 setCurrentTime(time);
 onTimeUpdateRef.current?.(time);
 }, []);

 /** Schedules time update using requestAnimationFrame. */
 const scheduleCurrentTime = useCallback((time: number, force = false) => {
 if (force) {
 cancelTimeUpdateFrame();
 publishCurrentTime(time, true);
 return;
 }

 pendingTimeRef.current = time;
 if (timeUpdateFrameRef.current !== null) return;

 timeUpdateFrameRef.current = requestAnimationFrame(() => {
 timeUpdateFrameRef.current = null;
 const nextTime = pendingTimeRef.current;
 pendingTimeRef.current = null;

 if (nextTime !== null) {
 publishCurrentTime(nextTime);
 }
 });
 }, [cancelTimeUpdateFrame, publishCurrentTime]);

 // ── Stop semua ─────────────────────────────────────────
 /** Stops all audio sources and resets state. */
 const stopAll = useCallback(() => {
 ttsRequestIdRef.current++;
 cancelTimeUpdateFrame();
 if (nativeAudioRef.current) {
 nativeAudioRef.current.pause();
 nativeAudioRef.current.currentTime = 0;
 }
 if (ttsAudioRef.current) {
 ttsAudioRef.current.pause();
 ttsAudioRef.current.src = "";
 ttsAudioRef.current = null;
 }
 cleanupTTSObjectUrl();
 stopSpeechRef.current?.();
 stopSpeechRef.current = null;
 if (typeof window !== "undefined" && window.speechSynthesis) {
 window.speechSynthesis.cancel();
 }
 setIsPlaying(false);
 setIsTTS(false);
 setIsLoading(false);
 publishCurrentTime(0, true);
 }, [cancelTimeUpdateFrame, cleanupTTSObjectUrl, publishCurrentTime]);

 // ── Effects ────────────────────────────────────────────
 // Playback speed → native audio
 useEffect(() => {
 onTimeUpdateRef.current = onTimeUpdate;
 }, [onTimeUpdate]);

 // Updates playback rate on audio elements.
 useEffect(() => {
 if (nativeAudioRef.current) nativeAudioRef.current.playbackRate = playbackSpeed;
 if (ttsAudioRef.current) ttsAudioRef.current.playbackRate = playbackSpeed;
 }, [playbackSpeed]);

 // External seek dari klik baris karaoke → native audio
 useEffect(() => {
 if (
 externalSeek !== undefined &&
 externalSeek !== lastSeekRef.current &&
 nativeAudioRef.current
 ) {
 lastSeekRef.current = externalSeek;
 nativeAudioRef.current.currentTime = externalSeek;
 scheduleCurrentTime(externalSeek, true);

 // Auto-play when seeking from karaoke / dictation
 window.dispatchEvent(new CustomEvent("nihongoroute_pause_line_tts"));
 nativeAudioRef.current.play()
 .then(() => {
 setIsPlaying(true);
 setIsTTS(false);
 setIsLoading(false);
 setError(null);
 })
 .catch(() => {});
 }
 }, [externalSeek, scheduleCurrentTime]);

 // Listen to pause event from line TTS
 useEffect(() => {
 const handlePauseAll = () => {
 stopAll();
 };
 window.addEventListener("nihongoroute_pause_native_audio", handlePauseAll);
 return () => {
 window.removeEventListener("nihongoroute_pause_native_audio", handlePauseAll);
 };
 }, [stopAll]);

 // Cleanup saat unmount
 useEffect(() => {
 const native = nativeAudioRef.current;
 const tts = ttsAudioRef.current;
 return () => {
 native?.pause();
 tts?.pause();
 cleanupTTSObjectUrl();
 stopSpeechRef.current?.();
 if (typeof window !== "undefined" && window.speechSynthesis) {
 window.speechSynthesis.cancel();
 }
 cancelTimeUpdateFrame();
 };
 }, [cancelTimeUpdateFrame, cleanupTTSObjectUrl]);

 // Tutup speed menu klik di luar
 useEffect(() => {
 if (!showSpeedMenu) return;
 const h = () => setShowSpeedMenu(false);
 document.addEventListener("click", h);
 return () => document.removeEventListener("click", h);
 }, [showSpeedMenu]);

 // ── Native audio toggle ────────────────────────────────
 /** Toggles native audio playback. */
 const toggleNativeAudio = () => {
 const el = nativeAudioRef.current;
 if (!el) return;

 if (isPlaying && !isTTS) {
 el.pause();
 setIsPlaying(false);
 return;
 }

 if (isTTS) stopAll();

 setIsLoading(true);
 window.dispatchEvent(new CustomEvent("nihongoroute_pause_line_tts"));
 el.play()
 .then(() => { setIsPlaying(true); setIsTTS(false); setIsLoading(false); })
 .catch(() => { setError("Gagal memutar audio."); setIsLoading(false); });
 };

 // ── TTS toggle (Edge TTS → Web Speech fallback) ────────
 /** Toggles TTS playback with Web Speech fallback. */
 const toggleTTS = async () => {
 const text = cleanText(textToSpeak || "");
 if (!text) { setError("Tidak ada teks untuk dibaca."); return; }

 // PauseCircle / resume TTS audio yang sudah ada
 if (isTTS && ttsAudioRef.current) {
 if (isPlaying) { ttsAudioRef.current.pause(); setIsPlaying(false); }
 else { ttsAudioRef.current.play().then(() => setIsPlaying(true)).catch(() => {}); }
 return;
 }

 // Mulai TTS baru
 stopAll();
 setIsLoading(true);
 ttsRequestIdRef.current++;
 const myRequestId = ttsRequestIdRef.current;
 window.dispatchEvent(new CustomEvent("nihongoroute_pause_line_tts"));

  // fetchTTSAudio mengembalikan URL API route: bukan blob URL
 const ttsUrl = await fetchTTSAudio(text, TTS_VOICES.ZUNDAMON, "medium");

 if (myRequestId !== ttsRequestIdRef.current) return;

 if (ttsUrl) {
 cleanupTTSObjectUrl();
 if (ttsUrl.startsWith("blob:")) {
 ttsObjectUrlRef.current = ttsUrl;
 }
 const ttsEl = new Audio(ttsUrl);
 ttsEl.playbackRate = playbackSpeed;
 ttsAudioRef.current = ttsEl;

 ttsEl.oncanplay = () => {
 setIsLoading(false);
 setIsPlaying(true);
 setIsTTS(true);
 setError(null);
 };

 ttsEl.onended = () => {
 setIsPlaying(false);
 setIsTTS(false);
 ttsAudioRef.current = null;
 cleanupTTSObjectUrl();
 };

 ttsEl.onerror = () => {
 ttsAudioRef.current = null;
 cleanupTTSObjectUrl();
 setIsLoading(false);
 setIsPlaying(true);
 setIsTTS(true);
 stopSpeechRef.current = speakWithWebSpeech(
 text, TTS_VOICES.ZUNDAMON, playbackSpeed,
 () => { setIsPlaying(false); setIsTTS(false); },
 () => { setError("Gagal AI Voice."); setIsPlaying(false); setIsTTS(false); }
 );
 };

 ttsEl.play().catch(() => { setIsLoading(false); setError("Gagal memutar AI Voice."); });
 } else {     // Edge TTS tidak tersedia: fallback ke Web Speech API
 setIsLoading(false);
 setIsPlaying(true);
 setIsTTS(true);
 stopSpeechRef.current = speakWithWebSpeech(
 text, TTS_VOICES.ZUNDAMON, playbackSpeed,
 () => { setIsPlaying(false); setIsTTS(false); },
 () => { setError("Gagal AI Voice."); setIsPlaying(false); setIsTTS(false); }
 );
 }
 };

 // ── PlayCircle/PauseCircle dispatch ────────────────────────────────
 /** Dispatches play/pause action. */
 const handlePlayPause = () => {
 if (onPlayPause) {
 const preventDefault = onPlayPause();
 if (preventDefault) return;
 }

 if (audioUrl?.trim()) toggleNativeAudio();
 else if (!isTTSDisabled) toggleTTS();
 else setError("Audio dinonaktifkan.");
 };

 /** Handles manual seek bar changes. */
 const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
 const t = parseFloat(e.target.value);
 if (nativeAudioRef.current) {
 nativeAudioRef.current.currentTime = t;
 lastSeekRef.current = t;
 }
 scheduleCurrentTime(t, true);
 };

 /** Updates playback speed. */
 const handleSpeedChange = (speed: SpeedOption, e: React.MouseEvent) => {
 e.stopPropagation();
 setPlaybackSpeed(speed);
 setShowSpeedMenu(false);
 };

 // ── Icon ───────────────────────────────────────────────
 const isPlayingActive = isPlayingOverride !== undefined ? isPlayingOverride : isPlaying;
 const iconSize = compact ? 20 : header ? 20 : 28;
 const PlayIcon = isLoading
 ? <Loader size={compact ? 18 : 24} className="animate-spin" />
 : isPlayingActive
 ? <PauseCircle size={iconSize} fill="currentColor" />
 : <PlayCircle size={iconSize} fill="currentColor" className={!compact ? "ml-1" : undefined} />;

 return (
 <div className={cn(
 "flex items-center gap-4 transition-all duration-500",
 compact ? "relative"
 : header ? "relative w-full max-w-sm"
 : "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl"
 )}>
 {/* Error toast */}
 {error && (
 <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs whitespace-nowrap animate-in fade-in slide-in-">
 <ErrorWarning size={14} />
 {error}
 </div>
 )}

 <div className={cn(
 "flex items-center transition-all duration-300",
 compact 
 ? "p-0.5 bg-transparent gap-2.5" 
 : "bg-card/55 border border-border/50 shadow-xl ring-1 ring-border w-full",
 header 
 ? "rounded-lg px-4 py-3 gap-3" 
 : !compact ? "rounded-2xl md:rounded-3xl px-4 py-3 justify-between gap-4" : ""
 )}>
 {/* PlayCircle / PauseCircle */}
 <Button
 variant="ghost"
 size="icon"
 disabled={isLoading}
 onClick={handlePlayPause}
 aria-label={isLoading ? "Memuat..." : isPlayingActive ? "PauseCircle" : "Putar"}
 className={cn(
 "rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 active:scale-90 shrink-0",
 compact ? "w-10 h-10" : header ? "w-10 h-10" : "w-14 h-14",
 isLoading && "cursor-wait"
 )}
 >
 {PlayIcon}
 </Button>

 {/* ── Header mode: progress bar ── */}
 {header && audioUrl && (
 <div className="flex-1 flex flex-col gap-1">
 <div className="flex justify-between items-center">
 <span className="text-[10px] font-black uppercase tracking-wider text-primary/70">
 {isTTS ? "AI Voice" : "Audio"}
 </span>
 <span className="text-[10px] font-mono text-muted-foreground">
 {formatTime(currentTime)} / {formatTime(duration)}
 </span>
 </div>
 <div className="relative group h-5 flex items-center">
 <input
 aria-label="Posisi audio"
 type="range" min="0" max={duration || 100} value={currentTime}
 onChange={handleSeek}
 className="absolute inset-0 w-full h-1 bg-primary/10 rounded-full appearance-none cursor-pointer accent-primary group-hover:h-1.5 transition-all"
 />
 <div
 className="h-1 bg-primary rounded-full pointer-events-none group-hover:h-1.5 transition-all"
 style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
 />
 </div>
 </div>
 )}

 {/* Header tanpa audio */}
 {header && !audioUrl && (
 <div className="flex flex-col">
 <span className="text-[10px] font-black uppercase tracking-wider text-primary/70">AI Smart Voice</span>
 <span className="text-xs font-bold text-foreground">
 {isLoading ? "Memuat..." : isPlayingActive ? "Membaca..." : "Siap"}
 </span>
 </div>
 )}

 {/* ── Floating bar mode: progress bar ── */}
 {!compact && !header && audioUrl && (
 <div className="flex-1 flex flex-col gap-1 px-2">
 <div className="flex justify-between items-center px-1">
 <span className="text-[10px] font-black uppercase tracking-wider text-primary/70">
 {isTTS ? "AI Reading" : "Native Audio"}
 </span>
 <span className="text-[10px] font-mono text-muted-foreground">
 {formatTime(currentTime)} / {formatTime(duration)}
 </span>
 </div>
 <div className="relative group h-6 flex items-center">
 <input
 aria-label="Posisi audio"
 type="range" min="0" max={duration || 100} value={currentTime}
 onChange={handleSeek}
 className="absolute inset-0 w-full h-1 bg-primary/10 rounded-full appearance-none cursor-pointer accent-primary group-hover:h-1.5 transition-all"
 />
 <div
 className="h-1 bg-primary rounded-full pointer-events-none group-hover:h-1.5 transition-all"
 style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
 />
 </div>
 </div>
 )}

 {/* ── Compact / tanpa audio: status label ── */}
 {(compact || (!audioUrl && !header)) && (
 <div className="flex flex-col pr-2 pl-2">
 <span className="text-[10px] font-black uppercase tracking-wider text-primary/70 mb-0.5">
 {audioUrl ? "Native" : "AI Smart Voice"}
 </span>
 <span className="text-xs font-bold text-foreground line-clamp-1">
 {isLoading ? "Memuat..." : isPlayingActive ? (isTTS ? "Membaca..." : "Memutar...") : "Siap?"}
 </span>
 </div>
 )}

 {/* ── Aksi sekunder (floating & header) ── */}
 {!compact && (
 <div className="flex items-center gap-1 pr-2">
 {/* Speed */}
 <div className="relative">
 <Button
 variant="ghost" size="icon"
 onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(v => !v); }}
 aria-label="Kecepatan putar"
 title={`Kecepatan: ${playbackSpeed}×`}
 className="size-10 rounded-full hover:bg-background/5 text-muted-foreground/60 hover:text-primary transition-all"
 >
 <DashboardSpeed size={16} />
 </Button>
 {showSpeedMenu && (
 <div className="absolute bottom-full mb-2 right-0 flex flex-col gap-1 p-2 rounded-lg bg-card border border-border shadow-2xl z-50 min-w-[80px]">
 {SPEED_OPTIONS.map(speed => (
 <button
 key={speed}
 type="button"
 onClick={(e) => handleSpeedChange(speed, e)}
 className={cn(
 "px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-left",
 playbackSpeed === speed
 ? "bg-primary text-primary-foreground"
 : "text-muted-foreground hover:bg-muted hover:text-foreground"
 )}
 >
 {speed}×
 </button>
 ))}
 </div>
 )}
 </div>

 {/* Ulangi */}
 <Button
 variant="ghost" size="icon"
 onClick={() => {
 if (nativeAudioRef.current) {
 nativeAudioRef.current.currentTime = 0;
 lastSeekRef.current = 0;
 if (!isPlayingActive) handlePlayPause();
 }
 }}
 aria-label="Ulangi dari awal"
 className="size-10 rounded-full hover:bg-background/5 text-muted-foreground/60 hover:text-primary transition-all"
 >
 <Refresh size={18} />
 </Button>

 {/* Stop */}
 <Button
 variant="ghost" size="icon"
 onClick={stopAll}
 disabled={!isPlayingActive && currentTime === 0}
 aria-label="Stop"
 className="size-10 rounded-full hover:bg-background/5 text-muted-foreground/60 hover:text-destructive transition-all"
 >
 <CheckboxBlank size={18} fill="currentColor" />
 </Button>
 </div>
 )}

 {/* Elemen audio native — tersembunyi, hanya untuk file audio URL */}
 {audioUrl && (
 <audio
 ref={nativeAudioRef}
 src={cachedAudioUrl}
 aria-label="Native audio player"
 onWaiting={() => setIsLoading(true)}
 onCanPlay={() => setIsLoading(false)}
 onDurationChange={(e) => setDuration(e.currentTarget.duration)}
 onTimeUpdate={(e) => {
 scheduleCurrentTime(e.currentTarget.currentTime);
 }}
 onEnded={() => { setIsPlaying(false); scheduleCurrentTime(0, true); setIsLoading(false); }}
 onError={() => { setError("Gagal memuat file audio."); setIsLoading(false); setIsPlaying(false); }}
 />
 )}
 </div>
 </div>
 );
}