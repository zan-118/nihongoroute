/**
 * @file app/(main)/courses/basics/page.tsx
 * @description Halaman fondasi aksara bahasa Jepang (Matriks Kana) yang memuat tabel Hiragana & Katakana lengkap.
 * @module Client Component
 */

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenTool, ChevronLeft, LayoutGrid, Sparkles, Swords, Heart, Trophy } from "lucide-react";
import Link from "next/link";
import WritingCanvas from "@/components/WritingCanvas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/* ====================================================
    DATA KANA LENGKAP (Statis)
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

  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizLives, setQuizLives] = useState(3);
  const [quizChar, setQuizChar] = useState<{ char: string; romaji: string } | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizInput, setQuizInput] = useState("");
  const [quizFeedback, setQuizFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const getAllKanaForType = (currentType: KanaType) => {
    const pairs: { char: string; romaji: string }[] = [];
    const categories: KanaCategory[] = ["seion", "dakuon", "yoon"];
    categories.forEach((cat) => {
      const data = kanaData[cat];
      data[currentType].forEach((row, rowIndex) => {
        row.forEach((char, colIndex) => {
          if (char !== "") {
            pairs.push({
              char,
              romaji: data.romaji[rowIndex][colIndex],
            });
          }
        });
      });
    });
    return pairs;
  };

  const nextQuizQuestion = (currentType: KanaType = type) => {
    const pairs = getAllKanaForType(currentType);
    const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
    
    const options = new Set<string>();
    options.add(randomPair.romaji);
    while (options.size < 4 && options.size < pairs.length) {
      const randomWrong = pairs[Math.floor(Math.random() * pairs.length)].romaji;
      options.add(randomWrong);
    }
    
    const shuffledOptions = Array.from(options).sort(() => Math.random() - 0.5);
    
    setQuizChar(randomPair);
    setQuizOptions(shuffledOptions);
    setQuizInput("");
    setQuizFeedback(null);
  };

  const startQuiz = () => {
    setQuizScore(0);
    setQuizLives(3);
    setGameOver(false);
    setIsQuizActive(true);
    nextQuizQuestion(type);
  };

  const handleOptionClick = (option: string) => {
    if (gameOver || !quizChar || quizFeedback) return;
    setQuizInput(option);

    if (option.toLowerCase() === quizChar.romaji.toLowerCase()) {
      setQuizFeedback("correct");
      setQuizScore((s) => s + 1);
      setTimeout(() => {
        nextQuizQuestion();
      }, 500);
    } else {
      setQuizFeedback("incorrect");
      setQuizLives((l) => l - 1);
      if (quizLives - 1 <= 0) {
        setGameOver(true);
      } else {
        setTimeout(() => {
          setQuizFeedback(null);
        }, 500);
      }
    }
  };

  const currentData = kanaData[category];
  const isHira = type === "hiragana";

  const themeColor = isHira ? "text-cyan-600 dark:text-cyan-400" : "text-purple-600 dark:text-purple-400";
  const themeBorder = isHira ? "border-cyan-500/30" : "border-purple-500/30";
  const themeBgHover = isHira ? "hover:bg-cyan-500/10" : "hover:bg-purple-500/10";
  const themeAccent = isHira ? "bg-cyan-500" : "bg-purple-500";

  return (
    <div className="w-full flex-1 relative overflow-hidden flex flex-col bg-background transition-colors duration-300 pt-12 pb-24 px-4 md:px-8">
      <div className="neural-grid" />

      <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col h-full">
        <header className="mb-8">
          <nav className="mb-4">
            <Button
              variant="outline"
              asChild
              className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-muted border-border"
            >
              <Link href="/courses">
                <ChevronLeft size={14} className="mr-2" /> Kembali ke Pusat
              </Link>
            </Button>
          </nav>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight">
                Huruf <span className={themeColor}>Dasar</span>
              </h1>
              <p className="text-muted-foreground text-xs mt-2 max-w-md font-medium leading-relaxed">
                Kunci utama untuk bisa membaca teks Jepang. Kuasai Hiragana & 
                Katakana di sini sebelum mulai belajar kalimat dan tata bahasa.
              </p>
            </div>
            <div
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted border border-border text-[9px] font-bold uppercase tracking-widest ${themeColor}`}
            >
              <LayoutGrid size={12} /> Tampilan Penuh
            </div>
          </div>
        </header>

        <div className="mb-8 space-y-6">
          <div className="bg-muted p-1.5 rounded-2xl border border-border flex gap-2 shadow-inner relative max-w-sm">
            <Button
              variant={isHira ? "default" : "ghost"}
              onClick={() => setType("hiragana")}
              className={`relative z-10 flex-1 py-6 rounded-xl font-bold uppercase tracking-widest text-[10px] md:text-xs transition-all duration-500 h-10 ${isHira ? "bg-cyan-500 text-black hover:bg-cyan-600 shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
            >
              Hiragana
            </Button>
            <Button
              variant={!isHira ? "default" : "ghost"}
              onClick={() => setType("katakana")}
              className={`relative z-10 flex-1 py-6 rounded-xl font-bold uppercase tracking-widest text-[10px] md:text-xs transition-all duration-500 h-10 ${!isHira ? "bg-purple-500 text-black hover:bg-purple-600 shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
            >
              Katakana
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2 md:gap-3">
              {[
                { id: "seion", label: "Huruf Utama" },
                { id: "dakuon", label: "Bunyi Turunan" },
                { id: "yoon", label: "Bunyi Gabungan" },
              ].map((cat) => (
                <Button
                  key={cat.id}
                  variant={category === cat.id ? "default" : "outline"}
                  onClick={() => setCategory(cat.id as KanaCategory)}
                  className={`px-5 py-2.5 h-auto rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                    category === cat.id
                      ? `bg-muted ${themeColor} ${themeBorder} border-opacity-50`
                      : "bg-transparent text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </Button>
              ))}
            </div>

            <Button 
              onClick={startQuiz}
              className={`px-6 py-3 h-auto rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all duration-300 ${themeAccent} text-black shadow-lg hover:opacity-90 border-none`}
            >
              <Swords size={16} className="mr-2" /> Latihan
            </Button>
          </div>
        </div>

        <Card className="p-6 md:p-8 rounded-2xl border border-border bg-card shadow-2xl relative flex-1 min-h-[450px] overflow-hidden">
          <div
            className={`relative z-10 grid gap-3 md:gap-4 mx-auto ${category === "yoon" ? "grid-cols-3 max-w-lg" : "grid-cols-5 max-w-2xl"}`}
          >
            <AnimatePresence mode="wait">
              {currentData[type].map((row, rowIndex) => (
                <React.Fragment key={`${category}-${type}-${rowIndex}`}>
                  {row.map((char, colIndex) =>
                    char !== "" ? (
                        <div
                          key={`${category}-${type}-${rowIndex}-${colIndex}`}
                          onClick={() =>
                            setSelectedChar({
                              char,
                              romaji: currentData.romaji[rowIndex][colIndex],
                            })
                          }
                          className={`relative aspect-square bg-muted/30 border border-border rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${themeBgHover} hover:border-current group active:scale-95 shadow-sm`}
                        >
                          <span className="text-3xl md:text-4xl font-black text-foreground group-hover:scale-105 transition-transform font-japanese drop-shadow-sm">
                            {char}
                          </span>
                          <span className="text-[9px] md:text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-widest mt-2 group-hover:text-foreground transition-colors">
                            {currentData.romaji[rowIndex][colIndex]}
                          </span>
                        </div>
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
        </Card>
      </div>

      <Dialog
        open={!!selectedChar}
        onOpenChange={(open) => !open && setSelectedChar(null)}
      >
        <DialogContent className="max-w-md p-0 border-none bg-transparent shadow-none">
          <AnimatePresence>
            {selectedChar && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className={`relative bg-card p-6 md:p-8 rounded-2xl border ${themeBorder} shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-y-auto custom-scrollbar`}
              >
                <div className="relative z-10 flex flex-col h-full">
                  <header className="flex items-center gap-3 mb-5 sm:mb-6 pr-10 shrink-0">
                    <div
                      className={`w-10 h-10 shrink-0 rounded-xl ${isHira ? "bg-cyan-500/10" : "bg-purple-500/10"} border ${themeBorder} flex items-center justify-center shadow-sm`}
                    >
                      <PenTool size={18} className={themeColor} />
                    </div>
                    <DialogHeader className="p-0">
                      <span
                        className={`font-mono uppercase tracking-[0.2em] text-[9px] sm:text-[10px] font-black ${themeColor} block leading-none mb-1.5 text-left`}
                      >
                        Latihan Menulis
                      </span>
                      <DialogTitle className="text-foreground text-lg sm:text-xl font-black uppercase tracking-tight leading-none text-left">
                        Cara Menulis
                      </DialogTitle>
                    </DialogHeader>
                  </header>

                  <div className="bg-muted p-4 sm:p-5 rounded-xl border border-border flex justify-between items-center mb-6 shrink-0">
                    <div className="flex items-center gap-4">
                      <p className="text-4xl sm:text-5xl font-black text-foreground font-japanese leading-none">
                        {selectedChar!.char}
                      </p>
                      <p
                        className={`font-mono uppercase tracking-widest text-xs sm:text-sm font-bold ${themeColor}`}
                      >
                        &quot;{selectedChar!.romaji}&quot;
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-lg bg-background border border-border text-[8px] sm:text-[9px] font-bold uppercase tracking-widest ${themeColor}`}
                    >
                      Sistem {type}
                    </div>
                  </div>

                  <div className="w-full flex-1 flex flex-col justify-center min-h-[300px] mb-2 bg-background rounded-xl border border-border overflow-hidden">
                    <WritingCanvas 
                      character={selectedChar!.char} 
                      strokeColor={isHira ? "#06b6d4" : "#a855f7"}
                      guideColor={isHira ? "#06b6d4" : "#a855f7"}
                    />
                  </div>

                  <p className="text-center text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-4 shrink-0">
                    <Sparkles size={10} className="inline mr-1 text-primary" />{" "}
                    Yuk, coba tulis huruf ini di kanvas!
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isQuizActive}
        onOpenChange={(open) => {
          setIsQuizActive(open);
          if (!open) setGameOver(false);
        }}
      >
        <DialogContent className="max-w-md p-0 border-none bg-transparent shadow-none">
          <DialogTitle className="sr-only">Latihan Kana</DialogTitle>
          <DialogDescription className="sr-only">Latihan membaca huruf kana.</DialogDescription>
          <AnimatePresence>
            {isQuizActive && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 40 }}
                className={`relative bg-card p-6 sm:p-8 rounded-2xl border ${themeBorder} shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col`}
              >
                <div className="relative z-10 flex flex-col h-full">
                  <header className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-500 font-black text-sm`}>
                        <Heart size={16} className={quizLives > 0 ? "fill-current" : ""} />
                        {quizLives}
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-500 font-black text-sm`}>
                        <Trophy size={16} className="fill-current" />
                        {quizScore}
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg bg-muted border border-border text-[9px] font-bold uppercase tracking-widest ${themeColor}`}>
                      {isHira ? "Hiragana" : "Katakana"} Quiz
                    </div>
                  </header>

                  {!gameOver ? (
                    <div className="flex flex-col items-center">
                      <div className={`w-full aspect-video bg-background rounded-2xl border ${quizFeedback === 'correct' ? 'border-emerald-500 shadow-lg' : quizFeedback === 'incorrect' ? 'border-destructive shadow-lg' : 'border-border shadow-inner'} flex items-center justify-center mb-8 transition-all duration-300`}>
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={quizChar?.char}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="text-7xl sm:text-9xl font-black text-foreground font-japanese"
                          >
                            {quizChar?.char}
                          </motion.span>
                        </AnimatePresence>
                      </div>

                      <div className="grid grid-cols-2 gap-3 w-full">
                        {quizOptions.map((option, i) => {
                          const isCorrect = option === quizChar?.romaji;
                          const isClicked = option === quizInput;
                          let btnClass = "bg-muted border-border text-muted-foreground hover:bg-background hover:text-foreground";
                          
                          if (quizFeedback) {
                            if (isCorrect) {
                              btnClass = "bg-emerald-500 border-emerald-500 text-white shadow-lg";
                            } else if (isClicked && !isCorrect) {
                              btnClass = "bg-destructive border-destructive text-white shadow-lg";
                            } else {
                              btnClass = "bg-muted/50 border-border text-muted-foreground/20 opacity-50";
                            }
                          } else {
                            btnClass = `bg-muted border-border text-muted-foreground hover:border-current focus-visible:ring-1 focus-visible:ring-current hover:${themeColor}`;
                          }

                          return (
                            <Button
                              key={i}
                              type="button"
                              onClick={() => handleOptionClick(option)}
                              disabled={!!quizFeedback}
                              variant="outline"
                              className={`h-14 rounded-xl text-lg font-black uppercase tracking-widest transition-all duration-300 ${btnClass}`}
                            >
                              {option}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <Card className="bg-muted/20 p-8 md:p-10 rounded-2xl border border-border text-center w-full relative overflow-hidden shadow-2xl">
                      <div className="w-16 h-16 bg-destructive/10 rounded-xl flex items-center justify-center mx-auto mb-6 border border-destructive/20">
                        <Heart size={32} className="text-destructive" />
                      </div>
                      <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-2">Game Over!</h2>
                      <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-6">Skor akhir kamu:</p>
                      <div className="text-6xl font-black text-amber-500 mb-8 drop-shadow-md">
                        {quizScore}
                      </div>
                      <Button
                        onClick={() => startQuiz()}
                        className={`w-full h-auto py-4 rounded-xl font-black uppercase tracking-widest ${themeAccent} text-black text-[10px] transition-all shadow-lg border-none`}
                      >
                        Main Lagi
                      </Button>
                    </Card>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}
