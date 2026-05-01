"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Check, X, ShieldCheck } from "lucide-react";
import Flashcard from "@/components/Flashcard";
import { FlashcardType } from "./features/srs/review/types";
import { useSRSReview } from "./features/srs/review/useSRSReview";

export default function SRSReviewEngine({ cards }: { cards: FlashcardType[] }) {
  const engine = useSRSReview(cards);

  if (!engine.isClient || engine.shuffledCards.length === 0) return null;

  return (
    <section className="w-full max-w-2xl mx-auto px-4">
      {/* HEADER */}
      <header className="flex flex-col gap-6 mb-10">
        <div className="flex items-center gap-3">
          <Card className="w-10 h-10 rounded-xl bg-red-500/10 border-red-500/20 flex items-center justify-center neo-inset shadow-none">
            <BrainCircuit size={20} className="text-red-500" />
          </Card>
          <div>
            <Badge
              variant="outline"
              className="text-red-500 font-black text-[10px] tracking-[0.3em] uppercase bg-red-500/5 px-4 py-1.5 rounded-xl border-red-500/20 neo-inset h-auto"
            >
              SRS Intel Review
            </Badge>
            <p className="text-slate-500 text-[10px] font-bold uppercase mt-1 tracking-widest">
              Evaluasi Algoritma Memori
            </p>
          </div>
        </div>

        <Card className="bg-red-500/5 border-red-500/10 p-4 rounded-[1.5rem] neo-inset shadow-none border-dashed">
          <p className="text-red-400/80 text-[11px] leading-relaxed italic flex items-center gap-3 font-medium">
            <ShieldCheck size={16} className="shrink-0 text-red-500" />
            Setiap jawaban menentukan jadwal kemunculan kartu ini di masa depan.
            Jawab dengan jujur.
          </p>
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
            className={!engine.isFlipped ? "cursor-pointer" : ""}
          >
            {engine.currentCard && (
              <Flashcard
                word={engine.currentCard.word}
                meaning={engine.currentCard.meaning}
                furigana={engine.currentCard.furigana}
                romaji={engine.currentCard.romaji}
                isFlipped={engine.isFlipped}
                onFlip={engine.toggleFlip}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* KONTROL BAWAH */}
      <footer className="min-h-[100px]">
        {!engine.isFlipped ? (
          <div className="flex flex-col items-center gap-6">
            <div className="text-slate-600 font-mono text-[11px] font-black tracking-[0.4em] uppercase text-center flex flex-col gap-1">
              <span className="text-white/40 italic">Kartu Tersisa</span>
              <span className="text-white text-lg">
                {engine.currentIndex + 1} <span className="text-white/10 mx-1">/</span>{" "}
                {engine.shuffledCards.length}
              </span>
            </div>

            <div className="hidden md:flex justify-center mt-2">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold bg-black/40 px-4 py-2 rounded-xl neo-inset border border-white/5">
                Tekan <kbd className="font-mono text-red-400">Spasi</kbd> untuk
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
              onClick={() => engine.handleAnswer(false)}
              className="relative h-auto py-8 bg-red-500/5 border border-red-500/20 rounded-[2.5rem] text-red-500 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs neo-card hover:bg-red-500 hover:text-black transition-all group overflow-hidden"
            >
              <div className="relative z-10 flex items-center">
                <X
                  size={18}
                  className="mr-2 group-hover:scale-125 transition-transform"
                />{" "}
                Masih Lupa
              </div>
              <kbd className="hidden md:inline-block absolute top-4 left-4 bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-mono text-[9px]">
                1
              </kbd>
            </Button>

            <Button
              variant="ghost"
              onClick={() => engine.handleAnswer(true)}
              className="relative h-auto py-8 bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] text-emerald-400 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs neo-card hover:bg-emerald-500 hover:text-black transition-all group shadow-[0_0_20px_rgba(16,185,129,0.1)] overflow-hidden"
            >
              <div className="relative z-10 flex items-center">
                <Check
                  size={18}
                  className="mr-2 group-hover:scale-125 transition-transform"
                />{" "}
                Sudah Ingat
              </div>
              <kbd className="hidden md:inline-block absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono text-[9px]">
                2
              </kbd>
            </Button>
          </motion.div>
        )}
      </footer>
    </section>
  );
}
