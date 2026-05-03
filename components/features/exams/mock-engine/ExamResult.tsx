"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Skull, Share2 } from "lucide-react";
import Link from "next/link";
import { ExamData, GameState } from "./types";
import { SECTION_LABELS } from "./constants";
import { useProgressStore } from "@/store/useProgressStore";
import PdfGenerator from "@/components/features/pdf/PdfGenerator";

interface ExamResultProps {
  exam: ExamData;
  setGameState: (state: GameState) => void;
  backLink: string;
  calculateScore: () => {
    correctCount: number;
    finalScore: number;
    sectionBreakdown: Record<string, { total: number; correct: number }>;
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
  const { correctCount, finalScore, sectionBreakdown } = calculateScore();
  const isPassed = finalScore >= exam.passingScore;
  const userFullName = useProgressStore((state) => state.userFullName) || "Siswa NihongoRoute";

  const certificateData = {
    userName: userFullName,
    examTitle: exam.title,
    score: finalScore,
    date: new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    level: exam.levelCode?.toUpperCase(),
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto px-4 py-8"
    >
      <Card className="p-8 md:p-16 text-center relative overflow-hidden neo-card rounded-[3rem] border border-border bg-card shadow-2xl transition-all duration-500">
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] blur-[150px] rounded-full pointer-events-none opacity-20 ${isPassed ? "bg-emerald-500" : "bg-red-500"}`}
        />

        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className={`w-32 h-32 mx-auto neo-inset flex items-center justify-center rounded-[2.5rem] mb-10 bg-muted/50 border border-border ${isPassed ? "text-emerald-500" : "text-red-500"}`}
          >
            {isPassed ? (
              <Trophy size={64} className="drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            ) : (
              <Skull size={64} className="drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
            )}
          </motion.div>

          <h1 className={`text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 leading-tight ${isPassed ? "text-emerald-500" : "text-red-500"}`}>
            {isPassed ? "OMEDETOU! Keren Banget!" : "WADUH! Belum Lulus..."}
          </h1>
          <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px] md:text-xs mb-12">
            Hasil Akhir: {exam.title}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="neo-inset p-8 flex flex-col items-center justify-center border border-border bg-muted/10">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-4">Skor Akhir</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-5xl md:text-7xl font-black font-mono ${isPassed ? 'text-emerald-500' : 'text-red-500'}`}>{finalScore}</span>
                <span className="text-xl font-bold text-muted-foreground/40">/180</span>
              </div>
            </Card>

            <Card className="neo-inset p-8 flex flex-col items-center justify-center border border-border bg-muted/10">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-4">Akurasi</span>
              <span className="text-5xl md:text-7xl font-black font-mono text-foreground">
                {Math.round((correctCount / (exam.questions?.length || 1)) * 100)}%
              </span>
            </Card>

            <Card className="neo-inset p-8 flex flex-col items-center justify-center border border-border bg-muted/10">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-4">Benar</span>
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
                   <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(0,238,255,1)]" />
                   Performa Materi
                </h3>
                <div className="space-y-8 bg-muted/20 p-8 rounded-3xl border border-border neo-inset">
                  {Object.entries(sectionBreakdown).map(([sectionKey, data]) => {
                    if (data.total === 0) return null;
                    const percentage = Math.round((data.correct / data.total) * 100);
                    const color = percentage >= 70 ? "bg-emerald-500" : percentage >= 40 ? "bg-amber-500" : "bg-red-500";
                    
                    return (
                      <div key={sectionKey} className="space-y-3">
                        <div className="flex justify-between items-end">
                           <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                             {SECTION_LABELS[sectionKey as keyof typeof SECTION_LABELS] || sectionKey}
                           </span>
                           <span className="text-[10px] font-mono font-black text-foreground">
                             {data.correct}/{data.total}
                           </span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${percentage}%` }}
                             className={`h-full ${color} shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
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
                   <div className="w-1.5 h-6 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,1)]" />
                   Aksi & Sertifikasi
                </h3>
                
                {isPassed ? (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-[2.5rem] p-8 relative group overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700" />
                    <Trophy className="text-amber-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
                    <h4 className="text-lg font-black uppercase tracking-tight text-amber-600 dark:text-amber-500 mb-2">Klaim Sertifikat Anda</h4>
                    <p className="text-[11px] font-medium text-muted-foreground mb-8 leading-relaxed">
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
                         className="w-full h-12 bg-white/5 border border-border text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                       >
                         <Share2 size={16} /> Bagikan Pencapaian
                       </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/30 border border-border rounded-[2.5rem] p-8 opacity-80 h-full flex flex-col justify-center">
                    <Skull className="text-muted-foreground/30 mb-6" size={40} />
                    <h4 className="text-lg font-black uppercase tracking-tight text-muted-foreground mb-2">Terus Berlatih!</h4>
                    <p className="text-[11px] font-medium text-muted-foreground mb-8 leading-relaxed">
                      Dibutuhkan lebih banyak latihan untuk mencapai skor kelulusan. Pelajari kembali materi yang salah.
                    </p>
                    <Button
                      onClick={() => setGameState("review")}
                      variant="ghost"
                      className="w-full h-12 bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/20 transition-all"
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
                className="w-full sm:w-auto px-12 h-14 bg-muted hover:bg-foreground hover:text-background text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all"
             >
               <Link href={backLink}>Selesai & Keluar</Link>
             </Button>
             
             {isPassed && (
               <Button
                  onClick={() => setGameState("review")}
                  variant="ghost"
                  className="w-full sm:w-auto px-12 h-14 border border-border hover:bg-muted text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all"
               >
                 Tinjau Ujian
               </Button>
             )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
