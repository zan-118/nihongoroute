/**
 * LOKASI FILE: app/(main)/library/cheatsheet/CheatsheetClient.tsx
 * KONSEP: Mobile-First Neumorphic (Catatan Referensi Cepat)
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Hash,
  Clock,
  BookOpen,
  ChevronDown,
  Home,
  Activity,
  FileText,
  Database,
  ArrowRight,
  Library,
  Users,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  const [selectedSheetId, setSelectedSheetId] = useState<string>(
    safeSheets?.length > 0 ? safeSheets[0]?._id : "",
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredSheets = safeSheets.filter((sheet) => {
    if (!sheet) return false;
    const searchLower = (searchTerm || "").toLowerCase();
    return (
      sheet.title?.toLowerCase().includes(searchLower) ||
      sheet.category?.toLowerCase().includes(searchLower)
    );
  });

  const activeSheet = safeSheets.find((s) => s?._id === selectedSheetId);
  const combinedItems = [
    ...(activeSheet?.linkedVocab || []),
    ...(activeSheet?.items || []),
  ].filter((item) => item !== null && item !== undefined);
  // ======================
  // HELPERS
  // ======================
  const formatLabel = (text: string) => {
    if (!text) return text;
    // Highlight keywords followed by colon
    const keywords = [
      "Contoh", "Catatan", "Penting", "Fakta budaya", 
      "Perubahan fonetis", "Nuansa", "Tips", "Catatan menarik",
      "Pengecualian penting", "Batas", "Fakta budaya", "Nuansa sosial"
    ];
    
    let formatted = text;
    keywords.forEach(key => {
      const regex = new RegExp(`(${key}:)`, 'g');
      formatted = formatted.replace(regex, '<strong class="text-cyber-neon/80 font-bold">$1</strong>');
    });

    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  // ======================
  // RENDER
  // ======================
  return (
    <div className="relative w-full z-10 flex flex-col flex-1 pb-24 px-4 md:px-8 lg:px-12">
      <nav className="mb-8 md:mb-12 flex flex-wrap items-center gap-2 md:gap-4 text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        <Link href="/dashboard" className="hover:text-cyber-neon transition-colors flex items-center gap-1.5 md:gap-2">
          <Home size={14} /> Beranda
        </Link>
        <span className="text-white/10">/</span>
        <Link href="/library" className="hover:text-cyber-neon transition-colors flex items-center gap-1.5 md:gap-2">
          <Library size={14} /> Pustaka
        </Link>
        <span className="text-white/10">/</span>
        <span className="text-cyber-neon flex items-center gap-1.5 md:gap-2">
          <FileText size={14} /> Cheatsheet
        </span>
      </nav>

      <header className="mb-10 md:mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 border-b border-white/5 pb-8 md:pb-12">
          <div className="flex items-center gap-5 md:gap-6">
            <Card className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-2xl bg-cyber-neon/10 border-cyber-neon/20 flex items-center justify-center neo-inset shadow-none">
              <FileText size={28} className="text-cyber-neon md:w-8 md:h-8" />
            </Card>
            <div className="text-left flex-1 min-w-0">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none mb-2 break-words">
                Catatan <span className="text-cyber-neon">Cepat</span>
              </h1>
              <span className="text-[10px] md:text-xs text-slate-500 font-medium tracking-tight uppercase tracking-widest block">Referensi kilat buat bantu hafalanmu.</span>
            </div>
          </div>
        </div>
      </header>

      <section className="flex flex-col lg:flex-row gap-8 lg:gap-10 min-h-[600px] lg:min-h-[700px] items-start">
        <aside className="w-full lg:w-80 xl:w-96 flex flex-col gap-5 shrink-0 lg:sticky lg:top-24">
          <div className="relative group">
            <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyber-neon transition-colors z-10" size={18} />
            <Input
              type="text"
              placeholder="Cari apa nih? Ketik aja di sini..."
              className="w-full bg-black/40 border-white/5 pl-12 md:pl-14 pr-6 py-6 rounded-2xl text-white font-medium text-sm neo-inset shadow-none placeholder:text-slate-600 focus-visible:ring-cyber-neon/30"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button
            variant="ghost"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden flex items-center justify-between h-auto py-5 px-6 bg-black/40 border-white/5 rounded-2xl text-white neo-card shadow-none active:translate-y-1 transition-all whitespace-normal"
          >
            <span className="flex-1 flex items-center gap-3 font-bold uppercase tracking-widest text-[10px] md:text-xs text-left leading-tight pr-4">
              {activeSheet ? activeSheet.title : "Pilih Kategori"}
            </span>
            <ChevronDown className={`transition-transform duration-300 ${isMobileMenuOpen ? "rotate-180 text-cyber-neon" : ""}`} size={18} />
          </Button>

          <nav className={`${isMobileMenuOpen ? "flex" : "hidden"} lg:flex flex-col gap-3 max-h-[50vh] lg:max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar no-scrollbar py-2`}>
            {filteredSheets.map((sheet) => {
              const isActive = selectedSheetId === sheet._id;
              return (
                <Button
                  key={sheet._id}
                  variant="ghost"
                  onClick={() => {
                    setSelectedSheetId(sheet._id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-start gap-4 md:gap-5 h-auto p-4 md:p-5 rounded-2xl transition-all duration-300 text-left group border neo-card shadow-none whitespace-normal ${
                    isActive 
                      ? "bg-cyber-neon text-black border-none shadow-[0_0_20px_rgba(0,238,255,0.3)]" 
                      : "bg-black/40 border-white/5 hover:border-cyber-neon/40 text-slate-500 hover:text-white"
                  }`}
                >
                  <div className={`w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-xl neo-inset shadow-none flex items-center justify-center transition-all duration-300 ${isActive ? "bg-black/20 text-black border-none" : "bg-black/20 text-slate-600 group-hover:text-cyber-neon"}`}>
                    {getIconForCategory(sheet.category)}
                  </div>
                  <div className="overflow-hidden flex-1 flex flex-col items-start">
                    <p className={`text-[7px] md:text-[9px] uppercase font-bold tracking-widest mb-1 text-left leading-tight ${isActive ? "text-black/60" : "text-slate-500 group-hover:text-cyber-neon/80"}`}>
                      {sheet.category}
                    </p>
                    <p className={`text-xs md:text-base font-bold tracking-tight text-left leading-snug break-words ${isActive ? "text-black" : "text-slate-300 group-hover:text-white"}`}>
                      {sheet.title}
                    </p>
                  </div>
                  {!isActive && (
                     <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-cyber-neon shrink-0" />
                  )}
                </Button>
              );
            })}
          </nav>
        </aside>

        <article className="flex-1 min-w-0 w-full h-full">
          <AnimatePresence mode="wait">
            {activeSheet ? (
              <motion.div
                key={activeSheet._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full h-full"
              >
                <Card className="bg-cyber-surface border-white/5 rounded-3xl md:rounded-[3.5rem] p-6 md:p-10 lg:p-12 neo-card shadow-none h-full flex flex-col relative overflow-hidden">
                  {/* Decorative background number */}
                  <div className="absolute top-6 right-6 md:top-10 md:right-10 text-[6rem] md:text-[8rem] lg:text-[10rem] font-black text-white/[0.02] pointer-events-none tracking-tighter">
                     {activeSheet.category.substring(0,3).toUpperCase()}
                  </div>

                  <div className="mb-10 md:mb-14 flex flex-col xl:flex-row xl:items-end justify-between gap-6 relative z-10">
                    <div>
                       <div className="flex items-center gap-3 mb-4">
                          <Activity size={14} className="text-cyber-neon animate-pulse" />
                          <span className="text-cyber-neon font-bold text-[10px] md:text-xs uppercase tracking-widest">
                            Catatan Pilihanmu
                          </span>
                        </div>
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-xl leading-none">
                          {activeSheet.title}
                        </h2>
                    </div>
                    <Badge variant="outline" className="px-4 py-2 md:px-5 md:py-2.5 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-600 border-white/10 neo-inset h-auto bg-black/40">
                      {activeSheet.category}
                    </Badge>
                  </div>

                  <div className="flex flex-col w-full flex-1 relative z-10">
                    <div className="hidden md:flex items-center justify-between p-6 md:p-8 border-b border-white/10 text-[9px] md:text-[10px] font-bold text-cyber-neon/60 uppercase tracking-widest">
                      <div className="w-1/3">Ekspresi / Kata</div>
                      <div className="w-2/3 pl-10">Penjelasan & Penggunaan</div>
                    </div>
                    
                    {combinedItems.length > 0 ? (
                      <div className="flex flex-col mt-4 md:mt-6 h-full">
                        {combinedItems.map((item, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: (idx % 20) * 0.03 }}
                            className="group flex flex-col md:flex-row p-6 md:p-10 rounded-2xl md:rounded-none md:border-b border-white/[0.05] hover:bg-white/[0.015] transition-all duration-300 bg-black/20 md:bg-transparent gap-6 md:gap-0 mb-4 md:mb-0 relative overflow-hidden"
                          >
                            {/* Left Side: The Japanese Term & Romaji */}
                            <div className="w-full md:w-[35%] flex flex-col gap-3 relative z-10 shrink-0">
                              <div className="flex flex-col">
                                <span className="text-xl md:text-2xl lg:text-4xl font-japanese font-black text-white group-hover:text-cyber-neon transition-all duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] tracking-tighter break-words">
                                  {item?.jp || "—"}
                                </span>
                                <div className="flex items-center gap-2 mt-2">
                                  <div className="w-4 h-[1px] bg-cyber-neon/30" />
                                  <span className="text-[9px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] break-all">
                                    {item?.romaji || "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Right Side: The Detailed Explanation */}
                            <div className="w-full md:w-[65%] md:pl-10 relative z-10">
                              <div className="text-sm md:text-base text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300 whitespace-pre-wrap font-medium tracking-wide break-words">
                                {formatLabel(item?.label || "")}
                              </div>
                            </div>
                            
                            {/* Decorative background number */}
                            <div className="absolute -bottom-4 -right-2 text-5xl md:text-7xl font-black text-white/[0.02] pointer-events-none select-none italic group-hover:text-cyber-neon/[0.03] transition-colors">
                               {idx + 1}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <Card className="flex-1 flex flex-col items-center justify-center p-16 md:p-24 border border-dashed border-white/10 bg-black/20 rounded-3xl md:rounded-[3rem] neo-inset shadow-none">
                        <Database size={48} className="text-slate-600 mb-6 md:mb-8" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs md:text-sm text-center">
                          Belum ada data referensi untuk kategori ini
                        </p>
                      </Card>
                    )}
                  </div>
                </Card>
              </motion.div>
            ) : (
              <Card className="h-[400px] md:h-[600px] flex flex-col items-center justify-center p-12 md:p-24 border border-dashed border-white/10 bg-black/20 rounded-3xl md:rounded-[3.5rem] neo-inset shadow-none">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-cyber-neon/5 flex items-center justify-center border border-cyber-neon/10 mb-6 md:mb-10">
                   <FileText size={32} className="text-slate-500 md:w-10 md:h-10 animate-pulse" />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs md:text-sm text-center">
                  Pilih salah satu catatan di sebelah kiri buat mulai belajar ya!
                </p>
              </Card>
            )}
          </AnimatePresence>
        </article>
      </section>
    </div>
  );
}

function getIconForCategory(cat: string) {
  const c = cat?.toLowerCase() || "";
  if (c.includes("bilangan") || c.includes("angka") || c.includes("counter")) return <Hash size={18} />;
  if (c.includes("waktu") || c.includes("hari") || c.includes("tanggal")) return <Clock size={18} />;
  if (c.includes("grammar") || c.includes("partikel") || c.includes("aturan")) return <BookOpen size={18} />;
  if (c.includes("keluarga") || c.includes("relasi")) return <Users size={18} />;
  if (c.includes("topik") || c.includes("sosial") || c.includes("sapaan")) return <MessageSquare size={18} />;
  return <Sparkles size={18} />;
}
