"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#1f242d] text-[#c4cfde] flex flex-col overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative flex-1 flex flex-col justify-center items-center min-h-[90vh] px-6 text-center">
        {/* Animated Glows */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#0ef] rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
            className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-blue-500 rounded-full blur-[100px]"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-5xl mx-auto"
        >
          <div className="inline-block px-4 py-2 rounded-full bg-[#0ef]/5 border border-[#0ef]/20 text-[10px] text-[#0ef] font-black tracking-[0.3em] uppercase mb-8 backdrop-blur-sm">
            The Future of Japanese Learning
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-[120px] font-black italic tracking-tighter text-white leading-[0.85] mb-8 uppercase">
            Japanese <br />
            <span className="text-[#0ef] drop-shadow-[0_0_20px_rgba(0,255,239,0.3)]">
              Made Simple.
            </span>
          </h1>

          <p className="text-sm md:text-lg text-[#c4cfde]/60 max-w-2xl mx-auto mb-12 leading-relaxed italic">
            Kuasai kosakata, konjugasi kata kerja, dan tata bahasa JLPT dengan
            sistem
            <span className="text-white font-bold">
              {" "}
              Spaced Repetition
            </span>{" "}
            yang terintegrasi secara cerdas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/jlpt"
              className="w-full sm:w-auto px-12 py-5 bg-[#0ef] text-[#1f242d] font-black rounded-2xl hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(0,255,239,0.4)]"
            >
              Mulai Belajar
            </Link>
            <Link
              href="/dictionary/verbs"
              className="w-full sm:w-auto px-12 py-5 bg-white/5 text-white border border-white/10 font-black rounded-2xl hover:bg-white/10 transition-all text-xs uppercase tracking-[0.2em]"
            >
              Cek Kamus
            </Link>
          </div>
        </motion.div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-24 border-t border-white/5 bg-[#1a1c23]/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
          <FeatureCard
            icon="🧠"
            title="Smart SRS"
            desc="Sistem hafalan otomatis yang menyesuaikan dengan daya ingatmu. Klik tambah, biarkan kami yang menjadwalkan."
          />
          <FeatureCard
            icon="📘"
            title="Grammar Focus"
            desc="Penjelasan mendalam sesuai materi Lampiran Minna no Nihongo. Paham konsep, bukan sekadar hafal."
          />
          <FeatureCard
            icon="⚡"
            title="Fast & Clean"
            desc="Aplikasi berjalan 100% di browser tanpa perlu login. Progres aman, belajar jadi lebih tenang."
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="p-10 rounded-[2.5rem] bg-[#1e2024] border border-white/5 hover:border-[#0ef]/30 transition-all group"
    >
      <div className="text-5xl mb-6 group-hover:scale-110 transition-transform origin-left">
        {icon}
      </div>
      <h3 className="text-xl font-black text-white mb-4 uppercase italic tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-[#c4cfde]/50 leading-relaxed">{desc}</p>
    </motion.div>
  );
}
