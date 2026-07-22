"use client";

/**
 * @file VocabHero.tsx
 * @description Komponen panel tajuk utama detail kosakata (Vocab Hero).
 * Menampilkan tulisan ejaan kanji/kana utama, bacaan romaji, arti, serta tombol aksi TTS & penambahan ke SRS.
 */

import { SmartJapanese } from "@/components/ui/SmartJapanese";
import TTSReader from "@/components/features/tools/tts/TTSReader";
import { AddToSRSButton } from "@/components/features/srs/button/AddToSRSButton";

interface VocabHeroProps {
  /** The target Japanese word (kanji or kana). */
  word: string;
  /** Optional furigana reading for kanji characters. */
  furigana?: string;
  /** Optional romaji transliteration. */
  romaji?: string;
  /** Meaning of the vocabulary word. */
  meaning: string;
  /** Optional pre-resolved audio URL for pronunciation. */
  audioUrl?: string | null;
}

/**
 * Hero section component for vocabulary detail page with Double-Bezel architecture.
 * 
 * @param props - Component properties.
 * @returns React element rendering the vocabulary hero card.
 */
export function VocabHero({ word, furigana, romaji, meaning, audioUrl }: VocabHeroProps) {
  return (
    <div className="w-full p-2.5 rounded-[2.5rem] bg-card/40 dark:bg-card/20 backdrop-blur-2xl border border-border/60 dark:border-white/10 shadow-2xl relative overflow-hidden font-sans group">
      
      {/* Ambient Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary/15 blur-[80px] rounded-full pointer-events-none z-0" />

      {/* Tombou Corner Mark */}
      <div className="absolute top-3 right-3 w-4 h-4 pointer-events-none z-20">
        <div className="absolute top-0 right-0 w-3.5 h-[1.5px] bg-primary/40" />
        <div className="absolute top-0 right-0 w-[1.5px] h-3.5 bg-primary/40" />
      </div>

      {/* ── INNER CORE CONTAINER ── */}
      <div className="w-full h-full rounded-[calc(2.5rem-0.625rem)] p-8 sm:p-12 md:p-16 bg-gradient-to-b from-background/95 via-background/80 to-background/95 dark:from-[#080d14]/95 dark:to-[#05080e]/95 border border-border/30 dark:border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] flex flex-col items-center text-center relative z-10">
        
        {/* Action Buttons Top Right */}
        <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
          <AddToSRSButton wordId={word} />
          <TTSReader text={word} minimal={false} speaker="indah" audioUrl={audioUrl} />
        </div>

        {/* Eyebrow Label */}
        <span className="text-[10px] font-black uppercase tracking-[0.3em] font-mono text-primary mb-6">
          [ KOSAKATA PUSTAKA ]
        </span>

        {/* Main Japanese Characters */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl text-foreground font-japanese leading-none tracking-tight mb-4 drop-shadow-md">
          <SmartJapanese word={word} furigana={furigana} />
        </h1>

        {/* Romaji Transliteration */}
        {romaji && (
          <p className="text-xs sm:text-sm font-mono font-bold text-muted-foreground/70 uppercase tracking-[0.35em] mb-6">
            {romaji}
          </p>
        )}
        
        {/* Glowing Divider Bar */}
        <div className="h-1.5 w-20 bg-gradient-to-r from-primary via-cyan-400 to-emerald-400 rounded-full mb-6 shadow-[0_0_20px_rgba(0,122,124,0.6)]" />
        
        {/* Main Meaning */}
        <p className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground max-w-2xl leading-tight">
          {meaning}
        </p>
      </div>
    </div>
  );
}