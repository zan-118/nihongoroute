"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info, PenTool, ChevronLeft } from "lucide-react";
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
    ["ま", "み", "む", "me", "も"],
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

  // Helper untuk menarik SVG Stroke Order dari KanjiVG
  const getStrokeImageUrl = (char: string) => {
    const code = char.charCodeAt(0).toString(16).padStart(5, "0");
    return `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${code}.svg`;
  };

  return (
    <div className="min-h-screen bg-[#1f242d] text-[#c4cfde] p-6 md:p-12 pb-32">
      <div className="max-w-6xl mx-auto">
        {/* BREADCRUMB NAV */}
        <nav className="mb-8">
          <Link
            href="/jlpt"
            className="flex items-center gap-2 text-[#0ef] text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity"
          >
            <ChevronLeft size={14} /> Back to Curriculum
          </Link>
        </nav>

        {/* HEADER */}
        <header className="mb-12 relative">
          <h1 className="text-5xl md:text-8xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">
            Kana{" "}
            <span className="text-[#0ef] drop-shadow-[0_0_20px_rgba(0,255,239,0.3)]">
              Basics
            </span>
          </h1>
          <p className="text-[#c4cfde]/40 italic max-w-xl text-sm border-l-2 border-white/10 pl-4 mt-6">
            Pondasi utama bahasa Jepang. Kuasai Hiragana dan Katakana sebelum
            melanjutkan ke tata bahasa.
            <span className="text-white font-bold"> Klik karakter</span> untuk
            melihat cara menulisnya.
          </p>
        </header>

        {/* CONTROLS: TOGGLE & INFO */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          <div className="bg-[#1e2024] p-2 rounded-[2.5rem] border border-white/5 flex gap-2 shadow-2xl">
            <button
              onClick={() => setType("hiragana")}
              className={`px-12 py-4 rounded-[2rem] font-black uppercase italic tracking-widest text-xs transition-all duration-500 ${
                type === "hiragana"
                  ? "bg-[#0ef] text-[#1f242d] shadow-[0_0_25px_rgba(0,255,239,0.5)] scale-105"
                  : "text-white/20 hover:text-white/60"
              }`}
            >
              Hiragana
            </button>
            <button
              onClick={() => setType("katakana")}
              className={`px-12 py-4 rounded-[2rem] font-black uppercase italic tracking-widest text-xs transition-all duration-500 ${
                type === "katakana"
                  ? "bg-[#0ef] text-[#1f242d] shadow-[0_0_25px_rgba(0,255,239,0.5)] scale-105"
                  : "text-white/20 hover:text-white/60"
              }`}
            >
              Katakana
            </button>
          </div>

          <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-[#0ef]/60">
            <PenTool size={14} /> Click any tile for stroke order
          </div>
        </div>

        {/* INTERACTIVE GRID */}
        <div className="bg-[#1e2024] p-6 md:p-12 rounded-[3.5rem] border border-white/5 shadow-2xl overflow-x-auto no-scrollbar">
          <div className="min-w-[650px] grid grid-cols-5 gap-6">
            {currentData.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                {row.map((char, colIndex) =>
                  char !== "" ? (
                    <motion.div
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() =>
                        setSelectedChar({
                          char,
                          romaji: kanaData.romaji[rowIndex][colIndex],
                        })
                      }
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative aspect-square bg-[#1f242d] border border-white/5 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all hover:border-[#0ef]/40 hover:shadow-[0_0_40px_rgba(0,255,239,0.1)] group"
                    >
                      <span className="text-5xl font-black text-white group-hover:text-[#0ef] transition-colors font-japanese italic">
                        {char}
                      </span>
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-3 group-hover:text-white/60 transition-colors">
                        {kanaData.romaji[rowIndex][colIndex]}
                      </span>
                    </motion.div>
                  ) : (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className="aspect-square opacity-0"
                    />
                  ),
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* STROKE ORDER MODAL */}
        <AnimatePresence>
          {selectedChar && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedChar(null)}
                className="absolute inset-0 bg-black/95 backdrop-blur-xl"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 40 }}
                className="relative bg-[#1e2024] p-10 rounded-[4rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] max-w-sm w-full text-center"
              >
                <button
                  onClick={() => setSelectedChar(null)}
                  className="absolute top-10 right-10 p-2 text-white/20 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>

                <div className="mb-10">
                  <span className="text-[#0ef] font-black uppercase tracking-[0.4em] text-[10px] block mb-8 italic">
                    Stroke Order Diagram
                  </span>

                  <div className="bg-white rounded-[3rem] p-8 mb-8 shadow-2xl flex items-center justify-center aspect-square relative group overflow-hidden">
                    <img
                      src={getStrokeImageUrl(selectedChar.char)}
                      alt={selectedChar.char}
                      className="w-full h-full object-contain grayscale"
                      onError={(e) => {
                        e.currentTarget.src = `https://placehold.co/400x400/FFFFFF/1f242d?text=${selectedChar.char}`;
                      }}
                    />
                  </div>

                  <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 flex justify-between items-center">
                    <div className="text-left">
                      <p className="text-5xl font-black text-white italic leading-none">
                        {selectedChar.char}
                      </p>
                      <p className="text-[#0ef] font-mono uppercase tracking-widest text-xs mt-2">
                        {selectedChar.romaji}
                      </p>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black text-white/40 uppercase tracking-widest">
                      {type}
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-white/20 italic leading-relaxed">
                  Ikuti nomor urutan pada diagram <br />
                  untuk cara tulis yang benar.
                </p>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
