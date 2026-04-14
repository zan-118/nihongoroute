"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenTool, X } from "lucide-react";
import WritingCanvas from "@/components/WritingCanvas";
import TTSReader from "./TTSReader";

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
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  const themeColor = type === "kanji" ? "text-purple-400" : "text-cyan-400";
  const themeBorder =
    type === "kanji" ? "border-purple-500/30" : "border-cyan-400/30";
  const themeShadow =
    type === "kanji"
      ? "shadow-[0_0_30px_rgba(168,85,247,0.15)]"
      : "shadow-[0_0_30px_rgba(34,211,238,0.15)]";

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

  return (
    <div
      className="relative w-full aspect-[4/5] sm:aspect-square md:aspect-[4/3] cursor-pointer"
      style={{ perspective: "1000px" }}
      onClick={handleClick}
    >
      <motion.div
        className="w-full h-full transition-all duration-700 relative"
        style={{ transformStyle: "preserve-3d" }}
        initial={false}
        animate={{
          rotateY: isFlipped ? 180 : 0,
          scale: isDrawingMode ? 1.02 : 1,
        }}
      >
        {/* =======================================
            SISI DEPAN (PERTANYAAN / HURUF)
        ======================================= */}
        <div
          className="absolute inset-0 w-full h-full bg-cyber-surface border border-white/5 shadow-[15px_15px_40px_rgba(0,0,0,0.6),-10px_-10px_30px_rgba(255,255,255,0.02)] flex flex-col items-center justify-center p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem]"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <span
            className={`absolute top-6 text-[9px] font-black uppercase tracking-[0.3em] text-white/30 border border-white/10 px-4 py-1.5 rounded-full bg-black/20`}
          >
            {type === "kanji" ? "Karakter Kanji" : "Kosakata"}
          </span>

          <div className="absolute top-6 right-6 z-20">
            <TTSReader text={word} minimal={true} />
          </div>

          {/* ✨ FONT RAKSASA DI SISI DEPAN */}
          <h2
            className={`${word.length > 4 ? "text-6xl sm:text-7xl lg:text-8xl" : "text-[6rem] sm:text-[8rem] lg:text-[10rem]"} font-black text-white tracking-tighter drop-shadow-2xl font-japanese leading-none`}
          >
            {word}
          </h2>

          <p
            className={`absolute bottom-6 ${themeColor} opacity-40 text-[9px] font-black uppercase tracking-[0.4em] animate-pulse`}
          >
            Ketuk untuk membalik
          </p>
        </div>

        {/* =======================================
            SISI BELAKANG (JAWABAN / KANVAS)
        ======================================= */}
        <div
          className={`absolute inset-0 w-full h-full border ${themeBorder} rounded-[2rem] sm:rounded-[3rem] ${themeShadow} flex flex-col items-center justify-center p-6 sm:p-10 transition-colors duration-300 ${
            isDrawingMode
              ? "bg-[#0a0c10]"
              : "bg-gradient-to-br from-[#111318] to-[#0a0c10]"
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full h-full flex flex-col items-center justify-center relative pt-8 pb-4"
              >
                <span
                  className={`absolute top-0 text-[9px] font-black uppercase tracking-[0.3em] ${themeColor} opacity-40 border border-current px-3 py-1 rounded-full`}
                >
                  Jawaban
                </span>

                <div className="absolute top-0 right-0 z-20">
                  <TTSReader text={word} minimal={true} />
                </div>

                <div className="text-center w-full flex flex-col items-center justify-center h-full">
                  {type !== "kanji" && (
                    <p
                      className={`${themeColor} font-mono font-bold text-base sm:text-xl lg:text-2xl tracking-[0.2em] uppercase mb-2`}
                    >
                      {furigana || romaji || "..."}
                    </p>
                  )}

                  {/* ✨ FONT RAKSASA SISI BELAKANG */}
                  <h2
                    className={`${word.length > 4 ? "text-5xl sm:text-6xl lg:text-7xl" : "text-6xl sm:text-7xl lg:text-8xl"} font-black text-white tracking-tighter mb-4 font-japanese drop-shadow-md leading-tight`}
                  >
                    {word}
                  </h2>

                  {/* INFO ONYOMI & KUNYOMI (Khusus Kanji) */}
                  {type === "kanji" && kanjiDetails && (
                    <div className="flex flex-wrap justify-center gap-3 mb-6 w-full">
                      {kanjiDetails.onyomi && (
                        <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 flex flex-col items-center min-w-[100px]">
                          <span className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-widest font-black">
                            Onyomi
                          </span>
                          <span className="text-purple-400 font-japanese font-bold text-base sm:text-lg">
                            {kanjiDetails.onyomi}
                          </span>
                        </div>
                      )}
                      {kanjiDetails.kunyomi && (
                        <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 flex flex-col items-center min-w-[100px]">
                          <span className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-widest font-black">
                            Kunyomi
                          </span>
                          <span className="text-purple-400 font-japanese font-bold text-base sm:text-lg">
                            {kanjiDetails.kunyomi}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Arti Bahasa Indonesia Diperbesar */}
                  <div
                    className={`py-4 sm:py-6 px-6 bg-white/5 rounded-2xl border ${themeBorder} w-full shadow-inner max-h-[150px] overflow-y-auto custom-scrollbar flex items-center justify-center`}
                  >
                    <h3
                      className={`${themeColor} text-xl sm:text-2xl lg:text-4xl font-black uppercase tracking-tight leading-snug`}
                    >
                      {meaning}
                    </h3>
                  </div>

                  {type === "kanji" && (
                    <button
                      onClick={handleDrawClick}
                      className="mt-6 flex items-center justify-center gap-3 w-full max-w-sm mx-auto bg-purple-500/20 border border-purple-500/50 hover:bg-purple-500 text-purple-400 hover:text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs lg:text-sm transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] active:scale-95"
                    >
                      <PenTool size={18} />
                      <span>Latih Tulis Stroke Order</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="back-draw"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex flex-col relative z-50 cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                <header className="flex justify-between items-center mb-6 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shadow-inner">
                      <PenTool size={18} className="text-purple-400" />
                    </div>
                    <span className="font-mono text-[10px] sm:text-xs uppercase font-black tracking-widest text-purple-400">
                      Latihan Menulis
                    </span>
                  </div>
                  <button
                    onClick={handleCloseDraw}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors border border-white/5"
                  >
                    <X size={20} />
                  </button>
                </header>

                <div className="flex-1 flex items-center justify-center w-full relative">
                  <WritingCanvas character={word.charAt(0)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
