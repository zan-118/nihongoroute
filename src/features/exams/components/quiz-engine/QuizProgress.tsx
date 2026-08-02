/**
 * @file QuizProgress.tsx
 * @description Komponen progress bar kustom (QuizProgress) untuk melacak kemajuan pengerjaan kuis/ujian dengan animasi pegas yang fluid.
 */

"use client";

// ======================
// IMPOR
// ======================
import { m } from "framer-motion";

// ======================
// ANTARMUKA / TIPE DATA
// ======================

/**
 * Props for QuizProgress component.
 */
interface QuizProgressProps {
 /** Current progress value. */
 current: number;
 /** Total progress value. */
 total: number;
 /** Tailwind background color class. */
 color?: string;
 /** Additional CSS classes for progress indicator. */
 indicatorClassName?: string;
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * QuizProgress component. Renders animated progress bar.
 */
export function QuizProgress({ current, total, color = "bg-primary", indicatorClassName = "" }: QuizProgressProps) {
 // Clamp percentage between 0 and 100 to prevent overflow.
 const percentage = Math.min(100, Math.max(0, (current / total) * 100));

 return (
 <div className="w-full h-2 md:h-3 bg-[hsl(var(--background)/0.05)] rounded-full overflow-hidden relative border border-border neo-inset">
 <m.div
 initial={{ width: 0 }}
 animate={{ width: `${percentage}%` }}
 transition={{ type: "spring", stiffness: 300, damping: 30 }}
 className={`h-full ${color} relative rounded-full ${indicatorClassName}`}
 >
 {/* Glow Tip */}
 <div className="absolute right-0 top-0 bottom-0 w-8 hsl(var(--foreground)/0.3)] blur-sm" />
 <div className="absolute right-0 top-0 bottom-0 w-1 bg-background shadow-[0_0_15px_hsl(var(--foreground)/0.8)]" />
 </m.div>
 </div>
 );
}