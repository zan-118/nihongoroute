"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PenTool, ChevronLeft, ScanLine } from "lucide-react";
import Link from "next/link";

// DATA KANA LENGKAP
const kanaData = {
  hiragana: [
    ["あ", "い", "う", "え", "お"],
    ["か", "き", "く", "け", "こ"],
    ["さ", "し", "す", "せ", "そ"],
    ["た", "ち", "つ", "て", "と"],
    ["な", "に", "ぬ", "ね", "の"],
    ["は", "ひ", "ふ", "へ", "ほ"],
    ["ま", "み", "む", "め", "も"],
    ["や", "", "ゆ", "", "よ"],
    ["ら", "り", "る", "れ", "ろ"],
    ["わ", "", "", "", "を"],
    ["ん", "", "", "", ""],
  ],
  katakana: [
    ["ア", "イ", "ウ", "エ", "オ"],
    ["カ", "キ", "ク", "ケ", "コ"],
    ["サ", "シ", "ス", "セ", "ソ"],
    ["タ", "チ", "ツ", "テ", "ト"],
    ["ナ", "ニ", "ヌ", "ネ", "ノ"],
    ["ハ", "ヒ", "フ", "ヘ", "ホ"],
    ["マ", "ミ", "ム", "メ", "モ"],
    ["ヤ", "", "ユ", "", "ヨ"],
    ["ラ", "リ", "ル", "レ", "ロ"],
    ["ワ", "", "", "", "ヲ"],
    ["ン", "", "", "", ""],
  ],
  romaji: [
    ["a", "i", "u", "e", "o"],
    ["ka", "ki", "ku", "ke", "ko"],
    ["sa", "shi", "su", "se", "so"],
    ["ta", "chi", "tsu", "te", "to"],
    ["na", "ni", "nu", "ne", "no"],
    ["ha", "hi", "fu", "he", "ho"],
    ["ma", "mi", "mu", "me", "mo"],
    ["ya", "", "yu", "", "yo"],
    ["ra", "ri", "ru", "re", "ro"],
    ["wa", "", "", "", "wo"],
    ["n", "", "", "", ""],
  ],
};

