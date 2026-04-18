/**
 * LOKASI FILE: app/page.tsx
 * KONSEP: Cyber-Dark Neumorphic + Framer Motion
 */

"use client";

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

export default function LandingPage() {
  // Variabel Animasi untuk Stagger Effect (Dilengkapi tipe 'Variants' untuk TypeScript)
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const features = [
    {
      title: "Sistem Hafalan Pintar",
      desc: "Algoritma Spaced Repetition yang mengatur jadwal ulang kosakata secara otomatis.",
      icon: <BrainCircuit size={28} className="text-cyan-400" />,
      color: "text-cyan-400",
    },
    {
      title: "Koleksi Terpadu",
      desc: "Akses ratusan tata bahasa, matriks verba, dan kamus dalam satu dashboard intuitif.",
      icon: <Library size={28} className="text-purple-400" />,
      color: "text-purple-400",
    },
    {
      title: "Ujian Simulasi",
      desc: "Uji kesiapan JLPT Anda dengan mesin simulasi waktu nyata berstandar resmi.",
      icon: <Zap size={28} className="text-amber-400" />,
      color: "text-amber-400",
    },
  ];

  return (
    <main className="min-h-screen bg-[#080a0f] text-[#c4cfde] selection:bg-cyan-400/30 overflow-x-hidden">
      {/* BACKGROUND AMBIENT */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-32">
        {/* HERO SECTION */}
        <section className="min-h-[75vh] flex flex-col items-center justify-center text-center mb-24">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8 p-2 neo-inset rounded-2xl"
          >
            <div className="bg-cyan-400/10 border border-cyan-400/20 px-4 py-2 rounded-xl flex items-center gap-2">
              <Sparkles size={14} className="text-cyan-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">
                Next-Gen Learning Platform
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl md:text-8xl lg:text-9xl font-black italic uppercase tracking-tighter leading-[0.9] text-white mb-8"
          >
            Mastering <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              Japanese Art.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-400 text-sm md:text-lg max-w-2xl mb-12 leading-relaxed italic"
          >
            Platform belajar mandiri gratis yang menggabungkan estetika
            futuristik dengan metode sains kognitif untuk akselerasi kemampuan
            bahasa Anda.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
          >
            <Link
              href="/dashboard"
              className="btn-cyber flex items-center justify-center gap-3 group"
            >
              Akses Dashboard{" "}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              href="/courses"
              className="px-8 py-3 neo-card hover:shadow-none transition-all flex items-center justify-center gap-3 text-white font-bold uppercase tracking-widest text-sm"
            >
              <PlayCircle size={18} className="text-cyan-400" /> Lihat Silabus
            </Link>
          </motion.div>
        </section>

        {/* FEATURES GRID */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="neo-card p-8 md:p-10 group relative overflow-hidden transition-all duration-300"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-7xl font-black italic pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                0{i + 1}
              </div>
              <div className="mb-6 p-4 neo-inset w-fit rounded-2xl group-hover:shadow-none transition-all">
                {feature.icon}
              </div>
              <h3
                className={`text-xl md:text-2xl font-black uppercase italic tracking-tight mb-4 ${feature.color}`}
              >
                {feature.title}
              </h3>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.section>

        {/* TRUST BANNER */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="neo-inset p-8 md:p-12 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8 border border-white/5"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 neo-card flex items-center justify-center rounded-2xl shrink-0">
              <ShieldCheck size={32} className="text-cyan-400" />
            </div>
            <div>
              <h4 className="text-white font-black uppercase italic text-xl">
                100% Gratis & Open Source
              </h4>
              <p className="text-slate-500 text-xs mt-1">
                Dikembangkan dengan dedikasi untuk komunitas pembelajar bahasa
                Jepang.
              </p>
            </div>
          </div>
          <Link
            href="/support"
            className="text-cyan-400 font-black uppercase tracking-widest text-[10px] md:text-xs flex items-center gap-2 hover:gap-4 transition-all whitespace-nowrap shrink-0"
          >
            Dukung Pengembangan <ArrowRight size={14} />
          </Link>
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
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
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
