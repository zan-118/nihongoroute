/**
 * @file AnimatedKanji.tsx
 * @description Komponen visual untuk menampilkan kanji yang sedang digambar secara teranimasi di dalam kanvas stroke order.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import React from "react";
import { useAnimatedKanji } from "./useAnimatedKanji";

// ==========================================
// TIPE DATA / INTERFACE
// ==========================================
export interface AnimatedKanjiProps {
  /** Kanji character to animate. */
  character: string;
  /** Key to trigger animation restart. */
  triggerKey: number;
  /** Stroke color. Defaults to purple. */
  color?: string;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
export function AnimatedKanji({
  character,
  triggerKey,
  color = "#a855f7",
}: AnimatedKanjiProps) {
  const { containerRef, error } = useAnimatedKanji(character, triggerKey, color);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[12rem] font-japanese font-black text-foreground/5 opacity-30">
          {character}
        </span>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes drawKanji {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
      />
    </>
  );
}

export default AnimatedKanji;
