"use client";

/**
 * @file FeatureGrid.tsx
 * @description Komponen grid fitur utama interaktif untuk Landing Page NihongoRoute.
 * Menampilkan ringkasan ekosistem pembelajaran (Kana, Kamus, SRS, Simulasi JLPT),
 * langkah-langkah belajar terstruktur, dan fitur gamifikasi (Streaks, XP, Lencana).
 *
 * @package components/features/landing
 * @project NihongoRoute
 */

// ==========================================
// IMPOR
// ==========================================
import React, { useState } from "react";
import { m, Variants } from "framer-motion";
import { 
  BrainCircuit, 
  Library, 
  Zap, 
  BookOpen, 
  PenTool, 
  Award, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  GraduationCap, 
  ArrowRight, 
  BookMarked,
  Timer,
  Check,
  Target
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ==========================================
// VARIASI ANIMASI FRAMER MOTION
// ==========================================

/**
 * Framer motion container animation variants.
 * Staggers children entry animations.
 */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

/**
 * Framer motion item animation variants.
 * Fades in individual grid items.
 */
const itemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

// ==========================================

/**
 * Interactive JLPT N5 grammar quiz playground.
 * Allows user to select answers and displays instant feedback.
 */
function JlptQuizPlayground() {
  // Track selected answer key
  const [selected, setSelected] = useState<string | null>(null);
  // Check if selected answer is correct (A is correct)
  const isCorrect = selected === "A";

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Kuis Latihan Ujian N5</span>
      <div className="w-full p-3 bg-background/80 border border-border rounded-xl text-center shadow-inner">
        <span className="text-xs font-bold text-foreground">
          私は昨日デパート <span className="text-primary font-bold">[ ? ]</span> 行きました。
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 w-full">
        {[
          { key: "A", label: "に (ni)" },
          { key: "B", label: "を (wo)" },
          { key: "C", label: "が (ga)" },
          { key: "D", label: "は (ha)" },
        ].map((opt) => (
          <button
            key={opt.key}
            type="button"
            aria-pressed={selected === opt.key}
            aria-label={`Pilih jawaban ${opt.key}: ${opt.label}`}
            onClick={() => setSelected(opt.key)}
            className={`py-1.5 px-3 rounded-lg border text-xs font-bold transition-all ${
              selected === opt.key
                ? opt.key === "A"
                  ? "bg-success/15 border-success text-success shadow-[0_2px_8px_rgba(var(--success-rgb),0.2)]"
                  : "bg-destructive/15 border-destructive text-destructive"
                : "border-border bg-background/50 hover:border-foreground/20 text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {selected && (
        <span className={`text-[10px] font-bold uppercase tracking-wider ${isCorrect ? "text-success animate-pulse" : "text-destructive"}`}>
          {isCorrect ? "✓ Tepat! 'ni' menyatakan arah/tujuan." : "✗ Salah, coba lagi!"}
        </span>
      )}
    </div>
  );
}

// KOMPONEN UTAMA
// ==========================================
/**
 * FeatureGrid component.
 * Displays interactive learning ecosystem, steps, and gamification preview.
 */
export function FeatureGrid() {
  // Track active step in learning path
  const [activeStep, setActiveStep] = useState<number>(0);

  // Langkah-langkah metode belajar terpadu NihongoRoute
  const learningSteps = [
    {
      title: "Langkah 1: Kenali Huruf (Kana)",
      desc: "Mulai dari sini: kuasai Hiragana & Katakana lewat tabel interaktif dan panduan menulis langkah demi langkah.",
      badge: "Langkah Pertama",
      tip: "Fondasi penting buat baca manga, artikel, dan soal ujian.",
      action: "Buka Menu Kana"
    },
    {
      title: "Langkah 2: Perkaya Kosakata & Pelajaran",
      desc: "Ribuan kosakata dan tata bahasa sesuai standar JLPT, lengkap dengan audio pelafalan dan contoh kalimat.",
      badge: "Materi Terpadu",
      tip: "Ada furigana yang bisa kamu nyalain atau matiin kapan aja.",
      action: "Masuk Perpustakaan"
    },
    {
      title: "Langkah 3: Pengulangan Terjadwal",
      desc: "Lupa metode hafalan lama. Sistem SRS kami otomatis ngatur kosakata yang perlu diulang pas sebelum kamu mulai lupa.",
      badge: "Hafal Tanpa Lupa",
      tip: "Bisa hemat waktu belajar sampai 60% dibanding cara catat biasa.",
      action: "Coba Flashcard"
    },
    {
      title: "Langkah 4: Uji dengan Simulasi JLPT",
      desc: "Ukur kesiapanmu lewat simulasi ujian JLPT dengan timer, penilaian akurat, dan statistik hasil yang lengkap.",
      badge: "Siap Ujian",
      tip: "Tersedia dari N5 sampai N1, lengkap dengan pembahasan.",
      action: "Mulai Simulasi"
    }
  ];

  return (
    <div className="w-full space-y-[120px] mb-[120px]">
      
      {/* SEKSI 1: SHOWCASE FITUR UTAMA */}
      <section className="relative">
        <div className="text-center max-w-3xl mx-auto mb-[65px]">
          <Badge className="bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            Ekosistem Pembelajaran
          </Badge>
          <h2 className="text-4xl md:text-5xl tracking-tight mb-5">
            Apa Saja yang <span className="brand-text-gradient">Bisa Kamu Pelajari?</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg font-medium leading-relaxed">
            Semua yang kamu butuhkan buat melangkah dari nol sampai mahir, dalam satu platform modern tanpa ribet.
          </p>
        </div>

        <m.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-[34px]"
        >
          {/* KARTU 1: ALAT BANTU KANA INTERAKTIF */}
          <m.div variants={itemVariants}>
            <Card className="p-6 sm:p-8 md:p-10 group relative overflow-hidden transition-all duration-500 flex flex-col h-full bg-card/10  border border-border rounded-[24px] sm:rounded-[34px] hover:border-primary/40 hover:shadow-[0_0_50px_rgb(var(--primary-rgb)_/_0.12)] shadow-none glass">
              <div className="absolute inset-0 bg-seigaiha pointer-events-none opacity-[0.45] transition-opacity group-hover:opacity-60" />
              <div className="absolute top-0 right-0 size-32 bg-primary/5 rounded-full blur-[40px] group-hover:bg-primary/10 transition-all duration-500" />
              
              <div className="mb-[26px] p-4 bg-background border border-border w-fit rounded-lg group-hover:scale-110 transition-transform duration-500 shadow-sm text-primary">
                <PenTool size={26} className="drop-shadow-[0_0_6px_rgb(var(--primary-rgb)_/_0.3)]" />
              </div>
              
              <h3 className="text-2xl tracking-tight mb-[13px] text-foreground group-hover:text-primary transition-colors">
                Alat Bantu Kana Interaktif
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed flex-1 font-medium mb-6">
                Kuasai Hiragana & Katakana lewat tabel interaktif, panduan urutan guratan, dan latihan menulis langsung di layarmu.
              </p>
 
              {/* Tampilan Visual Mockup di Dalam Kartu */}
              <div className="p-4 bg-background/40 border border-border rounded-lg flex items-center justify-between gap-4 glass mt-auto transition-all duration-300 group-hover:border-primary/20">
                <div className="size-14 border-2 border-dashed border-primary/30 bg-background/80 rounded-xl flex items-center justify-center relative font-japanese font-bold text-2xl text-primary shadow-inner transition-transform group-hover:scale-105">
                  あ
                  <div className="absolute text-[8px] font-bold text-primary/50 top-1 left-1">1</div>
                  <div className="absolute text-[7px] font-bold text-muted-foreground/60 bottom-1 right-1">N5</div>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-foreground">Hiragana "A" (Guratan 1/3)</span>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden relative">
                    <div className="h-full bg-primary rounded-full w-[33%] relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-background/20 before:to-transparent" />
                  </div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Arah guratan: Melengkung ke kanan</span>
                </div>
              </div>
            </Card>
          </m.div>
 
          {/* KARTU 2: DATABASE PERPUSTAKAAN KOSAKATA & TATA BAHASA */}
          <m.div variants={itemVariants}>
            <Card className="p-6 sm:p-8 md:p-10 group relative overflow-hidden transition-all duration-500 flex flex-col h-full bg-card/10  border border-border rounded-[24px] sm:rounded-[34px] hover:border-secondary/40 hover:shadow-[0_0_50px_rgb(var(--secondary-rgb)_/_0.12)] shadow-none glass">
              <div className="absolute inset-0 bg-asanoha pointer-events-none opacity-[0.45] transition-opacity group-hover:opacity-60" />
              <div className="absolute top-0 right-0 size-32 bg-secondary/5 rounded-full blur-[40px] group-hover:bg-secondary/10 transition-all duration-500" />
              
              <div className="mb-[26px] p-4 bg-background border border-border w-fit rounded-lg group-hover:scale-110 transition-transform duration-500 shadow-sm text-secondary">
                <Library size={26} className="drop-shadow-[0_0_6px_rgb(var(--secondary-rgb)_/_0.3)]" />
              </div>
              
              <h3 className="text-2xl tracking-tight mb-[13px] text-foreground group-hover:text-secondary transition-colors">
                Perpustakaan Kosakata, Kanji & Tata Bahasa
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed flex-1 font-medium mb-4">
                Ribuan kosakata, kamus Kanji lengkap, dan pustaka tata bahasa praktis — semuanya dengan audio penutur asli dan furigana otomatis.
              </p>

              {/* STATISTIK NYATA DARIPADA SUPABASE */}
              <div className="flex gap-2 flex-wrap mb-6">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 transition-transform hover:scale-105 shadow-none">
                  22K+ Kosakata
                </Badge>
                <Badge variant="outline" className="bg-secondary/5 text-secondary border-secondary/20 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 transition-transform hover:scale-105 shadow-none">
                  13K+ Kanji
                </Badge>
                <Badge variant="outline" className="bg-success/5 text-success border-success/20 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 transition-transform hover:scale-105 shadow-none">
                  800+ Tata Bahasa
                </Badge>
              </div>
 
              {/* Tampilan Visual Mockup di Dalam Kartu */}
              <div className="p-4 bg-background/40 border border-border rounded-lg flex flex-col gap-2 glass mt-auto transition-all duration-300 group-hover:border-secondary/20">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">Kosakata Utama</span>
                  <span className="text-[9px] font-extrabold bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded-full">N5</span>
                </div>
                <div className="flex flex-col transition-transform group-hover:translate-x-1 duration-300">
                  <ruby className="text-xl font-bold font-japanese tracking-wider text-foreground">
                    日本語 <rt className="text-[0.55em] font-bold text-muted-foreground transition-colors group-hover:text-primary">にほんご</rt>
                  </ruby>
                  <span className="text-[11px] text-muted-foreground font-semibold mt-0.5">Nihongo — Bahasa Jepang</span>
                </div>
                <div className="h-px bg-border/60" />
                <div className="text-[9px] text-muted-foreground leading-relaxed">
                  <strong>Contoh:</strong> 日本語の勉強が大好きです。<br />
                  <span className="opacity-80">Saya sangat suka belajar bahasa Jepang.</span>
                </div>
              </div>
            </Card>
          </m.div>
 
          {/* KARTU 3: FLASHCARDS DENGAN SYSTEM SRS */}
          <m.div variants={itemVariants}>
            <Card className="p-6 sm:p-8 md:p-10 group relative overflow-hidden transition-all duration-500 flex flex-col h-full bg-card/10  border border-border rounded-[24px] sm:rounded-[34px] hover:border-primary/40 hover:shadow-[0_0_50px_rgb(var(--primary-rgb)_/_0.12)] shadow-none glass">
              <div className="absolute inset-0 bg-seigaiha pointer-events-none opacity-[0.45] transition-opacity group-hover:opacity-60" />
              <div className="absolute top-0 right-0 size-32 bg-primary/5 rounded-full blur-[40px] group-hover:bg-primary/10 transition-all duration-500" />
              
              <div className="mb-[26px] p-4 bg-background border border-border w-fit rounded-lg group-hover:scale-110 transition-transform duration-500 shadow-sm text-primary">
                <BrainCircuit size={26} className="drop-shadow-[0_0_6px_rgb(var(--primary-rgb)_/_0.3)]" />
              </div>
              
              <h3 className="text-2xl tracking-tight mb-[13px] text-foreground group-hover:text-primary transition-colors">
                Flashcard Cerdas & Pengulangan Terjadwal
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed flex-1 font-medium mb-6">
                Latih ingatanmu dengan cara paling efektif. Sistem SRS otomatis jadwalkan kartu flashcard yang perlu diulang tepat sebelum kamu lupa.
              </p>
 
              {/* Tampilan Visual Mockup di Dalam Kartu */}
              <div className="p-4 bg-background/40 border border-border rounded-lg flex items-center gap-3.5 glass mt-auto transition-all duration-300 group-hover:border-primary/20">
                <div className="relative w-11 h-14 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-lg flex items-center justify-center font-bold text-xl shadow-[0_4px_12px_rgb(var(--primary-rgb)_/_0.3)] shrink-0 transition-transform group-hover:scale-105">
                  猫
                  <div className="absolute -top-1 -right-1 size-2.5 bg-success rounded-full border border-background animate-pulse" />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-foreground">猫 (Neko) — Kucing</span>
                  <span className="text-[9px] text-muted-foreground flex items-center gap-1.5 font-bold">
                    <span className="size-1.5 bg-success rounded-full" /> Interval: 3 Hari Lagi (Kotak 4)
                  </span>
                  <div className="w-full bg-muted h-1 rounded-full overflow-hidden mt-1 relative">
                    <div className="bg-success h-full w-[80%] relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-background/20 before:to-transparent" />
                  </div>
                </div>
              </div>
            </Card>
          </m.div>
 
          {/* KARTU 4: SIMULASI UJIAN JLPT REAL-TIME */}
          <m.div variants={itemVariants}>
            <Card className="p-6 sm:p-8 md:p-10 group relative overflow-hidden transition-all duration-500 flex flex-col h-full bg-card/10  border border-border rounded-[24px] sm:rounded-[34px] hover:border-secondary/40 hover:shadow-[0_0_50px_rgb(var(--secondary-rgb)_/_0.12)] shadow-none glass">
              <div className="absolute inset-0 bg-asanoha pointer-events-none opacity-[0.45] transition-opacity group-hover:opacity-60" />
              <div className="absolute top-0 right-0 size-32 bg-secondary/5 rounded-full blur-[40px] group-hover:bg-secondary/10 transition-all duration-500" />
              
              <div className="mb-[26px] p-4 bg-background border border-border w-fit rounded-lg group-hover:scale-110 transition-transform duration-500 shadow-sm text-secondary">
                <Zap size={26} className="drop-shadow-[0_0_6px_rgb(var(--secondary-rgb)_/_0.3)]" />
              </div>
              
              <h3 className="text-2xl tracking-tight mb-[13px] text-foreground group-hover:text-secondary transition-colors">
                Simulasi Ujian JLPT Real-Time
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed flex-1 font-medium mb-6">
                Uji kesiapanmu dengan simulasi ujian JLPT — lengkap dengan timer, sesi ujian terpisah, dan laporan hasil yang detail.
              </p>
 
              {/* Tampilan Visual Mockup di Dalam Kartu */}
              <div className="p-4 bg-background/40 border border-border rounded-lg flex flex-col gap-2 glass mt-auto transition-all duration-300 group-hover:border-secondary/20">
                <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground">
                  <span className="flex items-center gap-1"><Timer size={10} className="text-secondary" /> Ujian JLPT N3: Sesi Choukai</span>
                  <span className="text-destructive font-mono font-bold animate-pulse">00:42:15</span>
                </div>
                <div className="w-full bg-muted h-1 rounded-full overflow-hidden relative">
                  <div className="bg-secondary h-full w-[70%] relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-background/20 before:to-transparent" />
                </div>
                <div className="flex justify-between gap-1.5 mt-0.5">
                  {[1, 2, 3, 4].map((num) => (
                    <div 
                      key={num} 
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] border transition-all duration-300 ${
                        num === 3 
                          ? "bg-secondary text-secondary-foreground border-secondary shadow-[0_2px_8px_rgb(var(--secondary-rgb)_/_0.3)]" 
                          : "border-border bg-background text-muted-foreground hover:border-secondary/30"
                      }`}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </m.div>
        </m.div>
      </section>

      {/* SEKSI 2: LANGKAH PERJALANAN BELAJAR TERPADU */}
      <section className="relative">
        {/* Glow latar belakang redup */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto mb-[65px]">
          <Badge className="bg-secondary/10 text-secondary border border-secondary/20 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            Alur Metode Belajar
          </Badge>
          <h2 className="text-4xl md:text-5xl tracking-tight mb-5">
            Cara Cerdas <span className="text-primary">Menguasai Bahasa Jepang</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg font-medium leading-relaxed">
            Metode belajar yang nganterin kamu dari kenalan huruf sampai siap hadapi ujian JLPT.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[55px] items-start">
          {/* TOMBOL NAVIGASI LANGKAH - KOLOM KIRI */}
          <div className="lg:col-span-5 flex flex-col gap-4 w-full">
            {learningSteps.map((step, idx) => (
              <button
                type="button"
                key={step.title}
                aria-pressed={activeStep === idx}
                aria-label={`Lihat detail ${step.title}`}
                onClick={() => setActiveStep(idx)}
                className={`w-full text-left p-6 rounded-[24px] border transition-all duration-300 flex items-center justify-between gap-4 group relative overflow-hidden ${
                  activeStep === idx 
                    ? "bg-card border-primary/40 shadow-[0_10px_30px_rgb(var(--primary-rgb)_/_0.05)] glass" 
                    : "bg-transparent border-border hover:border-foreground/10 hover:bg-card/5"
                }`}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base transition-all duration-300 ${
                    activeStep === idx 
                      ? "bg-primary text-slate-950 dark:text-primary-foreground shadow-[0_4px_12px_rgb(var(--primary-rgb)_/_0.3)]" 
                      : "bg-muted text-foreground/80 dark:text-muted-foreground"
                  }`}>
                    0{idx + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                      {step.badge}
                    </span>
                    <span className={`text-base font-bold transition-colors ${
                      activeStep === idx ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    }`}>
                      {step.title.split(": ")[1]}
                    </span>
                  </div>
                </div>
                <ArrowRight 
                  size={16} 
                  className={`transition-all duration-300 relative z-10 ${
                    activeStep === idx 
                      ? "translate-x-0 text-primary opacity-100" 
                      : "-translate-x-2 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                  }`} 
                />
              </button>
            ))}
          </div>

          {/* TAMPILAN DETIL LANGKAH AKTIF - KOLOM KANAN */}
          <div className="lg:col-span-7 h-full">
            <Card className="p-6 sm:p-8 md:p-10 rounded-[24px] sm:rounded-[34px] bg-card/10  border border-border shadow-none relative overflow-hidden min-h-[350px] flex flex-col justify-between">
              <div className="absolute top-0 right-0 size-[200px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="space-y-6 relative z-10">
                <Badge className="bg-primary/10 text-primary border border-primary/20 rounded-full font-bold uppercase tracking-widest text-[9px]">
                  {learningSteps[activeStep].badge}
                </Badge>
                
                <h3 className="text-3xl tracking-tight text-foreground">
                  {learningSteps[activeStep].title}
                </h3>
                
                <p className="text-muted-foreground text-base leading-relaxed font-medium">
                  {learningSteps[activeStep].desc}
                </p>

                <div className="p-4 bg-muted/30 border border-border rounded-lg flex items-start gap-3">
                  <Sparkles size={16} className="text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                    <strong className="text-foreground">Tips Belajar:</strong> {learningSteps[activeStep].tip}
                  </p>
                </div>

                {/* Interactive Preview Box based on activeStep */}
                <div className="p-4 bg-background/40 border border-border/80 rounded-lg glass transition-all duration-500">
                  {activeStep === 0 && (
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Latihan Menulis Kana "あ"</span>
                      <div className="size-20 border-2 border-dashed border-primary/30 rounded-xl flex items-center justify-center relative font-japanese font-black text-4xl text-primary bg-background/60 shadow-inner">
                        あ
                        <m.svg
                          className="absolute inset-0 size-full pointer-events-none"
                          viewBox="0 0 100 100"
                        >
                          {/* Animated stroke guides */}
                          <m.path
                            d="M 25 35 L 75 35"
                            fill="none"
                            stroke="rgba(var(--primary-rgb), 0.55)"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                          />
                          <m.path
                            d="M 50 15 L 50 85"
                            fill="none"
                            stroke="rgba(var(--primary-rgb), 0.55)"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, delay: 0.8, repeat: Infinity, repeatDelay: 1 }}
                          />
                          <m.path
                            d="M 30 70 C 20 40, 80 40, 60 75 C 50 85, 35 75, 45 60"
                            fill="none"
                            stroke="rgba(var(--primary-rgb), 0.75)"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, delay: 1.6, repeat: Infinity, repeatDelay: 1 }}
                          />
                        </m.svg>
                      </div>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Animasi Petunjuk Arah Guratan</span>
                    </div>
                  )}

                  {activeStep === 1 && (
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Mini Flashcard Kamus</span>
                      <m.div
                        whileHover={{ rotateY: 180 }}
                        transition={{ duration: 0.6 }}
                        style={{ transformStyle: "preserve-3d" }}
                        className="w-44 h-24 relative cursor-pointer"
                      >
                        {/* Front */}
                        <div 
                          style={{ backfaceVisibility: "hidden" }}
                          className="absolute inset-0 bg-card border border-border/80 rounded-xl flex flex-col items-center justify-center gap-1 shadow-sm"
                        >
                          <ruby className="text-xl font-bold font-japanese tracking-wide text-foreground">
                            猫 <rt className="text-[0.55em] text-muted-foreground">ねこ</rt>
                          </ruby>
                          <span className="text-[8px] font-black text-primary uppercase tracking-widest">Hover Untuk Lihat Arti</span>
                        </div>
                        {/* Back */}
                        <div 
                          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                          className="absolute inset-0 bg-primary/10 border border-primary/30 rounded-xl flex flex-col items-center justify-center gap-1 shadow-sm"
                        >
                          <span className="text-lg font-bold text-primary">Neko</span>
                          <span className="text-[10px] font-bold text-muted-foreground">Arti: Kucing</span>
                        </div>
                      </m.div>
                    </div>
                  )}

                  {activeStep === 2 && (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Kurva Lupa (Forgetting Curve)</span>
                      <div className="w-full h-20 flex items-center justify-center relative">
                        <svg className="w-60 h-16" viewBox="0 0 200 60">
                          <line x1="10" y1="10" x2="190" y2="10" stroke="rgba(255,255,255,0.06)" strokeDasharray="3" />
                          <line x1="10" y1="30" x2="190" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="3" />
                          <line x1="10" y1="50" x2="190" y2="50" stroke="rgba(255,255,255,0.06)" strokeDasharray="3" />
                          <m.path
                            d="M 10 10 C 50 15, 80 50, 190 52"
                            fill="none"
                            stroke="url(#curve-gradient)"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
                          />
                          <circle cx="10" cy="10" r="3" fill="hsl(var(--primary))" />
                          <circle cx="70" cy="22" r="3" fill="hsl(var(--secondary))" />
                          <circle cx="130" cy="38" r="3" fill="hsl(var(--primary))" />
                          <defs>
                            <linearGradient id="curve-gradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="hsl(var(--primary))" />
                              <stop offset="50%" stopColor="hsl(var(--secondary))" />
                              <stop offset="100%" stopColor="hsl(var(--destructive))" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <span className="absolute top-1 left-2 text-[8px] font-black text-success uppercase tracking-wider">100% Memori</span>
                        <span className="absolute bottom-1 right-2 text-[8px] font-black text-destructive uppercase tracking-wider">Lupa</span>
                      </div>
                    </div>
                  )}

                  {activeStep === 3 && <JlptQuizPlayground />}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border/80 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-success" />
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Kurikulum Terstruktur</span>
                </div>
                <span className="text-xs font-bold text-primary flex items-center gap-1 group">
                  Mulai Sekarang 
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* SEKSI 3: PRATINJAU GAMIFIKASI KEMAJUAN BELAJAR */}
      <section className="relative">
        <Card className="p-6 sm:p-10 md:p-[42px] lg:p-[55px] rounded-[28px] sm:rounded-[34px] md:rounded-[42px] bg-card/10  border border-border shadow-none relative overflow-hidden group">
          {/* Aksen Kilau Latar Belakang */}
          <div className="absolute -top-32 -left-32 size-89 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 size-89 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* PENJELASAN SEBELAH KIRI */}
            <div className="lg:col-span-6 space-y-6">
              <Badge className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest">
                Sistem Kemajuan Belajar
              </Badge>
              <h2 className="text-3xl md:text-4xl tracking-tight">
                Tetap Konsisten dengan <br />
                <span className="brand-text-gradient">Sistem Belajar Interaktif</span>
              </h2>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed font-medium">
                Streak harian dan poin XP bikin rutinitas belajar bahasa Jepangmu terasa kayak main game yang seru.
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center text-success">
                    <Check size={16} />
                  </div>
                  <span className="text-xs font-bold text-foreground">Target Harian Jelas</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Target size={16} />
                  </div>
                  <span className="text-xs font-bold text-foreground">Lencana Prestasi</span>
                </div>
              </div>
            </div>

            {/* WIDGET GAMIFIKASI SEBELAH KANAN */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* KARTU STREAK (HARI AKTIF) */}
              <Card className="p-6 bg-background/50 border border-border/80 rounded-[28px] glass flex flex-col justify-between h-48">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Belajar Harian</span>
                  <Flame size={20} className="text-destructive fill-destructive animate-premium-bounce" />
                </div>
                <div className="my-2">
                  <span className="text-4xl font-black text-foreground tracking-tight">7 HARI</span>
                  <p className="text-[10px] text-success font-bold mt-1 uppercase tracking-wider flex items-center gap-1">
                    <span className="size-1.5 bg-success rounded-full" /> Streak Aktif!
                  </p>
                </div>
                {/* Mini Heatmap Grid Kontribusi */}
                <div className="mt-3 flex flex-col gap-1 w-full overflow-hidden">
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 28 }).map((_, idx) => {
                      const colors = [
                        "bg-muted border border-border/40",
                        "bg-success/20 border border-success/30",
                        "bg-success/50 border border-success/40",
                        "bg-primary/45 border border-primary/30",
                        "bg-secondary/45 border border-secondary/30",
                        "bg-success/80 border border-success/60 shadow-[0_0_6px_rgba(var(--success-rgb),0.35)]",
                      ];
                      const isToday = idx === 27;
                      const colorIdx = isToday ? 5 : (idx % 6);
                      return (
                        <div
                          key={`cell-${idx}`}
                          className={`h-3 rounded-sm transition-transform hover:scale-110 cursor-pointer ${colors[colorIdx]} ${
                            isToday ? "animate-pulse" : ""
                          }`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[7px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                    <span>Mulai</span>
                    <span>Hari Ini</span>
                  </div>
                </div>
              </Card>

              {/* KARTU LEVEL DAN XP */}
              <Card className="p-6 bg-background/50 border border-border/80 rounded-[28px] glass flex flex-col justify-between h-48">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Tingkatan Level</span>
                  <Award size={20} className="text-secondary" />
                </div>
                <div className="my-2">
                  <span className="text-3xl font-black text-foreground tracking-tight">LEVEL 12</span>
                  <p className="text-[10px] text-muted-foreground font-semibold mt-1">
                    Pembelajar Tingkat N4 Aktif
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] font-bold text-muted-foreground">
                    <span>1,850 / 2,000 XP</span>
                    <span>92%</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-secondary to-primary h-full w-[92%]" />
                  </div>
                </div>
              </Card>

              {/* BARIS LENCANA TERBARU */}
              <Card className="p-5 bg-background/50 border border-border/80 rounded-[28px] glass sm:col-span-2 flex items-center justify-between gap-4">
                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest shrink-0">Lencana Baru:</span>
                <div className="flex gap-3 overflow-x-auto py-1">
                  {[
                    { label: "Kana Master", color: "text-primary bg-primary/10 border-primary/20" },
                    { label: "SRS Warrior", color: "text-secondary bg-secondary/10 border-secondary/20" },
                    { label: "JLPT Challenger", color: "text-warning bg-warning/10 border-warning/20" }
                  ].map((badge) => (
                    <Badge key={badge.label} className={`px-3 py-1 rounded-lg border font-bold text-[9px] whitespace-nowrap ${badge.color}`}>
                      <GraduationCap size={10} className="mr-1.5 shrink-0" />
                      {badge.label}
                    </Badge>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </section>

    </div>
  );
}