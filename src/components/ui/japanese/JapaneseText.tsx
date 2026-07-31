/**
 * @file JapaneseText.tsx
 * @description Komponen inti terpadu untuk merender teks bahasa Jepang dengan Furigana, mode pembacaan dinamis, dan font khas Noto Serif JP / Kanji.
 */

"use client";

import React, { useMemo } from "react";
import { isJapanese, toRomaji, isKanji } from "wanakana";
import { splitFurigana } from "./splitFurigana";
import { useUIStore } from "@/store/useUIStore";
import WordPopover from "@/features/library/reading/components/WordPopover";

export interface JapaneseTextProps {
  /** Teks asli bahasa Jepang (kanji/kana) */
  text: string;
  /** Bacaan furigana lengkap */
  furigana?: string;
  /** Representasi latin/romaji opsional */
  romaji?: string;
  /** Ukuran tampilan preset */
  size?: "small" | "medium" | "large" | "xl";
  /** Kelas CSS opsional */
  className?: string;
  /** Paksa mode tampilan tertentu (opsional, default mengikuti UI store) */
  mode?: "kanji" | "furigana" | "hiragana" | "romaji";
  /** Aktifkan popover kamus interaktif pada kata kanji */
  interactive?: boolean;
}

function isUsefulInteractivePart(text: string) {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > 24) return false;
  if (!isJapanese(trimmed)) return false;
  if (/^[\u3040-\u309f]{1,2}$/.test(trimmed)) return false;
  return /[\u30a0-\u30ff\u4e00-\u9faf]/.test(trimmed);
}

export const JapaneseText = React.memo(function JapaneseText({
  text,
  furigana = "",
  romaji,
  size = "medium",
  className = "",
  mode,
  interactive = false,
}: JapaneseTextProps) {
  const globalMode = useUIStore((state) => state.readingState.mode);
  const currentMode = mode || globalMode || "furigana";

  const sizeConfig = {
    small: { furi: "text-[0.55em]", kanji: "text-sm" },
    medium: { furi: "text-[0.55em]", kanji: "text-base md:text-lg" },
    large: { furi: "text-[0.55em]", kanji: "text-xl md:text-2xl" },
    xl: { furi: "text-[0.55em]", kanji: "text-2xl md:text-4xl" },
  };

  const { kanji: kanjiSize } = sizeConfig[size];

  const parts = useMemo(() => {
    if (!text || !furigana) return [];
    return splitFurigana(text, furigana);
  }, [text, furigana]);

  if (!text) {
    return <span className={className}>{furigana}</span>;
  }

  // Mode Hiragana
  if (currentMode === "hiragana" && furigana) {
    return (
      <span className={`font-noto-serif leading-relaxed tracking-normal inline-block text-foreground ${kanjiSize} ${className}`}>
        {furigana}
      </span>
    );
  }

  // Mode Romaji
  if (currentMode === "romaji") {
    const romajiText = romaji
      ? romaji
      : furigana
        ? toRomaji(furigana)
        : toRomaji(text);
    return (
      <span className={`font-sans leading-relaxed tracking-wide inline-block text-foreground ${kanjiSize} ${className}`}>
        {romajiText}
      </span>
    );
  }

  // Mode Kanji murni tanpa furigana
  if (!furigana || text === furigana || currentMode === "kanji") {
    return (
      <span className={`font-japanese leading-relaxed text-foreground ${kanjiSize} ${className}`}>
        {text}
      </span>
    );
  }

  const renderPart = (part: { text: string; furi?: string }, pos: number) => {
    const partContent = part.furi && currentMode === "furigana" ? (
      <ruby className="group font-japanese">
        <span className={`${kanjiSize} font-medium transition-colors text-foreground`}>
          {part.text}
        </span>
        <rt className="text-[0.55em] text-primary/70 font-medium tracking-normal select-none leading-none opacity-90">
          {part.furi}
        </rt>
      </ruby>
    ) : (
      <span className={`${kanjiSize} font-medium transition-colors ${
        isKanji(part.text.charAt(0)) ? "text-foreground" : "text-foreground/90"
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
      className={`font-noto-serif leading-relaxed tracking-normal inline-block ${className}`}
      style={{ rubyPosition: 'over', rubyAlign: 'space-around' } as React.CSSProperties}
    >
      {parts.map(renderPart)}
    </span>
  );
});
