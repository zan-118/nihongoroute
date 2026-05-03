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

  return (
    <main className="bg-background text-foreground selection:bg-cyan-400/30 overflow-x-hidden w-full relative transition-colors duration-300">
      {/* BACKGROUND AMBIENT */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[100px]" />
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
              className="bg-cyan-400/10 border-cyan-400/20 px-4 py-2 rounded-xl flex items-center gap-2 shadow-none"
            >
              <Sparkles size={14} className="text-cyan-600 dark:text-cyan-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
                Next-Gen Learning Platform
              </span>
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-foreground mb-8"
          >
            Kuasai <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500 drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              Bahasa Jepang.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground text-sm md:text-lg max-w-2xl mb-12 leading-relaxed font-medium"
          >
            Belajar bahasa Jepang jadi lebih seru dan mudah. Gratis, modern, 
            dan didesain khusus untuk membantumu mahir lebih cepat.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
          >
            <Button
              asChild
              className="bg-primary hover:bg-foreground text-primary-foreground font-black uppercase tracking-widest h-auto py-4 px-10 rounded-xl shadow-xl transition-all group border-none"
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
              className="h-auto py-4 px-10 bg-muted border border-border hover:bg-background transition-all text-foreground font-bold uppercase tracking-widest text-xs md:text-xs shadow-none rounded-xl"
            >
              <Link href="/courses">
                <PlayCircle size={18} className="mr-2 text-primary" /> Jelajahi Materi
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
            className="h-full"
          >
            <Card className="p-6 md:p-8 group relative overflow-hidden transition-all duration-300 flex flex-col h-full bg-card border border-border rounded-2xl hover:border-primary/40 hover:bg-primary/[0.02] shadow-lg">
              <div className="mb-8 p-4 bg-muted border border-border w-fit rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-inner text-primary group-hover:border-none relative z-10">
                <BrainCircuit size={24} />
              </div>
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-4 relative z-10 transition-colors duration-300 text-foreground group-hover:text-primary">
                Hafal Tanpa Lupa
              </h3>
              <p className="text-muted-foreground text-xs md:text-sm leading-relaxed flex-1 font-medium group-hover:text-foreground transition-colors duration-300 relative z-10">
                Gunakan algoritma cerdas untuk mengunci kosakata dalam ingatan jangka panjangmu secara otomatis.
              </p>
            </Card>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            variants={itemVariants}
            className="h-full"
          >
            <Card className="p-6 md:p-8 group relative overflow-hidden transition-all duration-300 flex flex-col h-full bg-card rounded-2xl border border-border hover:border-purple-500/40 hover:bg-purple-500/[0.02] shadow-lg">
              <div className="mb-8 p-4 bg-muted border border-border w-fit rounded-xl group-hover:bg-purple-600 dark:group-hover:bg-purple-500 group-hover:text-primary-foreground transition-all duration-300 shadow-inner text-purple-600 dark:text-purple-400 group-hover:border-none relative z-10">
                <Library size={24} />
              </div>
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-4 relative z-10 transition-colors duration-300 text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400">
                Pustaka Lengkap
              </h3>
              <p className="text-muted-foreground text-xs md:text-sm leading-relaxed flex-1 font-medium group-hover:text-foreground transition-colors duration-300 relative z-10">
                Akses ribuan tata bahasa, matriks kata kerja, dan kamus praktis dalam satu genggaman.
              </p>
            </Card>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            variants={itemVariants}
            className="h-full"
          >
            <Card className="p-6 md:p-8 group relative overflow-hidden transition-all duration-300 flex flex-col h-full bg-card rounded-2xl border border-border hover:border-amber-500/40 hover:bg-amber-500/[0.02] shadow-lg">
              <div className="mb-8 p-4 bg-muted border border-border w-fit rounded-xl group-hover:bg-amber-600 dark:group-hover:bg-amber-500 group-hover:text-primary-foreground transition-all duration-300 shadow-inner text-amber-600 dark:text-amber-500 group-hover:border-none relative z-10">
                <Zap size={24} />
              </div>
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-4 relative z-10 transition-colors duration-300 text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-500">
                Siap Ujian JLPT
              </h3>
              <p className="text-muted-foreground text-xs md:text-sm leading-relaxed flex-1 font-medium group-hover:text-foreground transition-colors duration-300 relative z-10">
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
          <Card className="p-8 md:p-12 rounded-[2rem] flex flex-col lg:flex-row items-center justify-between gap-10 bg-card border border-border shadow-2xl relative overflow-hidden group transition-all duration-300 hover:border-primary/30">
            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-muted border border-border flex items-center justify-center rounded-2xl shrink-0 group-hover:border-primary/40 transition-all duration-500">
                <ShieldCheck size={36} className="text-primary" />
              </div>
              <div className="text-center md:text-left">
                <h4 className="text-foreground font-black uppercase text-2xl md:text-3xl tracking-tight mb-2">
                  Sepenuhnya <span className="text-primary">Gratis Untukmu</span>
                </h4>
                <p className="text-muted-foreground text-sm md:text-base font-medium">
                  Dibuat dengan sepenuh hati untuk membantu siapa saja yang ingin belajar 
                  bahasa Jepang tanpa harus terhalang biaya.
                </p>
              </div>
            </div>
            <Button
              asChild
              variant="link"
              className="text-primary font-black uppercase tracking-[0.4em] text-xs md:text-sm flex items-center gap-3 hover:gap-6 transition-all whitespace-nowrap shrink-0 group hover:no-underline relative z-10"
            >
              <Link href="/support">
                Kontribusi Project <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </Button>
          </Card>
        </motion.section>

        {/* FOOTER */}
        <footer className="mt-32 pt-12 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="relative w-10 h-10 drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
              <Image
                src="/logo-branding.svg"
                alt="NihongoRoute"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-foreground font-black uppercase tracking-widest">
                Nihongo<span className="text-primary">Route</span>
              </span>
              <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">
                Digital Learning Ecosystem © {new Date().getFullYear()}
              </span>
            </div>
          </div>
          <div className="flex gap-6 text-xs font-black uppercase tracking-widest text-muted-foreground">
            <Link
              href="/library"
              className="hover:text-primary transition-colors"
            >
              Library
            </Link>
            <Link
              href="/review"
              className="hover:text-primary transition-colors"
            >
              Review
            </Link>
            <a
              href="https://github.com/zan-118"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition-colors"
            >
              GitHub
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
