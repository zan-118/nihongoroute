/**
 * @file PracticeSection.tsx
 * @description Komponen seksi latihan/ujian akhir pelajaran (PracticeSection) untuk mengarahkan pengguna ke ujian komprehensif bab tersebut.
 */

// ======================
// IMPOR
// ======================
import React from "react";
import Link from "next/link";
import { Award } from "lucide-react";

// ======================
// ANTARMUKA / TIPE DATA
// ======================
export interface PracticeLessonItem {
  slug: string;
  title: string;
}

export interface LessonPracticeData {
  title: string;
  finalPractice?: PracticeLessonItem;
}

interface PracticeSectionProps {
  lesson: LessonPracticeData;
}

// ======================
// EKSEKUSI UTAMA
// ======================
export const PracticeSection: React.FC<PracticeSectionProps> = ({ lesson }) => {
  if (!lesson.finalPractice) return null;

  return (
    <section>
      <div 
        className="p-8 md:p-14 relative overflow-hidden border border-border/80 rounded-2xl md:rounded-3xl bg-card/25 shadow-[0_0_50px_rgba(var(--primary-rgb),0.015)] glass"
        style={{ 
          backgroundImage: "linear-gradient(135deg, rgba(var(--primary-rgb),0.05), transparent, rgba(var(--secondary-rgb),0.05))"
        }}
      >
        <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
          <Award size={180} />
        </div>
        {/* Pola tradisional Seigaiha Jepang */}
        <div className="absolute inset-0 bg-seigaiha pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto">
          <div 
            className="size-16 rounded-lg flex items-center justify-center text-primary mb-6"
            style={{ backgroundColor: "rgb(var(--primary-rgb)/0.2)" }}
          >
            <Award size={32} />
          </div>
          <h3 className="text-2xl md:text-3xl uppercase tracking-tighter mb-4">
            Siap untuk Ujian Akhir?
          </h3>
          <p className="text-muted-foreground mb-8 text-sm md:text-base font-medium">
            Uji pemahaman kamu tentang materi <strong>{lesson.title}</strong> dengan simulasi ujian komprehensif.
          </p>
          <Link
            href={`/exams/${lesson.finalPractice.slug}`}
            className="w-full sm:w-auto text-center px-6 md:px-10 py-4 rounded-full bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-[0_0_30px_rgb(var(--primary-rgb)/0.3)]"
          >
            Mulai Latihan: {lesson.finalPractice.title}
          </Link>
        </div>
      </div>
    </section>
  );
};
