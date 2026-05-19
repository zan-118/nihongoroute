"use client";

import React from "react";
import { splitFurigana } from "@/components/ui/SmartJapanese";
import { useUIStore } from "@/store/useUIStore";
import * as wanakana from "wanakana";

import WordPopover from "@/components/features/reading/components/WordPopover";

interface FuriganaDisplayProps {
  text: string;
  furigana: string;
  size?: "small" | "medium" | "large" | "xl";
  className?: string;
  mode?: "kanji" | "furigana" | "hiragana" | "romaji";
  interactive?: boolean;
  romaji?: string;
}

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

  // Hiragana Mode: Direct return of furigana prop to ensure 100% no Kanji and high performance
  if (currentMode === "hiragana" && furigana) {
    return (
      <span className={`font-noto-serif leading-relaxed tracking-normal inline-block w-full text-foreground ${kanjiSize} ${className}`}>
        {furigana}
      </span>
    );
  }

  const parts = splitFurigana(text, furigana);

  const content = (
    <span 
      className={`font-noto-serif leading-relaxed tracking-normal inline-block w-full ${className}`}
      style={{ rubyPosition: 'over', rubyAlign: 'center' } as React.CSSProperties}
    >
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part.furi && currentMode === "furigana" ? (
            <ruby className="group">
              <span className={`${kanjiSize} font-medium transition-colors text-foreground`}>
                {part.text}
              </span>
              <rt className={`${furiSize} text-primary/60 font-medium tracking-normal select-none`}>
                {part.furi}
              </rt>
            </ruby>
          ) : (
            <span className={`${kanjiSize} font-medium transition-colors ${
              wanakana.isKanji(part.text.charAt(0)) ? "text-foreground" : "text-foreground/90"
            }`}>
              {part.text}
            </span>
          )}
        </React.Fragment>
      ))}
    </span>
  );

  if (interactive && text) {
    return (
      <WordPopover word={text} reading={furigana}>
        {content}
      </WordPopover>
    );
  }

  return content;
}
