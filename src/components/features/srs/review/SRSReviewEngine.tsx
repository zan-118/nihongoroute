"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Check, X, ShieldCheck, Flame, Trophy } from "lucide-react";
import Flashcard from "@/components/features/flashcards/card/Flashcard";
import XPPop from "@/components/features/gamification/XPPop";
import { FlashcardType } from "./types";
import { useSRSReview } from "./useSRSReview";

export default function SRSReviewEngine({ cards }: { cards: FlashcardType[] }) {
  const engine = useSRSReview(cards);

  if (!engine.isClient || engine.shuffledCards.length === 0) return null;

  if (engine.isFinished) {
    return (
      <section className="w-full max-w-xl mx-auto px-4 mt-10">
        <Card className="w-full bg-card p-8 md:p-10 rounded-2xl border border-border text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-destructive shadow-lg" />
          
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-[rgba(var(--muted-rgb),0.5)] dark:bg-[rgba(var(--background-rgb),0.04)] rounded-xl flex items-center justify-center border border-border mb-6 shadow-none">
            <Trophy size={32} aria-hidden="true" className="text-warning drop-shadow-sm" />
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tight mb-2 text-center">
            Sesi Tinjauan Berakhir
          </h2>
          <p className="text-muted-foreground text-xs md:text-xs mb-8 uppercase font-bold tracking-widest">
            {engine.shuffledCards.length} KARTU TELAH DIPERBARUI
          </p>

          <Card className="bg-[rgba(var(--muted-rgb),0.5)] dark:bg-[rgba(var(--background-rgb),0.03)] py-4 rounded-xl border border-border mb-8 flex justify-center items-center gap-3 shadow-none">
            <Flame size={18} aria-hidden="true" className="text-destructive" />
            <span className="text-foreground font-mono font-black text-base md:text-lg">
              +{engine.earnedXP} XP
            </span>
          </Card>

          <Button
            onClick={() => engine.router.push("/dashboard")}
            className="w-full h-auto py-4 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold uppercase tracking-widest text-xs md:text-xs rounded-xl transition-all shadow-lg"
          >
            Selesai & Tutup
          </Button>
        </Card>
      </section>
    );
  }

  const progressPercent = (engine.currentIndex / engine.shuffledCards.length) * 100;

  return (
    <section className="w-full max-w-2xl mx-auto px-4 transition-colors duration-300">
      {/* PROGRESS BAR */}
      <div className="w-full h-1 bg-muted rounded-full overflow-hidden mb-8">
        <div 
          className="h-full bg-destructive transition-all duration-500 ease-out" 
          style={{ width: `${progressPercent}%` }} 
        />
      </div>

      {/* HEADER */}
      <header className="flex flex-col gap-6 mb-10">
        <div className="flex items-center gap-3">
          <Card className="w-10 h-10 rounded-xl bg-[rgba(var(--destructive-rgb),0.1)] border border-destructive/20 flex items-center justify-center neo-inset shadow-none">
            <BrainCircuit size={20} aria-hidden="true" className="text-destructive" />
          </Card>
          <div>
            <Badge
              variant="outline"
              className="text-destructive text-destructive font-black text-xs tracking-[0.3em] uppercase bg-destructive/5 px-4 py-1.5 rounded-xl border-destructive/20 neo-inset h-auto"
            >
              Asah Ingatan (SRS)
            </Badge>
            <p className="text-muted-foreground text-xs font-bold uppercase mt-1 tracking-widest">
              Waktunya menguji sejauh mana hafalanmu bertahan.
            </p>
          </div>
        </div>

        <Card className="bg-[rgba(var(--destructive-rgb),0.05)] border-destructive/10 p-4 rounded-[1.5rem] neo-inset shadow-none border-dashed">
          <div className="flex items-start gap-3">
            <ShieldCheck size={16} aria-hidden="true" className="shrink-0 text-destructive mt-0.5" />
            <div className="space-y-1">
              <p className="text-destructive/80 text-destructive/80 text-xs leading-relaxed italic font-medium">
                Bersikaplah jujur pada diri sendiri. SRS paling efektif saat kamu mengakui jika benar-benar lupa.
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed uppercase tracking-widest font-bold">
                Sistem akan mengatur ulang jadwal munculnya kata ini berdasarkan performamu.
              </p>
            </div>
          </div>
        </Card>
      </header>

      {/* AREA KARTU */}
      <div
        className="relative mb-10"
        onClick={!engine.isFlipped ? engine.toggleFlip : undefined}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={engine.currentIndex}
            initial={{ x: engine.direction * 50, opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: -engine.direction * 50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`relative ${!engine.isFlipped ? "cursor-pointer" : ""}`}
          >
            {/* XP Pop & Visual Flash */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
              <XPPop show={engine.showXP} amount={10} />
            </div>
            
            {engine.flash && (
              <div 
                className={`absolute inset-0 z-40 rounded-[2.5rem] pointer-events-none mix-blend-overlay opacity-30 ${engine.flash === "correct" ? "bg-success" : "bg-destructive"}`} 
              />
            )}

            {engine.currentCard && (
              <Flashcard
                id={engine.currentCard.id}
                word={engine.currentCard.word}
                meaning={engine.currentCard.meaning}
                furigana={engine.currentCard.furigana}
                romaji={engine.currentCard.romaji}
                isFlipped={engine.isFlipped}
                onFlip={engine.toggleFlip}
                isShaking={engine.isShaking}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* KONTROL BAWAH */}
      <footer className="min-h-[100px]">
        {!engine.isFlipped ? (
          <div className="flex flex-col items-center gap-6">
            <div className="text-muted-foreground font-mono text-xs font-black tracking-[0.4em] uppercase text-center flex flex-col gap-1">
              <span className="text-muted-foreground/40 italic">Progres Sesi</span>
              <span className="text-foreground text-lg">
                {engine.currentIndex + 1} <span className="text-border mx-1">/</span>{" "}
                {engine.shuffledCards.length}
              </span>
            </div>

            <div className="hidden md:flex justify-center mt-2">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold bg-[rgba(var(--muted-rgb),0.5)] dark:bg-card/40 px-4 py-2 rounded-xl neo-inset border border-border">
                Tekan <kbd className="font-mono text-destructive">Spasi</kbd> untuk
                melihat jawaban
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="grid grid-cols-2 gap-5"
          >
            <Button
              variant="ghost"
              onClick={() => engine.handleAnswer(0)}
              className="relative h-auto py-8 bg-destructive/5 border border-destructive/20 rounded-[2.5rem] text-destructive font-black uppercase tracking-[0.2em] text-xs md:text-xs neo-card hover:bg-destructive hover:text-destructive-foreground transition-all group overflow-hidden"
            >
              <div className="relative z-10 flex items-center gap-2">
                <X
                  size={18}
                  className="group-hover:scale-125 transition-transform"
                />
                Lupa / Salah
              </div>
              <kbd className="hidden md:inline-block absolute top-4 left-4 bg-destructive/20 text-destructive text-destructive px-2 py-0.5 rounded font-mono text-xs">
                1
              </kbd>
            </Button>

            <Button
              variant="ghost"
              onClick={() => engine.handleAnswer(2)}
              className="relative h-auto py-8 bg-success/5 border border-success/20 rounded-[2.5rem] text-success font-black uppercase tracking-[0.2em] text-xs md:text-xs neo-card hover:bg-success hover:text-success-foreground transition-all group shadow-sm dark:shadow-[0_0_20px_rgba(var(--success-rgb),0.1)] overflow-hidden"
            >
              <div className="relative z-10 flex items-center gap-2">
                <Check
                  size={18}
                  className="group-hover:scale-125 transition-transform"
                />
                Ingat / Benar
              </div>
              <kbd className="hidden md:inline-block absolute top-4 right-4 bg-success/20 text-success text-success px-2 py-0.5 rounded font-mono text-xs">
                2
              </kbd>
            </Button>
            
            {engine.isSyncing && (
               <div className="col-span-2 text-center text-xs text-muted-foreground animate-pulse mt-2">
                 Menyinkronkan progres ke cloud...
               </div>
            )}
          </motion.div>
        )}
      </footer>
    </section>
  );
}
