"use client";

/**
 * @file ExamReview.tsx
 * @description Orkestrator tipis untuk review jawaban setelah mock exam selesai.
 * State bersama (analysis, filter) hidup di sini; panel dipecah ke folder review/.
 */

import { useMemo, useState } from "react";
import { Check } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { analyzeExamReview } from "@/lib/learning/exam-review-analysis";
import { ExamData, GameState } from "./types";
import { ReviewHeader } from "./review/ReviewHeader";
import { ReviewAnalysisSection } from "./review/ReviewAnalysisSection";
import { ReviewFilterBar } from "./review/ReviewFilterBar";
import { ReviewQuestionCard } from "./review/ReviewQuestionCard";
import type { ReviewFilter } from "./review/review-utils";

/**
 * ExamReview component props.
 */
interface ExamReviewProps {
 /** Exam data. */
 exam: ExamData;
 /** User answers. Key is question ID, value is choice index. */
 answers: Record<string, number>;
 /** Callback to update game state. */
 setGameState: (state: GameState) => void;
}

/**
 * Exam review screen. Show stats, recommendations, and question list.
 */
export function ExamReview({ exam, answers, setGameState }: ExamReviewProps) {
 const { resolvedTheme } = useTheme();

 // Analyze exam results. Cache for performance.
 const analysis = useMemo(() => analyzeExamReview(exam, answers), [exam, answers]);
 const [filter, setFilter] = useState<ReviewFilter>("mistakes");

 // Fallback to all if no mistakes exist.
 const effectiveFilter = analysis.mistakes.length === 0 ? "all" : filter;
 const visibleInsights =
   effectiveFilter === "mistakes" ? analysis.mistakes : analysis.insights;

 const handleBack = () => {
   setGameState("result");
   window.scrollTo({ top: 0, behavior: "smooth" });
 };

 return (
   <div className="w-full max-w-5xl mx-auto pb-20 transition-colors duration-300">
     <ReviewHeader onBack={handleBack} />

     <ReviewAnalysisSection analysis={analysis} />

     <ReviewFilterBar
       effectiveFilter={effectiveFilter}
       mistakeCount={analysis.mistakes.length}
       totalCount={analysis.totalQuestions}
       onFilterChange={setFilter}
     />

     <div className="flex flex-col gap-10 md:gap-16">
       {visibleInsights.length === 0 ? (
         <EmptyReviewState />
       ) : (
         visibleInsights.map((insight) => (
           <ReviewQuestionCard
             key={insight.question._key}
             insight={insight}
             resolvedTheme={resolvedTheme}
           />
         ))
       )}
     </div>
   </div>
 );
}

/**
 * State kosong: tidak ada soal untuk filter aktif.
 */
function EmptyReviewState() {
 return (
   <Card className="p-8 text-center rounded-2xl md:rounded-3xl border border-border bg-card">
     <Check
       size={44}
       aria-hidden="true"
       className="mx-auto mb-4 text-success"
     />
     <p className="text-sm font-black uppercase tracking-widest text-foreground">
       Tidak ada soal untuk filter ini.
     </p>
   </Card>
 );
}

