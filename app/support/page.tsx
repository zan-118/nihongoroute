"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Coffee,
  Heart,
  ShieldCheck,
  Zap,
  Globe,
} from "lucide-react";

export default function SupportPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#1f242d] text-[#c4cfde] selection:bg-[#0ef]/30 flex flex-col overflow-x-hidden">
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#0ef]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      {/* TOP NAVIGATION */}
      <nav className="p-6 sticky top-0 bg-[#1f242d]/80 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-[#0ef] transition-all group"
          >
            <ChevronLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Kembali
          </button>
          <div className="font-black italic text-xl tracking-tighter text-white">
            N<span className="text-[#0ef]">R</span>.
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-16 w-full flex-1">
        {/* HERO HEADER */}
        <section className="text-center mb-20">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-[#1e2024] border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-[10px_10px_20px_rgba(0,0,0,0.3)] relative"
          >
            <Heart
              className="text-red-500 fill-red-500 animate-pulse"
              size={32}
            />
            <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20" />
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl md:text-7xl font-black italic tracking-tighter text-white leading-none mb-6 uppercase"
          >
            Keep It <br />
            <span className="text-[#0ef] drop-shadow-[0_0_15px_rgba(0,255,239,0.3)]">
              Free For All.
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[#c4cfde]/60 text-sm md:text-base max-w-lg mx-auto leading-relaxed italic"
          >
            Donasi kamu adalah energi utama agar{" "}
            <span className="text-white font-bold">NihongoRoute</span> tetap
            hidup, gratis, dan tanpa iklan bagi pejuang bahasa Jepang.
          </motion.p>
        </section>

        {/* DONATION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
          <DonationCard
            href="https://trakteer.id/Zan118/tip"
            title="Trakteer"
            desc="Support via E-Wallet / Gopay"
            icon="☕"
            accent="hover:border-red-500/40"
            label="Traktir Kopi"
          />
          <DonationCard
            href="https://saweria.co/Zan118"
            title="Saweria"
            desc="Support via QRIS / Dana / LinkAja"
            icon="💸"
            accent="hover:border-yellow-500/40"
            label="Kirim Dukungan"
          />
        </div>

        {/* TRANSPARENCY SECTION */}
        <section className="bg-[#1e2024]/50 border border-white/5 rounded-[3.5rem] p-10 md:p-16 shadow-2xl">
          <div className="flex items-center gap-4 mb-12">
            <ShieldCheck className="text-[#0ef]" size={24} />
            <h2 className="text-xl font-black text-white uppercase italic tracking-widest">
              Alokasi Dana
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <StatItem
              icon={<Zap className="text-yellow-400" />}
              title="Infrastructure"
              desc="Biaya server database Sanity dan hosting agar tetap ngebut."
            />
            <StatItem
              icon={<Globe className="text-blue-400" />}
              title="New Content"
              desc="Pengembangan kurikulum N4 sampai N1 secara bertahap."
            />
            <StatItem
              icon={<Coffee className="text-[#0ef]" />}
              title="Developer"
              desc="Menjaga saya tetap terjaga untuk coding fitur-fitur baru."
            />
          </div>
        </section>

        {/* QUOTE FOOTER */}
        <footer className="mt-24 text-center pb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10 mb-4">
            Direct Contribution
          </p>
          <p className="text-xs text-white/30 italic">
            "Satu cangkir kopi darimu, satu langkah lebih dekat untuk kita semua
            menguasai bahasa Jepang."
          </p>
        </footer>
      </main>
    </div>
  );
}

function DonationCard({ href, title, desc, icon, accent, label }: any) {
  return (
    <motion.a
      href={href}
      target="_blank"
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative p-10 rounded-[2.5rem] bg-[#1e2024] border border-white/5 ${accent} transition-all duration-500 shadow-2xl overflow-hidden flex flex-col h-full`}
    >
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-7xl font-black italic group-hover:opacity-[0.07] transition-opacity">
        {title}
      </div>
      <div className="text-5xl mb-6 group-hover:scale-110 transition-transform origin-left">
        {icon}
      </div>
      <h3 className="text-3xl font-black text-white italic mb-2 uppercase tracking-tighter">
        {title}
      </h3>
      <p className="text-xs text-white/40 font-medium uppercase tracking-widest mb-8 leading-relaxed">
        {desc}
      </p>
      <div className="mt-auto flex items-center gap-3 text-[#0ef] font-black uppercase text-[10px] tracking-[0.3em]">
        <div className="h-[2px] w-8 bg-[#0ef] group-hover:w-12 transition-all" />
        {label}
      </div>
    </motion.a>
  );
}

function StatItem({ icon, title, desc }: any) {
  return (
    <div className="group">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-[#0ef]/10 transition-colors shadow-xl">
        {icon}
      </div>
      <h4 className="text-white font-black uppercase italic tracking-widest mb-3">
        {title}
      </h4>
      <p className="text-sm text-[#c4cfde]/40 leading-relaxed italic">{desc}</p>
    </div>
  );
}
