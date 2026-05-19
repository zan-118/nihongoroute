"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 80, damping: 15 },
  },
};

/**
 * Komponen FeatureGrid yang telah dirombak total menjadi 
 * pusat eksplorasi fitur premium dan interaktif NihongoRoute.
 */
export function FeatureGrid() {
  const [activeStep, setActiveStep] = useState<number>(0);

  const learningSteps = [
    {
      title: "Langkah 1: Kenali Huruf (Kana)",
      desc: "Mulailah perjalanan Anda dengan menguasai Hiragana & Katakana. Gunakan tabel interaktif dan panduan menulis guratan demi guratan yang presisi.",
      badge: "Langkah Pertama",
      tip: "Penting untuk fondasi membaca manga, artikel, atau soal ujian.",
      action: "Buka Menu Kana"
    },
    {
      title: "Langkah 2: Perkaya Kosakata & Pelajaran",
      desc: "Pelajari ribuan kata penting dan tata bahasa praktis berstandar JLPT. Setiap materi dikemas dengan klip audio pelafalan dan contoh kalimat nyata.",
      badge: "Materi Terpadu",
      tip: "Dilengkapi furigana dinamis yang bisa diaktifkan/matikan kapan saja.",
      action: "Masuk Perpustakaan"
    },
    {
      title: "Langkah 3: Pengulangan Terjadwal",
      desc: "Lupakan metode menghafal konvensional. Algoritma pengulangan terjadwal kami secara otomatis mengatur kosakata yang harus diulang tepat sebelum Anda lupa.",
      badge: "Hafal Tanpa Lupa",
      tip: "Menghemat waktu belajar hingga 60% dibanding metode mencatat biasa.",
      action: "Coba Flashcard"
    },
    {
      title: "Langkah 4: Uji dengan Simulasi JLPT",
      desc: "Ukur kesiapan belajar Anda melalui simulasi ujian JLPT yang dirancang dengan sistem waktu nyata, format penilaian akurat, dan statistik kelulusan mendalam.",
      badge: "Siap Ujian",
      tip: "Tersedia untuk tingkat N5 hingga N1 dengan pembahasan lengkap.",
      action: "Mulai Simulasi"
    }
  ];

  return (
    <div className="w-full space-y-[120px] mb-[120px]">
      
      {/* SECTION 1: CORE FEATURES SHOWCASE */}
      <section className="relative">
        <div className="text-center max-w-3xl mx-auto mb-[65px]">
          <Badge className="bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            Ekosistem Pembelajaran
          </Badge>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5">
            Apa Saja yang <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">NihongoRoute Sediakan?</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg font-medium leading-relaxed">
            Semua modul pembelajaran bahasa Jepang yang Anda butuhkan untuk melangkah dari pemula total hingga mahir, dirancang dalam satu platform modern tanpa hambatan.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-[34px]"
        >
          {/* CARD 1: KANA INSTRUMENT */}
          <motion.div variants={itemVariants}>
            <Card className="p-[42px] group relative overflow-hidden transition-all duration-500 flex flex-col h-full bg-card/10 backdrop-blur-xl border border-border rounded-[34px] hover:border-primary/30 hover:bg-card/20 shadow-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] group-hover:bg-primary/10 transition-all duration-500" />
              
              <div className="mb-[26px] p-4 bg-background border border-border w-fit rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-sm text-primary">
                <PenTool size={26} />
              </div>
              
              <h3 className="text-2xl font-bold tracking-tight mb-[13px] text-foreground group-hover:text-primary transition-colors">
                Alat Bantu Kana Interaktif
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed flex-1 font-medium mb-6">
                Kuasai sistem penulisan Hiragana & Katakana melalui matriks kana interaktif, panduan langkah-demi-langkah urutan guratan (Stroke Order), serta kanvas latihan menulis langsung di layar gadget Anda.
              </p>

              {/* Visual Mockup inside Card */}
              <div className="p-4 bg-background/40 border border-border rounded-2xl flex items-center justify-between gap-4 glass mt-auto">
                <div className="w-14 h-14 border-2 border-dashed border-primary/30 bg-background/80 rounded-xl flex items-center justify-center relative font-japanese font-bold text-2xl text-primary shadow-inner">
                  あ
                  <div className="absolute text-[8px] font-bold text-primary/50 top-1 left-1">1</div>
                  <div className="absolute text-[7px] font-bold text-muted-foreground/60 bottom-1 right-1">N5</div>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-foreground">Hiragana "A" (Guratan 1/3)</span>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full w-[33%]" />
                  </div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Arah guratan: Melengkung ke kanan</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* CARD 2: RICH DATABASE (VOCAB & GRAMMAR) */}
          <motion.div variants={itemVariants}>
            <Card className="p-[42px] group relative overflow-hidden transition-all duration-500 flex flex-col h-full bg-card/10 backdrop-blur-xl border border-border rounded-[34px] hover:border-secondary/30 hover:bg-card/20 shadow-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-[40px] group-hover:bg-secondary/10 transition-all duration-500" />
              
              <div className="mb-[26px] p-4 bg-background border border-border w-fit rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-sm text-secondary">
                <Library size={26} />
              </div>
              
              <h3 className="text-2xl font-bold tracking-tight mb-[13px] text-foreground group-hover:text-secondary transition-colors">
                Perpustakaan Kosakata, Kanji & Tata Bahasa
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed flex-1 font-medium mb-6">
                Akses ribuan kosakata terstruktur, kamus Kanji komprehensif, dan pustaka rumus tata bahasa praktis. Semuanya dilengkapi dengan sistem audio pengucapan penutur asli dan fungsionalitas furigana cerdas.
              </p>

              {/* Visual Mockup inside Card */}
              <div className="p-4 bg-background/40 border border-border rounded-2xl flex flex-col gap-2 glass mt-auto">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">Kosakata Utama</span>
                  <span className="text-[9px] font-extrabold bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded-full">N5</span>
                </div>
                <div className="flex flex-col">
                  <ruby className="text-xl font-bold font-japanese tracking-wider text-foreground">
                    日本語 <rt className="text-[0.55em] font-normal text-muted-foreground">にほんご</rt>
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
          </motion.div>

          {/* CARD 3: FLASHCARDS WITH SRS */}
          <motion.div variants={itemVariants}>
            <Card className="p-[42px] group relative overflow-hidden transition-all duration-500 flex flex-col h-full bg-card/10 backdrop-blur-xl border border-border rounded-[34px] hover:border-primary/30 hover:bg-card/20 shadow-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] group-hover:bg-primary/10 transition-all duration-500" />
              
              <div className="mb-[26px] p-4 bg-background border border-border w-fit rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-sm text-primary">
                <BrainCircuit size={26} />
              </div>
              
              <h3 className="text-2xl font-bold tracking-tight mb-[13px] text-foreground group-hover:text-primary transition-colors">
                Flashcard Cerdas & Pengulangan Terjadwal
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed flex-1 font-medium mb-6">
                Latih daya ingat Anda secara optimal. Sistem pengulangan cerdas kami secara otomatis menghitung dan menjadwalkan ulang kartu flashcard kosa kata yang perlu di-review persis sebelum Anda melupakannya.
              </p>

              {/* Visual Mockup inside Card */}
              <div className="p-4 bg-background/40 border border-border rounded-2xl flex items-center gap-3.5 glass mt-auto">
                <div className="relative w-11 h-14 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-lg flex items-center justify-center font-bold text-xl shadow-[0_4px_12px_rgba(var(--primary-rgb),0.3)] shrink-0">
                  猫
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-success rounded-full border border-background animate-pulse" />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-foreground">猫 (Neko) — Kucing</span>
                  <span className="text-[9px] text-muted-foreground flex items-center gap-1.5 font-bold">
                    <span className="w-1.5 h-1.5 bg-success rounded-full" /> Interval: 3 Hari Lagi (Kotak 4)
                  </span>
                  <div className="w-full bg-muted h-1 rounded-full overflow-hidden mt-1">
                    <div className="bg-success h-full w-[80%]" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* CARD 4: JLPT EXAM SIMULATION */}
          <motion.div variants={itemVariants}>
            <Card className="p-[42px] group relative overflow-hidden transition-all duration-500 flex flex-col h-full bg-card/10 backdrop-blur-xl border border-border rounded-[34px] hover:border-secondary/30 hover:bg-card/20 shadow-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-[40px] group-hover:bg-secondary/10 transition-all duration-500" />
              
              <div className="mb-[26px] p-4 bg-background border border-border w-fit rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-sm text-secondary">
                <Zap size={26} />
              </div>
              
              <h3 className="text-2xl font-bold tracking-tight mb-[13px] text-foreground group-hover:text-secondary transition-colors">
                Simulasi Ujian JLPT Real-Time
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed flex-1 font-medium mb-6">
                Uji kesiapan kelulusan Anda dengan simulasi ujian JLPT interaktif. Lengkap dengan sistem timer mundur yang presisi, pembagian sesi materi ujian, lembar jawaban digital, dan laporan hasil kelulusan yang rinci.
              </p>

              {/* Visual Mockup inside Card */}
              <div className="p-4 bg-background/40 border border-border rounded-2xl flex flex-col gap-2 glass mt-auto">
                <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground">
                  <span className="flex items-center gap-1"><Timer size={10} className="text-secondary" /> Ujian JLPT N3: Sesi Choukai</span>
                  <span className="text-destructive font-mono font-bold animate-pulse">00:42:15</span>
                </div>
                <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full w-[70%]" />
                </div>
                <div className="flex justify-between gap-1.5 mt-0.5">
                  {[1, 2, 3, 4].map((num) => (
                    <div 
                      key={num} 
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] border transition-all duration-300 ${
                        num === 3 
                          ? "bg-secondary text-secondary-foreground border-secondary shadow-[0_2px_8px_rgba(var(--secondary-rgb),0.3)]" 
                          : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 2: SMART LEARNING JOURNEY */}
      <section className="relative">
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto mb-[65px]">
          <Badge className="bg-secondary/10 text-secondary border border-secondary/20 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            Alur Metode Belajar
          </Badge>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5">
            Langkah Cerdas <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">Menguasai Bahasa Jepang</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg font-medium leading-relaxed">
            Metode belajar terpadu yang memandu Anda dari langkah awal pengenalan aksara hingga mencapai fasih berbicara dan siap menaklukkan lembar ujian JLPT.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[55px] items-start">
          {/* STEP CONTROLS - LEFT COLUMN */}
          <div className="lg:col-span-5 flex flex-col gap-4 w-full">
            {learningSteps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`w-full text-left p-6 rounded-[24px] border transition-all duration-300 flex items-center justify-between gap-4 group relative overflow-hidden ${
                  activeStep === idx 
                    ? "bg-card border-primary/40 shadow-[0_10px_30px_rgba(var(--primary-rgb),0.05)] glass" 
                    : "bg-transparent border-border hover:border-foreground/10 hover:bg-card/5"
                }`}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base transition-all duration-300 ${
                    activeStep === idx 
                      ? "bg-primary text-primary-foreground shadow-[0_4px_12px_rgba(var(--primary-rgb),0.3)]" 
                      : "bg-muted text-muted-foreground"
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

          {/* ACTIVE STEP CONTENT DISPLAY - RIGHT COLUMN */}
          <div className="lg:col-span-7 h-full">
            <Card className="p-10 rounded-[34px] bg-card/10 backdrop-blur-xl border border-border shadow-none relative overflow-hidden min-h-[350px] flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="space-y-6 relative z-10">
                <Badge className="bg-primary/10 text-primary border border-primary/20 rounded-full font-bold uppercase tracking-widest text-[9px]">
                  {learningSteps[activeStep].badge}
                </Badge>
                
                <h3 className="text-3xl font-extrabold tracking-tight text-foreground">
                  {learningSteps[activeStep].title}
                </h3>
                
                <p className="text-muted-foreground text-base leading-relaxed font-medium">
                  {learningSteps[activeStep].desc}
                </p>

                <div className="p-4 bg-muted/30 border border-border rounded-2xl flex items-start gap-3">
                  <Sparkles size={16} className="text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                    <strong className="text-foreground">Tips Belajar:</strong> {learningSteps[activeStep].tip}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border/80 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-success" />
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Kurikulum Terstruktur</span>
                </div>
                <span className="text-xs font-bold text-primary flex items-center gap-1 group">
                  Optimalkan Sekarang 
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 3: LEARNING PROGRESS GAMIFICATION PREVIEW */}
      <section className="relative">
        <Card className="p-[55px] rounded-[42px] bg-card/10 backdrop-blur-xl border border-border shadow-none relative overflow-hidden group">
          {/* Glowing Accents */}
          <div className="absolute -top-32 -left-32 w-89 h-89 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-89 h-89 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* TEXT LEFT */}
            <div className="lg:col-span-6 space-y-6">
              <Badge className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest">
                Sistem Kemajuan Belajar
              </Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Tetap Konsisten dengan <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Sistem Belajar Interaktif</span>
              </h2>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed font-medium">
                NihongoRoute merancang fitur pelacakan konsistensi belajar harian (Streaks) dan poin pengalaman (XP) yang membuat rutinitas belajar bahasa Jepang Anda terasa seperti memainkan game petualangan yang menyenangkan.
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center text-success">
                    <Check size={16} />
                  </div>
                  <span className="text-xs font-bold text-foreground">Target Harian Jelas</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Target size={16} />
                  </div>
                  <span className="text-xs font-bold text-foreground">Lencana Prestasi</span>
                </div>
              </div>
            </div>

            {/* GAMIFICATION WIDGETS RIGHT */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* STREAK CARD */}
              <Card className="p-6 bg-background/50 border border-border/80 rounded-[28px] glass flex flex-col justify-between h-48">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Belajar Harian</span>
                  <Flame size={20} className="text-destructive fill-destructive animate-bounce" />
                </div>
                <div className="my-2">
                  <span className="text-4xl font-black text-foreground tracking-tight">7 HARI</span>
                  <p className="text-[10px] text-success font-bold mt-1 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-success rounded-full" /> Streak Aktif!
                  </p>
                </div>
                {/* Visual grid days */}
                <div className="flex justify-between gap-1 mt-2">
                  {["S", "S", "R", "K", "J", "S", "M"].map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${
                        idx < 5 
                          ? "bg-success text-success-foreground shadow-[0_2px_6px_rgba(var(--success-rgb),0.2)]" 
                          : idx === 5 
                          ? "bg-primary text-primary-foreground animate-pulse" 
                          : "bg-muted text-muted-foreground border border-border"
                      }`}>
                        {idx < 5 ? "✓" : day}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* XP LEVEL CARD */}
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

              {/* BADGES ROW */}
              <Card className="p-5 bg-background/50 border border-border/80 rounded-[28px] glass sm:col-span-2 flex items-center justify-between gap-4">
                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest shrink-0">Lencana Baru:</span>
                <div className="flex gap-3 overflow-x-auto py-1">
                  {[
                    { label: "Kana Master", color: "text-primary bg-primary/10 border-primary/20" },
                    { label: "SRS Warrior", color: "text-secondary bg-secondary/10 border-secondary/20" },
                    { label: "JLPT Challenger", color: "text-warning bg-warning/10 border-warning/20" }
                  ].map((badge, idx) => (
                    <Badge key={idx} className={`px-3 py-1 rounded-lg border font-bold text-[9px] whitespace-nowrap ${badge.color}`}>
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
