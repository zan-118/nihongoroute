/**
 * @file SurvivalIntro.tsx
 * @description Komponen visual layar awal (perkenalan) untuk mode bertahan hidup (Survival Mode).
 * Menjelaskan aturan dasar permainan dan menyediakan tombol untuk memulai permainan.
 */

// ======================
// IMPOR
// ======================
import { Activity } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ======================
// ANTARMUKA & TIPE
// ======================

/**
 * Props for SurvivalIntro component.
 */
interface SurvivalIntroProps {
 /** Callback trigger start game. */
 startGame: () => void;
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Survival mode intro screen. Show rules. Provide start button.
 */
export function SurvivalIntro({ startGame }: SurvivalIntroProps) {
 return (
 <Card className="p-8 md:p-16 lg:p-20 rounded-2xl md:rounded-3xl border border-border bg-card text-center relative overflow-hidden group max-w-2xl mx-auto my-8 md:my-10 neo-card shadow-xl transition-colors duration-200">
 {/* Hover overlay effect */}
 <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-80 transition-all duration-200 pointer-events-none" />
 
 {/* Icon container with custom shadow */}
 <Card className="w-20 h-20 md:w-28 md:h-28 mx-auto bg-[hsl(var(--muted)/0.5)] dark:bg-[hsl(var(--background)/0.4)] border border-border dark:border-primary/20 rounded-2xl md:rounded-3xl flex items-center justify-center mb-8 md:mb-12 neo-inset shadow-none group-hover:border-primary/40 transition-all duration-200">
 <Activity
 size={40}
 aria-hidden="true"
 className="text-primary drop-shadow-sm dark:drop-shadow-[0_0_8px_hsl(var(--primary)/0.35)] md:w-12 md:h-12"
 />
 </Card>
 <h2 className="text-4xl md:text-6xl lg:text-7xl text-foreground tracking-tight mb-6 md:mb-8 leading-none">
 Mode <span className="text-primary drop-shadow-sm dark:drop-shadow-[0_0_10px_hsl(var(--primary)/0.25)]">Evaluasi</span>
 </h2>
 <p className="text-muted-foreground mb-10 md:mb-14 max-w-md mx-auto text-xs md:text-sm leading-relaxed font-bold tracking-wide">
 Uji kecepatan dan ingatanmu. Jawab sebelum waktu habis. 3 kesempatan. Buktikan penguasaan kosakata.
 </p>
 
 {/* Start button trigger callback */}
 <Button
 onClick={startGame}
 className="relative z-10 w-full sm:w-auto h-auto bg-primary hover:bg-foreground text-primary-foreground font-bold uppercase tracking-widest py-6 px-12 md:py-7 md:px-16 rounded-2xl md:rounded-3xl shadow-md transition-all border-none text-xs md:text-sm"
 >
 MULAI EVALUASI
 </Button>
 </Card>
 );
}