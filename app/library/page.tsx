"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { RefreshCw, BookOpen, BarChart2, ArrowRight } from "lucide-react";

export default function LibraryPage() {
  return (
    // PERBAIKAN: Menambahkan pt-28 md:pt-36 agar konten turun ke bawah Navbar
    <main className="min-h-screen px-4 md:px-8 pt-28 md:pt-36 pb-24 bg-cyber-bg relative overflow-hidden">
      {/* Latar Belakang Grid & Pendaran */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* HEADER HALAMAN */}
        <header className="mb-12 md:mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4 md:mb-6 drop-shadow-lg leading-none"
          >
            Koleksi Pintar
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[#c4cfde]/70 text-sm md:text-base max-w-2xl leading-relaxed"
          >
            Pusat data referensi bahasa Jepang. Akses cepat ke aturan tata
            bahasa, mesin konjugasi, dan tabel partikel tanpa harus membuka
            kamus fisik.
          </motion.p>
        </header>

        {/* GRID KARTU MENU */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* KARTU 1: KAMUS KATA KERJA (Cyan) */}
          <Link href="/library/verbs" className="group flex flex-col h-full">
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1 bg-cyber-surface p-8 md:p-10 rounded-[2.5rem] border border-white/5 hover:border-cyan-400/50 hover:bg-cyan-400/5 transition-all duration-300 shadow-[10px_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] flex flex-col"
            >
              <div className="flex justify-between items-start mb-10">
                <div className="w-14 h-14 bg-cyan-400/10 rounded-2xl flex items-center justify-center border border-cyan-400/30 group-hover:scale-110 transition-transform shadow-inner">
                  <RefreshCw className="text-cyan-400" size={24} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                  Database
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-cyan-400 uppercase italic tracking-tighter mb-4 leading-none">
                Kamus Kata Kerja
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-10 flex-1">
                Mesin konjugasi untuk kata kerja N5. Bentuk Masu, Te, Nai, Ta,
                hingga Potensial. Lengkap dengan latihan hafalan.
              </p>

              <div className="mt-auto flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-cyan-400 transition-colors bg-black/20 p-4 rounded-xl border border-white/5 group-hover:border-cyan-400/30">
                <span>Buka Data</span>
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </motion.article>
          </Link>

          {/* KARTU 2: PANDUAN TATA BAHASA (Purple) */}
          <Link href="/library/grammar" className="group flex flex-col h-full">
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex-1 bg-cyber-surface p-8 md:p-10 rounded-[2.5rem] border border-white/5 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-300 shadow-[10px_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] flex flex-col"
            >
              <div className="flex justify-between items-start mb-10">
                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-transform shadow-inner">
                  <BookOpen className="text-purple-400" size={24} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                  Tata Bahasa
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-purple-400 uppercase italic tracking-tighter mb-4 leading-none">
                Panduan Tata Bahasa
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-10 flex-1">
                Dokumentasi pola kalimat lengkap dengan contoh audio dan
                penjelasan mendetail yang mudah dipahami.
              </p>

              <div className="mt-auto flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-purple-400 transition-colors bg-black/20 p-4 rounded-xl border border-white/5 group-hover:border-purple-500/30">
                <span>Buka Data</span>
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </motion.article>
          </Link>

          {/* KARTU 4: KAMUS KOSAKATA GLOBAL (Rose) */}
          <Link href="/library/vocab" className="group flex flex-col h-full">
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex-1 bg-cyber-surface p-8 md:p-10 rounded-[2.5rem] border border-white/5 hover:border-rose-400/50 hover:bg-rose-400/5 transition-all duration-300 shadow-[10px_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(244,63,94,0.15)] flex flex-col"
            >
              <div className="flex justify-between items-start mb-10">
                <div className="w-14 h-14 bg-rose-400/10 rounded-2xl flex items-center justify-center border border-rose-400/30 group-hover:scale-110 transition-transform shadow-inner">
                  <BookOpen className="text-rose-400" size={24} />{" "}
                  {/* Ganti icon sesuai selera */}
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                  Database
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-rose-400 uppercase italic tracking-tighter mb-4 leading-none">
                Kamus Kosakata
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-10 flex-1">
                Ribuan perbendaharaan kata dari N5 hingga N2. Dilengkapi dengan
                filter jenis kata (Hinshi) dan sistem pencarian instan.
              </p>

              <div className="mt-auto flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-rose-400 transition-colors bg-black/20 p-4 rounded-xl border border-white/5 group-hover:border-rose-400/30">
                <span>Buka Data</span>
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </motion.article>
          </Link>

          {/* KARTU 3: CATATAN RINGKAS (Emerald) */}
          <Link
            href="/library/cheatsheet"
            className="group flex flex-col h-full"
          >
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex-1 bg-cyber-surface p-8 md:p-10 rounded-[2.5rem] border border-white/5 hover:border-emerald-400/50 hover:bg-emerald-400/5 transition-all duration-300 shadow-[10px_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col"
            >
              <div className="flex justify-between items-start mb-10">
                <div className="w-14 h-14 bg-emerald-400/10 rounded-2xl flex items-center justify-center border border-emerald-400/30 group-hover:scale-110 transition-transform shadow-inner">
                  <BarChart2 className="text-emerald-400" size={24} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                  Ringkasan
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-emerald-400 uppercase italic tracking-tighter mb-4 leading-none">
                Catatan Ringkas
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-10 flex-1">
                Tabel referensi cepat (Cheatsheet) untuk hitungan angka, format
                waktu, daftar partikel, dan konter benda.
              </p>

              <div className="mt-auto flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-emerald-400 transition-colors bg-black/20 p-4 rounded-xl border border-white/5 group-hover:border-emerald-400/30">
                <span>Buka Data</span>
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </motion.article>
          </Link>
        </div>
      </div>
    </main>
  );
}