export default function BasicsPage() {
  const [type, setType] = useState<"hiragana" | "katakana">("hiragana");
  const [selectedChar, setSelectedChar] = useState<{
    char: string;
    romaji: string;
  } | null>(null);

  const currentData = kanaData[type];

  // Tema Dinamis berdasarkan tipe Kana
  const isHira = type === "hiragana";
  const themeColor = isHira ? "text-[#0ef]" : "text-purple-400";
  const themeBorder = isHira ? "border-[#0ef]/30" : "border-purple-500/30";
  const themeBgHover = isHira ? "hover:bg-[#0ef]/10" : "hover:bg-purple-500/10";
  const themeGlow = isHira
    ? "shadow-[0_0_15px_rgba(0,255,239,0.3)]"
    : "shadow-[0_0_15px_rgba(168,85,247,0.3)]";

  const getStrokeImageUrl = (char: string) => {
    const code = char.charCodeAt(0).toString(16).padStart(5, "0");
    return `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${code}.svg`;
  };

  return (
    <div className="min-h-screen bg-[#15171a] pt-24 pb-32 px-4 md:px-8 relative overflow-hidden">
      {/* Background Cyber Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* BREADCRUMB NAV */}
        <nav className="mb-10 font-mono text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3">
          <Link
            href="/jlpt"
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
          >
            <ChevronLeft size={14} /> Back to Hub
          </Link>
          <span className="text-white/20">/</span>
          <span
            className={`${themeColor} bg-white/5 px-3 py-1.5 rounded-lg border ${themeBorder} transition-colors duration-500`}
          >
            Kana Matrix
          </span>
        </nav>

        {/* HEADER */}
        <header className="mb-12 relative flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div>
            <p
              className={`${themeColor} text-[10px] font-black uppercase tracking-[0.4em] mb-2 transition-colors duration-500 flex items-center gap-2`}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              Initialization Phase
            </p>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none drop-shadow-lg">
              Kana{" "}
              <span
                className={`${themeColor} transition-colors duration-500 drop-shadow-md`}
              >
                Matrix
              </span>
            </h1>
            <p className="text-[#c4cfde]/50 max-w-xl text-sm mt-4 leading-relaxed font-medium">
              Pondasi utama bahasa Jepang. Kuasai huruf dasar sebelum
              melanjutkan ke tata bahasa.
              <strong className="text-white">
                {" "}
                Klik karakter manapun
              </strong>{" "}
              untuk memuat data *Stroke Order*.
            </p>
          </div>
        </header>

        {/* CONTROLS: TACTILE TOGGLE & INFO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          {/* Neumorphic Toggle Switch */}
          <div className="bg-[#1e2024] p-2 rounded-full border border-white/5 flex gap-2 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] relative">
            <button
              onClick={() => setType("hiragana")}
              className={`relative z-10 px-8 md:px-12 py-3 rounded-full font-black uppercase tracking-widest text-[10px] md:text-xs transition-all duration-500 ${
                isHira
                  ? "text-[#15171a] shadow-lg"
                  : "text-white/40 hover:text-white"
              }`}
            >
              Hiragana
            </button>
            <button
              onClick={() => setType("katakana")}
              className={`relative z-10 px-8 md:px-12 py-3 rounded-full font-black uppercase tracking-widest text-[10px] md:text-xs transition-all duration-500 ${
                !isHira
                  ? "text-[#15171a] shadow-lg"
                  : "text-white/40 hover:text-white"
              }`}
            >
              Katakana
            </button>

            {/* Sliding Active Background */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`absolute top-2 bottom-2 w-[calc(50%-0.5rem)] rounded-full ${isHira ? "bg-[#0ef] left-2" : "bg-purple-500 right-2"} shadow-[0_0_15px_currentColor] opacity-90`}
            />
          </div>

          <div
            className={`flex items-center gap-3 px-5 py-2.5 rounded-xl bg-[#1e2024] border border-white/5 text-[9px] font-black uppercase tracking-[0.2em] ${themeColor} shadow-inner transition-colors duration-500`}
          >
            <ScanLine size={14} className="animate-pulse" /> Select Tile for
            Hologram
          </div>
        </div>

        {/* INTERACTIVE DATA GRID */}
        <div className="bg-[#1e2024] p-6 md:p-12 rounded-[3rem] border border-white/5 shadow-[15px_15px_40px_rgba(0,0,0,0.6)] overflow-x-auto custom-scrollbar relative">
          {/* Watermark */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] font-black italic opacity-[0.02] pointer-events-none select-none transition-colors duration-700 ${themeColor}`}
          >
            {isHira ? "あ" : "ア"}
          </div>

          <div className="min-w-[700px] grid grid-cols-5 gap-4 md:gap-6 relative z-10">
            <AnimatePresence mode="wait">
              {currentData.map((row, rowIndex) => (
                <React.Fragment key={`${type}-${rowIndex}`}>
                  {row.map((char, colIndex) =>
                    char !== "" ? (
                      <motion.div
                        key={`${type}-${rowIndex}-${colIndex}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: rowIndex * 0.05 + colIndex * 0.02,
                        }}
                        onClick={() =>
                          setSelectedChar({
                            char,
                            romaji: kanaData.romaji[rowIndex][colIndex],
                          })
                        }
                        className={`relative aspect-square bg-[#15171a] border border-white/5 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${themeBgHover} hover:border-current group shadow-[6px_6px_15px_rgba(0,0,0,0.5),-4px_-4px_10px_rgba(255,255,255,0.02)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.5)] active:scale-95`}
                      >
                        <span
                          className={`text-4xl md:text-5xl font-black text-white group-hover:${themeColor} transition-colors font-japanese drop-shadow-sm`}
                        >
                          {char}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-white/30 uppercase tracking-widest mt-2 group-hover:text-white/80 transition-colors">
                          {kanaData.romaji[rowIndex][colIndex]}
                        </span>
                      </motion.div>
                    ) : (
                      <div
                        key={`empty-${rowIndex}-${colIndex}`}
                        className="aspect-square opacity-0"
                      />
                    ),
                  )}
                </React.Fragment>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* HOLOGRAPHIC STROKE ORDER MODAL */}
        <AnimatePresence>
          {selectedChar && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedChar(null)}
                className="absolute inset-0 bg-[#15171a]/80 backdrop-blur-md"
              />

              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className={`relative bg-[#1e2024] p-8 md:p-12 rounded-[3.5rem] border ${themeBorder} ${themeGlow} max-w-sm w-full text-center overflow-hidden`}
              >
                {/* Cyber Scanline Effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-b from-transparent via-current to-transparent opacity-5 pointer-events-none animate-scanline ${themeColor}`}
                />

                <button
                  onClick={() => setSelectedChar(null)}
                  className="absolute top-6 right-6 p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/5 z-20"
                >
                  <X size={18} />
                </button>

                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-2 mb-8">
                    <PenTool size={16} className={themeColor} />
                    <span
                      className={`font-mono uppercase tracking-[0.3em] text-[10px] font-black ${themeColor}`}
                    >
                      Stroke Analysis
                    </span>
                  </div>

                  <div className="bg-white rounded-[2.5rem] p-8 mb-8 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] flex items-center justify-center aspect-square relative border-[4px] border-white/10 group overflow-hidden">
                    <img
                      src={getStrokeImageUrl(selectedChar.char)}
                      alt={selectedChar.char}
                      // Hapus invert, ganti dengan grayscale yang akan memudar saat di-hover
                      className="w-full h-full object-contain grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = `https://placehold.co/400x400/ffffff/15171a?text=${selectedChar.char}&font=roboto`;
                      }}
                    />
                  </div>

                  <div className="bg-[#15171a] p-6 rounded-3xl border border-white/5 flex justify-between items-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                    <div className="text-left">
                      <p className="text-5xl font-black text-white leading-none drop-shadow-md">
                        {selectedChar.char}
                      </p>
                      <p
                        className={`font-mono uppercase tracking-[0.3em] text-xs font-bold mt-3 ${themeColor}`}
                      >
                        "{selectedChar.romaji}"
                      </p>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest ${themeColor}`}
                    >
                      {type}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
