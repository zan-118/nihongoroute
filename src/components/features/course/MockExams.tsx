/**
 * @file MockExams.tsx
 * @description Komponen daftar simulasi ujian CBT JLPT (MockExams) untuk kategori belajar. Menampilkan kartu ujian premium lengkap dengan waktu pengerjaan dan skor kelulusan.
 */

"use client";

// ======================
// IMPOR
// ======================
import React, { useState } from "react";
import Link from "next/link";
import { m, Variants } from "framer-motion";
import { Flame, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

// ======================
// ANTARMUKA / TIPE DATA
// ======================
interface MockExam {
  id: string;
  title: string;
  timeLimit: number;
  passingScore: number;
}

interface MockExamsProps {
  exams: MockExam[];
  itemVariants: Variants;
}

// ======================
// KOMPONEN PEMBANTU KARTU — Compact
// ======================
const ExamCard = React.memo(function ExamCard({ exam }: { exam: MockExam }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl transition-all duration-200 flex flex-col gap-4 sm:gap-6 h-full relative overflow-hidden glass"
      style={{
        borderColor: isHovered ? "rgb(var(--primary-rgb)/0.4)" : "rgb(var(--border-rgb)/0.4)",
        boxShadow: isHovered ? "0 10px 28px rgb(var(--primary-rgb)/0.08), 0 0 12px rgb(var(--primary-rgb)/0.04)" : "none"
      }}
    >
      {/* Premium Glow Overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-200 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgb(var(--primary-rgb)/0.04) 0%, transparent 100%)",
          opacity: isHovered ? 1 : 0
        }}
      />

      <div
        className="absolute top-0 right-0 p-6 sm:p-8 pointer-events-none text-foreground transition-all duration-200"
        style={{
          opacity: isHovered ? 0.06 : 0.02,
          transform: isHovered ? 'scale(1.1) rotate(6deg)' : 'scale(1)'
        }}
      >
        <Flame size={80} className="sm:hidden" />
        <Flame size={100} className="hidden sm:block" />
      </div>

      <div className="relative z-10 space-y-3">
        <h4
          className="text-xl sm:text-2xl md:text-3xl font-black transition-colors tracking-tighter uppercase leading-none"
          style={{
            color: isHovered ? "hsl(var(--primary))" : "hsl(var(--foreground))"
          }}
        >
          {exam.title}
        </h4>
        <div className="flex flex-wrap gap-2">
          <span
            className="px-2.5 py-1 rounded-md sm:rounded-lg border text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest transition-colors duration-300"
            style={{
              backgroundColor: isHovered ? "rgb(var(--primary-rgb)/0.06)" : "rgb(var(--background-rgb)/0.5)",
              borderColor: isHovered ? "rgb(var(--primary-rgb)/0.3)" : "rgb(var(--border-rgb)/0.5)",
              color: isHovered ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"
            }}
          >
            ⏱️ {exam.timeLimit} Mins
          </span>
          <span
            className="px-2.5 py-1 rounded-md sm:rounded-lg border text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest transition-colors duration-300"
            style={{
              backgroundColor: isHovered ? "rgb(var(--primary-rgb)/0.06)" : "rgb(var(--background-rgb)/0.5)",
              borderColor: isHovered ? "rgb(var(--primary-rgb)/0.3)" : "rgb(var(--border-rgb)/0.5)",
              color: isHovered ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"
            }}
          >
            🎯 {exam.passingScore}% Pass
          </span>
        </div>
      </div>

      <div className="mt-auto relative z-10 flex items-center justify-between pt-4 sm:pt-6 border-t border-border">
        <span
          className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-colors"
          style={{
            color: isHovered ? "hsl(var(--primary))" : "rgb(var(--primary-rgb)/0.6)"
          }}
        >
          Challenge Start
        </span>
        <div
          className="size-8 sm:size-9 rounded-lg text-primary-foreground flex items-center justify-center shadow-md transition-all duration-200"
          style={{
            backgroundColor: "hsl(var(--primary))",
            boxShadow: isHovered ? "0 6px 18px rgb(var(--primary-rgb)/0.25)" : "none",
            transform: isHovered ? "translateX(4px)" : "none"
          }}
        >
          <ChevronRight size={16} />
        </div>
      </div>
    </Card>
  );
});

// ======================
// EKSEKUSI UTAMA
// ======================
export function MockExams({ exams, itemVariants }: MockExamsProps) {
  if (!exams || exams.length === 0) return null;

  return (
    <m.section variants={itemVariants} className="mb-10 md:mb-16">
      <div className="flex items-center gap-4 mb-5 md:mb-8">
        <div className="space-y-0.5">
          <h3 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-tight text-foreground flex items-center gap-2">
            <Flame size={16} className="text-destructive" /> Simulasi Ujian
          </h3>
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground/60">
            Uji Batas Kemampuan Anda
          </p>
        </div>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-border/50 to-transparent hidden sm:block" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {exams.map((exam) => (
          <Link key={exam.id} href={`/exams/${exam.id}`} className="group">
            <ExamCard exam={exam} />
          </Link>
        ))}
      </div>
    </m.section>
  );
}
