/**
 * LOKASI FILE: app/(main)/library/cheatsheet/CheatsheetClient.tsx
 * KONSEP: Category-First Dashboard (Catatan Referensi Cepat)
 * RE-DESAIN: Category Cards -> Detail Modal
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
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
  X,
  ChevronRight,
  Info,
  Loader2,
} from "lucide-react";

const PdfGenerator = dynamic(() => import("@/components/features/pdf/PdfGenerator"), {
  ssr: false,
  loading: () => <Loader2 className="animate-spin text-primary" size={20} />
});
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import * as wanakana from "wanakana";
import { splitFurigana } from "@/lib/furigana";

export interface SheetItem {
  label: string;
  jp: string;
  romaji: string;
}
export interface Cheatsheet {
  _id: string;
  title: string;
  category: string;
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
  const [selectedSheet, setSelectedSheet] = useState<Cheatsheet | null>(null);

  const filteredSheets = safeSheets.filter((sheet) => {
    if (!sheet) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      sheet.title?.toLowerCase().includes(searchLower) ||
      sheet.category?.toLowerCase().includes(searchLower)
    );
  });

  const formatLabel = (text: string) => {
    if (!text) return text;
    const keywords = [
      "Contoh", "Catatan", "Penting", "Fakta budaya", 
      "Perubahan fonetis", "Nuansa", "Tips", "Catatan menarik",
      "Pengecualian penting", "Batas", "Fakta budaya", "Nuansa sosial"
    ];
    
    let formatted = text;
    keywords.forEach(key => {
      const regex = new RegExp(`(${key}:)`, 'g');
      formatted = formatted.replace(regex, '<strong class="text-primary/80 font-bold">$1</strong>');
    });

    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

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
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
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
              className="w-full bg-muted/20 border border-border/50 pl-14 pr-6 py-7 h-auto rounded-[2rem] text-foreground font-medium text-base neo-inset shadow-none placeholder:text-muted-foreground/30 focus-visible:ring-primary/20"
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
           <AnimatePresence mode="popLayout">
              {filteredSheets.map((sheet, idx) => (
                <motion.div
                  key={sheet._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card 
                    onClick={() => setSelectedSheet(sheet)}
                    className="group relative h-full bg-card hover:bg-primary/[0.02] border border-border/50 hover:border-primary/40 rounded-[2.5rem] p-8 cursor-pointer transition-all duration-500 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col gap-6 overflow-hidden"
                  >
                    {/* Background decoration */}
                    <div className="absolute -bottom-6 -right-6 text-[8rem] font-black text-foreground/[0.03] group-hover:text-primary/[0.05] transition-colors pointer-events-none italic">
                       {idx + 1}
                    </div>

                    <div className="flex items-center justify-between relative z-10">
                       <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-500">
                          {getIconForCategory(sheet.category)}
                       </div>
                       <Badge variant="outline" className="bg-muted/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-border">
                          {sheet.category}
                       </Badge>
                    </div>

                    <div className="flex-1 relative z-10">
                       <h3 className="text-2xl md:text-3xl font-black text-foreground tracking-tight mb-2 group-hover:text-primary transition-colors">
                          {sheet.title}
                       </h3>
                       <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-2">
                          Berisi {(sheet.items?.length || 0) + (sheet.linkedVocab?.length || 0)} materi referensi cepat yang siap dipelajari.
                       </p>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-border/30 relative z-10">
                       <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                          Buka Materi <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                       </div>
                       <div className="text-[10px] font-bold text-muted-foreground/40 italic">
                          Click to expand
                       </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
           </AnimatePresence>
        </div>
      </section>

      {/* Detailed Sheet Modal */}
      <Dialog open={!!selectedSheet} onOpenChange={(open) => !open && setSelectedSheet(null)}>
        <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto bg-card border border-border/50 rounded-[3rem] p-0 shadow-2xl z-[200] no-scrollbar">
          {selectedSheet && (() => {
            const items = [
              ...(selectedSheet.linkedVocab || []),
              ...(selectedSheet.items || []),
            ].filter(Boolean);

            return (
              <div className="flex flex-col h-full">
                {/* Modal Header */}
                <header className="sticky top-0 z-20 bg-card/80 backdrop-blur-xl border-b border-border/50 p-8 md:p-12 no-print">
                   <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                         <div className="flex items-center gap-3 mb-4">
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                               {selectedSheet.category}
                            </Badge>
                         </div>
                         <DialogTitle className="text-4xl md:text-6xl font-black text-foreground tracking-tighter leading-none mb-4">
                            {selectedSheet.title}
                         </DialogTitle>
                         <p className="text-muted-foreground font-medium text-sm max-w-2xl leading-relaxed">
                            Berikut adalah daftar referensi lengkap untuk kategori ini. Klik pada teks Jepang untuk menyalin teks tersebut.
                         </p>
                         <div className="mt-6 flex flex-wrap gap-3 no-print">
                            <PdfGenerator 
                              type="vocab"
                              title={selectedSheet.title}
                              level={selectedSheet.category}
                              data={items.map((item, i) => ({
                                _id: `${selectedSheet._id}-${i}`,
                                word: item.jp,
                                romaji: item.romaji,
                                meaning: item.label.replace(/<[^>]*>?/gm, '') // Clean HTML tags
                              }))}
                            />
                         </div>
                      </div>

                      <button 
                        onClick={() => setSelectedSheet(null)}
                        className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-all"
                      >
                        <X size={24} />
                      </button>
                   </div>
                </header>

                {/* Modal Content - Table */}
                <div className="print-section p-4 md:p-12">
                   <div className="overflow-hidden rounded-3xl border border-border/50 bg-muted/20">
                      <table className="w-full text-left border-collapse">
                         <thead>
                            <tr className="bg-muted border-b border-border/50">
                               <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-primary/60 w-16 text-center">#</th>
                               <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-primary/60 w-1/3">Ekspresi / Kata</th>
                               <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-primary/60">Penjelasan & Penggunaan</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-border/30">
                            {items.map((item, idx) => (
                               <tr key={idx} className="group hover:bg-primary/[0.02] transition-colors">
                                  <td className="px-6 py-8 text-center text-xs font-black text-muted-foreground/30 group-hover:text-primary/40 italic">
                                     {idx + 1}
                                  </td>
                                  <td className="px-6 py-8">
                                     <button 
                                       onClick={() => {
                                          navigator.clipboard.writeText(item.jp);
                                          toast.success("Disalin ke papan klip!");
                                       }}
                                       className="flex flex-col items-start gap-1 group/btn no-print"
                                     >
                                        <div className="text-2xl md:text-3xl font-japanese font-black text-foreground group-hover/btn:text-primary transition-colors tracking-tighter leading-relaxed">
                                           {(() => {
                                             const hiraReading = wanakana.toHiragana(item.romaji || "");
                                             return splitFurigana(item.jp || "", hiraReading).map((chunk, i) => (
                                               chunk.furi ? (
                                                 <ruby key={i}>
                                                   {chunk.text}
                                                   <rt className="text-[10px] md:text-xs text-primary/80 font-bold tracking-widest not-italic mb-1">
                                                     {chunk.furi}
                                                   </rt>
                                                 </ruby>
                                               ) : (
                                                 <span key={i}>{chunk.text}</span>
                                               )
                                             ));
                                           })()}
                                        </div>
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60 group-hover/btn:opacity-100 transition-opacity mt-1">
                                           {item.romaji}
                                        </span>
                                     </button>
                                     {/* Simple text for print only */}
                                     <div className="hidden print:block">
                                        <div className="text-2xl font-japanese font-black text-black">{item.jp}</div>
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.romaji}</div>
                                     </div>
                                  </td>
                                  <td className="px-6 py-8">
                                     <div className="text-sm md:text-base text-muted-foreground leading-relaxed font-medium group-hover:text-foreground transition-colors max-w-xl">
                                        {formatLabel(item.label)}
                                     </div>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>

                {/* Footer Info */}
                <footer className="p-8 md:p-12 pt-0 flex justify-between items-center no-print">
                   <div className="flex items-center gap-2">
                      <Info size={14} className="text-primary" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">
                         Scroll ke bawah untuk melihat materi lainnya
                      </span>
                   </div>
                   <Button 
                     variant="ghost" 
                     onClick={() => setSelectedSheet(null)}
                     className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary"
                   >
                      Selesai Membaca
                   </Button>
                </footer>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
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
