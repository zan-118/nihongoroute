/**
 * @file AudioController.tsx
 * @description Komponen pengendali audio — native file + Edge TTS AI Voice.
 * Native audio: pakai elemen <audio> HTML dengan CacheStorage offline.
 * TTS: pakai Edge TTS (neural, natural) via /api/tts, fallback ke Web Speech API.
 * Dua sumber audio dipisah dengan ref terpisah agar tidak konflik.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Square, AlertCircle, RotateCcw, Loader2, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCachedAudio } from "@/hooks/useCachedAudio";
import { fetchTTSAudio, speakWithWebSpeech, TTS_VOICES } from "@/lib/tts";

// ============================================================
// TIPE DATA
// ============================================================
interface AudioControllerProps {
  audioUrl?: string;
  textToSpeak?: string;
  isTTSDisabled?: boolean;
  /** compact: ikon + label saja (sidebar). header: player horizontal. default: floating bar */
  compact?: boolean;
  header?: boolean;
  onTimeUpdate?: (time: number) => void;
  externalSeek?: number;
  onPlayPause?: () => boolean | void;
  isPlayingOverride?: boolean;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5] as const;
type SpeedOption = typeof SPEED_OPTIONS[number];

const cleanText = (text: string) =>
  text.replace(/\[.*?\]/g, "").replace(/[\[\]]/g, "").replace(/\s+/g, " ").trim();

