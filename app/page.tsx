/**
 * @file page.tsx
 * @description Halaman landas (Landing Page) utama NihongoRoute.
 * Menyediakan informasi fitur, branding, dan akses cepat ke dashboard pembelajaran.
 * @module LandingPage
 */

"use client";

// ======================
// IMPORTS
// ======================
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import {
  BrainCircuit,
  Library,
  Zap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ======================
// MAIN EXECUTION
// ======================

/**
 * Komponen LandingPage: Merupakan wajah utama aplikasi dengan gaya visual Cyber-Dark.
 * Menggunakan framer-motion untuk animasi interaktif dan responsive layout.
 * 
 * @returns {JSX.Element} Elemen halaman landas.
 */
export default function LandingPage() {
  
  // ======================
  // BUSINESS LOGIC (Animation Config)
  // ======================
  
  /**
   * Variabel animasi untuk container fitur agar muncul secara berurutan.
   */
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  /**
   * Variabel animasi untuk masing-masing item kartu fitur.
   */
  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  // ======================
  // CONSTANTS / CONFIG
  // ======================


  return (
    <main className="bg-[#080a0f] text-[#c4cfde] selection:bg-cyan-400/30 overflow-x-hidden w-full relative">
      {/* BACKGROUND AMBIENT */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-32 md:pb-12">
        {/* HERO SECTION */}
        <section className="min-h-[75vh] flex flex-col items-center justify-center text-center mb-24">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8"
          >
            <Badge
              variant="outline"
              className="bg-cyan-400/10 border-cyan-400/20 px-4 py-2 rounded-xl flex items-center gap-2 neo-inset"
            >
              <Sparkles size={14} className="text-cyan-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">
                Next-Gen Learning Platform
              </span>
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl md:text-8xl lg:text-9xl font-black italic uppercase tracking-tighter leading-[0.9] text-white mb-8"
          >
            Kuasai <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              Bahasa Jepang.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-200 text-sm md:text-lg max-w-2xl mb-12 leading-relaxed italic"
          >
            Belajar bahasa Jepang jadi lebih seru dan mudah. Gratis, modern, 
            dan didesain khusus dengan metode sains kognitif untuk membantumu 
            mahir lebih cepat.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
          >
            <Button
              asChild
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black uppercase tracking-widest h-auto py-4 px-10 rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all group border-none"
            >
              <Link href="/dashboard">
                Mulai Belajar Sekarang{" "}
                <ArrowRight
                  size={18}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="h-auto py-4 px-10 neo-card hover:bg-white/5 transition-all text-white font-bold uppercase tracking-widest text-sm border-white/5 shadow-none"
            >
              <Link href="/courses">
                <PlayCircle size={18} className="mr-2 text-cyan-400" /> Jelajahi Materi
              </Link>
            </Button>
          </motion.div>
        </section>

        {/* FEATURES GRID */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-32"
        >
          {/* Feature 1 */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -12 }}
            className="h-full"
          >
            <Card className="p-8 md:p-12 group relative overflow-hidden transition-all duration-500 flex flex-col h-full bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3.5rem] border-white/10 hover:border-white/20 hover:bg-white/[0.02] shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_60px_rgba(34,211,238,0.1)]">
              <div className="absolute -top-6 -right-6 md:-top-10 md:-right-10 text-[10rem] md:text-[12rem] font-black italic text-white/[0.03] group-hover:text-cyan-400/[0.06] transition-all duration-700 pointer-events-none select-none">
                01
              </div>
              <div className={`absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
              <div className="mb-10 p-5 bg-white/5 border border-white/10 w-fit rounded-2xl md:rounded-3xl group-hover:scale-110 group-hover:bg-cyan-400 group-hover:text-black transition-all duration-500 shadow-inner text-cyan-400 group-hover:border-none relative z-10">
                <BrainCircuit size={28} />
              </div>
              <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter mb-6 relative z-10 transition-colors duration-500 text-cyan-400 group-hover:text-white">
                Hafal Tanpa Lupa
              </h3>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed flex-1 italic font-bold group-hover:text-slate-200 transition-colors duration-500 relative z-10">
                Gunakan algoritma cerdas untuk mengunci kosakata dalam ingatan jangka panjangmu secara otomatis.
              </p>
            </Card>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -12 }}
            className="h-full"
          >
            <Card className="p-8 md:p-12 group relative overflow-hidden transition-all duration-500 flex flex-col h-full bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3.5rem] border-white/10 hover:border-white/20 hover:bg-white/[0.02] shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_60px_rgba(34,211,238,0.1)]">
              <div className="absolute -top-6 -right-6 md:-top-10 md:-right-10 text-[10rem] md:text-[12rem] font-black italic text-white/[0.03] group-hover:text-purple-400/[0.06] transition-all duration-700 pointer-events-none select-none">
                02
              </div>
              <div className={`absolute inset-0 bg-gradient-to-br from-purple-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
              <div className="mb-10 p-5 bg-white/5 border border-white/10 w-fit rounded-2xl md:rounded-3xl group-hover:scale-110 group-hover:bg-purple-400 group-hover:text-black transition-all duration-500 shadow-inner text-purple-400 group-hover:border-none relative z-10">
                <Library size={28} />
              </div>
              <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter mb-6 relative z-10 transition-colors duration-500 text-purple-400 group-hover:text-white">
                Pustaka Lengkap
              </h3>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed flex-1 italic font-bold group-hover:text-slate-200 transition-colors duration-500 relative z-10">
                Akses ribuan tata bahasa, matriks kata kerja, dan kamus praktis dalam satu genggaman.
              </p>
            </Card>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -12 }}
            className="h-full"
          >
            <Card className="p-8 md:p-12 group relative overflow-hidden transition-all duration-500 flex flex-col h-full bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3.5rem] border-white/10 hover:border-white/20 hover:bg-white/[0.02] shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_60px_rgba(34,211,238,0.1)]">
              <div className="absolute -top-6 -right-6 md:-top-10 md:-right-10 text-[10rem] md:text-[12rem] font-black italic text-white/[0.03] group-hover:text-amber-400/[0.06] transition-all duration-700 pointer-events-none select-none">
                03
              </div>
              <div className={`absolute inset-0 bg-gradient-to-br from-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
              <div className="mb-10 p-5 bg-white/5 border border-white/10 w-fit rounded-2xl md:rounded-3xl group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-black transition-all duration-500 shadow-inner text-amber-400 group-hover:border-none relative z-10">
                <Zap size={28} />
              </div>
              <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter mb-6 relative z-10 transition-colors duration-500 text-amber-400 group-hover:text-white">
                Siap Ujian JLPT
              </h3>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed flex-1 italic font-bold group-hover:text-slate-200 transition-colors duration-500 relative z-10">
                Latih kesiapanmu dengan simulasi ujian waktu nyata yang akurat untuk target kelulusanmu.
              </p>
            </Card>
          </motion.div>
        </motion.section>

        {/* TRUST BANNER */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full"
        >
          <Card className="p-10 md:p-16 rounded-[3rem] md:rounded-[5rem] flex flex-col lg:flex-row items-center justify-between gap-12 bg-slate-900/40 backdrop-blur-2xl border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white/5 border border-white/10 flex items-center justify-center rounded-3xl shrink-0 group-hover:scale-110 group-hover:border-cyan-400/40 transition-all duration-700 shadow-2xl">
                <ShieldCheck size={48} className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
              </div>
              <div className="text-center md:text-left">
                <h4 className="text-white font-black uppercase italic text-2xl md:text-4xl tracking-tighter mb-2">
                  Sepenuhnya <span className="text-cyan-400">Gratis Untukmu</span>
                </h4>
                <p className="text-slate-400 text-sm md:text-lg font-bold italic opacity-80 group-hover:opacity-100 transition-opacity">
                  Dibuat dengan sepenuh hati untuk membantu siapa saja yang ingin belajar 
                  bahasa Jepang tanpa harus terhalang biaya.
                </p>
              </div>
            </div>
            <Button
              asChild
              variant="link"
              className="text-cyan-400 font-black uppercase tracking-[0.4em] text-xs md:text-sm flex items-center gap-3 hover:gap-6 transition-all whitespace-nowrap shrink-0 group hover:no-underline relative z-10"
            >
              <Link href="/support">
                Kontribusi Project <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </Button>
          </Card>
        </motion.section>

        {/* FOOTER */}
        <footer className="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="relative w-10 h-10 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
              <Image
                src="/logo-branding.svg"
                alt="NihongoRoute"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black italic uppercase tracking-widest">
                Nihongo<span className="text-cyan-400">Route</span>
              </span>
              <span className="text-[8px] text-slate-600 font-bold uppercase tracking-[0.4em]">
                Digital Learning Ecosystem © {new Date().getFullYear()}
              </span>
            </div>
          </div>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-300">
            <Link
              href="/library"
              className="hover:text-cyan-400 transition-colors"
            >
              Library
            </Link>
            <Link
              href="/review"
              className="hover:text-cyan-400 transition-colors"
            >
              Review
            </Link>
            <a
              href="https://github.com/zan-118"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors"
            >
              GitHub
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}

