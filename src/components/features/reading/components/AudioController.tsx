"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, AlertCircle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AudioControllerProps {
  audioUrl?: string;
  textToSpeak?: string;
  isTTSDisabled?: boolean;
  compact?: boolean;
  onTimeUpdate?: (time: number) => void;
  externalSeek?: number;
}

export default function AudioController({ 
  audioUrl, 
  textToSpeak, 
  isTTSDisabled,
  compact = false,
  onTimeUpdate,
  externalSeek
}: AudioControllerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTTS, setIsTTS] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ttsRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Sync external seek
  useEffect(() => {
    if (externalSeek !== undefined && audioRef.current) {
      audioRef.current.currentTime = externalSeek;
      setCurrentTime(externalSeek);
    }
  }, [externalSeek]);

  const cleanTextForTTS = (text: string) => {
    if (!text) return "";
    return text
      .replace(/\[.*?\]/g, "") 
      .replace(/[\[\]]/g, "")  
      .replace(/\s+/g, " ")    
      .trim();
  };

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
    setCurrentTime(0);
  };

  // Stop everything on unmount
  useEffect(() => {
    return () => {
      stopAll();
    };
  }, []);

  const toggleNativeAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying && !isTTS) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (isTTS) stopAll();
      
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setIsTTS(false);
      }).catch(err => {
        console.error("Audio playback error:", err);
        setError("Gagal memutar audio native.");
        setIsPlaying(false);
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
      utterance.rate = 0.85;
      
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
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn(
      "flex items-center gap-4 transition-all duration-500",
      compact 
        ? "relative" 
        : "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl"
    )}>
      {error && (
        <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs animate-in fade-in slide-in-from-bottom-2">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <div className={cn(
        "w-full flex items-center gap-4 rounded-full p-2 transition-all duration-500",
        "bg-card/40 backdrop-blur-3xl border border-border/50 shadow-2xl ring-1 ring-white/5",
        compact && "p-1 bg-transparent border-none ring-0 shadow-none"
      )}>
        {/* Play/Pause Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 active:scale-90",
            compact ? "w-10 h-10" : "w-14 h-14"
          )}
          onClick={handlePlayPause}
          aria-label={isPlaying ? "Pause Audio" : "Putar Audio"}
        >
          {isPlaying ? <Pause size={compact ? 20 : 28} fill="currentColor" /> : <Play size={compact ? 20 : 28} fill="currentColor" className={compact ? "ml-0.5" : "ml-1"} />}
        </Button>

        {/* Progress Section (Only if not compact or if native audio) */}
        {!compact && audioUrl && (
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

        {/* Status Info (Compact or No Audio) */}
        {(compact || !audioUrl) && (
          <div className="flex flex-col pr-4 pl-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70 mb-0.5">
              {audioUrl ? "Native" : "AI Smart Voice"}
            </span>
            <span className="text-xs font-bold text-foreground line-clamp-1">
              {isPlaying ? (isTTS ? "Membaca..." : "Memutar...") : "Siap?"}
            </span>
          </div>
        )}

        {/* Secondary Actions */}
        {!compact && (
          <div className="flex items-center gap-1 pr-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full hover:bg-background/5 text-muted-foreground/60 transition-all hover:text-primary"
              onClick={() => {
                if (audioRef.current) {
                   audioRef.current.currentTime = 0;
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
              className="w-10 h-10 rounded-full hover:bg-background/5 text-muted-foreground/60 transition-all hover:text-destructive"
              onClick={stopAll}
              disabled={!isPlaying && currentTime === 0}
              aria-label="Stop Audio"
            >
              <Square size={18} fill="currentColor" />
            </Button>
          </div>
        )}

        {/* Native Audio Element */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onDurationChange={(e) => setDuration(e.currentTarget.duration)}
            onTimeUpdate={(e) => {
              const time = e.currentTarget.currentTime;
              setCurrentTime(time);
              onTimeUpdate?.(time);
            }}
            onEnded={() => {
              setIsPlaying(false);
              setCurrentTime(0);
            }}
          />
        )}
      </div>
    </div>
  );
}
