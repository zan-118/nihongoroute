"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function LibraryPage() {
  const librarySections = [
    {
      title: "Kamus Kata Kerja",
      desc: "Mesin konjugasi untuk kata kerja N5. Bentuk Masu, Te, Nai, Ta, hingga Potensial. Lengkap dengan latihan hafalan.",
      icon: "🔄",
      href: "/library/verbs",
      color: "text-cyan-400",
      bgHover: "hover:border-cyan-400/30",
      tag: "DATABASE",
    },
    {
      title: "Panduan Tata Bahasa",
      desc: "Dokumentasi pola kalimat lengkap dengan contoh audio dan penjelasan mendetail.",
      icon: "📚",
      href: "/library/grammar",
      color: "text-indigo-400",
      bgHover: "hover:border-indigo-400/30",
      tag: "TATA BAHASA",
    },
    {
      title: "Catatan Ringkas",
      desc: "Tabel referensi cepat (Cheatsheet) untuk angka, waktu, partikel, dan konter.",
      icon: "📊",
      href: "/library/cheatsheet",
      color: "text-emerald-400",
      bgHover: "hover:border-emerald-400/30",
      tag: "RINGKASAN",
    },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8 md:pt-12 pb-32">
      <header className="mb-16 border-b border-white/5 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="h-10 w-2 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)] hidden md:block" />
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg">
              Koleksi <span className="text-cyan-400">Pintar</span>
            </h1>
          </div>
          <p className="text-slate-400 font-medium md:ml-6 max-w-2xl text-sm leading-relaxed">
            Pusat data referensi bahasa Jepang. Akses cepat ke aturan tata
            bahasa, mesin konjugasi, dan tabel partikel tanpa harus membuka
            kamus fisik.
          </p>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {librarySections.map((section, idx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link href={section.href} className="block group h-full">
              <article
                className={`neo-card p-8 h-full flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 ${section.bgHover}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform origin-top-left">
                      {section.icon}
                    </span>
                    <span className="neo-inset px-3 py-1 text-[9px] font-mono font-black uppercase tracking-widest text-slate-500">
                      {section.tag}
                    </span>
                  </div>

                  <h2
                    className={`text-2xl font-black uppercase italic tracking-tight mb-3 ${section.color}`}
                  >
                    {section.title}
                  </h2>
                  <p className="text-sm text-slate-400 leading-relaxed mb-8">
                    {section.desc}
                  </p>
                </div>

                <div className="neo-inset w-full text-center py-3 text-xs font-mono font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">
                  Buka Data →
                </div>
              </article>
            </Link>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
