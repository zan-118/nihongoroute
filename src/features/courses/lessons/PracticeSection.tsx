/**
 * @file PracticeSection.tsx
 * @description Komponen seksi latihan/ujian akhir pelajaran (PracticeSection) untuk mengarahkan pengguna ke ujian komprehensif bab tersebut.
 */


// IMPOR

import React from "react";
import Link from "next/link";
import { Award } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";


// ANTARMUKA / TIPE DATA


/**
 * Practice lesson item details.
 */
export interface PracticeLessonItem {
 _id: string;
 title: string;
 slug: string;
}

export interface LessonPracticeData {
 title: string;
 finalPractice?: PracticeLessonItem;
}

/**
 * Props for PracticeSection component.
 */
interface PracticeSectionProps {
 lesson: LessonPracticeData;
}


// EKSEKUSI UTAMA


/**
 * Render practice section for lesson.
 * Direct user to final exam.
 */
export const PracticeSection: React.FC<PracticeSectionProps> = ({ lesson }) => {
 // Exit if no final practice exam exists
 if (!lesson.finalPractice) return null;

 return (
 <section>
 <div className="relative group">
 {/* Tombou Register Mark */}
 <div className="absolute -top-[6px] -right-[6px] w-[14px] h-[14px] pointer-events-none z-20">
 <div className="absolute top-0 right-0 w-[14px] h-[1px] bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
 <div className="absolute top-0 right-0 w-[1px] h-[14px] bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
 </div>

 <Card 
 className="p-8 md:p-14 relative overflow-hidden border border-border/50 dark:border-white/10 rounded-2xl bg-card shadow-sm"
 >
 {/* Decorative background icon */}
 <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
 <Award size={180} />
 </div>
 {/* Pola tradisional Seigaiha Jepang */}
 <div className="absolute inset-0 \-5 pointer-events-none" />
 <div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto">
 {/* Icon container with primary color background */}
 <div 
 className="size-16 rounded-lg flex items-center justify-center text-primary mb-6"
 style={{ backgroundColor: "hsl(var(--primary)/0.15)" }}
 >
 <Award size={32} />
 </div>
 <h3 className="text-2xl md:text-3xl uppercase tracking-tighter mb-4 font-bold">
 Siap untuk Ujian Akhir?
 </h3>
 <p className="text-muted-foreground mb-8 text-sm md:text-base font-medium">
 Uji pemahaman kamu tentang materi <strong>{lesson.title}</strong> dengan simulasi ujian komprehensif.
 </p>
 {/* Link to exam page */}
 <Link
 href={`/exams/${lesson.finalPractice.slug}`}
 className="w-full sm:w-auto text-center px-6 md:px-10 py-4 rounded-lg rounded-br-none bg-primary text-primary-foreground font-black uppercase tracking-wider text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
 >
 Mulai Uatihan: {lesson.finalPractice.title}
 </Link>
 </div>
 </Card>
 </div>
 </section>
 );
};