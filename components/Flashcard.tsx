/**
 * @file Flashcard.tsx
 * @description Komponen kartu hafalan interaktif yang mendukung rotasi 3D dan mode menulis kanji.
 * @module Flashcard
 */

"use client";

// ======================
// IMPORTS
// ======================
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenTool, X, MousePointer2 } from "lucide-react";
import WritingCanvas from "@/components/WritingCanvas";
import TTSReader from "./TTSReader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ======================
// TYPES
// ======================
interface FlashcardProps {
  word: string;
  meaning: string;
  furigana?: string;
  romaji?: string;
  kanjiDetails?: { onyomi?: string; kunyomi?: string };
  isFlipped: boolean;
  onFlip: () => void;
  type?: "vocab" | "kanji";
}

// ======================
// MAIN EXECUTION
// ======================

/**
 * Komponen Flashcard: Menampilkan kartu interaktif dengan sisi depan dan belakang.
 * 
 * @param {FlashcardProps} props - Properti kartu.
 * @returns {JSX.Element} Antarmuka kartu flashcard.
 */
export default function Flashcard({
  word,
  meaning,
  furigana,
  romaji,
  kanjiDetails,
  isFlipped,
  onFlip,
  type = "vocab",
}: FlashcardProps) {
  // State Management
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  // ======================
  // CONFIG / THEME
  // ======================
  const isKanji = type === "kanji";
  const themeColor = isKanji ? "text-purple-400" : "text-cyber-neon";
  const themeBorder = isKanji ? "border-purple-500/30" : "border-cyber-neon/30";
  const themeShadow = isKanji 
    ? "shadow-[0_0_30px_rgba(168,85,247,0.1)]" 
    : "shadow-[0_0_30px_rgba(0,238,255,0.1)]";
  const glowClass = isKanji 
    ? "drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" 
    : "drop-shadow-[0_0_15px_rgba(0,238,255,0.5)]";

  // ======================
  // HELPER FUNCTIONS
  // ======================

  const handleClick = (e: React.MouseEvent) => {
    if (isDrawingMode) {
      e.stopPropagation();
      return;
    }
    onFlip();
  };

  const handleDrawClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDrawingMode(true);
  };

  const handleCloseDraw = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDrawingMode(false);
  };

  // ======================
  // RENDER
  // ======================
  return (
    <div
      className="relative w-full aspect-[4/5] sm:aspect-square md:aspect-[4/3] cursor-pointer"
      style={{ perspective: "1500px" }}
      onClick={handleClick}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: "preserve-3d" }}
        initial={false}
        animate={{
          rotateY: isFlipped ? 180 : 0,
          scale: isDrawingMode ? 1.02 : 1,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* =======================================
            SISI DEPAN (PERTANYAAN)
        ======================================= */}
        <Card
          className="absolute inset-0 w-full h-full bg-[#0a0c10] border-white/5 flex flex-col items-center justify-center p-6 sm:p-10 md:p-12 rounded-[2.5rem] md:rounded-[3rem] neo-card shadow-none overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {/* Decorative background glow */}
          <div className={`absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 blur-[80px] md:blur-[100px] rounded-full opacity-10 pointer-events-none ${isKanji ? 'bg-purple-500' : 'bg-cyber-neon'}`} />

          <Badge
            variant="outline"
            className="absolute top-6 md:top-8 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 border-white/5 px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl bg-black/20 neo-inset h-auto whitespace-nowrap"
          >
            {isKanji ? "Karakter Kanji" : "Kosakata Utama"}
          </Badge>


          <h2
            className={`${word.length > 4 ? "text-5xl sm:text-6xl md:text-7xl lg:text-9xl" : "text-7xl sm:text-8xl md:text-9xl lg:text-[11rem]"} font-black text-white tracking-tight font-japanese leading-none z-10 ${glowClass} transition-all duration-300`}
          >
            {word}
          </h2>

          <div className="absolute bottom-6 md:bottom-10 flex flex-col items-center gap-1.5 md:gap-2">
             <MousePointer2 size={16} className={`${themeColor} opacity-50 animate-bounce md:w-5 md:h-5`} />
             <p className={`${themeColor} opacity-50 text-[9px] md:text-[10px] font-bold uppercase tracking-widest`}>
               Ketuk Untuk Membuka
             </p>
          </div>
        </Card>

        {/* =======================================
            SISI BELAKANG (JAWABAN)
        ======================================= */}
        <Card
          className={`absolute inset-0 w-full h-full border ${themeBorder} rounded-[2.5rem] md:rounded-[3rem] ${themeShadow} flex flex-col items-center justify-center p-6 sm:p-10 md:p-12 transition-all duration-500 neo-card shadow-none overflow-hidden ${
            isDrawingMode
              ? "bg-[#050608]"
              : "bg-[#0a0c10]"
          }`}
          style={{
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <AnimatePresence mode="wait">
            {!isDrawingMode ? (
              <motion.div
                key="back-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full h-full flex flex-col items-center justify-center relative pt-8 md:pt-10"
              >
                <Badge
                  variant="outline"
                  className={`absolute top-0 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${themeColor} border-current/20 px-4 md:px-5 py-1.5 md:py-2 rounded-lg md:rounded-xl h-auto neo-inset bg-black/20`}
                >
                  Definisi
                </Badge>

                <div className="absolute top-0 right-0 z-20">
                  <TTSReader text={word} minimal={true} />
                </div>

                <div className="text-center w-full flex flex-col items-center justify-center h-full space-y-4 md:space-y-6">
                  {type !== "kanji" && (
                    <p
                      className={`${themeColor} font-mono font-bold text-sm sm:text-lg md:text-2xl tracking-widest uppercase opacity-80`}
                    >
                      {furigana || romaji || "..." || "..."}
                    </p>
                  )}

                  <h2
                    className={`${word.length > 4 ? "text-4xl sm:text-5xl md:text-6xl lg:text-7xl" : "text-5xl sm:text-6xl md:text-7xl lg:text-8xl"} font-black text-white tracking-tight font-japanese leading-tight drop-shadow-lg transition-all`}
                  >
                    {word}
                  </h2>

                  {/* KANJI DETAILS */}
                  {isKanji && kanjiDetails && (
                    <div className="flex flex-wrap justify-center gap-3 md:gap-4 w-full">
                      {kanjiDetails.onyomi && (
                        <Card className="bg-black/40 px-4 py-2.5 md:px-6 md:py-3 rounded-xl md:rounded-2xl border-white/5 flex flex-col items-center min-w-[100px] md:min-w-[120px] neo-inset shadow-none">
                          <span className="text-[9px] md:text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                            Onyomi
                          </span>
                          <span className="text-purple-400 font-japanese font-bold text-lg md:text-xl">
                            {kanjiDetails.onyomi}
                          </span>
                        </Card>
                      )}
                      {kanjiDetails.kunyomi && (
                        <Card className="bg-black/40 px-4 py-2.5 md:px-6 md:py-3 rounded-xl md:rounded-2xl border-white/5 flex flex-col items-center min-w-[100px] md:min-w-[120px] neo-inset shadow-none">
                          <span className="text-[9px] md:text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                            Kunyomi
                          </span>
                          <span className="text-purple-400 font-japanese font-bold text-lg md:text-xl">
                            {kanjiDetails.kunyomi}
                          </span>
                        </Card>
                      )}
                    </div>
                  )}

                  {/* MEANING CARD */}
                  <Card
                    className={`p-5 md:p-8 bg-black/40 rounded-[2rem] md:rounded-[2.5rem] border ${themeBorder} w-full flex items-center justify-center neo-inset shadow-none min-h-[100px] md:min-h-[140px] mt-2 md:mt-0`}
                  >
                    <h3
                      className={`${themeColor} text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-tight leading-snug`}
                    >
                      {meaning}
                    </h3>
                  </Card>

                  {isKanji && (
                    <Button
                      onClick={handleDrawClick}
                      className="mt-4 md:mt-8 flex items-center justify-center gap-2 md:gap-3 w-full max-w-sm mx-auto bg-purple-500 hover:bg-white text-black font-bold uppercase tracking-widest h-auto py-4 md:py-5 px-6 md:px-8 rounded-xl md:rounded-2xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] border-none text-[10px] md:text-xs"
                    >
                      <PenTool size={18} className="md:w-5 md:h-5" />
                      <span>Latih Menulis</span>
                    </Button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="back-draw"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full h-full flex flex-col relative z-50 cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                <header className="flex justify-between items-center mb-6 md:mb-8 shrink-0">
                  <div className="flex items-center gap-3 md:gap-4">
                    <Card className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-purple-500/10 border-purple-500/30 flex items-center justify-center neo-inset shadow-none">
                      <PenTool size={18} className="text-purple-400 md:w-5 md:h-5" />
                    </Card>
                    <div className="text-left">
                       <span className="block font-bold text-[9px] md:text-[10px] uppercase tracking-widest text-purple-400">Latihan Goresan</span>
                       <span className="text-white font-japanese text-xs md:text-sm font-bold opacity-80">Latihan {word}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleCloseDraw}
                    className="w-10 h-10 md:w-12 md:h-12 p-0 rounded-xl md:rounded-2xl bg-black/40 hover:bg-cyber-neon hover:text-black transition-all border border-white/5 neo-inset"
                  >
                    <X size={20} className="md:w-6 md:h-6" />
                  </Button>
                </header>

                <div className="flex-1 flex items-center justify-center w-full relative">
                  <WritingCanvas character={word.charAt(0)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
