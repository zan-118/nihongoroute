/**
 * @file FuriganaDisplay.tsx
 * @description Komponen untuk merender teks bahasa Jepang dengan Furigana (ruby text) secara dinamis dan responsif (mendukung mode Kanji, Furigana, Hiragana, Romaji).
 */

"use client";

// ======================
// IMPOR
// ======================
import React, { useMemo } from "react";
import { splitFurigana } from "@/components/ui/SmartJapanese";
import { useUIStore } from "@/store/useUIStore";
import * as wanakana from "wanakana";
import WordPopover from "@/components/features/reading/components/WordPopover";

// ======================
// ANTARMUKA / TIPE DATA
// ======================
/**
 * Props for FuriganaDisplay component.
 */
interface FuriganaDisplayProps {
  /** Base Japanese text */
  text: string;
  /** Furigana reading for the text */
  furigana: string;
  /** Display size preset */
  size?: "small" | "medium" | "large" | "xl";
  /** Additional CSS classes */
  className?: string;
  /** Display mode override */
  mode?: "kanji" | "furigana" | "hiragana" | "romaji";
  /** Enable interactive dictionary popovers on kanji */
  interactive?: boolean;
  /** Optional pre-calculated romaji representation */
  romaji?: string;
}

/**
 * Determines if a text segment is suitable for interactive dictionary lookup.
 * Filters out non-Japanese, long phrases, and simple particles.
 * 
 * @param text - Text segment to evaluate.
 * @returns True if segment is interactive.
 */
function isUsefulInteractivePart(text: string) {
  const trimmed = text.trim();
  // Skip empty or excessively long segments
  if (!trimmed || trimmed.length > 24) return false;
  // Must be Japanese text
  if (!wanakana.isJapanese(trimmed)) return false;
  // Skip 1-2 character hiragana particles/words
  if (/^[\u3040-\u309f]{1,2}$/.test(trimmed)) return false;
  // Must contain kanji or katakana
  return /[\u30a0-\u30ff\u4e00-\u9faf]/.test(trimmed);
}

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * FuriganaDisplay component.
 * Renders Japanese text with ruby annotations based on selected reading mode.
 */
function FuriganaDisplay({ 
  text, 
  furigana, 
  romaji,
  size = "medium", 
  className = "",
  mode,
  interactive = false
}: FuriganaDisplayProps) {
  // Get reading mode from global UI store
  const globalMode = useUIStore((state) => state.readingState.mode);
  const currentMode = mode || globalMode || "kanji";

  // Font size mapping for ruby (furigana) and base text
  const sizeConfig = {
    small: { furi: "text-[0.55em]", kanji: "text-sm" },
    medium: { furi: "text-[0.55em]", kanji: "text-base md:text-lg" },
    large: { furi: "text-[0.55em]", kanji: "text-xl md:text-2xl" },
    xl: { furi: "text-[0.55em]", kanji: "text-2xl md:text-4xl" },
  };

  const { furi: furiSize, kanji: kanjiSize } = sizeConfig[size];

  // Parse text and furigana into matching segments
  const parts = useMemo(() => {
    if (!text || !furigana) return [];
    return splitFurigana(text, furigana);
  }, [text, furigana]);

  // Mode Hiragana: render pure hiragana reading directly
  if (currentMode === "hiragana" && furigana) {
    return (
      <span className={`font-noto-serif leading-relaxed tracking-normal inline-block w-full text-foreground ${kanjiSize} ${className}`}>
        {furigana}
      </span>
    );
  }

  // Mode Romaji: render romaji text, fallback to wanakana conversion if missing
  if (currentMode === "romaji") {
    const romajiText = romaji
      ? romaji
      : furigana
        ? wanakana.toRomaji(furigana)
        : wanakana.toRomaji(text);
    return (
      <span className={`font-sans leading-relaxed tracking-wide inline-block w-full text-foreground ${kanjiSize} ${className}`}>
        {romajiText}
      </span>
    );
  }

  /**
   * Renders individual text segment with optional ruby annotation.
   */
  const renderPart = (part: { text: string; furi?: string }, pos: number) => {
    // Render ruby tag if furigana exists and mode is set to furigana
    const partContent = part.furi && currentMode === "furigana" ? (
      <ruby className="group">
        <span className={`${kanjiSize} font-medium transition-colors text-foreground`}>
          {part.text}
        </span>
        <rt className="text-[0.55em] text-primary/60 font-medium tracking-normal select-none">
          {part.furi}
        </rt>
      </ruby>
    ) : (
      <span className={`${kanjiSize} font-medium transition-colors ${
        wanakana.isKanji(part.text.charAt(0)) ? "text-foreground" : "text-foreground/90"
      }`}>
        {part.text}
      </span>
    );

    // Wrap in interactive dictionary popover if applicable
    if (interactive && isUsefulInteractivePart(part.text)) {
      return (
        <WordPopover key={`furi-${part.text}-${pos}`} word={part.text} reading={part.furi}>
          {partContent}
        </WordPopover>
      );
    }

    return (
      <React.Fragment key={`furi-${part.text}-${pos}`}>
        {partContent}
      </React.Fragment>
    );
  };

  return (
    <span 
      className={`font-noto-serif leading-relaxed tracking-normal inline-block w-full ${className}`}
      style={{ rubyPosition: 'over', rubyAlign: 'center' } as React.CSSProperties}
    >
      {parts.map(renderPart)}
    </span>
  );
}

export default React.memo(FuriganaDisplay);