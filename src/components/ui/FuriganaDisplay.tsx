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
interface FuriganaDisplayProps {
  text: string;
  furigana: string;
  size?: "small" | "medium" | "large" | "xl";
  className?: string;
  mode?: "kanji" | "furigana" | "hiragana" | "romaji";
  interactive?: boolean;
  romaji?: string;
}

function isUsefulInteractivePart(text: string) {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > 24) return false;
  if (!wanakana.isJapanese(trimmed)) return false;
  if (/^[\u3040-\u309f]{1,2}$/.test(trimmed)) return false;
  return /[\u30a0-\u30ff\u4e00-\u9faf]/.test(trimmed);
}

// ======================
// EKSEKUSI UTAMA
// ======================
export default function FuriganaDisplay({ 
  text, 
  furigana, 
  romaji,
  size = "medium", 
  className = "",
  mode,
  interactive = false
}: FuriganaDisplayProps) {
  const globalMode = useUIStore((state) => state.readingState.mode);
  const currentMode = mode || globalMode || "kanji";

  const sizeConfig = {
    small: { furi: "text-[0.55em]", kanji: "text-sm" },
    medium: { furi: "text-[0.55em]", kanji: "text-base md:text-lg" },
    large: { furi: "text-[0.55em]", kanji: "text-xl md:text-2xl" },
    xl: { furi: "text-[0.55em]", kanji: "text-2xl md:text-4xl" },
  };

  const { furi: furiSize, kanji: kanjiSize } = sizeConfig[size];

  const parts = useMemo(() => {
    if (!text || !furigana) return [];
    return splitFurigana(text, furigana);
  }, [text, furigana]);

  // Mode Hiragana: tampilkan furigana langsung tanpa kanji
  if (currentMode === "hiragana" && furigana) {
    return (
      <span className={`font-noto-serif leading-relaxed tracking-normal inline-block w-full text-foreground ${kanjiSize} ${className}`}>
        {furigana}
      </span>
    );
  }

  // Mode Romaji: tampilkan teks romaji jika tersedia, fallback ke konversi wanakana
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

  const renderPart = (part: { text: string; furi?: string }, pos: number) => {
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
