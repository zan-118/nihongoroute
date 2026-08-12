"use client";

/**
 * @file MediaControlBar.tsx
 * @description Sticky bottom media control bar: kontrol playback (AudioController / AI Playlist),
 * playback rate, toggle terjemahan, dan toggle teks transkrip.
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, LayoutGrid, PauseCircle, PlayCircle } from "@/components/ui/icons";
import AudioController from "@/features/library/reading/components/AudioController";
import { TTSRate } from "@/features/media";
import { TranscriptLine } from "../../types";

/** Props untuk MediaControlBar. */
interface MediaControlBarProps {
  audioUrl?: string;
  onTimeUpdate?: (time: number) => void;
  externalSeek?: number;
  isPlayingPlaylist: boolean;
  playPlaylist: (lines: TranscriptLine[], startIndex?: number) => void;
  pausePlaylist: () => void;
  transcript: TranscriptLine[];
  currentActiveIndex: number;
  rate: TTSRate;
  onRateChange: (r: TTSRate) => void;
  showTranslation: boolean;
  onToggleTranslation: () => void;
  isTranscriptHidden: boolean;
  onToggleTranscriptHidden: () => void;
}

/**
 * Sticky bottom media control bar.
 */
export function MediaControlBar({
  audioUrl,
  onTimeUpdate,
  externalSeek,
  isPlayingPlaylist,
  playPlaylist,
  pausePlaylist,
  transcript,
  currentActiveIndex,
  rate,
  onRateChange,
  showTranslation,
  onToggleTranslation,
  isTranscriptHidden,
  onToggleTranscriptHidden,
}: MediaControlBarProps) {
  return (
 <div className="fixed bottom-6 left-6 md:left-78 right-6 z-50 rounded-2xl md:rounded-3xl border border-border bg-background/80 p-4 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 glass animate-in slide-in- duration-500 pointer-events-auto">
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
 aria-label={isPlayingPlaylist ? "PauseCircle Playlist" : "Putar Playlist"}
 >
 {isPlayingPlaylist ? <PauseCircle size={20} fill="currentColor" /> : <PlayCircle size={20} fill="currentColor" className="ml-0.5" />}
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
 onClick={() => onRateChange(r)}
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
 onClick={() => onToggleTranslation()}
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
 </div>
 </div>
  );
}
