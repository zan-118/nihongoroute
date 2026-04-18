"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PenTool, ChevronLeft, LayoutGrid, Sparkles } from "lucide-react";
import Link from "next/link";
import WritingCanvas from "@/components/WritingCanvas";

/* ====================================================
    DATA KANA LENGKAP
==================================================== */
const kanaData = {
  seion: {
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
  },
  dakuon: {
    hiragana: [
      ["が", "ぎ", "ぐ", "げ", "ご"],
      ["ざ", "じ", "ず", "ぜ", "ぞ"],
      ["だ", "ぢ", "づ", "で", "ど"],
      ["ば", "び", "ぶ", "べ", "ぼ"],
      ["ぱ", "ぴ", "ぷ", "ぺ", "ぽ"],
    ],
    katakana: [
      ["ガ", "ギ", "グ", "ゲ", "ゴ"],
      ["ザ", "ジ", "ズ", "ゼ", "ゾ"],
      ["ダ", "ヂ", "ヅ", "デ", "ド"],
      ["バ", "ビ", "ブ", "ベ", "ボ"],
      ["パ", "ピ", "プ", "pe", "ポ"],
    ],
    romaji: [
      ["ga", "gi", "gu", "ge", "go"],
      ["za", "ji", "zu", "ze", "zo"],
      ["da", "ji", "zu", "de", "do"],
      ["ba", "bi", "bu", "be", "bo"],
      ["pa", "pi", "pu", "pe", "po"],
    ],
  },
  yoon: {
    hiragana: [
      ["きゃ", "きゅ", "きょ"],
      ["しゃ", "しゅ", "しょ"],
      ["ちゃ", "ちゅ", "ちょ"],
      ["にゃ", "にゅ", "にょ"],
      ["ひゃ", "ひゅ", "ひょ"],
      ["みゃ", "みゅ", "みょ"],
      ["りゃ", "りゅ", "りょ"],
      ["ぎゃ", "ぎゅ", "ぎょ"],
      ["じゃ", "じゅ", "じょ"],
      ["びゃ", "びゅ", "びょ"],
      ["ぴゃ", "ぴゅ", "ぴょ"],
    ],
    katakana: [
      ["キャ", "キュ", "キョ"],
      ["シャ", "シュ", "ショ"],
      ["チャ", "チュ", "チョ"],
      ["ニャ", "ニュ", "ニョ"],
      ["ヒャ", "ヒュ", "ヒョ"],
      ["ミャ", "ミュ", "ミョ"],
      ["リャ", "リュ", "リョ"],
      ["ギャ", "ギュ", "ギョ"],
      ["ジャ", "ジュ", "ジョ"],
      ["ビャ", "ビュ", "ビョ"],
      ["ピャ", "ピュ", "ピョ"],
    ],
    romaji: [
      ["kya", "kyu", "kyo"],
      ["sha", "shu", "sho"],
      ["cha", "chu", "cho"],
      ["nya", "nyu", "nyo"],
      ["hya", "hyu", "hyo"],
      ["mya", "myu", "myo"],
      ["rya", "ryu", "ryo"],
      ["gya", "gyu", "gyo"],
      ["ja", "ju", "jo"],
      ["bya", "byu", "byo"],
      ["pya", "pyu", "pyo"],
    ],
  },
};

type KanaType = "hiragana" | "katakana";
type KanaCategory = "seion" | "dakuon" | "yoon";

