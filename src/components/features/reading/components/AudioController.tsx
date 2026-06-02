/**
 * @file AudioController.tsx
 * @description Komponen pengendali pemutaran audio native (berkas suara) dan AI Voice (Text-to-Speech) dengan dukungan caching luring, loading state, dan kontrol kecepatan putar.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, AlertCircle, RotateCcw, Loader2, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCachedAudio } from "@/hooks/useCachedAudio";

// ==========================================
// TIPE DATA / INTERFACE
// ==========================================
interface AudioControllerProps {
  audioUrl?: string;
  textToSpeak?: string;
  isTTSDisabled?: boolean;
  /** compact: ikon + label kecil saja (sidebar). header: player penuh tapi horizontal. default: floating bottom bar */
  compact?: boolean;
  header?: boolean;
  onTimeUpdate?: (time: number) => void;
  externalSeek?: number;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5] as const;
type SpeedOption = typeof SPEED_OPTIONS[number];

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * Komponen kontrol pemutar audio artikel.
 */
export default function AudioController({ 
  audioUrl, 
  textToSpeak, 
  isTTSDisabled,
  compact = false,
  header = false,
  onTimeUpdate,
  externalSeek
}: AudioControllerProps) {
  // ==========================================
  // STATUS & STATE & HOOKS
  // ==========================================
  const cachedAudioUrl = useCachedAudio(audioUrl);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTTS, setIsTTS] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<SpeedOption>(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ttsRef = useRef<SpeechSynthesisUtterance | null>(null);
  // Ref untuk melacak seek yang sedang diproses agar tidak double-trigger
  const lastSeekRef = useRef<number | undefined>(undefined);

  // ==========================================
  // FUNGSI PENGENDALI UTAMA (HANDLERS)
  // ==========================================

  // Hentikan semua pemutaran — didefinisikan sebelum useEffect agar cleanup unmount bisa mengaksesnya
  const stopAll = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsTTS(false);
    setIsLoading(false);
    setCurrentTime(0);
  };

  // ==========================================
  // EFEK SAMPING (EFFECTS)
  // ==========================================

  // Terapkan playback speed ke elemen audio saat berubah
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Sinkronkan pemutaran eksternal (seek dari klik baris transkrip)
  useEffect(() => {
    if (
      externalSeek !== undefined &&
      externalSeek !== lastSeekRef.current &&
      audioRef.current
    ) {
      lastSeekRef.current = externalSeek;
      audioRef.current.currentTime = externalSeek;
      setCurrentTime(externalSeek);
    }
  }, [externalSeek]);

  // Hentikan semuanya saat komponen unmount
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Tutup speed menu saat klik di luar
  useEffect(() => {
    if (!showSpeedMenu) return;
    const handler = () => setShowSpeedMenu(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showSpeedMenu]);

  const cleanTextForTTS = (text: string) => {
    if (!text) return "";
    return text
      .replace(/\[.*?\]/g, "") 
      .replace(/[\[\]]/g, "")  
      .replace(/\s+/g, " ")    
      .trim();
  };

  const toggleNativeAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying && !isTTS) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (isTTS) stopAll();
      setIsLoading(true);
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setIsTTS(false);
        setIsLoading(false);
      }).catch(err => {
        console.error("Audio playback error:", err);
        setError("Gagal memutar audio.");
        setIsPlaying(false);
        setIsLoading(false);
      });
    }
  };

  const toggleTTS = () => {
    const textToPlay = cleanTextForTTS(textToSpeak || "");
    if (!textToPlay) {
      setError("Tidak ada teks untuk dibaca.");
      return;
    }

    if (isPlaying && isTTS) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else if (!isPlaying && isTTS) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
    } else {
      stopAll();
      const utterance = new SpeechSynthesisUtterance(textToPlay);
      utterance.lang = "ja-JP";
      utterance.rate = playbackSpeed * 0.85;
      
      utterance.onstart = () => {
        setIsPlaying(true);
        setIsTTS(true);
        setError(null);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsTTS(false);
      };

      utterance.onerror = (e) => {
        if (e.error !== "interrupted") {
          setError("Gagal menjalankan AI Voice.");
        }
        setIsPlaying(false);
        setIsTTS(false);
      };

      ttsRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePlayPause = () => {
    const hasNative = audioUrl && audioUrl.trim().length > 0;
    if (hasNative) {
      toggleNativeAudio();
    } else if (!isTTSDisabled) {
      toggleTTS();
    } else {
      setError("Audio dan AI Voice dinonaktifkan.");
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      lastSeekRef.current = time;
    }
  };

  const handleSpeedChange = (speed: SpeedOption, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Ikon tombol play — loading spinner saat buffering
  const PlayIcon = isLoading
    ? <Loader2 size={compact ? 18 : 26} className="animate-spin" />
    : isPlaying
      ? <Pause size={compact ? 20 : 28} fill="currentColor" />
      : <Play size={compact ? 20 : 28} fill="currentColor" className={compact ? "ml-0.5" : "ml-1"} />;

  // ==========================================
  // RENDER KOMPONEN
  // ==========================================
  return (
    <div className={cn(
      "flex items-center gap-4 transition-all duration-500",
      compact 
        ? "relative" 
        : header
          ? "relative w-full max-w-sm"
          : "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl"
    )}>
      {error && (
        <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs animate-in fade-in slide-in-from-bottom-2 whitespace-nowrap">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <div className={cn(
        "w-full flex items-center gap-4 rounded-full p-2 transition-all duration-500",
        "bg-card/40 backdrop-blur-3xl border border-border/50 shadow-2xl ring-1 ring-white/5",
        compact && "p-1 bg-transparent border-none ring-0 shadow-none",
        header && "rounded-2xl px-4 py-3 gap-3"
      )}>
        {/* Tombol Putar/Jeda */}
        <Button
          variant="ghost"
          size="icon" 
          className={cn(
            "rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 active:scale-90 shrink-0",
            compact ? "w-10 h-10" : header ? "w-10 h-10" : "w-14 h-14",
            isLoading && "cursor-wait"
          )}
          onClick={handlePlayPause}
          disabled={isLoading}
          aria-label={isLoading ? "Memuat audio..." : isPlaying ? "Pause Audio" : "Putar Audio"}
        >
          {PlayIcon}
        </Button>

        {/* Header mode: selalu tampilkan progress bar */}
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
              <input aria-label="Posisi audio"
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
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

        {/* Header mode tanpa audio: label status */}
        {header && !audioUrl && (
          <div className="flex flex-col flex-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">AI Smart Voice</span>
            <span className="text-xs font-bold text-foreground">
              {isLoading ? "Memuat..." : isPlaying ? "Membaca..." : "Siap"}
            </span>
          </div>
        )}

        {/* Bagian Progres — mode floating bottom bar */}
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
              <input aria-label="Posisi audio"
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
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

        {/* Info Status (Ringkas atau Tanpa Audio — compact/floating tanpa audio) */}
        {(compact || (!audioUrl && !header)) && (
          <div className="flex flex-col pr-2 pl-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70 mb-0.5">
              {audioUrl ? "Native" : "AI Smart Voice"}
            </span>
            <span className="text-xs font-bold text-foreground line-clamp-1">
              {isLoading ? "Memuat..." : isPlaying ? (isTTS ? "Membaca..." : "Memutar...") : "Siap?"}
            </span>
          </div>
        )}

        {/* Aksi Sekunder — hanya di floating bar dan header */}
        {(!compact) && (
          <div className="flex items-center gap-1 pr-2">
            {/* Kontrol Kecepatan Putar */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="size-10 rounded-full hover:bg-background/5 text-muted-foreground/60 transition-all hover:text-primary font-bold text-xs"
                onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(v => !v); }}
                aria-label="Kecepatan Putar"
                title="Kecepatan Putar"
              >
                <Gauge size={16} />
              </Button>
              {showSpeedMenu && (
                <div className="absolute bottom-full mb-2 right-0 flex flex-col gap-1 p-2 rounded-2xl bg-card border border-border shadow-2xl z-50 min-w-[80px]">
                  {SPEED_OPTIONS.map((speed) => (
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

            <Button
              variant="ghost"
              size="icon" 
              className="size-10 rounded-full hover:bg-background/5 text-muted-foreground/60 transition-all hover:text-primary"
              onClick={() => {
                if (audioRef.current) {
                   audioRef.current.currentTime = 0;
                   lastSeekRef.current = 0;
                   if (!isPlaying) handlePlayPause();
                }
              }}
              aria-label="Ulangi Audio"
            >
              <RotateCcw size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon" 
              className="size-10 rounded-full hover:bg-background/5 text-muted-foreground/60 transition-all hover:text-destructive"
              onClick={stopAll}
              disabled={!isPlaying && currentTime === 0}
              aria-label="Stop Audio"
            >
              <Square size={18} fill="currentColor" />
            </Button>
          </div>
        )}

        {/* Elemen Audio Bawaan */}
        {audioUrl && (
          <audio aria-label="Audio"
            ref={audioRef}
            src={cachedAudioUrl}
            onWaiting={() => setIsLoading(true)}
            onCanPlay={() => setIsLoading(false)}
            onDurationChange={(e) => setDuration(e.currentTarget.duration)}
            onTimeUpdate={(e) => {
              const time = e.currentTarget.currentTime;
              setCurrentTime(time);
              onTimeUpdate?.(time);
            }}
            onEnded={() => {
              setIsPlaying(false);
              setCurrentTime(0);
              setIsLoading(false);
            }}
            onError={() => {
              setError("Gagal memuat file audio.");
              setIsLoading(false);
              setIsPlaying(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
