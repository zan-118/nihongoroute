"use client";

/**
 * @file LevelUpOverlay.tsx
 * @description Komponen visual overlay animasi perayaan kenaikan level (Level Up).
 * Menampilkan partikel konfeti ceria (confetti), lencana piala tropi, detail peningkatan status level, 
 * serta pesan penyemangat bagi pelajar.
 */

// ======================
// IMPOR
// ======================
import { m, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Sparkles, Trophy, Shield, ArrowRight, Star, Zap } from "@/components/ui/icons";
import { useLevelUpOverlay } from "./useLevelUpOverlay";

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * LevelUpOverlay component.
 * Renders full-screen celebration overlay with confetti when user levels up.
 * 
 * @param props - Component props.
 * @param props.level - Current user level.
 */
export default function LevelUpOverlay({ level }: { level: number }) {
 // Hook manages visibility state based on level changes
 const { show, setShow } = useLevelUpOverlay(level);

 return (
 <AnimatePresence mode="wait">
 {show && (
 <m.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-100 flex items-center justify-center bg-background/80 p-4 md:p-8"
 >
 <m.div
 initial={{ scale: 0.95, y: 20, opacity: 0 }}
 animate={{ scale: 1, y: 0, opacity: 1 }}
 exit={{ scale: 1.05, opacity: 0 }}
 transition={{ type: "spring", stiffness: 200, damping: 20 }}
 className="w-full max-w-lg h-auto max-h-[90vh] flex items-center justify-center"
 >
 <Card className="text-center py-6 px-4 md:py-10 md:px-12 bg-background rounded-2xl md:rounded-3xl border border-primary/30 shadow-2xl neo-card relative overflow-hidden w-full h-auto flex flex-col items-center">
 {/* Grid background pattern */}
 <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-size-[100%_4px] pointer-events-none opacity-20 dark:opacity-40" />
 
 {/* Radial glow effects */}
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-125 bg-primary/10 blur-[65px] rounded-full animate-bloom pointer-events-none ambient-glow will-change-transform" />
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-75 bg-primary/10 blur-[60px] rounded-full animate-pulse pointer-events-none ambient-glow will-change-transform" />
 
 <div className="absolute -top-16 -left-16 w-48 h-48 md:w-64 md:h-64 bg-primary/10 blur-[80px] md:blur-[60px] pointer-events-none ambient-glow will-change-transform" />

 {/* Floating trophy container */}
 <m.div
 animate={{ 
 scale: [1, 1.05, 1],
 rotate: [0, 3, -3, 0] 
 }}
 transition={{ 
 repeat: Infinity, 
 duration: 4,
 ease: "easeInOut"
 }}
 className="w-16 h-16 md:w-28 md:h-28 mx-auto bg-primary/10 rounded-lg md:rounded-2xl flex items-center justify-center mb-6 md:mb-10 neo-inset shadow-none border border-primary/30"
 >
 <Trophy size={40} className="text-primary drop-shadow-sm dark:drop-shadow-[0_0_20px_hsl(var(--primary)/0.6)] md:w-14 md:h-14" />
 </m.div>

 <Badge variant="outline" className="text-primary text-xs md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6 h-auto neo-inset px-4 py-1.5 md:px-8 md:py-2.5 border-primary/30 bg-primary/5 rounded-xl">
 Naik Level!
 </Badge>
 
 <h1 className="text-4xl md:text-6xl lg:text-7xl text-foreground uppercase tracking-tighter mb-4 md:mb-6 drop-shadow-sm dark:drop-shadow-[0_0_20px_hsl(var(--foreground)/0.2)]">
 LEVEL <span className="text-primary drop-shadow-sm dark:drop-shadow-[0_0_20px_hsl(var(--primary)/0.4)]">{level}</span>
 </h1>
 
 {/* Level stats indicators */}
 <div className="flex items-center justify-center gap-4 md:gap-8 mb-6 md:mb-12">
 <div className="flex flex-col items-center">
 <Shield size={20} className="text-success mb-2 md:w-6 md:h-6" />
 <span className="text-xs md:text-xs text-muted-foreground font-bold uppercase tracking-widest">Target Selesai</span>
 </div>
 <div className="w-px h-8 md:h-10 bg-border dark:bg-background/10" />
 <div className="flex flex-col items-center">
 <Zap size={20} className="text-warning mb-2 md:w-6 md:h-6" />
 <span className="text-xs md:text-xs text-muted-foreground font-bold uppercase tracking-widest">Kapasitas Maksimal</span>
 </div>
 </div>

 <p className="text-muted-foreground text-xs md:text-sm lg:text-base font-medium max-w-sm mx-auto mb-8 md:mb-12 leading-relaxed uppercase tracking-wide px-4 md:px-0">
 &quot;Selamat! Kemampuan bahasamu makin jago. Terus semangat ya, perjalanan masih panjang!&quot;
 </p>

 {/* Action button to dismiss overlay */}
 <Button
 onClick={() => setShow(false)}
 className="h-auto w-full sm:w-auto px-8 py-4 md:px-12 md:py-5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl md:rounded-2xl text-xs md:text-xs uppercase tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95 border-none group relative overflow-hidden"
 >
 <span className="relative z-10 flex items-center justify-center">
 Lanjut Belajar <ArrowRight size={16} className="ml-3 group-hover:translate-x-1.5 transition-transform duration-300 md:w-5 md:h-5" />
 </span>
 <div className="absolute inset-0 bg-background/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
 </Button>
 
 {/* Decorative background star */}
 <div className="absolute -bottom-16 -right-16 md:-bottom-20 md:-right-20 opacity-5 pointer-events-none scale-125 md:scale-150 rotate-12">
 <Star size={200} fill="currentColor" className="text-foreground md:w-75 md:h-75" />
 </div>
 </Card>
 </m.div>
 </m.div>
 )}
 </AnimatePresence>
 );
}