export default function BasicsPage() {
  const [type, setType] = useState<KanaType>("hiragana");
  const [category, setCategory] = useState<KanaCategory>("seion");
  const [selectedChar, setSelectedChar] = useState<{
    char: string;
    romaji: string;
  } | null>(null);

  const currentData = kanaData[category];
  const isHira = type === "hiragana";

  const themeColor = isHira ? "text-[#0ef]" : "text-purple-400";
  const themeBorder = isHira ? "border-[#0ef]/30" : "border-purple-500/30";
  const themeBgHover = isHira ? "hover:bg-[#0ef]/10" : "hover:bg-purple-500/10";
  const themeAccent = isHira ? "bg-[#0ef]" : "bg-purple-500";

  return (
    <div className="w-full flex-1  relative overflow-hidden flex flex-col">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col h-full">
        {/* HEADER */}
        <header className="mb-8">
          <nav className="mb-4">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest"
            >
              <ChevronLeft size={14} /> Kembali ke Pusat
            </Link>
          </nav>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter drop-shadow-lg">
                Matriks <span className={themeColor}>Kana</span>
              </h1>
              <p className="text-slate-200 text-xs mt-2 max-w-md">
                Pondasi utama bahasa Jepang. Kuasai cara baca dan cara tulis
                sebelum lanjut ke materi tata bahasa.
              </p>
            </div>
            <div
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1e2024] border border-white/5 text-[9px] font-black uppercase tracking-[0.2em] ${themeColor}`}
            >
              <LayoutGrid size={12} /> Tampilan Ringkas
            </div>
          </div>
        </header>

        {/* CONTROLS */}
        <div className="mb-8 space-y-6">
          <div className="bg-[#1e2024] p-1.5 rounded-2xl border border-white/5 flex gap-2 shadow-inner relative max-w-sm">
            <button
              onClick={() => setType("hiragana")}
              className={`relative z-10 flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all duration-500 ${isHira ? "text-[#15171a]" : "text-white/40 hover:text-white"}`}
            >
              Hiragana
            </button>
            <button
              onClick={() => setType("katakana")}
              className={`relative z-10 flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all duration-500 ${!isHira ? "text-[#15171a]" : "text-white/40 hover:text-white"}`}
            >
              Katakana
            </button>
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] rounded-xl ${isHira ? "bg-[#0ef] left-1.5" : "bg-purple-500 right-1.5"} shadow-[0_0_15px_currentColor]`}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "seion", label: "Dasar" },
              { id: "dakuon", label: "Tenten / Maru" },
              { id: "yoon", label: "Campuran" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id as KanaCategory)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  category === cat.id
                    ? `bg-[#1e2024] ${themeColor} ${themeBorder} shadow-[0_0_10px_currentColor]`
                    : "bg-transparent text-white/30 border-white/5 hover:bg-white/5"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* DATA GRID */}
        <div className="bg-[#1e2024] p-4 md:p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative flex-1 min-h-[400px]">
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12rem] md:text-[18rem] font-black italic opacity-[0.02] pointer-events-none select-none transition-colors duration-700 ${themeColor}`}
          >
            {isHira ? "あ" : "ア"}
          </div>

          <div
            className={`relative z-10 grid gap-2 md:gap-4 mx-auto ${category === "yoon" ? "grid-cols-3 max-w-lg" : "grid-cols-5 max-w-2xl"}`}
          >
            <AnimatePresence mode="wait">
              {currentData[type].map((row, rowIndex) => (
                <React.Fragment key={`${category}-${type}-${rowIndex}`}>
                  {row.map((char, colIndex) =>
                    char !== "" ? (
                      <motion.div
                        key={`${category}-${type}-${rowIndex}-${colIndex}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: rowIndex * 0.02 }}
                        onClick={() =>
                          setSelectedChar({
                            char,
                            romaji: currentData.romaji[rowIndex][colIndex],
                          })
                        }
                        className={`relative aspect-square bg-[#15171a] border border-white/5 rounded-xl md:rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${themeBgHover} hover:border-current group active:scale-90`}
                      >
                        <span className="text-2xl md:text-4xl font-black text-white group-hover:scale-110 transition-transform font-japanese">
                          {char}
                        </span>
                        <span className="text-[8px] md:text-[10px] font-mono font-bold text-white/20 uppercase tracking-widest mt-1 group-hover:text-white/60 transition-colors">
                          {currentData.romaji[rowIndex][colIndex]}
                        </span>
                      </motion.div>
                    ) : (
                      <div
                        key={`empty-${rowIndex}-${colIndex}`}
                        className="aspect-square opacity-0 pointer-events-none"
                      />
                    ),
                  )}
                </React.Fragment>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* WRITING MODAL OVERLAY (Dikeluarkan dari dalam hierarki Grid) */}
      <AnimatePresence>
        {selectedChar && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedChar(null)}
              className="absolute inset-0 bg-[#0a0c10]/95 backdrop-blur-xl"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className={`relative bg-[#1e2024] p-5 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border ${themeBorder} shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-y-auto custom-scrollbar`}
            >
              <button
                onClick={() => setSelectedChar(null)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-all border border-white/5 z-20"
              >
                <X size={20} />
              </button>

              <div className="relative z-10 flex flex-col h-full">
                <header className="flex items-center gap-3 mb-5 sm:mb-6 pr-10 shrink-0">
                  <div
                    className={`w-10 h-10 shrink-0 rounded-xl ${themeAccent}/10 border ${themeBorder} flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.2)]`}
                  >
                    <PenTool size={18} className={themeColor} />
                  </div>
                  <div>
                    <span
                      className={`font-mono uppercase tracking-[0.2em] text-[9px] sm:text-[10px] font-black ${themeColor} block leading-none mb-1.5`}
                    >
                      Latihan Menulis
                    </span>
                    <h2 className="text-white text-lg sm:text-xl font-black italic uppercase tracking-tighter leading-none">
                      Data Karakter
                    </h2>
                  </div>
                </header>

                <div className="bg-[#15171a] p-4 sm:p-5 rounded-2xl border border-white/5 flex justify-between items-center shadow-inner mb-6 shrink-0">
                  <div className="flex items-center gap-4">
                    <p className="text-4xl sm:text-5xl font-black text-white font-japanese leading-none translate-y-[-2px]">
                      {selectedChar.char}
                    </p>
                    <p
                      className={`font-mono uppercase tracking-[0.3em] text-xs sm:text-sm font-bold ${themeColor}`}
                    >
                      "{selectedChar.romaji}"
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${themeColor} italic shadow-inner`}
                  >
                    Sistem {type}
                  </div>
                </div>

                <div className="w-full flex-1 flex flex-col justify-center min-h-[300px] mb-2">
                  <WritingCanvas character={selectedChar.char} />
                </div>

                <p className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em] mt-4 shrink-0">
                  <Sparkles size={10} className="inline mr-1 text-cyan-400" />{" "}
                  Gunakan jari atau mouse untuk menulis
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
