"use client";

/**
 * @file ReadingControlBar.tsx
 * @description Sticky bottom control bar untuk halaman membaca: audio player,
 * statistik progres, dan toggle mode membaca / font / kosakata / terjemahan / zen.
 */

import { BarChart, LayoutGrid, Time, Zap } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import AudioController from "@/features/library/reading/components/AudioController";
import { formatReadingDuration } from "@/features/library/reading/utils/reading-metrics";
import { ReadingMode } from "@/features/library/reading/types";

interface ReadingControlBarProps {
  /** URL file audio native. */
  audioUrl?: string;
  /** Menonaktifkan TTS bila true. */
  isTTSDisabled?: boolean;
  /** Teks untuk TTS (jika tanpa audio native). */
  textToSpeak?: string;
  /** Durasi membaca dalam detik. */
  elapsedSeconds: number;
  /** Pace baca (unit/menit). */
  readingPace: number;
  /** Persentase penyelesaian bacaan. */
  readingCompletionPercent: number;
  /** Daftar mode tampilan teks. */
  modes: { id: ReadingMode; label: string }[];
  /** Mode tampilan aktif. */
  mode: ReadingMode;
  /** Callback ganti mode. */
  onModeChange: (mode: ReadingMode) => void;
  /** Ukuran font aktif. */
  fontSize: "standard" | "large" | "extra";
  /** Callback ganti ukuran font. */
  onFontSizeChange: (size: "standard" | "large" | "extra") => void;
  /** Status drawer kosakata. */
  isVocabOpen: boolean;
  /** Callback toggle drawer kosakata. */
  onToggleVocab: () => void;
  /** Status tampil terjemahan. */
  showTranslation: boolean;
  /** Callback toggle terjemahan. */
  onToggleTranslation: () => void;
  /** Callback masuk mode zen. */
  onZenMode: () => void;
}

const FONT_SIZES = ["standard", "large", "extra"] as const;

/**
 * Panel Kontrol Layar Lengket (Sticky Bottom Control Bar).
 */
export function ReadingControlBar({
  audioUrl,
  isTTSDisabled,
  textToSpeak,
  elapsedSeconds,
  readingPace,
  readingCompletionPercent,
  modes,
  mode,
  onModeChange,
  fontSize,
  onFontSizeChange,
  isVocabOpen,
  onToggleVocab,
  showTranslation,
  onToggleTranslation,
  onZenMode,
}: ReadingControlBarProps) {
  const hasAudio = !!(audioUrl || (!isTTSDisabled && textToSpeak));

  return (
    <div className="fixed bottom-0 left-0 right-0 md:bottom-6 md:left-78 md:right-6 z-50 rounded-t-xl rounded-b-none md:rounded-xl border-t border-x-0 border-b-0 md:border border-border bg-card p-3 pb-safe md:p-4 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 md:gap-4 animate-in slide-in- duration-500 pointer-events-auto">
      {/* Sisi Kiri: Audio & Playback Controller */}
      <div className="flex-1 w-full lg:max-w-xs">
        {hasAudio && (
          <AudioController
            audioUrl={audioUrl}
            textToSpeak={textToSpeak}
            isTTSDisabled={isTTSDisabled}
            compact={true}
            header={false}
          />
        )}
      </div>

      {/* Sisi Tengah: Ramping Stats Row */}
      <div className="hidden md:flex items-center gap-4 text-xs font-mono border-x border-border/40 px-4 py-1">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Time size={14} className="text-primary" />{" "}
          <span>{formatReadingDuration(elapsedSeconds)}</span>
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Zap size={14} className="text-warning" />{" "}
          <span>
            {readingPace || "-"}{" "}
            <span className="text-[9px] text-muted-foreground font-sans">u/m</span>
          </span>
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <BarChart size={14} className="text-success" />{" "}
          <span>{readingCompletionPercent}%</span>
        </span>
      </div>

      {/* Sisi Kanan: Toggles Mode Membaca, Font Size, Kosakata, dan Terjemahan */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 justify-center lg:justify-end w-full lg:w-auto">
        {/* Mode Select */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/20 border border-border/80">
          {modes.map((modeOption) => (
            <Button
              key={modeOption.id}
              variant={mode === modeOption.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onModeChange(modeOption.id)}
              className={cn(
                "rounded-lg px-2 py-1 h-7 text-[9px] font-black uppercase tracking-wider transition-all",
                mode === modeOption.id &&
                  "shadow-md shadow-primary/20 text-primary-foreground bg-primary"
              )}
              title={modeOption.label}
            >
              {modeOption.label}
            </Button>
          ))}
        </div>

        {/* Font Size Select */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/20 border border-border/80">
          {FONT_SIZES.map((sz) => (
            <Button
              key={sz}
              variant={fontSize === sz ? "default" : "ghost"}
              size="sm"
              onClick={() => onFontSizeChange(sz)}
              className={cn(
                "rounded-lg px-2 py-1 h-7 text-[9px] font-black uppercase tracking-wider transition-all",
                fontSize === sz &&
                  "shadow-md shadow-primary/20 text-primary-foreground bg-primary"
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
          onClick={onToggleVocab}
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
          onClick={onToggleTranslation}
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
          onClick={onZenMode}
          className="rounded-xl px-3 py-1.5 h-9 text-[9px] font-black uppercase tracking-wider bg-muted/10 text-muted-foreground hover:text-foreground hover:bg-muted/20 border border-border/80"
        >
          ZEN
        </Button>
      </div>
    </div>
  );
}