const formatTime = (t: number) => {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

// ============================================================
// KOMPONEN UTAMA
// ============================================================
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
  const cachedAudioUrl = useCachedAudio(audioUrl);

  const [isPlaying,     setIsPlaying]     = useState(false);
  const [isTTS,         setIsTTS]         = useState(false);
  const [isLoading,     setIsLoading]     = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [duration,      setDuration]      = useState(0);
  const [currentTime,   setCurrentTime]   = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<SpeedOption>(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // ── Refs ───────────────────────────────────────────────
  /** Elemen <audio> untuk native file */
  const nativeAudioRef = useRef<HTMLAudioElement | null>(null);
  /** Elemen Audio() untuk TTS — terpisah dari native */
  const ttsAudioRef    = useRef<HTMLAudioElement | null>(null);
  /** Fungsi stop untuk Web Speech API fallback */
  const stopSpeechRef  = useRef<(() => void) | null>(null);
  /** Tracking seek agar tidak double-trigger */
  const lastSeekRef    = useRef<number | undefined>(undefined);
  const ttsRequestIdRef = useRef(0);
  const lastRenderedTimeRef = useRef(0);
  const pendingTimeRef = useRef<number | null>(null);
  const timeUpdateFrameRef = useRef<number | null>(null);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  
  const ttsObjectUrlRef = useRef<string | null>(null);
  const cleanupTTSObjectUrl = useCallback(() => {
    if (ttsObjectUrlRef.current) {
      URL.revokeObjectURL(ttsObjectUrlRef.current);
      ttsObjectUrlRef.current = null;
    }
  }, []);


  // ── Helpers ────────────────────────────────────────────
  const cancelTimeUpdateFrame = useCallback(() => {
    if (timeUpdateFrameRef.current !== null) {
      cancelAnimationFrame(timeUpdateFrameRef.current);
      timeUpdateFrameRef.current = null;
    }
    pendingTimeRef.current = null;
  }, []);

  const publishCurrentTime = useCallback((time: number, force = false) => {
    if (!force && Math.abs(time - lastRenderedTimeRef.current) < 0.2) {
      return;
    }

    lastRenderedTimeRef.current = time;
    setCurrentTime(time);
    onTimeUpdateRef.current?.(time);
  }, []);

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

  useEffect(() => {
    if (nativeAudioRef.current) nativeAudioRef.current.playbackRate = playbackSpeed;
    if (ttsAudioRef.current)    ttsAudioRef.current.playbackRate    = playbackSpeed;
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
    const tts    = ttsAudioRef.current;
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
  const toggleTTS = async () => {
    const text = cleanText(textToSpeak || "");
    if (!text) { setError("Tidak ada teks untuk dibaca."); return; }

    // Pause / resume TTS audio yang sudah ada
    if (isTTS && ttsAudioRef.current) {
      if (isPlaying) { ttsAudioRef.current.pause(); setIsPlaying(false); }
      else           { ttsAudioRef.current.play().then(() => setIsPlaying(true)).catch(() => {}); }
      return;
    }

    // Mulai TTS baru
    stopAll();
    setIsLoading(true);
    ttsRequestIdRef.current++;
    const myRequestId = ttsRequestIdRef.current;
    window.dispatchEvent(new CustomEvent("nihongoroute_pause_line_tts"));

    // fetchTTSAudio mengembalikan URL API route — bukan blob URL
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
    } else {
      // Edge TTS tidak tersedia — fallback ke Web Speech API
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

  // ── Play/Pause dispatch ────────────────────────────────
  const handlePlayPause = () => {
    if (onPlayPause) {
      const preventDefault = onPlayPause();
      if (preventDefault) return;
    }

    if (audioUrl?.trim()) toggleNativeAudio();
    else if (!isTTSDisabled) toggleTTS();
    else setError("Audio dinonaktifkan.");
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    if (nativeAudioRef.current) {
      nativeAudioRef.current.currentTime = t;
      lastSeekRef.current = t;
    }
    scheduleCurrentTime(t, true);
  };

  const handleSpeedChange = (speed: SpeedOption, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  // ── Icon ───────────────────────────────────────────────
  const isPlayingActive = isPlayingOverride !== undefined ? isPlayingOverride : isPlaying;
  const iconSize = compact ? 20 : header ? 20 : 28;
  const PlayIcon = isLoading
    ? <Loader2 size={compact ? 18 : 24} className="animate-spin" />
    : isPlayingActive
      ? <Pause size={iconSize} fill="currentColor" />
      : <Play  size={iconSize} fill="currentColor" className={!compact ? "ml-1" : undefined} />;

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className={cn(
      "flex items-center gap-4 transition-all duration-500",
      compact ? "relative"
        : header ? "relative w-full max-w-sm"
        : "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl"
    )}>
      {/* Error toast */}
      {error && (
        <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs whitespace-nowrap animate-in fade-in slide-in-from-bottom-2">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <div className={cn(
        "w-full flex items-center gap-4 rounded-full p-2 transition-all duration-500",
        "bg-card/55 backdrop-blur-md border border-border/50 shadow-xl ring-1 ring-white/5",
        compact && "p-1 bg-transparent border-none ring-0 shadow-none",
        header  && "rounded-2xl px-4 py-3 gap-3"
      )}>
        {/* Play / Pause */}
        <Button
          variant="ghost"
          size="icon"
          disabled={isLoading}
          onClick={handlePlayPause}
          aria-label={isLoading ? "Memuat..." : isPlayingActive ? "Pause" : "Putar"}
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
              <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">
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
          <div className="flex flex-col flex-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">AI Smart Voice</span>
            <span className="text-xs font-bold text-foreground">
              {isLoading ? "Memuat..." : isPlayingActive ? "Membaca..." : "Siap"}
            </span>
          </div>
        )}

        {/* ── Floating bar mode: progress bar ── */}
        {!compact && !header && audioUrl && (
          <div className="flex-1 flex flex-col gap-1 px-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">
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
            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70 mb-0.5">
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
                <Gauge size={16} />
              </Button>
              {showSpeedMenu && (
                <div className="absolute bottom-full mb-2 right-0 flex flex-col gap-1 p-2 rounded-2xl bg-card border border-border shadow-2xl z-50 min-w-[80px]">
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
              <RotateCcw size={18} />
            </Button>

            {/* Stop */}
            <Button
              variant="ghost" size="icon"
              onClick={stopAll}
              disabled={!isPlayingActive && currentTime === 0}
              aria-label="Stop"
              className="size-10 rounded-full hover:bg-background/5 text-muted-foreground/60 hover:text-destructive transition-all"
            >
              <Square size={18} fill="currentColor" />
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
