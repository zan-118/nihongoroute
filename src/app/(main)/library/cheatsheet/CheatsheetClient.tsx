/**
 * LOKASI FILE: app/(main)/library/cheatsheet/CheatsheetClient.tsx
 * KONSEP: Category-First Dashboard (Catatan Referensi Cepat)
 * RE-DESAIN: Category Cards -> Detail Modal
 * Dioptimalkan tanpa Framer Motion untuk performa ekstrem.
 */

"use client";

import { useState } from "react";
import {
  Search,
  Hash,
  Clock,
  BookOpen,
  Home,
  Activity,
  FileText,
  Database,
  Library,
  Users,
  MessageSquare,
  Sparkles,
  ChevronRight,
} from "lucide-react";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  const safeSheets = Array.isArray(initialSheets) ? initialSheets : [];
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSheets = safeSheets.filter((sheet) => {
    if (!sheet) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      sheet.title?.toLowerCase().includes(searchLower) ||
      sheet.category?.toLowerCase().includes(searchLower)
    );
  });


  return (
    <div className="relative w-full max-w-[1600px] mx-auto z-10 flex flex-col flex-1 pb-32 md:pb-24 px-4 md:px-8 lg:px-12 transition-colors duration-300">
      {/* Breadcrumb */}
      <nav className="mb-8 md:mb-10 flex flex-wrap items-center gap-2 md:gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
        <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1.5 md:gap-2">
          <Home size={14} /> Beranda
        </Link>
        <span className="text-border">/</span>
        <Link href="/library" className="hover:text-primary transition-colors flex items-center gap-1.5 md:gap-2">
          <Library size={14} /> Pustaka
        </Link>
        <span className="text-border">/</span>
        <span className="text-primary flex items-center gap-1.5 md:gap-2">
          <FileText size={14} /> Cheatsheet
        </span>
      </nav>

      {/* Hero Header */}
      <header className="mb-12 md:mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-12">
          <div className="flex flex-col gap-4">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[rgba(var(--primary-rgb),0.1)] flex items-center justify-center text-primary border border-[rgba(var(--primary-rgb),0.2)]">
                   <Activity size={20} className="animate-pulse" />
                </div>
                <span className="text-primary font-black text-xs uppercase tracking-[0.3em]">Quick Reference</span>
             </div>
             <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground tracking-tighter leading-[0.9]">
                Catatan <span className="text-primary">Cepat</span>
             </h1>
             <p className="text-sm md:text-base text-muted-foreground font-medium max-w-xl leading-relaxed">
                Kumpulan materi referensi kilat untuk membantumu menghafal angka, waktu, sapaan, hingga aturan tata bahasa penting.
             </p>
          </div>
          
          <div className="relative group w-full md:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors z-10" size={20} />
            <Input
              type="text"
              placeholder="Cari materi referensi..."
              className="w-full bg-[rgba(var(--muted-rgb),0.2)] border border-[rgba(var(--border-rgb),0.5)] pl-14 pr-6 py-7 h-auto rounded-[2rem] text-foreground font-medium text-base neo-inset shadow-none placeholder:text-[rgba(var(--muted-foreground-rgb),0.3)] focus-visible:ring-[rgba(var(--primary-rgb),0.2)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Category Grid */}
      <section className="flex flex-col gap-10">
        <div className="flex items-center justify-between border-b border-border pb-6">
           <h2 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground flex items-center gap-2">
              <Database size={14} /> Tersedia {filteredSheets.length} Kategori
           </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {filteredSheets.map((sheet, idx) => (
            <div
              key={sheet._id || sheet.id}
              className="transform hover:-translate-y-1 transition-all duration-300"
              style={{ 
                contentVisibility: 'auto', 
                containIntrinsicSize: '0 250px',
              }}
            >
              <Link href={`/library/cheatsheet/${sheet.slug || sheet.id || sheet._id}`}>
                <Card 
                  className="group relative h-full bg-card hover:bg-[rgba(var(--primary-rgb),0.02)] border border-[rgba(var(--border-rgb),0.5)] hover:border-[rgba(var(--primary-rgb),0.4)] rounded-[2.5rem] p-8 cursor-pointer transition-all duration-500 shadow-sm hover:shadow-[0_20px_50px_rgba(var(--background-rgb),0.1)] dark:hover:shadow-[0_20px_50px_rgba(var(--background-rgb),0.3)] flex flex-col gap-6 overflow-hidden"
                >
                  {/* Background decoration */}
                  <div className="absolute -bottom-6 -right-6 text-[8rem] font-black text-[rgba(var(--foreground-rgb),0.03)] group-hover:text-[rgba(var(--primary-rgb),0.05)] transition-colors pointer-events-none italic">
                    {idx + 1}
                  </div>

                  <div className="flex items-center justify-between relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-[rgba(var(--primary-rgb),0.1)] group-hover:border-[rgba(var(--primary-rgb),0.2)] transition-all duration-500">
                        {getIconForCategory(sheet.category)}
                    </div>
                    <Badge variant="outline" className="bg-[rgba(var(--muted-rgb),0.5)] text-[10px] font-black uppercase tracking-widest text-muted-foreground border-border">
                        {sheet.category}
                    </Badge>
                  </div>

                  <div className="flex-1 relative z-10">
                    <h3 className="text-2xl md:text-3xl font-black text-foreground tracking-tight mb-2 group-hover:text-primary transition-colors">
                        {sheet.title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-2">
                        Lihat tabel referensi cepat untuk {sheet.title}. Dilengkapi dengan Furigana dan contoh penggunaan.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-[rgba(var(--border-rgb),0.3)] relative z-10">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                        Buka Tabel <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="text-[10px] font-bold text-[rgba(var(--muted-foreground-rgb),0.4)] italic">
                        Full Detail View
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function getIconForCategory(cat: string) {
  const c = cat?.toLowerCase() || "";
  if (c.includes("bilangan") || c.includes("angka") || c.includes("counter")) return <Hash size={24} />;
  if (c.includes("waktu") || c.includes("hari") || c.includes("tanggal")) return <Clock size={24} />;
  if (c.includes("grammar") || c.includes("partikel") || c.includes("aturan")) return <BookOpen size={24} />;
  if (c.includes("keluarga") || c.includes("relasi")) return <Users size={24} />;
  if (c.includes("topik") || c.includes("sosial") || c.includes("sapaan")) return <MessageSquare size={24} />;
  return <Sparkles size={24} />;
}
