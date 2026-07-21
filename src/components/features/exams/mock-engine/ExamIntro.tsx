/**
 * @file ExamIntro.tsx
 * @description Komponen intro simulasi ujian (ExamIntro) untuk memberikan detail jumlah soal, batas waktu, target kelulusan, dan petunjuk kepatuhan ujian CBT.
 */

// ======================
// IMPOR
// ======================
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { ExamData } from "./types";

// ======================
// ANTARMUKA / TIPE DATA
// ======================

/**
 * Props for ExamIntro component.
 */
interface ExamIntroProps {
  /** Exam metadata and question list. */
  exam: ExamData;
  /** Callback triggered when user starts exam. */
  onStartExam: () => void | Promise<void>;
  /** Loading state during exam initialization. */
  isStarting?: boolean;
  /** URL path to redirect back. */
  backLink: string;
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * ExamIntro component.
 * Renders exam details, rules, and start button.
 */
export function ExamIntro({
  exam,
  onStartExam,
  isStarting = false,
  backLink,
}: ExamIntroProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto p-8 md:p-12 text-center mt-6 md:mt-12 relative overflow-hidden neo-card rounded-2xl md:rounded-3xl border border-border bg-card shadow-2xl transition-colors duration-300">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 size-[300px] bg-destructive/5 blur-[60px] rounded-full pointer-events-none ambient-glow will-change-transform" />

      <Card className="size-24 mx-auto neo-inset flex items-center justify-center rounded-2xl mb-8 bg-[rgb(var(--muted-rgb)/0.5)] border border-border shadow-none">
        <AlertCircle
          size={40}
          aria-hidden="true"
          className="text-warning drop-shadow-sm dark:drop-shadow-[0_0_15px_rgb(var(--warning-rgb)/0.5)]"
        />
      </Card>

      <h1 className="text-3xl sm:text-4xl md:text-5xl text-foreground uppercase tracking-tight mb-8 leading-tight relative z-10">
        {exam.title}
      </h1>

      <Card className="neo-inset p-6 md:p-8 rounded-lg mb-8 text-left space-y-5 relative z-10 bg-muted/30 border border-border shadow-none">
        <div className="flex justify-between items-center border-b border-border pb-4">
          <span className="text-xs md:text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Total Soal
          </span>
          <Badge variant="ghost" className="font-mono font-bold text-foreground text-sm md:text-base">
            {exam.questions.length} Soal
          </Badge>
        </div>
        <div className="flex justify-between items-center border-b border-border pb-4">
          <span className="text-xs md:text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Batas Waktu
          </span>
          <Badge variant="ghost" className="font-mono font-bold text-destructive text-sm md:text-base">
            {exam.timeLimit} Menit
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs md:text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Target Pass
          </span>
          <Badge variant="ghost" className="font-mono font-bold text-warning text-sm md:text-base">
            {exam.passingScore} / 180
          </Badge>
        </div>
      </Card>

      <p className="text-xs text-muted-foreground mb-10 font-bold uppercase tracking-widest leading-relaxed px-2 relative z-10">
        Ingat ya: Sistem deteksi kecurangan lagi aktif nih. Khusus bagian Mendengar (Choukai), audionya cuma bisa diputar SEKALI dan gak bisa diulang. Fokus ya!
      </p>

      <div className="flex flex-col sm:flex-row gap-4 relative z-10">
        <Button
          asChild
          variant="ghost"
          className="neo-inset w-full hover:bg-background text-muted-foreground hover:text-foreground font-black uppercase tracking-widest h-auto py-5 px-6 rounded-xl transition-all text-xs sm:text-xs border border-border bg-muted/50 shadow-none"
        >
          <Link href={backLink}>
            ← Nanti Saja
          </Link>
        </Button>
        <Button
          onClick={() => void onStartExam()}
          disabled={isStarting}
          className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground font-black uppercase tracking-widest h-auto py-5 px-10 rounded-xl transition-all shadow-lg active:scale-95 text-xs sm:text-xs border-none"
        >
          {isStarting && <Loader2 size={16} aria-hidden="true" className="mr-2 animate-spin" />}
          {isStarting ? "Menyiapkan Sesi" : "Mulai Sekarang"}
        </Button>
      </div>
    </Card>
  );
}