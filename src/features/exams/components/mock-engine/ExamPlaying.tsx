"use client";

/**
 * @file ExamPlaying.tsx
 * @description Komponen antarmuka utama saat pengguna sedang mengerjakan simulasi ujian (Mock Exam).
 * Menggunakan ExamSessionContext seam untuk menghubungkan ExamHeader, ExamQuestionPane, ExamSidebar, dan ExamModals.
 */

import React from "react";
import { useExamSession } from "./ExamSessionContext";
import { ExamHeader } from "./sub/ExamHeader";
import { ExamQuestionPane } from "./sub/ExamQuestionPane";
import { ExamSidebar } from "./sub/ExamSidebar";
import { ExamModals } from "./sub/ExamModals";

/**
 * Main CBT exam layout component.
 */
export function ExamPlaying() {
 const { activeQuestion, audioRef } = useExamSession();

 if (!activeQuestion) return null;

 return (
 <div className="fixed inset-0 z-100 bg-background text-foreground overflow-y-auto pb-32 font-sans selection:bg-destructive/30">
 <audio aria-label="Audio" ref={audioRef} className="hidden" />

 <div className="max-w-7xl mx-auto px-4 md:px-6">
 {/* Sticky Header Navigasi Seksi & Timer */}
 <ExamHeader />

 {/* Tata Letak Utama Grid (Soal & Sidebar) */}
 <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start my-6">
 <ExamQuestionPane />
 <ExamSidebar />
 </div>
 </div>

 {/* Modal Konfirmasi Pindah Seksi / Selesai Ujian */}
 <ExamModals />
 </div>
 );
}

export default ExamPlaying;