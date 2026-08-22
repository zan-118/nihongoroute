/**
 * @file app/(main)/tools/survival/page.tsx
 * @description Halaman utama game Mode Bertahan Hidup (Survival Mode).
 * Menyediakan antarmuka pemilihan level JLPT dan jumlah kartu sebelum memulai game.
 */

"use client";

// IMPOR

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import {
 Fire,
 Restart,
 ChevronLeft,
 Stack,
 Hashtag,
 PlayCircle,
 Gamepad
} from "@/components/ui/icons";
import SurvivalMode from "@/features/games/SurvivalMode";
import { useSurvivalSetup } from "@/features/games/survival/useSurvivalSetup";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { JLPT_LEVELS, AMOUNTS } from "@/lib/constants/learning";

import { ROUTES } from "@/lib/core/routes";
/**
 * Survival game content component. Handle setup UI and active gameplay state.
 */
function SurvivalContent() {
 // Initialize router for navigation.
 const router = useRouter();
 
 // Fetch game state and handlers from custom hook.
 const {
 level,
 setLevel,
 amount,
 setAmount,
 cards,
 isFetchingCards,
 isPlaying,
 handleStartGame,
 handleExitGame,
 } = useSurvivalSetup();

 return (
 <div className="w-full flex-1 relative overflow-hidden flex flex-col bg-transparent transition-colors duration-300 pt-12 pb-24 px-4 md:px-8">
 {/* Background Radial Glow */}
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] pointer-events-none" />

 <AnimatePresence mode="wait">
 {/* Render loading spinner when fetching cards */}
 {isFetchingCards ? (
 <m.div
 key="loading-cards"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="flex-1 flex flex-col items-center justify-center px-4"
 >
 <Restart className="text-primary animate-spin mb-4" size={32} />
 <p className="text-muted-foreground font-mono uppercase tracking-widest text-xs font-bold">
 Menyiapkan arena tantangan...
 </p>
 </m.div>
 ) : !isPlaying ? (
 /* Render setup screen when game not active */
 <m.div
 key="setup"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -20 }}
 className="flex-1 w-full max-w-3xl mx-auto flex flex-col justify-center relative z-10"
 >
 <div className="text-center mb-10">
 <div className="w-16 h-16 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center shadow-md mx-auto mb-4">
 <Fire className="text-primary" size={32} />
 </div>
 <h1 className="text-4xl md:text-5xl text-foreground uppercase tracking-tight italic">
 Mode <span className="text-primary">Bertahan Hidup</span>
 </h1>
 <p className="text-muted-foreground text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mt-1">
 Survival Vocabulary Challenge
 </p>
 <p className="text-muted-foreground text-sm max-w-md mx-auto mt-4 leading-relaxed">
 Uji seberapa cepat ingatan kosakatamu. Tebak arti kata Jepang dengan tepat sebelum kehabisan waktu dan 3 nyawamu habis!
 </p>
 </div>

 <div className="space-y-8 glass p-6 md:p-8 rounded-[2rem] border border-border shadow-lg bg-card/50 ">

 {/* Level Selection */}
 <div className="space-y-4">
 <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">
 <Stack size={16} className="text-primary" />
 <h2>Pilih Tingkat JLPT</h2>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
 {JLPT_LEVELS.map((lvl) => (
 <button
 key={lvl.id}
 onClick={() => setLevel(lvl.id)}
 className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all duration-200
 ${level === lvl.id
 ? `shadow-md ${lvl.color.replace('text-', 'bg-').replace('/10', '/20')} border-primary`
 : "bg-background/50 border-border hover:bg-muted"
 }
 `}
 >
 <span className={`font-black text-lg ${level === lvl.id ? 'text-primary' : 'text-foreground/80'}`}>{lvl.label}</span>
 </button>
 ))}
 </div>
 </div>

 {/* Amount Selection */}
 <div className="space-y-4">
 <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">
 <Hashtag size={16} className="text-primary" />
 <h2>Jumlah Kosakata Tantangan</h2>
 </div>
 <div className="flex flex-wrap gap-3">
 {AMOUNTS.map((amt) => (
 <button
 key={amt}
 onClick={() => setAmount(amt)}
 className={`flex-1 min-w-[80px] py-3 px-4 rounded-lg border font-bold transition-all duration-200
 ${amount === amt
 ? "bg-primary text-primary-foreground border-primary shadow-md"
 : "bg-background/50 text-muted-foreground border-border hover:bg-muted"
 }
 `}
 >
 {amt} Kata
 </button>
 ))}
 </div>
 </div>

 <div className="pt-6 border-t border-border/50 mt-8 flex flex-col sm:flex-row gap-4">
 <Button
 onClick={() => router.push(ROUTES.TOOLS.ROOT)}
 variant="ghost"
 className="w-full sm:w-1/3 py-6 rounded-lg text-xs font-bold uppercase tracking-widest border border-border bg-muted/20 hover:bg-muted/50"
 >
 <ChevronLeft size={16} className="mr-2" /> Batal
 </Button>
 <Button
 onClick={handleStartGame}
 className="w-full sm:w-2/3 py-6 rounded-lg text-xs font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground shadow-md group transition-all"
 >
 Mulai Tantangan <PlayCircle size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
 </Button>
 </div>

 </div>
 </m.div>
 ) : (
 /* Render active gameplay screen */
 <m.div
 key="gameplay"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -20 }}
 transition={{ duration: 0.3 }}
 className="flex-1 w-full px-4 md:px-8 relative overflow-hidden flex flex-col items-center z-10"
 >
 <div className="relative z-10 w-full max-w-3xl mt-4">
 <header className="flex justify-between items-center mb-8 max-w-3xl mx-auto w-full">
 <Button
 onClick={handleExitGame}
 variant="ghost"
 className="text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-widest bg-muted/50 h-auto px-4 py-2.5 rounded-xl border border-border"
 >
 <ChevronLeft size={14} className="mr-2" /> Keluar ke Setup
 </Button>
 <Badge variant="outline" className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 h-auto bg-destructive/10 border-destructive/30 text-primary">
 <Gamepad size={16} />
 <span>Mode Bertahan Hidup • JLPT {level === "all" ? "Semua" : level}</span>
 </Badge>
 </header>

 <SurvivalMode cards={cards} />
 </div>
 </m.div>
 )}
 </AnimatePresence>
 </div>
 );
}

/**
 * Survival page entry point. Wrap content in Suspense for safe loading.
 */
export default function SurvivalPage() {
 return (
 <Suspense fallback={
 <div className="flex-1 flex flex-col items-center justify-center px-4">
 <Restart className="text-primary animate-spin mb-4" size={32} />
 <p className="text-muted-foreground font-mono uppercase tracking-widest text-xs font-bold">
 Memuat Modul Tantangan...
 </p>
 </div>
 }>
 <SurvivalContent />
 </Suspense>
 );
}