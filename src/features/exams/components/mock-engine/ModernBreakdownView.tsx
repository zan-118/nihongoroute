"use client";

/**
 * @file ModernBreakdownView.tsx
 * @description Tampilan analisis grafis modern (Modern Breakdown) hasil simulasi ujian.
 */

import { m } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Share, ErrorWarning, Alert } from "@/components/ui/icons";
import Link from "next/link";
import type { ExamData } from "./types";
import { SECTION_LABELS } from "./constants";
import type { CertificatePayload, SectionBreakdown } from "./examResultData";
import { PdfGenerator } from "./PdfGeneratorLazy";

/**
 * Props untuk tampilan breakdown modern.
 */
interface ModernBreakdownViewProps {
 exam: ExamData;
 isPassed: boolean;
 failedSection: boolean;
 finalScore: number;
 correctCount: number;
 sectionBreakdown: SectionBreakdown;
 certificateData: CertificatePayload;
 backLink: string;
 onReview: () => void;
 onShare: () => void;
}

/**
 * View dasbor analisis modern.
 */
export function ModernBreakdownView({
 exam,
 isPassed,
 failedSection,
 finalScore,
 correctCount,
 sectionBreakdown,
 certificateData,
 backLink,
 onReview,
 onShare,
}: ModernBreakdownViewProps) {
 return (

 <Card className="p-8 md:p-16 text-center relative overflow-hidden neo-card rounded-2xl border border-border bg-card shadow-2xl transition-all duration-500">
 <div
 className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] blur-[70px] rounded-full pointer-events-none opacity-20 ambient-glow will-change-transform ${isPassed ? "bg-success" : "bg-destructive"}`}
 />

 <div className="relative z-10">
 <m.div
 initial={{ scale: 0, rotate: -20 }}
 animate={{ scale: 1, rotate: 0 }}
 transition={{ type: "spring", damping: 15 }}
 className={`w-32 h-32 mx-auto neo-inset flex items-center justify-center rounded-xl mb-10 bg-muted/50 border border-border ${isPassed ? "text-success" : "text-destructive"}`}
 >
 {isPassed ? (
 <Trophy size={64} aria-hidden="true" className="drop-shadow-[0_0_15px_hsl(var(--success)/0.5)]" />
 ) : (
 <ErrorWarning size={64} aria-hidden="true" className="drop-shadow-[0_0_15px_hsl(var(--destructive)/0.5)]" />
 )}
 </m.div>

 <h1 className={`text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 leading-tight ${isPassed ? "text-success" : "text-destructive"}`}>
 {isPassed ? "OMEDETOU! Keren Banget!" : "WADUH! Belum Lulus..."}
 </h1>
 <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-xs md:text-xs mb-8">
 Hasil Akhir: {exam.title}
 </p>

 {failedSection && finalScore >= exam.passingScore && (
 <div className="max-w-xl mx-auto mb-8 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 animate-pulse shadow-[0_0_15px_hsl(var(--destructive)/0.1)]">
 <Alert size={16} className="text-destructive shrink-0" />
 <span>Skor Total Mencukupi, tetapi Gagal Batas Nilai Kategori (Maiten)</span>
 </div>
 )}

 <div className="flex flex-col gap-6 mb-12">
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
 {/* Bagian Breakdown */}
 <div className="space-y-6 text-left">
 <h3 className="text-xs uppercase tracking-[0.2em] text-foreground mb-6 flex items-center gap-3">
 <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary)/1)]" />
 Performa Materi
 </h3>
 <div className="space-y-8 bg-muted/20 p-8 rounded-xl border border-border neo-inset">
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
 className={`h-full ${color} shadow-[0_0_10px_hsl(var(--background)/0.1)]`}
 />
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* Bagian Sertifikat/Aksi */}
 <div className="space-y-6 text-left">
 <h3 className="text-xs uppercase tracking-[0.2em] text-foreground mb-6 flex items-center gap-3">
 <div className="w-1.5 h-6 bg-warning rounded-full shadow-[0_0_10px_hsl(var(--warning)/1)]" />
 Aksi & Sertifikasi
 </h3>
 
 {isPassed ? (
 <div className="bg-[hsl(var(--warning)/0.1)] border border-warning/30 rounded-xl p-8 relative group overflow-hidden">
 <div className="absolute -top-10 -right-10 size-40 bg-[hsl(var(--warning)/0.1)] blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700" />
 <Trophy aria-hidden="true" className="text-warning mb-6 group-hover:scale-110 transition-transform" size={40} />
 <h4 className="text-lg uppercase tracking-tight text-warning mb-2">Klaim Sertifikat Anda</h4>
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
 onShare();
 }}
 variant="ghost"
 className="w-full h-12 bg-[hsl(var(--background)/0.05)] border border-border text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[hsl(var(--background)/0.1)] transition-all flex items-center justify-center gap-2"
 >
 <Share size={16} aria-hidden="true" /> Bagikan Pencapaian
 </Button>
 </div>
 </div>
 ) : (
 <div className="bg-[hsl(var(--muted)/0.3)] border border-border rounded-xl p-8 opacity-80 h-full flex flex-col justify-center">
 <ErrorWarning aria-hidden="true" className="text-muted-foreground/30 mb-6" size={40} />
 <h4 className="text-lg uppercase tracking-tight text-muted-foreground mb-2">Terus Berlatih!</h4>
 <p className="text-xs font-medium text-muted-foreground mb-8 leading-relaxed">
 Dibutuhkan lebih banyak latihan untuk mencapai skor kelulusan. Pelajari kembali materi yang salah.
 </p>
 <Button
 onClick={() => onReview()}
 variant="ghost"
 className="w-full h-12 bg-[hsl(var(--primary)/0.1)] border border-primary/30 text-primary text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[hsl(var(--primary)/0.2)] transition-all"
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
 className="w-full sm:w-auto px-12 h-14 bg-muted hover:bg-foreground hover:text-background text-xs font-black uppercase tracking-widest rounded-lg transition-all"
 >
 <Link href={backLink}>Selesai & Keluar</Link>
 </Button>
 
 {isPassed && (
 <Button
 onClick={() => onReview()}
 variant="ghost"
 className="w-full sm:w-auto px-12 h-14 border border-border hover:bg-muted text-xs font-black uppercase tracking-widest rounded-lg transition-all"
 >
 Analisis Kesalahan
 </Button>
 )}
 </div>
 </div>
 </Card>
 );
}
