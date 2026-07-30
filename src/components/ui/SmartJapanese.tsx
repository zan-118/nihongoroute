/**
 * @file SmartJapanese.tsx
 * @description Facade pembungkus untuk memelihara kompatibilitas impor SmartJapanese.
 * Seluruh logika rendering dan pemisahan Furigana kini terpusat di `@/components/ui/japanese`.
 */

import React from "react";
import { JapaneseText, splitFurigana } from "@/components/ui/japanese";

export { splitFurigana };

export interface SmartJapaneseProps {
  word: string;
  furigana?: string;
  className?: string;
  mode?: "furigana" | "kanji" | "hiragana" | "romaji";
}

/**
 * SmartJapanese wrapper component.
 * Delegasi langsung ke `JapaneseText` terpadu.
 */
export function SmartJapanese({
  word,
  furigana,
  className = "",
  mode = "furigana",
}: SmartJapaneseProps) {
  return (
    <JapaneseText
      text={word}
      furigana={furigana}
      className={className}
      mode={mode}
    />
  );
}

export default React.memo(SmartJapanese);