/**
 * @file FeatureGrid.tsx
 * @description Landing page feature showcase component designed following Kanso minimalist principles.
 * Typography-first presentation with zero decorative icon clutter.
 */

import React from "react";
import { ArrowRight, BookOpen, GraduationCap } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JlptQuizPlayground } from "./JlptQuizPlayground";

/**
 * FeatureGrid component.
 * Pure Server Component for instant static rendering.
 */
export function FeatureGrid() {
  const learningSteps = [
    {
      step: "01",
      title: "Kenali Huruf (Kana)",
      desc: "Mulai dari Hiragana & Katakana lewat tabel interaktif dan panduan guratan langkah demi langkah.",
      badge: "Langkah Pertama",
    },
    {
      step: "02",
      title: "Perkaya Kosakata & Pelajaran",
      desc: "Ribuan kosakata dan tata bahasa JLPT, lengkap dengan pelafalan audio dan furigana opsional.",
      badge: "Materi Terpadu",
    },
    {
      step: "03",
      title: "Pengulangan Terjadwal",
      desc: "Sistem Spaced Repetition (SRS) otomatis menjadwalkan kosakata tepat sebelum kamu lupa.",
      badge: "Hafal Permanen",
    },
    {
      step: "04",
      title: "Uji dengan Simulasi JLPT",
      desc: "Ukur kesiapan ujian lewat simulasi JLPT CBT dengan timer, skor akurat, dan statistik pembahasan.",
      badge: "Siap Ujian",
    },
  ];

  return (
    <div className="w-full space-y-24 mb-24">
      {/* SEKSI 1: SHOWCASE FITUR UTAMA */}
      <section className="relative">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="outline" className="bg-card/80 border border-border/80 text-muted-foreground px-3.5 py-1 rounded-full text-xs font-medium tracking-wide mb-3">
            Ekosistem Pembelajaran
          </Badge>
          <h2 className="text-3xl md:text-4xl tracking-tight mb-4 font-bold text-foreground">
            Apa Saja yang <span className="text-primary">Bisa Kamu Pelajari?</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            Semua yang kamu butuhkan untuk melangkah dari nol hingga mahir dalam satu platform tenang dan cepat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* KARTU 1: ALAT BANTU KANA */}
          <Card className="p-7 flex flex-col justify-between bg-card border border-border/70 rounded-2xl transition-all duration-300 hover:border-primary/40">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
                01. Huruf & Guratan
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-3 text-foreground">
                Alat Bantu Kana Interaktif
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-normal">
                Kuasai Hiragana & Katakana lewat tabel interaktif, urutan guratan, dan latihan menulis di layar.
              </p>
            </div>

            <div className="p-4 bg-background/60 border border-border/80 rounded-xl flex items-center gap-4">
              <div className="size-12 border border-border/80 bg-card rounded-lg flex items-center justify-center font-japanese font-bold text-2xl text-primary shadow-none shrink-0">
                あ
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-xs font-semibold text-foreground">Hiragana "A" (Guratan 1/3)</span>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border/40">
                  <div className="h-full bg-primary rounded-full w-[33%]" />
                </div>
                <span className="text-[10px] text-muted-foreground">Melengkung halus ke kanan</span>
              </div>
            </div>
          </Card>

          {/* KARTU 2: PERPUSTAKAAN KOSAKATA & TATA BAHASA */}
          <Card className="p-7 flex flex-col justify-between bg-card border border-border/70 rounded-2xl transition-all duration-300 hover:border-primary/40">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
                02. Leksikal & Tata Bahasa
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-3 text-foreground">
                Pustaka Kosakata, Kanji & Grammar
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-normal">
                Ribuan kosakata, kamus Kanji lengkap, dan pustaka tata bahasa dengan audio penutur asli.
              </p>
            </div>

            <div className="p-4 bg-background/60 border border-border/80 rounded-xl flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Kosakata Utama</span>
                <span className="text-muted-foreground font-medium">JLPT N5</span>
              </div>
              <ruby className="text-2xl font-bold font-japanese tracking-wider text-foreground">
                日本語 <rt className="text-xs text-muted-foreground">にほんご</rt>
              </ruby>
              <span className="text-xs text-muted-foreground">Nihongo — Bahasa Jepang</span>
            </div>
          </Card>

          {/* KARTU 3: FLASHCARD SRS */}
          <Card className="p-7 flex flex-col justify-between bg-card border border-border/70 rounded-2xl transition-all duration-300 hover:border-primary/40">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
                03. Algoritma Memori
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-3 text-foreground">
                Flashcard Cerdas & SRS
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-normal">
                Sistem Spaced Repetition otomatis menjadwalkan kartu kosakata tepat sebelum kamu mulai lupa.
              </p>
            </div>

            <div className="p-4 bg-background/60 border border-border/80 rounded-xl flex items-center gap-3.5">
              <div className="size-11 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-lg shrink-0">
                猫
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-xs font-semibold text-foreground">猫 (Neko) — Kucing</span>
                <span className="text-[11px] text-muted-foreground">Jadwal Pengulangan: 3 Hari Lagi</span>
              </div>
            </div>
          </Card>

          {/* KARTU 4: SIMULASI UJIAN JLPT */}
          <Card className="p-7 flex flex-col justify-between bg-card border border-border/70 rounded-2xl transition-all duration-300 hover:border-primary/40">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
                04. Evaluasi & Sertifikasi
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-3 text-foreground">
                Simulasi Ujian JLPT Real-Time
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-normal">
                Uji kemampuan lewat simulasi ujian JLPT CBT dengan timer resmi, evaluasi nilai, dan pembahasan.
              </p>
            </div>

            <div className="p-4 bg-background/60 border border-border/80 rounded-xl flex items-center justify-between text-xs font-medium">
              <div className="flex items-center gap-2">
                <GraduationCap size={16} className="text-primary" />
                <span className="text-foreground">Simulasi Ujian N3</span>
              </div>
              <span className="text-muted-foreground font-mono">Pilihan Ganda & Listening</span>
            </div>
          </Card>
        </div>
      </section>

      {/* SEKSI 2: ALUR METODE BELAJAR */}
      <section className="relative">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="outline" className="bg-card/80 border border-border/80 text-muted-foreground px-3.5 py-1 rounded-full text-xs font-medium tracking-wide mb-3">
            Alur Metode Belajar
          </Badge>
          <h2 className="text-3xl md:text-4xl tracking-tight mb-3 font-bold text-foreground">
            Cara Cerdas Menguasai Bahasa Jepang
          </h2>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            Empat langkah terstruktur dari awal hingga siap ujian.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 flex flex-col gap-3 w-full">
            {learningSteps.map((s) => (
              <div
                key={s.step}
                className="p-5 rounded-xl border border-border/70 bg-card flex items-center gap-4 text-left transition-colors hover:border-primary/40"
              >
                <div className="size-10 rounded-lg bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                  {s.step}
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-primary uppercase tracking-wider">{s.badge}</div>
                  <div className="text-sm font-bold text-foreground">{s.title}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-7">
            <Card className="p-6 md:p-8 bg-card border border-border/70 rounded-2xl space-y-6">
              <div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold uppercase tracking-wider mb-3">
                  Interaktif & Praktis
                </Badge>
                <h3 className="text-2xl font-bold tracking-tight text-foreground mb-2">
                  Pratinjau Simulasi JLPT
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Coba jawab pertanyaan singkat di bawah ini untuk melihat contoh format soal ujian JLPT.
                </p>
              </div>

              <div className="p-4 bg-background/50 border border-border/80 rounded-xl">
                <JlptQuizPlayground />
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}