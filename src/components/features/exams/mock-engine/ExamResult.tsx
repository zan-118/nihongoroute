"use client";

import { m } from "framer-motion";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/useUserStore";
import dynamic from "next/dynamic";
import { Trophy, Skull, Share2, Loader2, FileText, BarChart2, Calendar, User, Award, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ExamData, GameState } from "./types";
import { SECTION_LABELS } from "./constants";
const PdfGenerator = dynamic(() => import("@/components/features/pdf/PdfGenerator"), {
  ssr: false,
  loading: () => <Loader2 className="animate-spin text-primary" size={20} />
});

interface ExamResultProps {
  exam: ExamData;
  setGameState: (state: GameState) => void;
  backLink: string;
  calculateScore: () => {
    correctCount: number;
    finalScore: number;
    sectionBreakdown: Record<string, { total: number; correct: number; passed: boolean }>;
    failedSection: boolean;
    isPassed: boolean;
  };
  handleShareResult: () => void;
}

export function ExamResult({
  exam,
  setGameState,
  backLink,
  calculateScore,
  handleShareResult,
}: ExamResultProps) {
  // Memoize kalkulasi skor — iterasi penuh array soal, tidak perlu diulang setiap render
  const [viewMode, setViewMode] = useState<"official" | "modern">("official");

  const { correctCount, finalScore, sectionBreakdown, failedSection, isPassed } = useMemo(
    () => calculateScore(),
    [calculateScore]
  );
  const userFullName = useUserStore(s => s.name) || "Siswa NihongoRoute";

  const regNo = useMemo(() => {
    const prefix = exam.title.toLowerCase().includes("jft") ? "JFT" : "JLPT";
    // Pure deterministic hash of userFullName + exam.title to ensure pure rendering
    const str = `${userFullName}-${exam.title}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const rand = 1000 + Math.abs(hash % 9000);
    return `26-1A-${prefix}-${rand}`;
  }, [exam.title, userFullName]);

  const testDateStr = useMemo(() => {
    return new Date().toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).replace(/\//g, "/");
  }, []);

  const isJft = useMemo(() => {
    return exam.title.toLowerCase().includes("jft") || 
           exam.categorySlug?.toLowerCase().includes("jft") || 
           exam.levelCode?.toLowerCase() === "a2";
  }, [exam.title, exam.categorySlug, exam.levelCode]);

  // JLPT Section Mapping (max 60 points per section, total 180)
  const jlptScores = useMemo(() => {
    const vocab = sectionBreakdown.vocabulary || { correct: 0, total: 0, passed: true };
    const grammar = sectionBreakdown.grammar || { correct: 0, total: 0, passed: true };
    const reading = sectionBreakdown.reading || { correct: 0, total: 0, passed: true };
    const listening = sectionBreakdown.listening || { correct: 0, total: 0, passed: true };

    const langCorrect = vocab.correct + grammar.correct;
    const langTotal = vocab.total + grammar.total;

    const isN4N5 = exam.levelCode?.toLowerCase() === "n4" || exam.levelCode?.toLowerCase() === "n5";

    let scoreLang = 0;
    let scoreRead = 0;
    let scoreList = 0;

    if (isN4N5) {
      // 120 points for Lang Knowledge & Reading
      const langReadCorrect = langCorrect + reading.correct;
      const langReadTotal = langTotal + reading.total;
      scoreLang = langReadTotal > 0 ? Math.round((langReadCorrect / langReadTotal) * 120) : 0;
      scoreList = listening.total > 0 ? Math.round((listening.correct / listening.total) * 60) : 0;
    } else {
      // 60 points each
      scoreLang = langTotal > 0 ? Math.round((langCorrect / langTotal) * 60) : 0;
      scoreRead = reading.total > 0 ? Math.round((reading.correct / reading.total) * 60) : 0;
      scoreList = listening.total > 0 ? Math.round((listening.correct / listening.total) * 60) : 0;
    }

    const getGrade = (correct: number, total: number) => {
      if (total === 0) return "-";
      const rate = correct / total;
      if (rate >= 0.67) return "A";
      if (rate >= 0.34) return "B";
      return "C";
    };

    return {
      scoreLang,
      scoreRead,
      scoreList,
      isN4N5,
      vocabGrade: getGrade(vocab.correct, vocab.total),
      grammarGrade: getGrade(grammar.correct, grammar.total),
      readingGrade: getGrade(reading.correct, reading.total)
    };
  }, [sectionBreakdown, exam.levelCode]);

  // JFT scoring (ranges from 10 to 250, passing is 200)
  const jftScores = useMemo(() => {
    const vocab = sectionBreakdown.vocabulary || { correct: 0, total: 0, passed: true };
    const grammar = sectionBreakdown.grammar || { correct: 0, total: 0, passed: true };
    const reading = sectionBreakdown.reading || { correct: 0, total: 0, passed: true };
    const listening = sectionBreakdown.listening || { correct: 0, total: 0, passed: true };

    const score = correctCount === 0 ? 10 : Math.round((correctCount / Math.max(1, exam.questions.length)) * 250);
    const passed = score >= 200 && !failedSection;

    return {
      score,
      passed,
      vocabRate: vocab.total > 0 ? Math.round((vocab.correct / vocab.total) * 100) : 0,
      grammarRate: grammar.total > 0 ? Math.round((grammar.correct / grammar.total) * 100) : 0,
      listeningRate: listening.total > 0 ? Math.round((listening.correct / listening.total) * 100) : 0,
      readingRate: reading.total > 0 ? Math.round((reading.correct / reading.total) * 100) : 0,
    };
  }, [sectionBreakdown, correctCount, exam.questions.length, failedSection]);

  const certificateData = {
    userName: userFullName,
    examTitle: exam.title,
    score: isJft ? jftScores.score : finalScore,
    date: new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    level: exam.levelCode?.toUpperCase() || (isJft ? "A2" : "JLPT"),
  };
  return (
    <m.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto px-4 py-8"
    >
      {/* Premium Toggle Switch */}
      <div className="flex justify-center mb-8">
        <div className="bg-muted/80 backdrop-blur-md p-1.5 rounded-2xl flex gap-2 border border-border shadow-lg z-20 relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("official")}
            className={`rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              viewMode === "official"
                ? "bg-background text-foreground shadow-md border border-border/40"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText size={14} className={viewMode === "official" ? "text-primary" : ""} />
            Official Result Document
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("modern")}
            className={`rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              viewMode === "modern"
                ? "bg-background text-foreground shadow-md border border-border/40"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart2 size={14} className={viewMode === "modern" ? "text-primary" : ""} />
            Modern Breakdown
          </Button>
        </div>
      </div>

      {viewMode === "official" ? (
        /* Authentic Parchment Certificate Layout */
        <div className="p-1 md:p-1.5 rounded-[2.2rem] bg-gradient-to-br from-amber-500/20 via-yellow-600/10 to-amber-700/20 shadow-2xl">
          <Card className="p-6 md:p-12 text-[#2d2821] relative overflow-hidden bg-[#FAF8F5] border-4 border-double border-[#C8BFA7] rounded-[2rem] font-serif transition-all duration-500">
            {/* Subtle watermarked background logo / emblem */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center select-none">
              <svg className="size-[85%]" viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 5 L95 28 L95 72 L50 95 L5 72 L5 28 Z" />
              </svg>
            </div>

            <div className="relative z-10 space-y-6 md:space-y-8">
              {/* Header Logos & Titles */}
              <div className="text-center border-b border-[#E3DEC3] pb-6 space-y-2">
                <span className="text-[10px] font-sans tracking-[0.25em] font-black text-emerald-800 uppercase block mb-1">
                  Official Result Notice & Transcript
                </span>
                {isJft ? (
                  <>
                    <h1 className="text-xl md:text-3xl font-black tracking-wide text-stone-800 leading-tight">
                      国際交流基金日本語基礎テスト 結果通知書
                    </h1>
                    <h2 className="text-[11px] md:text-sm font-sans tracking-wider text-stone-600 font-bold uppercase">
                      THE JAPAN FOUNDATION TEST FOR BASIC JAPANESE
                    </h2>
                    <p className="text-[9px] md:text-[10px] font-sans text-stone-500 italic uppercase tracking-wider">
                      Notification of Test Results
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="text-xl md:text-3xl font-black tracking-wide text-stone-800 leading-tight">
                      日本語能力試験 合否判定書
                    </h1>
                    <h2 className="text-[11px] md:text-sm font-sans tracking-wider text-stone-600 font-bold uppercase">
                      JAPANESE-LANGUAGE PROFICIENCY TEST
                    </h2>
                    <p className="text-[9px] md:text-[10px] font-sans text-stone-500 italic uppercase tracking-wider">
                      Certificate of Result and Scores
                    </p>
                  </>
                )}
              </div>

              {/* Examinee Identification Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] md:text-[13px] font-sans border-collapse border border-[#C8BFA7] bg-[#FCFBF8]/60">
                  <tbody>
                    <tr className="border-b border-[#C8BFA7]">
                      <td className="w-1/4 p-2.5 bg-[#F3EFE3] font-semibold border-r border-[#C8BFA7] text-[#554d3d]">
                        Examinee Name <br className="hidden md:inline" />
                        <span className="text-[10px] font-normal font-serif">(受験者氏名)</span>
                      </td>
                      <td className="p-2.5 border-r border-[#C8BFA7] font-serif font-bold text-stone-800 text-left pl-4">
                        {userFullName}
                      </td>
                      <td className="w-1/4 p-2.5 bg-[#F3EFE3] font-semibold border-r border-[#C8BFA7] text-[#554d3d]">
                        Registration No. <br className="hidden md:inline" />
                        <span className="text-[10px] font-normal font-serif">(受験番号)</span>
                      </td>
                      <td className="p-2.5 font-mono font-bold text-stone-800 text-left pl-4">
                        {regNo}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 bg-[#F3EFE3] font-semibold border-r border-[#C8BFA7] text-[#554d3d]">
                        Date of Test <br className="hidden md:inline" />
                        <span className="text-[10px] font-normal font-serif">(受験年月日)</span>
                      </td>
                      <td className="p-2.5 border-r border-[#C8BFA7] font-mono text-stone-800 text-left pl-4">
                        {testDateStr}
                      </td>
                      <td className="p-2.5 bg-[#F3EFE3] font-semibold border-r border-[#C8BFA7] text-[#554d3d]">
                        Level <br className="hidden md:inline" />
                        <span className="text-[10px] font-normal font-serif">(レベル)</span>
                      </td>
                      <td className="p-2.5 font-serif font-bold text-emerald-800 text-left pl-4 uppercase">
                        {exam.levelCode || (isJft ? "A2" : "JLPT")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Score Grid & Result Section */}
              {isJft ? (
                /* JFT-Basic Authentic CBT Score Breakdown */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Scaled Score Card */}
                    <div className="border border-[#C8BFA7] bg-[#FCFBF8] p-5 flex flex-col items-center justify-center relative rounded-lg">
                      <span className="text-xs font-sans font-bold text-[#554d3d] uppercase tracking-wide">
                        Scaled Score (総合評価点)
                      </span>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className={`text-4xl md:text-5xl font-black font-mono ${isPassed ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {jftScores.score}
                        </span>
                        <span className="text-xs font-sans font-semibold text-stone-400">/ 250</span>
                      </div>
                      <span className="text-[9px] font-sans text-stone-500 mt-1">
                        Passing Standard: 200 points or above (合格基準点: 200点以上)
                      </span>
                    </div>

                    {/* Result Status Seal Card */}
                    <div className="border border-[#C8BFA7] bg-[#FCFBF8] p-5 flex flex-col items-center justify-center relative rounded-lg overflow-hidden">
                      <span className="text-xs font-sans font-bold text-[#554d3d] uppercase tracking-wide">
                        Test Result (合否結果)
                      </span>
                      <div className="mt-2 flex items-center justify-center gap-2">
                        {isPassed ? (
                          <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-2xl tracking-wider">
                            <CheckCircle2 size={24} />
                            合格 (PASS)
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-rose-700 font-extrabold text-2xl tracking-wider">
                            <AlertCircle size={24} />
                            不合格 (FAIL)
                          </div>
                        )}
                      </div>
                      {/* SVG Hanko Stamp */}
                      <div className="absolute right-2 -bottom-2 opacity-90 pointer-events-none rotate-[-15deg] select-none">
                        <svg className={`w-20 h-20 ${isPassed ? 'text-[#c23b22]' : 'text-stone-500'}`} viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="3" />
                          <circle cx="50" cy="50" r="39" fill="none" stroke="currentColor" strokeWidth="1" />
                          <text x="50" y="32" textAnchor="middle" fill="currentColor" className="font-serif text-[7px] font-bold tracking-widest">JFT-BASIC</text>
                          <text x="50" y="58" textAnchor="middle" fill="currentColor" className="font-serif text-xl font-extrabold tracking-wider">{isPassed ? "合格" : "不判定"}</text>
                          <text x="50" y="78" textAnchor="middle" fill="currentColor" className="font-serif text-[9px] font-bold tracking-widest">判定之印</text>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* CBT Areas Rate */}
                  <div className="border border-[#C8BFA7] rounded-lg overflow-hidden">
                    <div className="bg-[#F3EFE3] p-2 text-center text-xs font-bold text-[#554d3d] uppercase tracking-wider border-b border-[#C8BFA7]">
                      Section Performance Rates (セクション別正答率)
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#C8BFA7] bg-[#FCFBF8]">
                      <div className="p-3 text-center">
                        <p className="text-[10px] text-stone-500 font-semibold uppercase">Writing & Vocab</p>
                        <p className="text-lg font-bold font-mono text-stone-800 mt-1">{jftScores.vocabRate}%</p>
                      </div>
                      <div className="p-3 text-center">
                        <p className="text-[10px] text-stone-500 font-semibold uppercase">Grammar</p>
                        <p className="text-lg font-bold font-mono text-stone-800 mt-1">{jftScores.grammarRate}%</p>
                      </div>
                      <div className="p-3 text-center">
                        <p className="text-[10px] text-stone-500 font-semibold uppercase">Reading</p>
                        <p className="text-lg font-bold font-mono text-stone-800 mt-1">{jftScores.readingRate}%</p>
                      </div>
                      <div className="p-3 text-center">
                        <p className="text-[10px] text-stone-500 font-semibold uppercase">Listening</p>
                        <p className="text-lg font-bold font-mono text-stone-800 mt-1">{jftScores.listeningRate}%</p>
                      </div>
                    </div>
                  </div>

                  {/* CEFR Level Box */}
                  <div className="border border-[#C8BFA7] bg-[#FCFBF8]/40 p-4 rounded-lg text-left text-xs space-y-2">
                    <p className="font-bold text-[#554d3d] uppercase border-b border-[#E3DEC3] pb-1.5 flex items-center gap-2">
                      <Award size={14} className="text-emerald-700" />
                      CEFR A2 Qualification Standard Remarks
                    </p>
                    <p className="text-stone-700 leading-relaxed font-serif text-[11px] md:text-xs">
                      <strong>[Jap]</strong> ごく基本的な個人情報や家族情報、買い物、近所の様子、仕事など、直接的関係がある領域に関する、よく使われる文や表現を理解できる。簡単で日常的な範囲なら、馴染みがある事柄についての情報交換に応じることができる。
                    </p>
                    <p className="text-stone-500 leading-relaxed font-serif text-[10px] md:text-[11px] italic">
                      <strong>[Eng]</strong> Can understand sentences and frequently used expressions related to areas of most immediate relevance (e.g. very basic personal and family information, shopping, local geography, employment). Can communicate in simple and routine tasks requiring a simple and direct exchange of information on familiar and routine matters.
                    </p>
                  </div>
                </div>
              ) : (
                /* JLPT Authentic Score Breakdown */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Box 1: Scores Table */}
                    <div className="md:col-span-2 border border-[#C8BFA7] rounded-lg overflow-hidden bg-[#FCFBF8]">
                      <div className="bg-[#F3EFE3] p-2.5 text-center text-xs font-bold text-[#554d3d] uppercase tracking-wider border-b border-[#C8BFA7]">
                        Scores by Test Section (得点区分別得点)
                      </div>
                      
                      {jlptScores.isN4N5 ? (
                        /* N4/N5 2 Sections Breakdown */
                        <div className="grid grid-cols-2 divide-x divide-[#C8BFA7]">
                          <div className="p-4 text-center">
                            <p className="text-[10px] text-stone-500 font-semibold uppercase leading-tight">Language Knowledge & Reading</p>
                            <p className="text-[9px] text-stone-400 font-serif leading-none mt-0.5">(言語知識・読解)</p>
                            <p className="text-3xl font-bold font-mono text-stone-800 mt-2">
                              {jlptScores.scoreLang} <span className="text-sm text-stone-400 font-semibold">/ 120</span>
                            </p>
                          </div>
                          <div className="p-4 text-center">
                            <p className="text-[10px] text-stone-500 font-semibold uppercase leading-tight">Listening</p>
                            <p className="text-[9px] text-stone-400 font-serif leading-none mt-0.5">(聴解)</p>
                            <p className="text-3xl font-bold font-mono text-stone-800 mt-2">
                              {jlptScores.scoreList} <span className="text-sm text-stone-400 font-semibold">/ 60</span>
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* N1-N3 3 Sections Breakdown */
                        <div className="grid grid-cols-3 divide-x divide-[#C8BFA7]">
                          <div className="p-4 text-center">
                            <p className="text-[10px] text-stone-500 font-semibold uppercase leading-tight">Language Knowledge</p>
                            <p className="text-[9px] text-stone-400 font-serif leading-none mt-0.5">(言語知識)</p>
                            <p className="text-2xl font-bold font-mono text-stone-800 mt-2">
                              {jlptScores.scoreLang} <span className="text-xs text-stone-400 font-semibold">/ 60</span>
                            </p>
                          </div>
                          <div className="p-4 text-center">
                            <p className="text-[10px] text-stone-500 font-semibold uppercase leading-tight">Reading</p>
                            <p className="text-[9px] text-stone-400 font-serif leading-none mt-0.5">(読解)</p>
                            <p className="text-2xl font-bold font-mono text-stone-800 mt-2">
                              {jlptScores.scoreRead} <span className="text-xs text-stone-400 font-semibold">/ 60</span>
                            </p>
                          </div>
                          <div className="p-4 text-center">
                            <p className="text-[10px] text-stone-500 font-semibold uppercase leading-tight">Listening</p>
                            <p className="text-[9px] text-stone-400 font-serif leading-none mt-0.5">(聴解)</p>
                            <p className="text-2xl font-bold font-mono text-stone-800 mt-2">
                              {jlptScores.scoreList} <span className="text-xs text-stone-400 font-semibold">/ 60</span>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Box 2: Total Score & Status Stamp */}
                    <div className="border border-[#C8BFA7] bg-[#FCFBF8] p-4 flex flex-col items-center justify-center relative rounded-lg overflow-hidden">
                      <span className="text-xs font-sans font-bold text-[#554d3d] uppercase tracking-wide">
                        Total Score (総合得点)
                      </span>
                      <div className="mt-2 flex items-baseline gap-1 z-10">
                        <span className={`text-4xl md:text-5xl font-black font-mono ${isPassed ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {finalScore}
                        </span>
                        <span className="text-xs font-sans font-semibold text-stone-400">/ 180</span>
                      </div>
                      
                      <div className="mt-1.5 z-10 text-[10px] font-sans font-bold flex items-center gap-1 text-[#554d3d]">
                        Result: {isPassed ? (
                          <span className="text-emerald-700 uppercase">合格 (Passed)</span>
                        ) : (
                          <span className="text-rose-700 uppercase">不合格 (Failed)</span>
                        )}
                      </div>

                      {/* SVG Hanko Stamp */}
                      <div className="absolute right-2 -bottom-2 opacity-95 pointer-events-none rotate-[-12deg] select-none">
                        <svg className={`w-20 h-20 ${isPassed ? 'text-[#c23b22]' : 'text-stone-500'}`} viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="3" />
                          <circle cx="50" cy="50" r="39" fill="none" stroke="currentColor" strokeWidth="1" />
                          <text x="50" y="32" textAnchor="middle" fill="currentColor" className="font-serif text-[7px] font-bold tracking-widest">JLPT OFFICE</text>
                          <text x="50" y="58" textAnchor="middle" fill="currentColor" className="font-serif text-xl font-extrabold tracking-wider">{isPassed ? "合格" : "不判定"}</text>
                          <text x="50" y="78" textAnchor="middle" fill="currentColor" className="font-serif text-[9px] font-bold tracking-widest">判定之印</text>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Reference Information Table: Grades (A/B/C) */}
                  <div className="border border-[#C8BFA7] rounded-lg overflow-hidden bg-[#FCFBF8]">
                    <div className="bg-[#F3EFE3] p-2 text-center text-xs font-bold text-[#554d3d] uppercase tracking-wider border-b border-[#C8BFA7]">
                      Reference Information (参考情報)
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs font-sans text-center border-collapse">
                        <thead>
                          <tr className="border-b border-[#C8BFA7] bg-[#FCFBF8] text-[#554d3d] text-[10px] font-bold">
                            <th className="p-2.5 border-r border-[#C8BFA7] text-left pl-4">Vocabulary (文字・語彙)</th>
                            <th className="p-2.5 border-r border-[#C8BFA7]">Grammar (文法)</th>
                            <th className="p-2.5">Reading (読解)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="font-mono text-stone-800 font-bold">
                            <td className="p-3 border-r border-[#C8BFA7] text-left pl-4 font-sans">
                              Grade <span className="font-mono text-emerald-800 text-sm font-black">{jlptScores.vocabGrade}</span>
                              <span className="text-[9px] font-normal text-stone-400 block mt-0.5">(A: 67%+ | B: 34-66% | C: &lt;34%)</span>
                            </td>
                            <td className="p-3 border-r border-[#C8BFA7] font-sans">
                              Grade <span className="font-mono text-emerald-800 text-sm font-black">{jlptScores.grammarGrade}</span>
                            </td>
                            <td className="p-3 font-sans">
                              Grade <span className="font-mono text-emerald-800 text-sm font-black">{jlptScores.readingGrade}</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Warning regarding Maiten Fail */}
              {failedSection && finalScore >= exam.passingScore && (
                <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-sans font-bold flex items-center justify-center gap-2">
                  <AlertCircle size={16} className="text-rose-700" />
                  <span>Total score meets passing bar, but candidate did not satisfy sectional minimum score criteria (Maiten failed).</span>
                </div>
              )}

              {/* Official Signatures & Seal Box */}
              <div className="border-t border-[#E3DEC3] pt-6 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] md:text-[11px] text-stone-500 font-sans">
                <div className="text-left space-y-1">
                  <p className="font-bold text-stone-700">ORGANIZED BY:</p>
                  <p>The Japan Foundation (独立行政法人 国際交流基金)</p>
                  <p>Japan Educational Exchanges and Services (日本国際教育支援協会)</p>
                </div>

                {/* Download & PDF Actions */}
                <div className="flex flex-col sm:flex-row gap-3 items-center z-20">
                  <PdfGenerator 
                    type="certificate" 
                    data={certificateData} 
                    title={`Sertifikat_${exam.title}`} 
                  />
                  
                  <Button
                    onClick={handleShareResult}
                    variant="outline"
                    size="sm"
                    className="bg-transparent hover:bg-[#F3EFE3] text-stone-700 border-[#C8BFA7] font-bold text-xs h-9"
                  >
                    <Share2 size={14} className="mr-1.5 text-stone-500" /> Share Result
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Row Underneath the Official Certificate */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 pb-2">
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto px-12 h-14 bg-background/10 hover:bg-background/20 text-xs font-black uppercase tracking-widest rounded-2xl transition-all border border-white/20 text-white backdrop-blur-md"
            >
              <Link href={backLink}>Finish & Exit</Link>
            </Button>
            
            <Button
              onClick={() => setGameState("review")}
              variant="outline"
              className="w-full sm:w-auto px-12 h-14 bg-background/5 hover:bg-background/15 text-xs font-black uppercase tracking-widest rounded-2xl transition-all border border-white/10 text-white/80 backdrop-blur-md"
            >
              Review Test Questions
            </Button>
          </div>
        </div>
      ) : (
        /* Modern Cybersecurity Glassmorphism Dashboard */
        <Card className="p-8 md:p-16 text-center relative overflow-hidden neo-card rounded-[3rem] border border-border bg-card shadow-2xl transition-all duration-500">
          <div
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] blur-[150px] rounded-full pointer-events-none opacity-20 ${isPassed ? "bg-success" : "bg-destructive"}`}
          />

          <div className="relative z-10">
            <m.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className={`w-32 h-32 mx-auto neo-inset flex items-center justify-center rounded-[2.5rem] mb-10 bg-muted/50 border border-border ${isPassed ? "text-success" : "text-destructive"}`}
            >
              {isPassed ? (
                <Trophy size={64} aria-hidden="true" className="drop-shadow-[0_0_15px_rgba(var(--success-rgb),0.5)]" />
              ) : (
                <Skull size={64} aria-hidden="true" className="drop-shadow-[0_0_15px_rgba(var(--destructive-rgb),0.5)]" />
              )}
            </m.div>

            <h1 className={`text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 leading-tight ${isPassed ? "text-success" : "text-destructive"}`}>
              {isPassed ? "OMEDETOU! Keren Banget!" : "WADUH! Belum Lulus..."}
            </h1>
            <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-xs md:text-xs mb-8">
              Hasil Akhir: {exam.title}
            </p>

            {failedSection && finalScore >= exam.passingScore && (
              <div className="max-w-xl mx-auto mb-8 p-4 rounded-[1.5rem] bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 animate-pulse shadow-[0_0_15px_rgba(var(--destructive-rgb),0.1)]">
                <span className="text-base">⚠️</span>
                <span>Skor Total Mencukupi, tetapi Gagal Batas Nilai Kategori (Maiten)</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="neo-inset p-8 flex flex-col items-center justify-center border border-border bg-muted/10">
                <span className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">Skor Akhir</span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl md:text-7xl font-black font-mono ${isPassed ? 'text-success' : 'text-destructive'}`}>{finalScore}</span>
                  <span className="text-xl font-bold text-muted-foreground/40">/180</span>
                </div>
              </Card>

              <Card className="neo-inset p-8 flex flex-col items-center justify-center border border-border bg-muted/10">
                <span className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">Akurasi</span>
                <span className="text-5xl md:text-7xl font-black font-mono text-foreground">
                  {Math.round((correctCount / (exam.questions?.length || 1)) * 100)}%
                </span>
              </Card>

              <Card className="neo-inset p-8 flex flex-col items-center justify-center border border-border bg-muted/10">
                <span className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">Benar</span>
                <div className="flex items-baseline gap-2">
                   <span className="text-5xl md:text-7xl font-black font-mono text-foreground">{correctCount}</span>
                   <span className="text-xl font-bold text-muted-foreground/40">/{exam.questions?.length || 0}</span>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
               {/* Breakdown Section */}
               <div className="space-y-6 text-left">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground mb-6 flex items-center gap-3">
                     <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),1)]" />
                     Performa Materi
                  </h3>
                  <div className="space-y-8 bg-muted/20 p-8 rounded-3xl border border-border neo-inset">
                    {Object.entries(sectionBreakdown).map(([sectionKey, data]) => {
                      if (data.total === 0) return null;
                      const percentage = Math.round((data.correct / data.total) * 100);
                      const isSecPassed = data.passed;
                      const color = isSecPassed ? (percentage >= 70 ? "bg-success" : "bg-warning") : "bg-destructive";
                      
                      return (
                        <div key={sectionKey} className="space-y-3">
                          <div className="flex justify-between items-end">
                             <span className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                               {SECTION_LABELS[sectionKey as keyof typeof SECTION_LABELS] || sectionKey}
                               {!isSecPassed && (
                                 <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-destructive/20 text-destructive border border-destructive/20 animate-pulse leading-none">
                                   Maiten
                                 </span>
                               )}
                             </span>
                             <span className="text-xs font-mono font-black text-foreground">
                               {data.correct}/{data.total} ({percentage}%)
                             </span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                             <m.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${percentage}%` }}
                               className={`h-full ${color} shadow-[0_0_10px_rgba(var(--background-rgb),0.1)]`}
                             />
                          </div>
                        </div>
                      );
                    })}
                  </div>
               </div>

               {/* Certificate/Action Section */}
               <div className="space-y-6 text-left">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground mb-6 flex items-center gap-3">
                     <div className="w-1.5 h-6 bg-warning rounded-full shadow-[0_0_10px_rgba(var(--warning-rgb),1)]" />
                     Aksi & Sertifikasi
                  </h3>
                  
                  {isPassed ? (
                    <div className="bg-[rgba(var(--warning-rgb),0.1)] border border-warning/30 rounded-[2.5rem] p-8 relative group overflow-hidden">
                      <div className="absolute -top-10 -right-10 size-40 bg-[rgba(var(--warning-rgb),0.1)] blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700" />
                      <Trophy aria-hidden="true" className="text-warning mb-6 group-hover:scale-110 transition-transform" size={40} />
                      <h4 className="text-lg font-black uppercase tracking-tight text-warning mb-2">Klaim Sertifikat Anda</h4>
                      <p className="text-xs font-medium text-muted-foreground mb-8 leading-relaxed">
                        Selamat! Anda telah menguasai materi ini dengan baik. Unduh sertifikat digital Anda sekarang.
                      </p>
                      <div className="flex flex-col gap-3">
                         <PdfGenerator 
                           type="certificate" 
                           data={certificateData} 
                           title={`Sertifikat_${exam.title}`} 
                         />
                         <Button
                           onClick={() => {
                             handleShareResult();
                           }}
                           variant="ghost"
                           className="w-full h-12 bg-[rgba(var(--background-rgb),0.05)] border border-border text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[rgba(var(--background-rgb),0.1)] transition-all flex items-center justify-center gap-2"
                         >
                           <Share2 size={16} aria-hidden="true" /> Bagikan Pencapaian
                         </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[rgba(var(--muted-rgb),0.3)] border border-border rounded-[2.5rem] p-8 opacity-80 h-full flex flex-col justify-center">
                      <Skull aria-hidden="true" className="text-muted-foreground/30 mb-6" size={40} />
                      <h4 className="text-lg font-black uppercase tracking-tight text-muted-foreground mb-2">Terus Berlatih!</h4>
                      <p className="text-xs font-medium text-muted-foreground mb-8 leading-relaxed">
                        Dibutuhkan lebih banyak latihan untuk mencapai skor kelulusan. Pelajari kembali materi yang salah.
                      </p>
                      <Button
                        onClick={() => setGameState("review")}
                        variant="ghost"
                        className="w-full h-12 bg-[rgba(var(--primary-rgb),0.1)] border border-primary/30 text-primary text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[rgba(var(--primary-rgb),0.2)] transition-all"
                      >
                        Periksa Jawaban Salah
                      </Button>
                    </div>
                  )}
               </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-border pt-12">
               <Button
                  asChild
                  variant="ghost"
                  className="w-full sm:w-auto px-12 h-14 bg-muted hover:bg-foreground hover:text-background text-xs font-black uppercase tracking-widest rounded-2xl transition-all"
               >
                 <Link href={backLink}>Selesai & Keluar</Link>
               </Button>
               
               {isPassed && (
                 <Button
                    onClick={() => setGameState("review")}
                    variant="ghost"
                    className="w-full sm:w-auto px-12 h-14 border border-border hover:bg-muted text-xs font-black uppercase tracking-widest rounded-2xl transition-all"
                 >
                   Tinjau Ujian
                 </Button>
               )}
            </div>
          </div>
        </Card>
      )}
    </m.div>
  );
}
