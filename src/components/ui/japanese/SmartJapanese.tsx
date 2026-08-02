/**
 * @file SmartJapanese.tsx
 * @description Facade pembungkus untuk memelihara kompatibilitas SmartJapanese.
 * Seluruh logika rendering dan pemisahan Furigana terpusat di `@/components/ui/japanese`.
 */

import React from "react";
import { JapaneseText } from "./JapaneseText";
import { splitFurigana } from "./splitFurigana";

export { splitFurigana };

export interface SmartJapaneseProps {
 word: string;
 furigana?: string;
 className?: string;
 mode?: "furigana" | "kanji" | "hiragana" | "romaji";
 size?: "small" | "medium" | "large" | "xl";
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
 size,
}: SmartJapaneseProps) {
 return (
 <JapaneseText
 text={word}
 furigana={furigana}
 className={className}
 mode={mode}
 size={size}
 />
 );
}

export default React.memo(SmartJapanese);
