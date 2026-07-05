/**
 * @file ShareClient.tsx
 * @description Komponen klien untuk menampilkan dan berbagi sertifikat kelulusan ujian simulasi JLPT.
 * Mendekode data sertifikat dari parameter URL dan menampilkan tampilan sertifikat premium.
 */

"use client";

// ======================
// IMPOR
// ======================
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { m } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Skull, Share2, Award, ArrowLeft, Target, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

// ======================
// TIPE DATA
// ======================
interface SharedData {
  guestId: string;
  examTitle: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  sectionScores: Record<string, number>;
  date: string;
}

function ShareContent() {
  const searchParams = useSearchParams();
  const rawData = searchParams.get("data");

  let data: SharedData | null = null;
  let error = false;
  const isDirectAccess = !rawData;

  if (rawData) {
    try {
      data = JSON.parse(decodeURIComponent(atob(rawData))) as SharedData;
    } catch (e) {
      console.error("Gagal memproses data share", e);
      error = true;
    }
  }

  if (isDirectAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-transparent relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/[0.03] to-transparent pointer-events-none" />
        <Card className="p-8 sm:p-12 max-w-md w-full glass border-border rounded-[3rem] shadow-[0_20px_50px_rgba(var(--primary-rgb),0.15)] relative z-10">
          <div className="size-20 mx-auto rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
            <Share2 size={40} className="text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]" />
          </div>
          <h1 className="text-2xl uppercase tracking-wide mb-3 text-foreground">Bagikan NihongoRoute</h1>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            Ajak teman-temanmu belajar bahasa Jepang secara seru, interaktif, dan terstruktur di NihongoRoute! Selesaikan ujian simulasi untuk memamerkan sertifikat kelulusanmu di sini.
          </p>
          <div className="flex flex-col gap-4">
            <Button 
              onClick={() => {
                if (typeof window !== "undefined") {
                  navigator.clipboard.writeText(window.location.origin);
                  toast.success("Tautan NihongoRoute berhasil disalin!");
                }
              }}
              className="w-full h-14 bg-primary hover:bg-secondary text-primary-foreground rounded-lg font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02]"
            >
              Salin Tautan Aplikasi
            </Button>
            <Button asChild variant="ghost" className="w-full h-14 border border-border bg-background/20 hover:bg-background/40 text-foreground rounded-lg font-black uppercase tracking-widest text-xs transition-all">
              <Link href="/exams" className="flex items-center justify-center gap-2">
                <Trophy size={14} className="text-warning" /> Ikuti Simulasi Ujian
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-transparent relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-destructive/[0.03] to-transparent pointer-events-none" />
        <Card className="p-8 sm:p-12 max-w-md w-full glass border-destructive/25 rounded-[3rem] shadow-[0_20px_50px_rgb(var(--destructive-rgb)/0.15)] relative z-10">
          <div className="size-20 mx-auto rounded-xl bg-destructive/10 border border-destructive/25 flex items-center justify-center mb-6">
            <Skull size={40} className="text-destructive drop-shadow-[0_0_8px_rgb(var(--destructive-rgb)/0.4)]" />
          </div>
          <h1 className="text-2xl uppercase tracking-wide mb-3">Tautan Tidak Valid</h1>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            Maaf, data sertifikat kelulusan ini tidak ditemukan atau format tautan telah kedaluwarsa.
          </p>
          <Button asChild className="w-full h-14 bg-primary hover:bg-secondary text-primary-foreground rounded-lg font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02]">
            <Link href="/" className="flex items-center justify-center gap-2">
              <ArrowLeft size={14} /> Kembali ke Beranda
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const formattedDate = data.date 
    ? new Date(data.date).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })
    : "-";

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 md:p-12 relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div 
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[600px] sm:h-[900px] blur-[150px] rounded-full pointer-events-none opacity-20 transition-all duration-700 ${
          data.passed 
            ? 'bg-gradient-to-tr from-success via-primary to-transparent' 
            : 'bg-gradient-to-tr from-destructive via-destructive to-transparent'
        }`} 
      />

      <m.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="w-full max-w-3xl relative z-10"
      >
        <Card className="p-8 sm:p-16 text-center glass border border-border/80 rounded-[4rem] shadow-[0_30px_70px_rgba(var(--foreground-rgb),0.35)] relative overflow-hidden">
          {/* Certificate Holographic Grid Background Overlay */}
          <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          {/* Badge & Achievement Header */}
          <div className="mb-10 relative">
            <m.div 
              initial={{ scale: 0.95, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12, delay: 0.2 }}
              className={`w-24 h-24 mx-auto rounded-[2.5rem] flex items-center justify-center mb-8 border shadow-xl relative z-10 ${
                data.passed 
                  ? 'bg-success/10 border-success/35 text-success shadow-[0_15px_30px_rgb(var(--success-rgb)/0.2)]' 
                  : 'bg-destructive/10 border-destructive/35 text-destructive shadow-[0_15px_30px_rgb(var(--destructive-rgb)/0.15)]'
              }`}
            >
              {data.passed ? <Trophy size={48} className="animate-pulse" /> : <Skull size={48} />}
            </m.div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/40 border border-border/60 text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/80 mb-4 select-none">
              <Award size={10} className={data.passed ? 'text-success' : 'text-destructive'} /> 
              Sertifikat Kelulusan
            </div>

            <h1 className="text-3xl sm:text-5xl uppercase tracking-tight mb-4 leading-tight">
              {data.passed ? "Kelulusan Teruji!" : "Prestasi Dicatat!"}
            </h1>
            
            <p className="text-muted-foreground text-xs sm:text-sm font-medium max-w-lg mx-auto leading-relaxed">
              Ini adalah sertifikasi pencapaian resmi digital milik <span className="text-foreground font-black underline decoration-primary decoration-2 underline-offset-4">{data.guestId}</span> setelah menyelesaikan ujian pada modul <span className="text-foreground font-black">{data.examTitle}</span>.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10 text-left">
            <div className="p-6 bg-background/25 border border-border/70 rounded-xl  flex items-center gap-5 hover:border-primary/20 transition-all duration-300">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border ${
                data.passed ? 'bg-success/5 border-success/20 text-success' : 'bg-destructive/5 border-destructive/20 text-destructive'
              }`}>
                <Target size={20} />
              </div>
              <div>
                <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest block mb-1">Skor yang Diperoleh</span>
                <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${data.passed ? 'text-success drop-shadow-[0_0_8px_rgb(var(--success-rgb)/0.2)]' : 'text-destructive'}`}>
                  {data.score} <span className="text-xs font-black text-muted-foreground/50">/ 180 XP</span>
                </span>
              </div>
            </div>

            <div className="p-6 bg-background/25 border border-border/70 rounded-xl  flex items-center gap-5 hover:border-primary/20 transition-all duration-300">
              <div className="size-12 rounded-lg bg-primary/5 border border-primary/10 text-primary flex items-center justify-center shrink-0">
                <Award size={20} className="text-primary" />
              </div>
              <div>
                <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest block mb-1">Akurasi Jawaban</span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-foreground tracking-tight">
                  {Math.round((data.score / 180) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Date Accomplished */}
          <div className="flex items-center justify-center gap-2 mb-10 text-[10px] sm:text-xs font-black uppercase tracking-wider text-muted-foreground/60 select-none">
            <Calendar size={14} className="text-primary/70" />
            Diselesaikan Pada: <span className="text-foreground/80 font-mono font-black">{formattedDate}</span>
          </div>

          {/* CTA Section */}
          <div className="pt-8 border-t border-border/60">
            <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.25em] mb-6">Uji Keterampilan Bahasa Jepang Anda Sekarang</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="h-14 px-10 bg-primary hover:bg-secondary text-primary-foreground font-black uppercase tracking-widest text-xs rounded-lg shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-0.5">
                <Link href="/">Mulai Belajar Nihongo</Link>
              </Button>
              <Button 
                onClick={() => {
                  if (typeof window !== "undefined") {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Tautan sertifikat berhasil disalin!");
                  }
                }}
                variant="ghost" 
                className="h-14 px-10 border border-border bg-background/15 hover:bg-background/25 text-foreground font-black uppercase tracking-widest text-xs rounded-lg transition-all hover:-translate-y-0.5"
                aria-label="Salin Tautan Sertifikat"
              >
                <Share2 size={16} className="mr-2 text-primary" /> Salin Tautan
              </Button>
            </div>
          </div>

          {/* Branding Footer */}
          <div className="mt-12 flex items-center justify-center gap-3 opacity-35 select-none">
            <div className="relative size-10 shrink-0">
              <Image src="/logo-branding.svg" alt="NihongoRoute Branding" fill className="object-contain" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.45em] text-foreground">NihongoRoute</span>
          </div>
        </Card>
      </m.div>
    </div>
  );
}

export default function ShareClient() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse bg-transparent">Memuat Sertifikat…</div>}>
      <ShareContent />
    </Suspense>
  );
}
