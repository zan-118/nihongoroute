/**
 * @file AboutView.tsx
 * @description Feature view component for the About Us page outlining mission, core pillars, and product values.
 */

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Sparkles, 
  WifiOff, 
  Brain, 
  Shield, 
  Heart, 
  ArrowRight, 
  BookOpen 
} from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const corePillars = [
  {
    icon: WifiOff,
    title: "Teknologi Offline-First",
    desc: "Akses materi kosakata, tata bahasa, dan simulasi ujian tanpa perlu khawatir kuota internet terputus di tengah jalan.",
    badge: "Bisa Offline",
  },
  {
    icon: Brain,
    title: "Algoritma Spaced Repetition (SRS)",
    desc: "Sistem pengulangan otomatis yang menjadwalkan kartu flashcard tepat saat memori Anda akan mulai lupa.",
    badge: "Hafalan Ilmiah",
  },
  {
    icon: Shield,
    title: "100% Gratis & Tanpa Iklan",
    desc: "Komitmen memberikan pendidikan bahasa Jepang yang setara dan bersih dari iklan banner yang mengganggu fokus.",
    badge: "Bebas Iklan",
  },
  {
    icon: Heart,
    title: "Dibuat Komunitas untuk Komunitas",
    desc: "Dirancang dan dikembangkan dengan penuh perhatian khusus untuk kebutuhan pejuang JLPT dan pembelajar bahasa Jepang di Indonesia.",
    badge: "Terbuka & Transparan",
  },
];

/**
 * AboutView component.
 * Renders the main visual layout for the About Us feature page.
 */
export default function AboutView() {
  return (
    <div className="app-page min-h-screen py-10 md:py-16">
      <div className="app-container-narrow mx-auto space-y-16">
        {/* Header Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <Badge variant="outline" className="bg-card border-border text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2">
            <Sparkles size={14} className="text-primary" />
            <span>Tentang NihongoRoute</span>
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Mewujudkan Akses Belajar Bahasa Jepang yang <span className="text-primary">Setara & Modern</span>.
          </h1>

          <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-normal text-balance">
            NihongoRoute lahir dari sebuah impian sederhana: menghadirkan tempat belajar bahasa Jepang yang cepat, nyaman, dan bisa diakses siapa saja tanpa terkendala biaya atau koneksi internet.
          </p>
        </div>

        {/* Brand Story Card */}
        <Card className="p-8 md:p-12 bg-card border border-border rounded-2xl relative overflow-hidden shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="relative size-32 md:size-44 shrink-0">
              <Image
                src="/logo-branding.svg"
                alt="NihongoRoute Logo"
                fill
                className="object-contain"
              />
            </div>

            <div className="space-y-4 text-left">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Filosofi Wabi-sabi & Fokus Tanpa Distraksi
              </h2>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Kami percaya bahwa belajar bahasa baru membutuhkan ketenangan dan konsistensi. Oleh karena itu, antarmuka NihongoRoute dirancang mengusung prinsip <strong className="text-foreground">Kanso (kesederhanaan)</strong> dan <strong className="text-foreground">Shibui (keindahan yang tenang)</strong>.
              </p>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Semua fitur — mulai dari tabel Kana, pengulang kosakata SRS, hingga simulasi JLPT — dibuat agar Anda bisa fokus 100% pada pemahaman materi.
              </p>
            </div>
          </div>
        </Card>

        {/* Core Pillars Grid */}
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Pilar Utama NihongoRoute
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Prinsip yang selalu kami pegang dalam membangun setiap fitur di aplikasi ini.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {corePillars.map((pillar) => (
              <Card key={pillar.title} className="p-6 md:p-8 bg-card border border-border rounded-2xl flex flex-col justify-between hover:border-primary/40 transition-colors">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl w-fit">
                      <pillar.icon size={24} />
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-extrabold uppercase tracking-wider">
                      {pillar.badge}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-bold text-foreground">
                    {pillar.title}
                  </h3>

                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <Card className="p-8 md:p-12 bg-primary/10 border border-primary/20 rounded-2xl text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Siap Memulai Perjalanan Belajarmu?
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            Tidak perlu mendaftar rumit. Kamu bisa langsung mencoba semua materi dan fitur latihan secara gratis.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8">
              <Link href="/dashboard" className="flex items-center gap-2">
                <span>Mulai Belajar Sekarang</span>
                <ArrowRight size={16} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full border-border">
              <Link href="/courses" className="flex items-center gap-2">
                <BookOpen size={16} />
                <span>Lihat Katalog Kursus</span>
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
