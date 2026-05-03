"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { RefreshCw, BookOpen, BarChart2, ArrowRight, Library, Database, Activity, Server, Award } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function LibraryPage() {
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

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 relative overflow-hidden pb-24 bg-background text-foreground transition-colors duration-300 min-h-screen pt-12">
      {/* Background Neural Overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,238,255,0.05)_0%,transparent_50%)] pointer-events-none z-0" />
      <div className="neural-grid" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* HEADER SECTION */}
        <header className="mb-16 md:mb-24">
          <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-10">
            <Card className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-2xl bg-primary/10 border-primary/20 flex items-center justify-center neo-inset shadow-none">
              <Library size={28} className="text-primary md:w-8 md:h-8" />
            </Card>
            <div className="flex flex-col">
              <span className="text-xs md:text-xs font-bold uppercase tracking-widest text-primary/50">Perpustakaan Digital</span>
              <div className="flex items-center gap-2 mt-1">
                 <Activity size={12} className="text-primary animate-pulse" />
                 <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Status: Siap Belajar</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 lg:gap-12">
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-5xl md:text-7xl lg:text-9xl font-black uppercase tracking-tight text-foreground mb-6 md:mb-10 drop-shadow-2xl leading-none md:leading-[0.85]"
              >
                Pustaka<br />
                <span className="text-primary drop-shadow-[0_0_30px_rgba(0,238,255,0.4)]">Materi</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground text-xs md:text-base lg:text-xl max-w-2xl leading-relaxed font-medium"
              >
                Gudang ilmumu ada di sini! Dari kata kerja sampai tata bahasa, semua amunisi buat naklukin JLPT sudah siap semua!
              </motion.p>
            </div>
            
            <div className="shrink-0 hidden xl:block w-full lg:w-auto mt-8 lg:mt-0">
               <Card className="p-8 md:p-10 rounded-3xl md:rounded-[3.5rem] bg-muted/30 border-border neo-card shadow-none min-w-[320px]">
                  <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-3 md:gap-4 text-muted-foreground font-bold uppercase text-xs md:text-xs tracking-widest">
                        <Server size={16} className="md:w-5 md:h-5" /> Kesiapan Materi
                     </div>
                     <span className="text-xs md:text-xs font-mono text-primary font-bold">100%</span>
                  </div>
                  <div className="flex gap-2 md:gap-2.5">
                     {[...Array(6)].map((_, i) => (
                       <div key={i} className="flex-1 h-8 md:h-12 bg-primary/10 rounded-full overflow-hidden">
                          <motion.div 
                            animate={{ height: ["30%", "90%", "30%"] }}
                            transition={{ repeat: Infinity, duration: 2 + i * 0.15, ease: "easeInOut" }}
                            className="w-full bg-primary" 
                          />
                       </div>
                     ))}
                  </div>
               </Card>
            </div>
          </div>
        </header>

        {/* NAVIGATION GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 items-stretch">
          {categories.map((cat, idx) => (
            <Link key={cat.href} href={cat.href} className="group flex h-full">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: cat.delay }}
                className="w-full h-full"
              >
                <Card className="h-full p-5 md:p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:bg-primary/[0.03] hover:shadow-xl transition-all duration-300 flex flex-col group shadow-sm">
                  <div className="flex justify-between items-center mb-5">
                    <div className="w-10 h-10 md:w-11 md:h-11 bg-muted rounded-xl flex items-center justify-center border border-border group-hover:bg-primary group-hover:text-white dark:group-hover:text-black group-hover:border-none transition-all duration-300 text-primary">
                      {cat.icon}
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">0{idx + 1}</span>
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <span className="text-xs font-bold text-primary/50 uppercase tracking-widest block">
                      {cat.label}
                    </span>
                    <h2 className="text-lg md:text-xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors duration-300 leading-snug">
                      {cat.title}
                    </h2>
                    <p className="text-xs md:text-xs text-muted-foreground leading-relaxed font-medium group-hover:text-foreground transition-colors">
                      {cat.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-xs md:text-xs font-bold text-muted-foreground uppercase tracking-wider group-hover:text-primary transition-colors">Akses Modul</span>
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-muted border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-white dark:group-hover:text-black group-hover:border-none transition-all duration-300">
                       <ArrowRight size={14} />
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
