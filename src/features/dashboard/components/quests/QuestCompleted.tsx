/**
 * @file QuestCompleted.tsx
 * @description Komponen UI mini untuk menampilkan status sukses ketika semua Misi Harian (Daily Quests)
 * telah berhasil diselesaikan oleh pengguna pada hari tersebut.
 *
 * @package components/features/dashboard/quests
 * @project NihongoRoute
 */

// ==========================================
// IMPOR
// ==========================================
import { m } from "framer-motion";

// ==========================================
// KOMPONEN UTAMA
// ==========================================

/**
 * QuestCompleted component.
 * Render success state when user finish all daily quests.
 */
export function QuestCompleted() {
 return (
 <m.div
 // Animate entry scale and opacity.
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 className="flex-1 flex flex-col items-center justify-center text-center p-8 relative transition-colors duration-300"
 >
 {/* Glow Latar Belakang Keberhasilan */}
 {/* Glow effect behind content. */}
 <div className="absolute inset-0 bg-success/5 blur-3xl rounded-full pointer-events-none" />
 <div className="size-16 bg-success/10 rounded-lg flex items-center justify-center mb-6 border border-success/20 relative z-10">
 {/* Icon with glow effect for dark mode. */}
 
 </div>
 <h4 className="text-lg md:text-xl text-foreground uppercase tracking-tight mb-2 relative z-10">
 Target Tercapai!
 </h4>
 <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest max-w-[200px] leading-relaxed relative z-10">
 Keren! Semua target hari ini sudah beres. Sampai jumpa besok!
 </p>
 </m.div>
 );
}