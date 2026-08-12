"use client";

/**
 * @file ExamResult.tsx
 * @description Komponen penayangan skor dan hasil analisis simulasi ujian (Mock Exam).
 * Mengelola kalkulasi skor (modul murni) dan sakelar tampilan antara dua view:
 * dokumen sertifikat resmi (OfficialCertificateView) dan analisis grafis modern (ModernBreakdownView).
 */

// ======================
// IMPOR
// ======================
import { m } from "framer-motion";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/useUserStore";
import { BarChart, FileText } from "@/components/ui/icons";
import { ExamData, GameState } from "./types";
import {
 buildCertificateData,
 buildRegistrationNumber,
 computeJftScores,
 computeJlptScores,
 formatTestDate,
 isJftExam,
} from "./examResultData";
import { OfficialCertificateView } from "./OfficialCertificateView";
import { ModernBreakdownView } from "./ModernBreakdownView";

// ======================
// ANTARMUKA & TIPE
// ======================

/**
 * Props for ExamResult component.
 */
interface ExamResultProps {
 /** Exam configuration and question data */
 exam: ExamData;
 /** State setter to switch between exam phases */
 setGameState: (state: GameState) => void;
 /** Redirect path when exiting the exam */
 backLink: string;
 /** Function to compute final scores and section status */
 calculateScore: () => {
  correctCount: number;
  finalScore: number;
  sectionBreakdown: Record<string, { total: number; correct: number; passed: boolean }>;
  failedSection: boolean;
  isPassed: boolean;
 };
 /** Callback to trigger sharing functionality */
 handleShareResult: () => void;
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * ExamResult component. Displays score, certificate, and performance breakdown.
 */
export function ExamResult({
 exam,
 setGameState,
 backLink,
 calculateScore,
 handleShareResult,
}: ExamResultProps) {
 const [viewMode, setViewMode] = useState<"official" | "modern">("official");

 /**
  * Memoized score calculation results.
  */
 const { correctCount, finalScore, sectionBreakdown, failedSection, isPassed } =
  useMemo(() => calculateScore(), [calculateScore]);

 /**
  * Retrieve current user name from store.
  */
 const userFullName = useUserStore((s) => s.name) || "Member NihongoRoute";

 /**
  * Generate deterministic registration number.
  */
 const regNo = useMemo(
  () => buildRegistrationNumber(userFullName, exam.title),
  [exam.title, userFullName]
 );

 /**
  * Format current date to Japanese standard format.
  */
 const testDateStr = useMemo(() => formatTestDate(), []);

 /**
  * Determine if the exam is JFT-Basic.
  */
 const isJft = useMemo(
  () => isJftExam(exam.title, exam.categorySlug, exam.levelCode),
  [exam.title, exam.categorySlug, exam.levelCode]
 );

 /**
  * JLPT-specific section scores and grades.
  */
 const jlptScores = useMemo(
  () => computeJlptScores(sectionBreakdown, exam.levelCode),
  [sectionBreakdown, exam.levelCode]
 );

 /**
  * JFT-specific scaled scores.
  */
 const jftScores = useMemo(
  () =>
   computeJftScores(
    sectionBreakdown,
    correctCount,
    exam.questions.length,
    failedSection
   ),
  [sectionBreakdown, correctCount, exam.questions.length, failedSection]
 );

 /**
  * Data payload passed to PDF generator.
  */
 const certificateData = useMemo(
  () =>
   buildCertificateData({
    userName: userFullName,
    examTitle: exam.title,
    score: isJft ? jftScores.score : finalScore,
    levelCode: exam.levelCode,
    isJft,
   }),
  [exam.title, exam.levelCode, finalScore, isJft, jftScores.score, userFullName]
 );

 const sharedViewProps = {
  exam,
  certificateData,
  backLink,
  onReview: () => setGameState("review"),
  onShare: handleShareResult,
 };

 return (
  <m.div
   initial={{ opacity: 0, y: 20 }}
   animate={{ opacity: 1, y: 0 }}
   className="w-full max-w-4xl mx-auto px-4 py-8"
  >
   {/* Sakelar Tampilan Premium */}
   <div className="flex justify-center mb-8">
    <div className="bg-muted/80 p-1.5 rounded-lg flex gap-2 border border-border shadow-lg z-20 relative">
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
      <BarChart size={14} className={viewMode === "modern" ? "text-primary" : ""} />
      Modern Breakdown
     </Button>
    </div>
   </div>

   {viewMode === "official" ? (
    <OfficialCertificateView
     {...sharedViewProps}
     userFullName={userFullName}
     regNo={regNo}
     testDateStr={testDateStr}
     isJft={isJft}
     isPassed={isPassed}
     failedSection={failedSection}
     finalScore={finalScore}
     jlptScores={jlptScores}
     jftScores={jftScores}
    />
   ) : (
    <ModernBreakdownView
     {...sharedViewProps}
     isPassed={isPassed}
     failedSection={failedSection}
     finalScore={finalScore}
     correctCount={correctCount}
     sectionBreakdown={sectionBreakdown}
    />
   )}
  </m.div>
 );
}
