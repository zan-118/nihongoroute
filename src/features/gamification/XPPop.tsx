/**
 * @file XPPop.tsx
 * @description Floating XP notification component.
 * @module XPPop
 */

"use client";

// ======================
// IMPOR
// ======================
import { m, AnimatePresence } from "framer-motion";

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * XPPop component. Shows floating XP gain animation.
 * 
 * @param props - Component properties.
 * @param props.show - Toggle visibility.
 * @param props.amount - XP points earned.
 * @returns XP animation element.
 */
export default function XPPop({
 show,
 amount,
}: {
 show: boolean;
 amount: number;
}) {
 return (
 // AnimatePresence manage exit animation.
 <AnimatePresence>
 {show && (
 // Motion div animate up, scale up, fade out.
 <m.div
 initial={{ opacity: 0, y: 0, scale: 0.5 }}
 animate={{ opacity: 1, y: -100, scale: 1.5 }}
 exit={{ opacity: 0, scale: 2 }}
 className="absolute pointer-events-none z-50 flex items-center justify-center"
 >
 {/* Glow effect background */}
 <div className="absolute size-24 bg-destructive/20 blur-3xl rounded-full animate-bloom" />
 
 {/* XP text with drop shadow */}
 <span className="relative text-destructive font-black italic text-4xl drop-shadow-[0_0_20px_hsl(var(--destructive)/0.8)] tracking-tighter">
 +{amount} XP
 </span>
 </m.div>
 )}
 </AnimatePresence>
 );
}