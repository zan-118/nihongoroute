/**
 * @file CheatsheetClient.tsx
 * @description Antarmuka klien interaktif untuk halaman daftar cheatsheet (referensi cepat).
 * Menampilkan kategori cheatsheet dalam format kartu premium dengan filter kategori teranimasi.
 */

"use client";

// ======================
// IMPOR
// ======================
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
  ChevronRight,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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

export default function CheatsheetClient({
  initialSheets,
}: {
  initialSheets: Cheatsheet[];
}) {
  const safeSheets = useMemo(() => Array.isArray(initialSheets) ? initialSheets : [], [initialSheets]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Mendapatkan kategori unik dengan jumlah item masing-masing
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
    <div className="relative w-full max-w-[1600px] mx-auto z-10 flex flex-col flex-1 pb-32 md:pb-24 px-4 md:px-8 lg:px-12 transition-colors duration-300">
      {/* Tajuk Utama (Hero Header) */}
      <header className="mb-12 md:mb-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 lg:gap-12">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-[rgba(var(--primary-rgb),0.1)] flex items-center justify-center text-primary border border-border">
                <Activity size={20} className="animate-pulse text-primary" />
              </div>
              <span className="text-primary font-black text-xs uppercase tracking-[0.3em]">Quick Reference</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground tracking-tighter leading-[0.9]">
              Catatan <span className="text-primary">Cepat</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground font-medium max-w-xl leading-relaxed">
              Kumpulan materi referensi kilat untuk membantumu menghafal angka, waktu, sapaan, hingga aturan tata bahasa penting secara interaktif.
            </p>
          </div>

          {/* Kolom Pencarian */}
          <div className="relative group w-full lg:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors z-10" size={20} />
            <Input
              id="cheatsheet-search"
              type="text"
              placeholder="Cari materi referensi..."
              className="w-full bg-[rgba(var(--muted-rgb),0.1)] border border-border pl-14 pr-6 py-7 h-auto rounded-[2rem] text-foreground font-medium text-base glass shadow-[0_4px_30px_rgba(var(--foreground-rgb),0.03)] placeholder:text-muted-foreground/40 focus-visible:ring-[rgba(var(--primary-rgb),0.2)] focus-visible:border-primary transition-all duration-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Filter Kategori */}
      <nav className="mb-10" aria-label="Filter kategori cheatsheet">
        <div className="flex items-center gap-2 mb-4 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
          <Filter size={14} className="text-primary" /> Saring Berdasarkan Topik
        </div>
        <div className="flex flex-wrap gap-2.5 p-2 rounded-[2rem] border border-border bg-[rgba(var(--card-rgb),0.2)] backdrop-blur-md w-fit max-w-full">
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
                className={`relative rounded-full px-5 py-5 text-sm font-bold transition-all duration-300 hover:text-foreground ${
                  isActive ? "text-primary-foreground font-black" : "text-muted-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryBackdrop"
                    className="absolute inset-0 bg-primary rounded-full shadow-[0_10px_20px_rgba(var(--primary-rgb),0.3)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {cat === "all" ? "Semua Topik" : cat}
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      isActive
                        ? "bg-[rgba(var(--background-rgb),0.2)] text-primary-foreground"
                        : "bg-[rgba(var(--muted-rgb),0.3)] text-muted-foreground"
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

      {/* Daftar Cheatsheet */}
      <section className="flex flex-col gap-8">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground flex items-center gap-2">
            <Database size={14} className="text-primary" /> Menampilkan {filteredSheets.length} Panduan
          </h2>
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredSheets.map((sheet, idx) => (
              <motion.div
                id={`cheatsheet-card-${sheet.slug || sheet.id}`}
                key={sheet._id || sheet.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <Link href={`/library/cheatsheet/${sheet.slug || sheet.id || sheet._id}`}>
                  <Card className="group relative h-full bg-[rgba(var(--card-rgb),0.4)] border border-border hover:border-[rgba(var(--primary-rgb),0.5)] rounded-[2.5rem] p-8 cursor-pointer transition-all duration-500 shadow-[0_4px_30px_rgba(var(--foreground-rgb),0.02)] hover:shadow-[0_20px_50px_rgba(var(--primary-rgb),0.15)] glass flex flex-col justify-between gap-6 overflow-hidden">
                    {/* Ambient Glow Background Effect */}
                    <div className="absolute top-0 right-0 size-32 bg-[rgba(var(--primary-rgb),0.03)] blur-[40px] rounded-full -mr-12 -mt-12 group-hover:bg-[rgba(var(--primary-rgb),0.08)] transition-all duration-500 pointer-events-none" />

                    {/* Watermark Number */}
                    <div className="absolute -bottom-6 -right-6 text-[8rem] font-black text-[rgba(var(--foreground-rgb),0.02)] group-hover:text-[rgba(var(--primary-rgb),0.04)] transition-all duration-500 pointer-events-none italic select-none leading-none">
                      {String(idx + 1).padStart(2, "0")}
                    </div>

                    <div className="flex items-center justify-between relative z-10">
                      <div className="size-14 rounded-2xl bg-[rgba(var(--muted-rgb),0.2)] border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-[rgba(var(--primary-rgb),0.15)] group-hover:border-[rgba(var(--primary-rgb),0.3)] transition-all duration-500 shadow-inner">
                        {getIconForCategory(sheet.category)}
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-[rgba(var(--muted-rgb),0.1)] text-[10px] font-black uppercase tracking-widest text-primary border-border"
                      >
                        {sheet.category}
                      </Badge>
                    </div>

                    <div className="flex-1 relative z-10 space-y-2.5">
                      <h3 className="text-2xl font-black text-foreground tracking-tight leading-tight group-hover:text-primary transition-colors">
                        {sheet.title}
                      </h3>
                      <p className="text-xs text-muted-foreground font-semibold leading-relaxed line-clamp-2">
                        Lihat tabel referensi cepat untuk {sheet.title}. Lengkap dengan Furigana dinamis, transliterasi romaji, dan tips pemahaman budaya Jepang.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-[rgba(var(--border-rgb),0.1)] relative z-10">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary group-hover:text-primary-foreground group-hover:bg-primary group-hover:px-3 group-hover:py-1 group-hover:rounded-full transition-all duration-300">
                        Buka Tabel <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                      <div className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-wider">
                        {(sheet.items || []).length} Baris
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredSheets.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center bg-[rgba(var(--card-rgb),0.1)] rounded-[2.5rem] border border-dashed border-border"
          >
            <div className="size-20 rounded-full bg-[rgba(var(--muted-rgb),0.1)] flex items-center justify-center mb-6">
              <Database size={32} className="text-muted-foreground opacity-45" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Catatan cepat tidak ditemukan</h3>
            <p className="text-muted-foreground text-sm max-w-sm mt-1">
              Tidak ada materi yang cocok dengan kata kunci pencarian Anda. Coba bersihkan pencarian atau ganti filter kategori.
            </p>
          </motion.div>
        )}
      </section>
    </div>
  );
}

function getIconForCategory(cat: string) {
  const c = cat?.toLowerCase() || "";
  if (c.includes("bilangan") || c.includes("angka") || c.includes("counter")) return <Hash size={24} />;
  if (c.includes("waktu") || c.includes("hari") || c.includes("tanggal") || c.includes("jam")) return <Clock size={24} />;
  if (c.includes("grammar") || c.includes("partikel") || c.includes("aturan") || c.includes("tata bahasa")) return <BookOpen size={24} />;
  if (c.includes("keluarga") || c.includes("relasi") || c.includes("hubungan")) return <Users size={24} />;
  if (c.includes("topik") || c.includes("sosial") || c.includes("sapaan") || c.includes("percakapan")) return <MessageSquare size={24} />;
  return <Sparkles size={24} />;
}
