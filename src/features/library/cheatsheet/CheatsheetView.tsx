/**
 * @file CheatsheetView.tsx
 * @description Antarmuka klien interaktif untuk halaman daftar cheatsheet (referensi cepat).
 * Menampilkan kategori cheatsheet berarsitektur Double-Bezel (Doppelrand).
 */

"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Hash,
  Clock,
  BookOpen,
  Activity,
  Database,
  Users,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  Filter,
} from "@/components/ui/icons";
import { m, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface SheetItem {
  label: string;
  jp: string;
  romaji: string;
}

export interface Cheatsheet {
  _id?: string;
  id?: string;
  title: string;
  category: string;
  slug?: string;
  linkedVocab?: SheetItem[];
  items?: SheetItem[];
}

export default function CheatsheetView({
  initialSheets,
}: {
  initialSheets: Cheatsheet[];
}) {
  const safeSheets = useMemo(() => Array.isArray(initialSheets) ? initialSheets : [], [initialSheets]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: safeSheets.length };
    safeSheets.forEach((sheet) => {
      if (sheet.category) {
        counts[sheet.category] = (counts[sheet.category] || 0) + 1;
      }
    });
    return counts;
  }, [safeSheets]);

  const categories = useMemo(() => {
    const list = Array.from(new Set(safeSheets.map((s) => s.category).filter(Boolean)));
    return ["all", ...list];
  }, [safeSheets]);

  const filteredSheets = useMemo(() => {
    return safeSheets.filter((sheet) => {
      if (!sheet) return false;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        sheet.title?.toLowerCase().includes(searchLower) ||
        sheet.category?.toLowerCase().includes(searchLower);
      const matchesCategory = selectedCategory === "all" || sheet.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [safeSheets, searchTerm, selectedCategory]);

  return (
    <div className="relative w-full max-w-[1600px] mx-auto z-10 flex flex-col flex-1 pb-32 md:pb-24 px-4 md:px-8 lg:px-12 transition-colors duration-300 font-sans">
      {/* Header */}
      <header className="mb-12 md:mb-16 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 lg:gap-12">
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 w-fit">
              <Activity size={16} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] font-mono">
                QUICK REFERENCE VAULT
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl text-foreground font-black tracking-tight leading-[0.92]">
              Catatan <span className="text-amber-400">Cepat</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground font-medium max-w-xl leading-relaxed">
              Kumpulan materi referensi kilat untuk menghafal sistem angka, waktu, sapaan, dan tata bahasa penting secara interaktif.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative group w-full lg:w-96">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
            <Input
              id="cheatsheet-search"
              type="text"
              placeholder="Cari materi referensi..."
              className="w-full bg-background/60 dark:bg-[#03060a]/60 border border-border/60 dark:border-white/10 pl-13 pr-6 py-4 h-14 rounded-2xl text-sm font-medium focus-visible:ring-amber-500/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Category Filter Pills */}
      <nav className="mb-10 space-y-3" aria-label="Filter kategori cheatsheet">
        <div className="flex items-center gap-2 text-xs font-mono font-black uppercase tracking-widest text-muted-foreground/80">
          <Filter size={14} className="text-amber-400" /> TOPIK REFERENSI
        </div>
        <div className="flex flex-wrap gap-2 p-1.5 rounded-full border border-border/40 bg-card/30 backdrop-blur-md w-fit max-w-full">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const count = categoryCounts[cat] || 0;
            return (
              <Button
                id={`filter-btn-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                variant="ghost"
                size="sm"
                className={`rounded-full px-5 h-9 text-xs font-mono font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-amber-500 text-amber-950 font-black shadow-md shadow-amber-500/20 scale-105"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2">
                  {cat === "all" ? "Semua Topik" : cat}
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      isActive
                        ? "bg-amber-950/20 text-amber-950"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </span>
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Cheatsheet Grid */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-border/40 dark:border-white/5 pb-3">
          <h2 className="text-xs font-mono font-black uppercase tracking-[0.25em] text-muted-foreground flex items-center gap-2">
            <Database size={14} className="text-amber-400" /> {filteredSheets.length} PANDUAN TERSEDIA
          </h2>
        </div>

        <m.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredSheets.map((sheet) => (
              <m.div
                id={`cheatsheet-card-${sheet.slug || sheet.id}`}
                key={sheet._id || sheet.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="h-full group font-sans"
              >
                <Link href={`/library/cheatsheet/${sheet.slug || sheet.id || sheet._id}`} className="block h-full">
                  <div className="w-full h-full p-6 rounded-2xl bg-card/70 dark:bg-card/30 backdrop-blur-md border border-border/60 dark:border-white/10 shadow-sm group-hover:border-amber-500/40 group-hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-6 relative overflow-hidden group-active:scale-[0.99]">
                    {/* Top Header */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="size-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                          {getIconForCategory(sheet.category)}
                        </div>
                        <Badge className="px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {sheet.category}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-xl sm:text-2xl font-black text-foreground leading-snug group-hover:text-amber-400 transition-colors line-clamp-2">
                          {sheet.title}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-2">
                          Tabel referensi cepat {sheet.title} dengan ejaan Furigana dan contoh penggunaan.
                        </p>
                      </div>
                    </div>

                    {/* Footer CTA */}
                    <div className="pt-4 border-t border-border/40 dark:border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-muted-foreground/70 uppercase">
                        {(sheet.items || []).length} BARIS
                      </span>

                      <div className="size-7 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-amber-950 transition-colors duration-300">
                        <ArrowUpRight size={13} />
                      </div>
                    </div>
                  </div>
                </Link>
              </m.div>
            ))}
          </AnimatePresence>
        </m.div>

        {filteredSheets.length === 0 && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center space-y-4 rounded-[2.25rem] bg-card/20 border border-border/40 p-8"
          >
            <div className="size-16 rounded-full bg-muted/30 border border-border/60 flex items-center justify-center mx-auto">
              <Database size={24} className="text-muted-foreground/50" />
            </div>
            <h3 className="text-base font-black text-foreground uppercase tracking-widest font-mono">Catatan Cepat Tidak Ditemukan</h3>
            <p className="text-muted-foreground text-xs max-w-sm mx-auto font-medium">
              Silakan periksa kata kunci pencarian atau sesuaikan filter topik yang dipilih.
            </p>
          </m.div>
        )}
      </section>
    </div>
  );
}

function getIconForCategory(cat: string) {
  const c = cat?.toLowerCase() || "";
  if (c.includes("bilangan") || c.includes("angka") || c.includes("counter")) return <Hash size={22} />;
  if (c.includes("waktu") || c.includes("hari") || c.includes("tanggal") || c.includes("jam")) return <Clock size={22} />;
  if (c.includes("grammar") || c.includes("partikel") || c.includes("aturan") || c.includes("tata bahasa")) return <BookOpen size={22} />;
  if (c.includes("keluarga") || c.includes("relasi") || c.includes("hubungan")) return <Users size={22} />;
  if (c.includes("topik") || c.includes("sosial") || c.includes("sapaan") || c.includes("percakapan")) return <MessageSquare size={22} />;
  return <Sparkles size={22} />;
}