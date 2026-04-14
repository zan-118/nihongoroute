"use client";

import { motion } from "framer-motion";

interface FlashcardProps {
  word: string;
  meaning: string;
  furigana?: string;
  romaji?: string;
  isFlipped: boolean;
  onFlip: () => void;
}

export default function Flashcard({
  word,
  meaning,
  furigana,
  romaji,
  isFlipped,
  onFlip,
}: FlashcardProps) {
  return (
    <div
      className="relative w-full aspect-square cursor-pointer perspective-1000"
      onClick={onFlip}
    >
      <motion.div
        className="w-full h-full transition-all duration-500 preserve-3d"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
      >
        {/* SISI DEPAN (PERTANYAAN) */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-cyber-surface border border-white/10 rounded-[2.5rem] shadow-neumorphic flex flex-col items-center justify-center p-8">
          <span className="absolute top-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 border border-white/5 px-3 py-1 rounded-full">
            Pertanyaan / Kanji
          </span>
          <h2 className="text-7xl md:text-8xl font-black text-white tracking-tighter drop-shadow-2xl">
            {word}
          </h2>
          <p className="absolute bottom-10 text-cyber-neon/40 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
            Ketuk untuk melihat arti
          </p>
        </div>

        {/* SISI BELAKANG (JAWABAN) */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden bg-[#1a1c20] border border-cyber-neon/30 rounded-[2.5rem] shadow-[0_0_40px_rgba(0,255,239,0.1)] flex flex-col items-center justify-center p-8"
          style={{ transform: "rotateY(180deg)" }}
        >
          <span className="absolute top-6 text-[10px] font-black uppercase tracking-[0.3em] text-cyber-neon/40 border border-cyber-neon/20 px-3 py-1 rounded-full">
            Jawaban / Arti
          </span>

          <div className="text-center">
            <p className="text-cyber-neon font-mono font-bold text-lg tracking-[0.2em] uppercase mb-2">
              {furigana || romaji}
            </p>
            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-6">
              {word}
            </h2>
            <div className="py-3 px-6 bg-cyber-neon/10 rounded-2xl border border-cyber-neon/20">
              <h3 className="text-2xl md:text-3xl font-black text-cyber-neon uppercase tracking-tight">
                {meaning}
              </h3>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
