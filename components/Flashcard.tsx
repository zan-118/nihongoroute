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
import { PenTool, X, MousePointer2, Sparkles } from "lucide-react";
import WritingCanvas from "@/components/WritingCanvas";
import TTSReader from "./TTSReader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [showWritingModal, setShowWritingModal] = useState(false);

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
    onFlip();
  };

  const handleDrawClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowWritingModal(true);
  };

  // ======================
  // RENDER
  // ======================
  return (
    <>
      <div
        className="relative w-full aspect-square max-h-[550px] sm:max-h-[600px] cursor-pointer mx-auto"
        style={{ perspective: "1500px" }}
        onClick={handleClick}
      >
        <motion.div
          className="w-full h-full relative"
          style={{ transformStyle: "preserve-3d" }}
          initial={false}
          animate={{
            rotateY: isFlipped ? 180 : 0,
          }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {/* =======================================
              SISI DEPAN (PERTANYAAN)
          ======================================= */}
          <Card
            className="absolute inset-0 w-full h-full bg-[#0a0c10] border-white/5 flex flex-col items-center justify-center p-4 sm:p-10 md:p-12 rounded-[2.5rem] md:rounded-[3rem] neo-card shadow-none overflow-hidden"
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
            className={`absolute inset-0 w-full h-full border ${themeBorder} rounded-[2.5rem] md:rounded-[3rem] ${themeShadow} flex flex-col items-center justify-center p-4 sm:p-10 md:p-12 transition-all duration-500 neo-card shadow-none overflow-hidden bg-[#0a0c10]`}
            style={{
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <div className="w-full h-full flex flex-col items-center justify-center relative pt-8 md:pt-10">
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
                    {furigana || romaji || "..."}
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
            </div>
          </Card>
        </motion.div>
      </div>

      {/* WRITING MODAL OVERLAY */}
      <Dialog
        open={showWritingModal}
        onOpenChange={setShowWritingModal}
      >
        <DialogContent className="max-w-md p-0 border-none bg-transparent shadow-none">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative bg-[#1e2024] p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-purple-500/30 shadow-2xl max-w-md w-full flex flex-col"
          >
            <div className="relative z-10 flex flex-col">
              <header className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                    <PenTool size={18} className="text-purple-400" />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold text-[9px] uppercase tracking-widest text-purple-400 mb-0.5">Latihan Kanji</span>
                    <h3 className="text-white text-lg font-black italic uppercase tracking-tighter leading-none">Cara Menulis</h3>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowWritingModal(false)}
                  className="w-10 h-10 p-0 rounded-xl bg-black/40 hover:bg-white hover:text-black transition-all border border-white/5"
                >
                  <X size={20} />
                </Button>
              </header>

              <div className="bg-[#15171a] p-4 rounded-2xl border border-white/5 flex justify-between items-center shadow-inner mb-6">
                <div className="flex items-center gap-4">
                  <p className="text-4xl font-black text-white font-japanese leading-none">
                    {word.charAt(0)}
                  </p>
                  <p className="font-mono uppercase tracking-[0.3em] text-xs font-bold text-purple-400">
                    "{word}"
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-purple-400 italic">
                  KANJI_MODE
                </div>
              </div>

              <div className="w-full flex-1 flex flex-col justify-center min-h-[300px] mb-2">
                <WritingCanvas 
                  character={word.charAt(0)} 
                  strokeColor="#a855f7" 
                  guideColor="#a855f7"
                />
              </div>

              <p className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em] mt-4">
                <Sparkles size={10} className="inline mr-1 text-purple-400" />{" "}
                Tulis goresan kanji di atas secara berurutan!
              </p>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}
