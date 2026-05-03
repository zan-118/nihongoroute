"use client";

import React from "react";
import { useAnimatedKanji } from "../kanji/useAnimatedKanji";

interface AnimatedKanjiProps {
  character: string;
  triggerKey: number;
  color?: string;
}

export default function AnimatedKanji({
  character,
  triggerKey,
  color = "#a855f7",
}: AnimatedKanjiProps) {
  const { containerRef, error } = useAnimatedKanji(character, triggerKey, color);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[12rem] font-japanese font-black text-white/5 opacity-30">
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
