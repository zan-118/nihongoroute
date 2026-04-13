"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="flex flex-col overflow-hidden relative">
      {/* SECTION HERO */}
      <section className="relative flex-1 flex flex-col justify-center items-center min-h-[90vh] px-6 text-center">
        {/* Animated Glows (Diselaraskan warnanya dengan cyan & indigo) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.12, 0.08] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-400 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.08, 0.05] }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
            className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-indigo-500 rounded-full blur-[100px]"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-5xl mx-auto mt-10 md:mt-0"
        >
          {/* Label atas menggunakan neo-inset & font-mono */}
          <div className="neo-inset inline-block px-6 py-2 border border-cyan-400/20 text-[10px] text-cyan-400 font-mono font-black tracking-[0.3em] uppercase mb-8 backdrop-blur-md">
            The Future of Japanese Learning
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-[120px] font-black italic tracking-tighter text-white leading-[0.85] mb-8 uppercase drop-shadow-2xl">
            Japanese <br />
            <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">
              Simple.
            </span>
          </h1>

          <p className="text-sm md:text-lg max-w-2xl mx-auto mb-12 italic">
            Kuasai kosakata dan tata bahasa JLPT dengan sistem{" "}
            <span className="text-cyan-400 font-bold">Spaced Repetition</span>{" "}
            yang terintegrasi secara cerdas.
          </p>

          <nav className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {/* Tombol Utama menggunakan .btn-cyber */}
            <Link
              href="/courses"
              className="btn-cyber w-full sm:w-auto px-12 py-5"
            >
              Mulai Belajar
            </Link>

            {/* Tombol Sekunder menggunakan .neo-card sebagai base */}
            <Link
              href="/library/verbs"
              className="neo-card w-full sm:w-auto px-12 py-5 text-slate-300 font-black hover:text-cyan-400 transition-colors text-xs uppercase tracking-[0.2em] border-white/5 hover:border-cyan-400/30 text-center"
            >
              Kamus Verba
            </Link>
          </nav>
        </motion.div>
      </section>

      {/* SECTION FEATURES */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon="🧠"
            title="Smart SRS"
            desc="Sistem hafalan otomatis yang menyesuaikan dengan daya ingatmu. Klik tambah, biarkan kami menjadwalkan."
          />
          <FeatureCard
            icon="🏛️"
            title="Digital Library"
            desc="Akses 120+ konjugasi kata kerja, tabel referensi, dan grammar dalam satu hub terpusat."
          />
          <FeatureCard
            icon="⚡"
            title="Basics First"
            desc="Kuasai Hiragana & Katakana dengan modul interaktif yang dilengkapi stroke order."
          />
        </div>
      </section>
    </div>
  );
}

interface FeatureCardProps {
  icon: string;
  title: string;
  desc: string;
}

function FeatureCard({ icon, title, desc }: FeatureCardProps) {
  return (
    <motion.article whileHover={{ y: -8 }} className="neo-card p-10 group">
      <div className="text-5xl mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-transform origin-bottom-left drop-shadow-lg">
        {icon}
      </div>
      {/* Menggunakan font-mono (JetBrains) untuk aksen judul kartu */}
      <h3 className="text-xl font-black text-white mb-4 uppercase italic tracking-widest font-mono group-hover:text-cyan-400 transition-colors">
        {title}
      </h3>
      {/* Tag <p> otomatis mengambil styling abu-abu (slate-400) dari globals.css */}
      <p className="text-sm">{desc}</p>
    </motion.article>
  );
}
