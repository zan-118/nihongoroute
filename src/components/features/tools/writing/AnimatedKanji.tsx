/**
 * @file AnimatedKanji.tsx
 * @description Komponen visual untuk menampilkan kanji yang sedang digambar secara teranimasi (stroke order animation) di dalam kanvas latihan menulis.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import React from "react";
import { useAnimatedKanji } from "../kanji/useAnimatedKanji";

// ==========================================
// TIPE DATA / INTERFACE
// ==========================================
interface AnimatedKanjiProps {
  character: string;
  triggerKey: number;
  color?: string;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * Komponen animasi coretan kanji di dalam kanvas.
 */
export default function AnimatedKanji({
  character,
  triggerKey,
  color = "#a855f7",
}: AnimatedKanjiProps) {
  const { containerRef, error } = useAnimatedKanji(character, triggerKey, color);

  // ==========================================
  // RENDER KOMPONEN
  // ==========================================
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
