"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PenTool, ChevronLeft, LayoutGrid } from "lucide-react";
import Link from "next/link";

/* ====================================================
   DATA KANA LENGKAP (Seion, Dakuon/Handakuon, Yoon)
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
      ["パ", "ピ", "プ", "ペ", "ポ"],
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

  const getStrokeImageUrl = (char: string) => {
    // KanjiVG biasanya hanya mendukung karakter tunggal.
    // Jika campuran (yoon), kita ambil karakter pertamanya saja untuk animasinya.
    const baseChar = char.charAt(0);
    const code = baseChar.charCodeAt(0).toString(16).padStart(5, "0");
    return `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${code}.svg`;
  };

  return (
    <div className="min-h-screen bg-[#15171a] pt-20 pb-24 px-4 md:px-8 relative overflow-hidden flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col h-full">
        {/* HEADER COMPACT */}
        <header className="mb-6">
          <nav className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3">
            <Link
              href="/courses"
              className="flex items-center gap-2 text-white/40 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
            >
              <ChevronLeft size={14} /> Back to Hub
            </Link>
          </nav>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter drop-shadow-lg">
                Kana <span className={themeColor}>Matrix</span>
              </h1>
            </div>
            <div
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1e2024] border border-white/5 text-[9px] font-black uppercase tracking-[0.2em] ${themeColor}`}
            >
              <LayoutGrid size={12} /> Compact View
            </div>
          </div>
        </header>

        {/* TACTILE CONTROLS (TABS) */}
        <div className="mb-8 space-y-4">
          {/* Level 1: Hiragana / Katakana */}
          <div className="bg-[#1e2024] p-1.5 rounded-2xl border border-white/5 flex gap-2 shadow-inner relative max-w-sm mx-auto md:mx-0">
            <button
              onClick={() => setType("hiragana")}
              className={`relative z-10 flex-1 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all duration-500 ${
                isHira ? "text-[#15171a]" : "text-white/40 hover:text-white"
              }`}
            >
              Hiragana
            </button>
            <button
              onClick={() => setType("katakana")}
              className={`relative z-10 flex-1 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all duration-500 ${
                !isHira ? "text-[#15171a]" : "text-white/40 hover:text-white"
              }`}
            >
              Katakana
            </button>
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] rounded-xl ${
                isHira ? "bg-[#0ef] left-1.5" : "bg-purple-500 right-1.5"
              } shadow-[0_0_10px_currentColor] opacity-90`}
            />
          </div>

          {/* Level 2: Seion / Dakuon / Yoon */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {[
              { id: "seion", label: "Dasar" },
              { id: "dakuon", label: "Tenten / Maru" },
              { id: "yoon", label: "Campuran (Yoon)" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id as KanaCategory)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  category === cat.id
                    ? `bg-[#1e2024] ${themeColor} ${themeBorder} shadow-[0_0_10px_currentColor]`
                    : "bg-transparent text-white/30 border-transparent hover:bg-white/5 hover:text-white/60"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* RESPONSIVE DATA GRID */}
        <div className="bg-[#1e2024] p-4 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-white/5 shadow-[10px_10px_30px_rgba(0,0,0,0.5)] relative flex-1">
          {/* Background Watermark */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10rem] md:text-[15rem] font-black italic opacity-[0.02] pointer-events-none select-none transition-colors duration-700 ${themeColor}`}
          >
            {isHira ? "あ" : "ア"}
          </div>

          {/* Grid Setup: 5 Columns untuk Seion/Dakuon, 3 Columns untuk Yoon */}
          <div
            className={`relative z-10 grid gap-2 md:gap-4 mx-auto ${
              category === "yoon"
                ? "grid-cols-3 max-w-lg"
                : "grid-cols-5 max-w-2xl"
            }`}
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
                        transition={{
                          delay: rowIndex * 0.03 + colIndex * 0.01,
                        }}
                        onClick={() =>
                          setSelectedChar({
                            char,
                            romaji: currentData.romaji[rowIndex][colIndex],
                          })
                        }
                        className={`relative aspect-square bg-[#15171a] border border-white/5 rounded-xl md:rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${themeBgHover} hover:border-current group shadow-inner active:scale-90`}
                      >
                        <span
                          className={`text-2xl md:text-4xl font-black text-white group-hover:${themeColor} transition-colors font-japanese`}
                        >
                          {char}
                        </span>
                        <span className="text-[8px] md:text-[10px] font-mono font-bold text-white/30 uppercase tracking-widest mt-1 md:mt-2 group-hover:text-white/80 transition-colors">
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

        {/* COMPACT STROKE ORDER MODAL */}
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
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className={`relative bg-[#1e2024] p-6 md:p-8 rounded-[2.5rem] border ${themeBorder} shadow-[0_0_30px_rgba(0,0,0,0.5)] max-w-xs w-full text-center overflow-hidden`}
              >
                <button
                  onClick={() => setSelectedChar(null)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/5 z-20"
                >
                  <X size={16} />
                </button>

                <div className="relative z-10">
                  <header className="flex items-center justify-center gap-2 mb-6">
                    <PenTool size={14} className={themeColor} />
                    <span
                      className={`font-mono uppercase tracking-[0.2em] text-[9px] font-black ${themeColor}`}
                    >
                      Character Data
                    </span>
                  </header>

                  {/* Area Gambar / Teks Fallback */}
                  <div className="bg-white rounded-3xl p-6 mb-6 shadow-inner flex items-center justify-center aspect-square relative border-[4px] border-white/10 group overflow-hidden">
                    <img
                      src={getStrokeImageUrl(selectedChar.char)}
                      alt={selectedChar.char}
                      className="w-full h-full object-contain grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                      onError={(e) => {
                        // Jika gambar stroke order tidak ada (misal huruf campuran), tampilkan teks aslinya
                        e.currentTarget.style.display = "none";
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `<span class="text-7xl font-japanese font-black text-[#15171a]">${selectedChar.char}</span>`;
                        }
                      }}
                    />
                  </div>

                  <div className="bg-[#15171a] p-4 md:p-5 rounded-2xl border border-white/5 flex justify-between items-center shadow-inner">
                    <div className="text-left">
                      <p className="text-3xl md:text-4xl font-black text-white leading-none">
                        {selectedChar.char}
                      </p>
                      <p
                        className={`font-mono uppercase tracking-[0.3em] text-[10px] font-bold mt-2 ${themeColor}`}
                      >
                        "{selectedChar.romaji}"
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest ${themeColor}`}
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
