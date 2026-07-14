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
/**
 * Props for AnimatedKanji component.
 */
interface AnimatedKanjiProps {
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
/**
 * Renders animated stroke-by-stroke kanji character.
 * Uses SVG path drawing. Falls back to static text on error.
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
    // Fallback to static text if SVG loading fails
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
      {/* Inject CSS keyframes for stroke animation */}
      <style>{`
        @keyframes drawKanji {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
      {/* Container where SVG element is injected by hook */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
      />
    </>
  );
}