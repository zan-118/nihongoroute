/**
 * LOKASI FILE: app/page.tsx
 * DESKRIPSI:
 * Komponen Landing Page utama aplikasi NihongoRoute.
 * Halaman ini berfungsi untuk menarik perhatian pengguna baru, memperkenalkan
 * proposisi nilai (gratis, cerdas, terstruktur), dan mengarahkan mereka ke
 * fitur-fitur utama (Dashboard/Courses).
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  Library,
  LayoutDashboard,
  Sparkles,
  ArrowRight,
} from "lucide-react";

/**
 * KOMPONEN UTAMA LANDING PAGE
 */
export default function LandingPage() {
  /**
   * DATA FITUR UNGGULAN:
   * Mendefinisikan konten kartu fitur di bawah Hero Section.
   * Setiap fitur memiliki ikon, skema warna border/glow, dan deskripsi singkat.
   */
  const features = [
    {
      title: "Sistem Hafalan Pintar",
      desc: "Algoritma kami mengatur jadwal ulang kosakata secara otomatis, memastikannya menempel di otak permanen.",
      icon: <BrainCircuit size={28} className="text-cyan-400" />,
      color: "border-cyan-400/30 bg-cyan-400/5",
      glow: "group-hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]",
    },
    {
      title: "Koleksi Terpadu",
      desc: "Akses ratusan kosakata, mesin konjugasi kata kerja, dan panduan tata bahasa lengkap dalam satu tempat.",
      icon: <Library size={28} className="text-purple-400" />,
      color: "border-purple-500/30 bg-purple-500/5",
      glow: "group-hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]",
    },
    {
      title: "Belajar Terstruktur",
      desc: "Kumpulkan XP, naikkan level, dan selesaikan misi harian untuk menjaga konsistensi belajarmu.",
      icon: <LayoutDashboard size={28} className="text-emerald-400" />,
      color: "border-emerald-500/30 bg-emerald-500/5",
      glow: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]",
    },
  ];

  return (
    <main className="min-h-screen bg-cyber-bg text-[#c4cfde] selection:bg-cyan-400 selection:text-black overflow-x-hidden pt-24 pb-20">
      {/* DEKORASI VISUAL: Efek pendaran radial dan grid futuristik yang menempel di latar belakang */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#0a0c10] to-[#0a0c10] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        {/* HERO SECTION: Judul utama dan Call to Action (CTA) */}
        <section className="min-h-[75vh] flex flex-col items-center justify-center text-center pt-10 pb-16">
          {/* Badge Promo: Menekankan aspek 'Gratis' */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 shadow-inner"
          >
            <Sparkles size={14} className="text-cyan-400" />
            Platform Belajar 100% Gratis
          </motion.div>

          {/* Judul Utama dengan Gradasi Neon */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black uppercase italic tracking-tight leading-tight mb-6 md:mb-8 drop-shadow-2xl text-white"
          >
            Kuasai Bahasa <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Jepang
            </span>{" "}
            <br className="block sm:hidden" />
            Dengan Cerdas.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-xs sm:text-sm md:text-base max-w-2xl mx-auto mb-10 md:mb-12 leading-relaxed px-4"
          >
            Tinggalkan cara menghafal yang membosankan. NihongoRoute
            menggabungkan materi JLPT dengan algoritma memori modern dan
            gamifikasi untuk efektivitas belajar.
          </motion.p>

          {/* Tombol Navigasi Utama */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 w-full sm:w-auto px-4"
          >
            {/* CTA Primer: Masuk ke Dashboard Progres */}
            <Link
              href="/dashboard"
              className="group relative w-full sm:w-auto px-6 md:px-8 py-4 md:py-5 bg-cyan-400 rounded-[2rem] text-black font-black uppercase tracking-widest text-[10px] md:text-xs transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(34,211,238,0.4)] flex items-center justify-center gap-3"
            >
              Mulai Perjalananmu
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>

            {/* CTA Sekunder: Melihat Daftar Pelajaran */}
            <Link
              href="/courses"
              className="w-full sm:w-auto px-6 md:px-8 py-4 md:py-5 bg-cyber-surface border border-white/10 rounded-[2rem] text-white font-black uppercase tracking-widest text-[10px] md:text-xs transition-all hover:bg-white/5 hover:border-white/20 text-center"
            >
              Lihat Materi Belajar
            </Link>
          </motion.div>
        </section>

        {/* FEATURES SECTION: Penjelasan 3 pilar utama aplikasi */}
        <section className="py-16 md:py-20 border-t border-white/5">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tight text-white mb-4">
              Dibangun Untuk <span className="text-cyan-400">Progres</span>
            </h2>
            <p className="text-slate-400 text-xs md:text-sm max-w-xl mx-auto px-4">
              Semua alat pendukung yang kamu butuhkan untuk lulus JLPT ada di
              dalam satu genggaman.
            </p>
          </div>

          {/* Grid Kartu Fitur dengan efek Neumorphic Shadow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 px-4 md:px-0">
            {features.map((feature, idx) => (
              <motion.article
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.2 }}
                className={`group p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-cyber-surface border transition-all duration-300 hover:-translate-y-2 shadow-[15px_15px_30px_#0a0c10,-10px_-10px_20px_rgba(255,255,255,0.02)] ${feature.color} ${feature.glow}`}
              >
                {/* Ikon Fitur dengan efek hover Scale */}
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#0a0c10] border border-white/5 flex items-center justify-center mb-6 md:mb-8 shadow-inner group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tight mb-3 md:mb-4">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* FOOTER: Identitas merek dan Hak Cipta */}
        <footer className="mt-16 md:mt-20 pt-8 md:pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 text-center md:text-left mb-8 md:mb-0">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 shrink-0 drop-shadow-[0_0_8px_rgba(34,211,238,0.2)]">
              <Image
                src="/logo-branding.svg"
                alt="Logo NihongoRoute"
                fill
                className="object-contain rounded-md"
              />
            </div>
            <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest">
              © {new Date().getFullYear()} NihongoRoute
            </span>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
            Akses Terbuka. Berbasis Komunitas.
          </p>
        </footer>
      </div>
    </main>
  );
}
