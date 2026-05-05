/**
 * @file app/(main)/tools/page.tsx
 * @description Halaman utama pusat peralatan (Utilities) NihongoRoute.
 * @module Client Component
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Wrench, 
  PenTool, 
  BrainCircuit, 
  Search, 
  ChevronRight,
  Zap,
  LayoutGrid
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";


const tools = [
  {
    title: "Kana Master",
    description: "Tabel interaktif Hiragana & Katakana lengkap dengan latihan menulis.",
    icon: LayoutGrid,
    href: "/tools/kana",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    border: "border-cyan-500/20"
  },
  {
    title: "Flashcards",
    description: "Latih hafalan kosakata dan verba dengan sistem kartu pintar.",
    icon: BrainCircuit,
    href: "/tools/flashcards",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    border: "border-purple-500/20"
  },
  {
    title: "Kamus Global",
    description: "Cari kosakata, tata bahasa, dan kanji dalam satu tempat.",
    icon: Search,
    href: "#", // Opens search modal ideally
    onClick: () => {
      // Logic to open search modal if possible, or just link to search page if exists
      if (typeof window !== 'undefined') {
        const event = new KeyboardEvent('keydown', {
          key: 'k',
          ctrlKey: true,
          bubbles: true
        });
        document.dispatchEvent(event);
      }
    },
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    border: "border-amber-500/20"
  },
  {
    title: "Latihan Menulis",
    description: "Kanvas digital kosong untuk melatih guratan kanji, kana, atau coretan belajar.",
    icon: PenTool,
    href: "/tools/writing",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    border: "border-emerald-500/20"
  }
];

export default function ToolsPage() {
  return (
    <div className="w-full flex-1 relative overflow-hidden flex flex-col bg-background transition-colors duration-300 pt-12 pb-24 px-4 md:px-8">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-5xl mx-auto w-full relative z-10 flex flex-col h-full">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg">
                <Wrench className="text-primary" size={24} />
             </div>
             <div>
                <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight italic">
                  Pusat <span className="text-primary">Peralatan</span>
                </h1>
                <p className="text-muted-foreground text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mt-1">
                  Utilities & Quick Learning Tools
                </p>
             </div>
          </div>
          <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
            Kumpulan alat bantu belajar mandiri untuk mempercepat penguasaan bahasa Jepang Anda.
            Dari pengenalan aksara hingga latihan hafalan intensif.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool, idx) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link href={tool.href} onClick={tool.onClick}>
                <Card className={`group relative p-8 rounded-[2rem] border ${tool.border} bg-card/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden`}>
                  {/* Hover Glow */}
                  <div className={`absolute -right-10 -top-10 w-40 h-40 ${tool.bgColor} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                  
                  <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex justify-between items-start">
                      <div className={`w-14 h-14 rounded-2xl ${tool.bgColor} border ${tool.border} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                        <tool.icon className={tool.color} size={28} />
                      </div>
                      <div className="p-2 rounded-full bg-muted border border-border opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                        <ChevronRight size={20} className="text-muted-foreground" />
                      </div>
                    </div>

                    <div>
                      <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">
                        {tool.title}
                      </h2>
                      <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                        {tool.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                       <Zap size={14} className="text-primary animate-pulse" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">
                         Mulai Latihan
                       </span>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-16 p-8 rounded-3xl bg-muted/30 border border-border/50 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent)]" />
           <p className="relative z-10 text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
             Alat baru akan ditambahkan secara berkala • Tetap Semangat Belajar!
           </p>
        </div>
      </div>
    </div>
  );
}
