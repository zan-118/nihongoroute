/**
 * @file AnimatedKanji.tsx
 * @description Visual component rendering animated Kanji stroke order diagrams inside drawing canvas.
 */

// ==========================================
// Import & Dependencies
// ==========================================
import React from "react";
import { useAnimatedKanji } from "./useAnimatedKanji";

// ==========================================
// Component Props Interface
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
// Main Component
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
