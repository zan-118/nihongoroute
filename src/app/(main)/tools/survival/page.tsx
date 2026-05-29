/**
 * @file app/(main)/tools/survival/page.tsx
 * @description Halaman utama game Mode Bertahan Hidup (Survival Mode).
 * Menyediakan antarmuka pemilihan level JLPT dan jumlah kartu sebelum memulai game.
 */

"use client";

// ======================
// IMPOR
// ======================
import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, 
  RotateCw, 
  ChevronLeft, 
  Layers, 
  Hash, 
  Play,
  Gamepad2
} from "lucide-react";
import SurvivalMode from "@/components/features/games/SurvivalMode";
import { useSurvivalSetup } from "@/components/features/games/survival/useSurvivalSetup";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const JLPT_LEVELS = [
  { id: "all", label: "Campur (Semua)", color: "bg-muted text-muted-foreground border-border" },
  { id: "N5", label: "N5", color: "bg-[rgba(var(--primary-rgb),0.1)] text-primary border-[rgba(var(--primary-rgb),0.2)]" },
  { id: "N4", label: "N4", color: "bg-[rgba(var(--success-rgb),0.1)] text-success border-[rgba(var(--success-rgb),0.2)]" },
  { id: "N3", label: "N3", color: "bg-[rgba(var(--warning-rgb),0.1)] text-warning border-[rgba(var(--warning-rgb),0.2)]" },
  { id: "N2", label: "N2", color: "bg-[rgba(var(--secondary-rgb),0.1)] text-secondary border-[rgba(var(--secondary-rgb),0.2)]" },
  { id: "N1", label: "N1", color: "bg-[rgba(var(--destructive-rgb),0.1)] text-destructive border-[rgba(var(--destructive-rgb),0.2)]" }
];

const AMOUNTS = [10, 20, 50, 100];

function SurvivalContent() {
  const router = useRouter();
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
    <div className="w-full flex-1 relative overflow-hidden flex flex-col bg-background transition-colors duration-300 pt-12 pb-24 px-4 md:px-8">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

      <AnimatePresence mode="wait">
        {isFetchingCards ? (
          <motion.div 
            key="loading-cards"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="flex-1 flex flex-col items-center justify-center px-4"
          >
            <RotateCw className="text-primary animate-spin mb-4" size={32} />
            <p className="text-muted-foreground font-mono uppercase tracking-widest text-xs animate-pulse font-bold">
              Menyiapkan arena tantangan...
            </p>
          </motion.div>
        ) : !isPlaying ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 w-full max-w-3xl mx-auto flex flex-col justify-center relative z-10"
          >
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center shadow-lg mx-auto mb-4 animate-pulse">
                <Flame className="text-primary" size={32} />
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight italic">
                Mode <span className="text-primary">Bertahan Hidup</span>
              </h1>
              <p className="text-muted-foreground text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mt-1">
                Survival Vocabulary Challenge
              </p>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mt-4 leading-relaxed">
                Uji kecepatan ingatan kosakata Anda. Tebak arti kata bahasa Jepang dengan tepat sebelum kehabisan waktu dan 3 nyawa berharga Anda!
              </p>
            </div>

            <div className="space-y-8 glass p-6 md:p-8 rounded-[2rem] border border-border shadow-[0_0_40px_rgba(var(--primary-rgb),0.05)] bg-card/50 backdrop-blur-sm">
              
              {/* Level Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  <Layers size={16} className="text-primary" />
                  <h2>Pilih Tingkat JLPT</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {JLPT_LEVELS.map((lvl) => (
                    <button
                      key={lvl.id}
                      onClick={() => setLevel(lvl.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300
                        ${level === lvl.id 
                          ? `shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] ${lvl.color.replace('text-', 'bg-').replace('/10', '/20')} border-primary` 
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
                  <Hash size={16} className="text-primary" />
                  <h2>Jumlah Kosakata Tantangan</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt)}
                      className={`flex-1 min-w-[80px] py-3 px-4 rounded-2xl border font-bold transition-all duration-300
                        ${amount === amt 
                          ? "bg-primary text-primary-foreground border-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]" 
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
                  onClick={() => router.push("/tools")}
                  variant="ghost"
                  className="w-full sm:w-1/3 py-6 rounded-2xl text-xs font-bold uppercase tracking-widest border border-border bg-muted/20 hover:bg-muted/50"
                >
                  <ChevronLeft size={16} className="mr-2" /> Batal
                </Button>
                <Button 
                  onClick={handleStartGame}
                  className="w-full sm:w-2/3 py-6 rounded-2xl text-xs font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] group transition-all"
                >
                  Mulai Tantangan <Play size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

            </div>
          </motion.div>
        ) : (
          <motion.div 
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
                  <Gamepad2 size={16} className="animate-pulse" />
                  <span>Mode Bertahan Hidup • JLPT {level === "all" ? "Semua" : level}</span>
                </Badge>
              </header>

              <SurvivalMode cards={cards} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SurvivalPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <RotateCw className="text-primary animate-spin mb-4" size={32} />
        <p className="text-muted-foreground font-mono uppercase tracking-widest text-xs animate-pulse font-bold">
          Memuat Modul Tantangan...
        </p>
      </div>
    }>
      <SurvivalContent />
    </Suspense>
  );
}
