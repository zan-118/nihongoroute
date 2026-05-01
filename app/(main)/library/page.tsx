/**
 * @file page.tsx
 * @description Pusat Data (Data Center) yang menjadi gerbang sentral menuju koleksi bahan ajar taktis.
 * @module LibraryPage
 */

"use client";

// ======================
// IMPORTS
// ======================
import { motion } from "motion/react";
import Link from "next/link";
import { RefreshCw, BookOpen, BarChart2, ArrowRight, Library, Database, Activity, Server, GraduationCap, ArrowUpRight, Award } from "lucide-react";
import { Card } from "@/components/ui/card";

// ======================
// MAIN EXECUTION
// ======================

/**
 * Komponen LibraryPage: Menampilkan panel navigasi untuk berbagai modul pustaka pembelajaran.
 * 
 * @returns {JSX.Element} Elemen halaman pustaka.
 */
export default function LibraryPage() {
  // CONFIG: Kategori Modul
  const categories = [
    {
      href: "/library/verbs",
      title: "Kamus Kata Kerja",
      desc: "Pelajari konjugasi kata kerja N5-N4. Lengkap dengan bentuk Masu, Te, hingga Potensial yang mudah dipahami.",
      icon: <RefreshCw size={28} />,
      label: "Kamus Verba",
      delay: 0.2
    },
    {
      href: "/library/grammar",
      title: "Panduan Tata Bahasa",
      desc: "Belajar pola kalimat jadi lebih asyik dengan contoh audio dan penjelasan yang gampang dimengerti.",
      icon: <BookOpen size={28} />,
      label: "Pola Kalimat",
      delay: 0.3
    },
    {
      href: "/library/vocab",
      title: "Daftar Kosakata",
      desc: "Gak perlu bingung cari kata, ribuan kosakata N5-N2 siap kamu kuasai setiap hari!",
      icon: <Database size={28} />,
      label: "Perbendaharaan Kata",
      delay: 0.4
    },
    {
      href: "/library/cheatsheet",
      title: "Catatan Cepat",
      desc: "Butuh contekan kilat buat angka atau partikel? Cek panduannya di sini, dijamin makin lancar!",
      icon: <BarChart2 size={28} />,
      label: "Panduan Cepat",
      delay: 0.5
    },
    {
      href: "/exams",
      title: "Ujian & Sertifikasi",
      desc: "Siap buat ujian beneran? Uji nyalimu di simulasi JLPT dan lihat seberapa jago skor kesiapanmu!",
      icon: <Award size={28} />,
      label: "Latihan Ujian",
      delay: 0.6
    }
  ];
  // ======================
  // RENDER
  // ======================
  return (
    <div className="w-full px-4 md:px-8 lg:px-12 relative overflow-hidden pb-24">
      {/* Background Neural Overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,238,255,0.05)_0%,transparent_50%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto relative z-10 pt-8 md:pt-10">
        {/* HEADER SECTION */}
        <header className="mb-16 md:mb-24">
          <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-10">
            <Card className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-2xl bg-cyber-neon/10 border-cyber-neon/20 flex items-center justify-center neo-inset shadow-none">
              <Library size={28} className="text-cyber-neon md:w-8 md:h-8" />
            </Card>
            <div className="flex flex-col">
              <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-cyber-neon">Perpustakaan Digital</span>
              <div className="flex items-center gap-2 md:gap-3 mt-1 md:mt-2">
                 <Activity size={12} className="text-cyber-neon animate-pulse md:w-3.5 md:h-3.5" />
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Status: Siap Belajar</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 lg:gap-12">
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-5xl md:text-7xl lg:text-9xl font-black uppercase tracking-tight text-white mb-6 md:mb-10 drop-shadow-2xl leading-none md:leading-[0.85]"
              >
                Pustaka<br />
                <span className="text-cyber-neon drop-shadow-[0_0_30px_rgba(0,238,255,0.5)]">Materi</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-slate-400 text-xs md:text-base lg:text-xl max-w-2xl leading-relaxed font-bold tracking-wide italic"
              >
                Gudang ilmumu ada di sini! Dari kata kerja sampai tata bahasa, semua amunisi buat naklukin JLPT sudah siap semua!
              </motion.p>
            </div>
            
            <div className="shrink-0 hidden xl:block w-full lg:w-auto mt-8 lg:mt-0">
               <Card className="p-8 md:p-10 rounded-3xl md:rounded-[3.5rem] bg-black/40 border-white/5 neo-card shadow-none min-w-[320px]">
                  <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-3 md:gap-4 text-slate-500 font-bold uppercase text-[10px] md:text-xs tracking-widest">
                        <Server size={16} className="md:w-5 md:h-5" /> Kesiapan Materi
                     </div>
                     <span className="text-[10px] md:text-xs font-mono text-cyber-neon/80 font-bold">100%</span>
                  </div>
                  <div className="flex gap-2 md:gap-2.5">
                     {[...Array(6)].map((_, i) => (
                       <div key={i} className="flex-1 h-8 md:h-12 bg-cyber-neon/10 rounded-full overflow-hidden">
                          <motion.div 
                            animate={{ height: ["30%", "90%", "30%"] }}
                            transition={{ repeat: Infinity, duration: 2 + i * 0.15, ease: "easeInOut" }}
                            className="w-full bg-cyber-neon" 
                          />
                       </div>
                     ))}
                  </div>
               </Card>
            </div>
          </div>
        </header>

        {/* NAVIGATION GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 items-stretch">
          {categories.map((cat, idx) => (
            <Link key={cat.href} href={cat.href} className="group flex h-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: cat.delay }}
                className="w-full h-full"
              >
                <Card className="h-full p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border-white/10 bg-slate-900/40 backdrop-blur-xl hover:border-cyber-neon/50 hover:bg-cyber-neon/[0.02] transition-all duration-500 neo-card shadow-none flex flex-col group relative overflow-hidden hover:scale-[1.03] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(0,238,255,0.15)]">
                  {/* Interactive Gradient Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyber-neon/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="absolute -top-6 -right-6 md:-top-10 md:-right-10 text-[10rem] md:text-[12rem] font-black text-white/[0.03] group-hover:text-cyber-neon/[0.06] transition-all duration-700 pointer-events-none uppercase italic">
                    0{idx + 1}
                  </div>
                  
                  <div className="flex justify-between items-start mb-12 md:mb-16 relative z-10">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:bg-cyber-neon group-hover:text-black transition-all duration-500 shadow-inner text-cyber-neon group-hover:border-none">
                      {cat.icon}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <GraduationCap size={16} className="text-slate-700 group-hover:text-cyber-neon/40 transition-colors" />
                       <div className="w-4 h-0.5 bg-slate-700 group-hover:bg-cyber-neon/40 transition-colors rounded-full" />
                    </div>
                  </div>

                  <div className="relative z-10 flex-1">
                    <span className="text-[9px] md:text-[10px] font-black text-cyber-neon/80 uppercase tracking-[0.4em] mb-3 md:mb-4 block">
                      {cat.label}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter mb-4 md:mb-6 group-hover:text-cyber-neon transition-colors duration-500 leading-tight italic">
                      {cat.title}
                    </h2>
                    <p className="text-[11px] md:text-xs text-slate-400 leading-relaxed font-bold group-hover:text-slate-300 transition-colors duration-500 italic">
                      {cat.desc}
                    </p>
                  </div>

                  <div className="mt-10 md:mt-14 flex items-center justify-between text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-slate-600 group-hover:text-cyber-neon transition-all duration-500 border-t border-white/10 pt-6 md:pt-10 relative z-10">
                    <span>Akses Modul</span>
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-cyber-neon group-hover:text-black group-hover:border-none group-hover:translate-x-2 transition-all duration-500 shadow-lg">
                       <ArrowRight size={18} className="md:w-5 md:h-5" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

