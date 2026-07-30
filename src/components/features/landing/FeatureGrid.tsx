import React from "react";
import { 
  BrainCircuit, 
  Library, 
  Zap, 
  PenTool, 
  Award, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  GraduationCap, 
  ArrowRight, 
  Timer,
  Check,
  Target
} from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JlptQuizPlayground } from "./JlptQuizPlayground";

/**
 * FeatureGrid component.
 * Pure Server Component for instant static rendering.
 * Displays interactive learning ecosystem, steps, and gamification preview.
 */
export function FeatureGrid() {
  const learningSteps = [
    {
      title: "Langkah 1: Kenali Huruf (Kana)",
      desc: "Mulai dari sini: kuasai Hiragana & Katakana lewat tabel interaktif dan panduan menulis langkah demi langkah.",
      badge: "Langkah Pertama",
      tip: "Fondasi penting buat baca manga, artikel, dan soal ujian."
    },
    {
      title: "Langkah 2: Perkaya Kosakata & Pelajaran",
      desc: "Ribuan kosakata dan tata bahasa sesuai standar JLPT, lengkap dengan audio pelafalan dan contoh kalimat.",
      badge: "Materi Terpadu",
      tip: "Ada furigana yang bisa kamu nyalain atau matiin kapan aja."
    },
    {
      title: "Langkah 3: Pengulangan Terjadwal",
      desc: "Lupa metode hafalan lama. Sistem SRS kami otomatis ngatur kosakata yang perlu diulang pas sebelum kamu mulai lupa.",
      badge: "Hafal Tanpa Lupa",
      tip: "Bisa hemat waktu belajar sampai 60% dibanding cara catat biasa."
    },
    {
      title: "Langkah 4: Uji dengan Simulasi JLPT",
      desc: "Ukur kesiapanmu lewat simulasi ujian JLPT dengan timer, penilaian akurat, dan statistik hasil yang lengkap.",
      badge: "Siap Ujian",
      tip: "Tersedia dari N5 sampai N1, lengkap dengan pembahasan."
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[34px]">
          {/* KARTU 1: ALAT BANTU KANA INTERAKTIF */}
          <div className="relative group h-full">
            <div className="absolute -top-[6px] -right-[6px] w-[14px] h-[14px] pointer-events-none z-20">
              <div className="absolute top-0 right-0 w-[14px] h-[1px] bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
              <div className="absolute top-0 right-0 w-[1px] h-[14px] bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
            </div>

            <Card className="p-6 sm:p-8 md:p-10 group relative overflow-hidden flex flex-col h-full bg-card border border-border/50 dark:border-white/10 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.015)] group-hover:border-primary/45 transition-colors duration-500">
              <div className="absolute inset-0 bg-seigaiha pointer-events-none opacity-[0.2] transition-opacity group-hover:opacity-30" />
              
              <div className="mb-[26px] p-4 bg-background border border-border/80 w-fit rounded-lg group-hover:scale-105 transition-transform duration-500 text-primary">
                <PenTool size={26} />
              </div>
              
              <h3 className="text-2xl tracking-tight mb-[13px] text-foreground group-hover:text-primary transition-colors font-bold">
                Alat Bantu Kana Interaktif
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed flex-1 font-semibold mb-6">
                Kuasai Hiragana & Katakana lewat tabel interaktif, panduan urutan guratan, dan latihan menulis langsung di layarmu.
              </p>
 
              <div className="p-4 bg-background/50 border border-border/80 rounded-lg flex items-center justify-between gap-4 mt-auto transition-all duration-300 group-hover:border-primary/20">
                <div className="size-14 border border-border/80 bg-background/80 rounded-lg flex items-center justify-center relative font-japanese font-bold text-2xl text-primary shadow-sm transition-transform group-hover:scale-105">
                  あ
                  <div className="absolute text-[8px] font-bold text-primary/50 top-1 left-1">1</div>
                  <div className="absolute text-[7px] font-bold text-muted-foreground/60 bottom-1 right-1">N5</div>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-foreground">Hiragana "A" (Guratan 1/3)</span>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden relative border border-border/40">
                    <div className="h-full bg-primary rounded-full w-[33%]" />
                  </div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Arah guratan: Melengkung ke kanan</span>
                </div>
              </div>
            </Card>
          </div>
 
          {/* KARTU 2: DATABASE PERPUSTAKAAN KOSAKATA & TATA BAHASA */}
          <div className="relative group h-full">
            <div className="absolute -top-[6px] -right-[6px] w-[14px] h-[14px] pointer-events-none z-20">
              <div className="absolute top-0 right-0 w-[14px] h-[1px] bg-secondary/20 group-hover:bg-secondary transition-colors duration-500" />
              <div className="absolute top-0 right-0 w-[1px] h-[14px] bg-secondary/20 group-hover:bg-secondary transition-colors duration-500" />
            </div>

            <Card className="p-6 sm:p-8 md:p-10 group relative overflow-hidden flex flex-col h-full bg-card border border-border/50 dark:border-white/10 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.015)] group-hover:border-secondary/45 transition-colors duration-500">
              <div className="absolute inset-0 bg-asanoha pointer-events-none opacity-[0.2] transition-opacity group-hover:opacity-30" />
              
              <div className="mb-[26px] p-4 bg-background border border-border/80 w-fit rounded-lg group-hover:scale-105 transition-transform duration-500 text-secondary">
                <Library size={26} />
              </div>
              
              <h3 className="text-2xl tracking-tight mb-[13px] text-foreground group-hover:text-secondary transition-colors font-bold">
                Perpustakaan Kosakata, Kanji & Tata Bahasa
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed flex-1 font-semibold mb-4">
                Ribuan kosakata, kamus Kanji lengkap, dan pustaka tata bahasa praktis — semuanya dengan audio penutur asli dan furigana otomatis.
              </p>

              <div className="flex gap-2 flex-wrap mb-6">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-[4px]">
                  22K+ Kosakata
                </Badge>
                <Badge variant="outline" className="bg-secondary/5 text-secondary border-secondary/20 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-[4px]">
                  13K+ Kanji
                </Badge>
                <Badge variant="outline" className="bg-success/5 text-success border-success/20 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-[4px]">
                  800+ Tata Bahasa
                </Badge>
              </div>
 
              <div className="p-4 bg-background/50 border border-border/80 rounded-lg flex flex-col gap-2 mt-auto transition-all duration-300 group-hover:border-secondary/20">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 border border-primary/25 px-2 py-0.5 rounded-[4px]">Kosakata Utama</span>
                  <span className="text-[9px] font-extrabold bg-secondary/10 text-secondary border border-secondary/25 px-2 py-0.5 rounded-[4px]">N5</span>
                </div>
                <div className="flex flex-col transition-transform group-hover:translate-x-1 duration-300">
                  <ruby className="text-xl font-bold font-japanese tracking-wider text-foreground">
                    日本語 <rt className="text-[0.55em] font-bold text-muted-foreground transition-colors group-hover:text-primary">にほんご</rt>
                  </ruby>
                  <span className="text-[11px] text-muted-foreground font-semibold mt-0.5">Nihongo — Bahasa Jepang</span>
                </div>
                <div className="h-px bg-border/40" />
                <div className="text-[9px] text-muted-foreground leading-relaxed">
                  <strong>Contoh:</strong> 日本語 diucapkan Ni-hon-go.<br />
                  <span className="opacity-80">Saya belajar bahasa Jepang setiap hari.</span>
                </div>
              </div>
            </Card>
          </div>
 
          {/* KARTU 3: FLASHCARDS DENGAN SYSTEM SRS */}
          <div className="relative group h-full">
            <div className="absolute -top-[6px] -right-[6px] w-[14px] h-[14px] pointer-events-none z-20">
              <div className="absolute top-0 right-0 w-[14px] h-[1px] bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
              <div className="absolute top-0 right-0 w-[1px] h-[14px] bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
            </div>

            <Card className="p-6 sm:p-8 md:p-10 group relative overflow-hidden flex flex-col h-full bg-card border border-border/50 dark:border-white/10 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.015)] group-hover:border-primary/45 transition-colors duration-500">
              <div className="absolute inset-0 bg-seigaiha pointer-events-none opacity-[0.2] transition-opacity group-hover:opacity-30" />
              
              <div className="mb-[26px] p-4 bg-background border border-border/80 w-fit rounded-lg group-hover:scale-105 transition-transform duration-500 text-primary">
                <BrainCircuit size={26} />
              </div>
              
              <h3 className="text-2xl tracking-tight mb-[13px] text-foreground group-hover:text-primary transition-colors font-bold">
                Flashcard Cerdas & Pengulangan Terjadwal
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed flex-1 font-semibold mb-6">
                Latih ingatanmu dengan cara paling efektif. Sistem SRS otomatis jadwalkan kartu flashcard yang perlu diulang tepat sebelum kamu lupa.
              </p>
 
              <div className="p-4 bg-background/50 border border-border/80 rounded-lg flex items-center gap-3.5 mt-auto transition-all duration-300 group-hover:border-primary/20">
                <div className="relative w-11 h-14 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-lg flex items-center justify-center font-bold text-xl shadow-sm shrink-0 transition-transform group-hover:scale-105">
                  猫
                  <div className="absolute -top-1 -right-1 size-2.5 bg-success rounded-full border border-background animate-pulse" />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-foreground">猫 (Neko) — Kucing</span>
                  <span className="text-[9px] text-muted-foreground flex items-center gap-1.5 font-bold">
                    <span className="size-1.5 bg-success rounded-full" /> Interval: 3 Hari Lagi (Kotak 4)
                  </span>
                  <div className="w-full bg-muted h-1 rounded-full overflow-hidden mt-1 relative border border-border/40">
                    <div className="bg-success h-full w-[80%]" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
 
          {/* KARTU 4: SIMULASI UJIAN JLPT REAL-TIME */}
          <div className="relative group h-full">
            <div className="absolute -top-[6px] -right-[6px] w-[14px] h-[14px] pointer-events-none z-20">
              <div className="absolute top-0 right-0 w-[14px] h-[1px] bg-secondary/20 group-hover:bg-secondary transition-colors duration-500" />
              <div className="absolute top-0 right-0 w-[1px] h-[14px] bg-secondary/20 group-hover:bg-secondary transition-colors duration-500" />
            </div>

            <Card className="p-6 sm:p-8 md:p-10 group relative overflow-hidden flex flex-col h-full bg-card border border-border/50 dark:border-white/10 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.015)] group-hover:border-secondary/45 transition-colors duration-500">
              <div className="absolute inset-0 bg-asanoha pointer-events-none opacity-[0.2] transition-opacity group-hover:opacity-30" />
              
              <div className="mb-[26px] p-4 bg-background border border-border/80 w-fit rounded-lg group-hover:scale-105 transition-transform duration-500 text-secondary">
                <Zap size={26} />
              </div>
              
              <h3 className="text-2xl tracking-tight mb-[13px] text-foreground group-hover:text-secondary transition-colors font-bold">
                Simulasi Ujian JLPT Real-Time
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed flex-1 font-semibold mb-6">
                Uji kesiapanmu dengan simulasi ujian JLPT — lengkap dengan timer, sesi ujian terpisah, dan laporan hasil yang detail.
              </p>
 
              <div className="p-4 bg-background/50 border border-border/80 rounded-lg flex flex-col gap-2 mt-auto transition-all duration-300 group-hover:border-secondary/20">
                <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground">
                  <span className="flex items-center gap-1"><Timer size={10} className="text-secondary" /> Ujian JLPT N3: Sesi Choukai</span>
                  <span className="text-destructive font-mono font-bold animate-pulse">00:42:15</span>
                </div>
                <div className="w-full bg-muted h-1 rounded-full overflow-hidden relative border border-border/40">
                  <div className="bg-secondary h-full w-[70%]" />
                </div>
                <div className="flex justify-between gap-1.5 mt-0.5">
                  {[1, 2, 3, 4].map((num) => (
                    <div 
                      key={num} 
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] border transition-all duration-300 ${
                        num === 3 
                          ? "bg-secondary text-secondary-foreground border-secondary shadow-sm" 
                          : "border-border/80 bg-background text-muted-foreground hover:border-secondary/30"
                      }`}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* SEKSI 2: LANGKAH PERJALANAN BELAJAR TERPADU */}
      <section className="relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-secondary/5 rounded-full blur-[65px] pointer-events-none ambient-glow will-change-transform" />

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
          <div className="lg:col-span-5 flex flex-col gap-4 w-full">
            {learningSteps.map((step, idx) => (
              <div
                key={step.title}
                className="w-full text-left p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 group relative overflow-hidden bg-card border-border/80 hover:border-primary/40"
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base bg-primary text-slate-950 dark:text-primary-foreground shadow-[0_4px_12px_rgb(var(--primary-rgb)_/_0.3)]">
                    0{idx + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                      {step.badge}
                    </span>
                    <span className="text-base font-bold text-foreground">
                      {step.title.split(": ")[1]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-7 relative group h-full">
            <div className="absolute -top-[6px] -right-[6px] w-[14px] h-[14px] pointer-events-none z-20">
              <div className="absolute top-0 right-0 w-[14px] h-[1px] bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
              <div className="absolute top-0 right-0 w-[1px] h-[14px] bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
            </div>

            <Card className="p-6 sm:p-8 md:p-10 bg-card border border-border/50 dark:border-white/10 rounded-2xl relative overflow-hidden min-h-[350px] flex flex-col justify-between shadow-[0_4px_25px_rgba(0,0,0,0.015)] group-hover:border-primary/45 transition-colors duration-500">
              
              <div className="space-y-6 relative z-10">
                <Badge className="bg-primary/10 text-primary border border-primary/20 rounded-[4px] font-bold uppercase tracking-widest text-[9px]">
                  Siap Ujian
                </Badge>
                
                <h3 className="text-3xl tracking-tight text-foreground font-bold">
                  Langkah 4: Uji dengan Simulasi JLPT
                </h3>
                
                <p className="text-muted-foreground text-base leading-relaxed font-semibold">
                  Ukur kesiapanmu lewat simulasi ujian JLPT dengan timer, penilaian akurat, dan statistik hasil yang lengkap.
                </p>

                <div className="p-4 bg-muted/30 border border-border/60 rounded-lg flex items-start gap-3">
                  <Sparkles size={16} className="text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                    <strong className="text-foreground">Tips Belajar:</strong> Tersedia dari N5 sampai N1, lengkap dengan pembahasan.
                  </p>
                </div>

                <div className="p-4 bg-background/50 border border-border/80 rounded-lg transition-all duration-500">
                  <JlptQuizPlayground />
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
        <div className="relative group">
          <div className="absolute -top-[6px] -right-[6px] w-[14px] h-[14px] pointer-events-none z-20">
            <div className="absolute top-0 right-0 w-[14px] h-[1px] bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
            <div className="absolute top-0 right-0 w-[1px] h-[14px] bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
          </div>

          <Card className="p-6 sm:p-10 md:p-[42px] lg:p-[55px] bg-card border border-border/50 dark:border-white/10 rounded-2xl relative overflow-hidden group shadow-[0_4px_25px_rgba(0,0,0,0.015)] group-hover:border-primary/45 transition-colors duration-500">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              <div className="lg:col-span-6 space-y-6">
                <Badge className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-[4px] text-[9px] font-bold uppercase tracking-widest">
                  Sistem Kemajuan Belajar
                </Badge>
                <h2 className="text-3xl md:text-4xl tracking-tight font-bold">
                  Tetap Konsisten dengan <br />
                  <span className="brand-text-gradient">Sistem Belajar Interaktif</span>
                </h2>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed font-semibold">
                  Streak harian dan poin XP bikin rutinitas belajar bahasa Jepangmu terasa kayak main game yang seru.
                </p>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-[4px] bg-success/10 border border-success/20 flex items-center justify-center text-success">
                      <Check size={16} />
                    </div>
                    <span className="text-xs font-bold text-foreground">Target Harian Jelas</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-[4px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <Target size={16} />
                    </div>
                    <span className="text-xs font-bold text-foreground">Lencana Prestasi</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Card className="p-5 bg-card border border-border/60 dark:border-white/10 rounded-lg flex flex-col justify-between h-44 shadow-sm hover:border-primary/30 transition-colors duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Belajar Harian</span>
                    <Flame size={20} className="text-destructive fill-destructive animate-pulse" />
                  </div>
                  <div className="my-2">
                    <span className="text-4xl font-black text-foreground tracking-tight">7 HARI</span>
                    <p className="text-[10px] text-success font-bold mt-1 uppercase tracking-wider flex items-center gap-1">
                      <span className="size-1.5 bg-success rounded-full" /> Streak Murni!
                    </p>
                  </div>
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

                <Card className="p-5 bg-card border border-border/60 dark:border-white/10 rounded-lg flex flex-col justify-between h-44 shadow-sm hover:border-primary/30 transition-colors duration-300">
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
                      <span>1.850 / 2.000 XP</span>
                      <span>92%</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden border border-border/40">
                      <div className="bg-gradient-to-r from-secondary to-primary h-full w-[92%]" />
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-card border border-border/60 dark:border-white/10 rounded-lg flex items-center justify-between gap-4 shadow-sm hover:border-primary/30 transition-colors duration-300 sm:col-span-2">
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest shrink-0">Lencana Baru:</span>
                  <div className="flex gap-3 overflow-x-auto py-1">
                    {[
                      { label: "Kana Master", color: "text-primary bg-primary/10 border-primary/20" },
                      { label: "SRS Warrior", color: "text-secondary bg-secondary/10 border-secondary/20" },
                      { label: "JLPT Challenger", color: "text-warning bg-warning/10 border-warning/20" }
                    ].map((badge) => (
                      <Badge key={badge.label} className={`px-3 py-1 rounded-[4px] border font-bold text-[9px] whitespace-nowrap ${badge.color}`}>
                        <GraduationCap size={10} className="mr-1.5 shrink-0" />
                        {badge.label}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}