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
        <Card className="w-full bg-card dark:bg-[#0a0c10] p-8 md:p-10 rounded-2xl border border-border dark:border-white/[0.08] text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500 shadow-lg" />
          
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-muted/50 dark:bg-white/[0.04] rounded-xl flex items-center justify-center border border-border dark:border-white/[0.08] mb-6 shadow-none">
            <Trophy size={32} className="text-amber-600 dark:text-amber-400 drop-shadow-sm" />
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tight mb-2 text-center">
            Review Selesai
          </h2>
          <p className="text-muted-foreground text-xs md:text-xs mb-8 uppercase font-bold tracking-widest">
            {engine.shuffledCards.length} KARTU SELESAI DITINJAU
          </p>

          <Card className="bg-muted/50 dark:bg-white/[0.03] py-4 rounded-xl border border-border dark:border-white/[0.08] mb-8 flex justify-center items-center gap-3 shadow-none">
            <Flame size={18} className="text-red-500" />
            <span className="text-foreground dark:text-white font-mono font-black text-base md:text-lg">
              +{engine.earnedXP} XP
            </span>
          </Card>

          <Button
            onClick={() => engine.router.push("/dashboard")}
            className="w-full h-auto py-4 text-white font-bold uppercase tracking-widest text-xs md:text-xs bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-lg"
          >
            Kembali ke Dashboard
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
          className="h-full bg-red-500 transition-all duration-500 ease-out" 
          style={{ width: `${progressPercent}%` }} 
        />
      </div>

      {/* HEADER */}
      <header className="flex flex-col gap-6 mb-10">
        <div className="flex items-center gap-3">
          <Card className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center neo-inset shadow-none">
            <BrainCircuit size={20} className="text-red-500" />
          </Card>
          <div>
            <Badge
              variant="outline"
              className="text-red-600 dark:text-red-500 font-black text-xs tracking-[0.3em] uppercase bg-red-500/5 px-4 py-1.5 rounded-xl border-red-500/20 neo-inset h-auto"
            >
              Latihan Mengingat (SRS)
            </Badge>
            <p className="text-muted-foreground text-xs font-bold uppercase mt-1 tracking-widest">
              Mari segarkan ingatanmu hari ini
            </p>
          </div>
        </div>

        <Card className="bg-red-500/5 border-red-500/10 p-4 rounded-[1.5rem] neo-inset shadow-none border-dashed">
          <div className="flex items-start gap-3">
            <ShieldCheck size={16} className="shrink-0 text-red-600 dark:text-red-500 mt-0.5" />
            <div className="space-y-1">
              <p className="text-red-600/80 dark:text-red-400/80 text-xs leading-relaxed italic font-medium">
                Kejujuran adalah kunci. Beritahu kami jika kamu benar-benar ingat atau lupa kata ini.
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed uppercase tracking-widest font-bold">
                Sistem SRS akan menjadwalkan ulang kata ini secara otomatis agar kamu tidak lupa.
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
                className={`absolute inset-0 z-40 rounded-[2.5rem] pointer-events-none mix-blend-overlay opacity-30 ${engine.flash === "correct" ? "bg-emerald-500" : "bg-red-500"}`} 
              />
            )}

            {engine.currentCard && (
              <Flashcard
                id={engine.currentCard._id}
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
              <span className="text-muted-foreground/40 italic">Kartu Tersisa</span>
              <span className="text-foreground text-lg">
                {engine.currentIndex + 1} <span className="text-border mx-1">/</span>{" "}
                {engine.shuffledCards.length}
              </span>
            </div>

            <div className="hidden md:flex justify-center mt-2">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold bg-muted/50 dark:bg-black/40 px-4 py-2 rounded-xl neo-inset border border-border dark:border-white/5">
                Tekan <kbd className="font-mono text-red-600 dark:text-red-400">Spasi</kbd> untuk
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
              disabled={engine.isSyncing}
              className="relative h-auto py-8 bg-red-500/5 border border-red-500/20 rounded-[2.5rem] text-red-600 dark:text-red-500 font-black uppercase tracking-[0.2em] text-xs md:text-xs neo-card hover:bg-red-600 hover:text-white dark:hover:text-black transition-all group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="relative z-10 flex items-center gap-2">
                <X
                  size={18}
                  className="group-hover:scale-125 transition-transform"
                />
                Masih Lupa
              </div>
              <kbd className="hidden md:inline-block absolute top-4 left-4 bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded font-mono text-xs">
                1
              </kbd>
            </Button>

            <Button
              variant="ghost"
              onClick={() => engine.handleAnswer(2)}
              disabled={engine.isSyncing}
              className="relative h-auto py-8 bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-[0.2em] text-xs md:text-xs neo-card hover:bg-emerald-600 hover:text-white dark:hover:text-black transition-all group shadow-sm dark:shadow-[0_0_20px_rgba(16,185,129,0.1)] overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="relative z-10 flex items-center gap-2">
                <Check
                  size={18}
                  className="group-hover:scale-125 transition-transform"
                />
                Sudah Ingat
              </div>
              <kbd className="hidden md:inline-block absolute top-4 right-4 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-mono text-xs">
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
