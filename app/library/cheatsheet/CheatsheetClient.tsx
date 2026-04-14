"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Hash,
  Clock,
  BookOpen,
  Layers,
  ChevronDown,
  Home,
} from "lucide-react";
import Link from "next/link";

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

  // ✨ PERBAIKAN: Gunakan .filter(Boolean) untuk membuang nilai null/undefined
  // yang mungkin disebabkan oleh referensi Sanity yang terputus/dihapus
  const combinedItems = [
    ...(activeSheet?.linkedVocab || []),
    ...(activeSheet?.items || []),
  ].filter(Boolean);

  return (
    <section className="flex flex-col lg:flex-row gap-6 lg:gap-10 min-h-[600px] relative z-10 pb-20 uppercase">
      {/* BREADCRUMB */}
      <nav className="mb-4 flex flex-wrap items-center gap-2 text-[9px] md:text-xs font-black uppercase tracking-[0.2em] font-mono w-full col-span-full">
        <Link
          href="/dashboard"
          className="text-white/30 hover:text-emerald-400 transition-colors flex items-center gap-1.5 p-2 rounded-lg hover:bg-white/5"
        >
          <Home size={14} /> Beranda
        </Link>
        <span className="text-white/10">/</span>
        <Link
          href="/library"
          className="text-white/40 hover:text-emerald-400 transition-colors flex items-center gap-1.5 p-2 rounded-lg hover:bg-white/5"
        >
          <Layers size={14} /> Koleksi
        </Link>
        <span className="text-white/10">/</span>
        <span className="text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-400/20 flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <Hash size={14} /> Ringkasan
        </span>
      </nav>

      <aside className="w-full lg:w-80 flex flex-col gap-4 shrink-0">
        <div className="relative group">
          <input
            type="text"
            placeholder="Cari referensi..."
            className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/50 outline-none text-white transition-all font-mono text-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors"
            size={18}
          />
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl text-white"
        >
          <span className="flex items-center gap-2 font-bold">
            {activeSheet ? activeSheet.title : "Pilih Kategori"}
          </span>
          <ChevronDown
            className={`transition-transform ${isMobileMenuOpen ? "rotate-180" : ""}`}
          />
        </button>

        <nav
          className={`${isMobileMenuOpen ? "flex" : "hidden"} lg:flex flex-col gap-2 max-h-[50vh] lg:max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar`}
        >
          {filteredSheets.map((sheet) => {
            const isActive = selectedSheetId === sheet._id;
            return (
              <button
                key={sheet._id}
                onClick={() => {
                  setSelectedSheetId(sheet._id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 text-left group border ${isActive ? "bg-emerald-400/10 border-emerald-400/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "bg-transparent border-white/5 hover:bg-white/5"}`}
              >
                <div
                  className={`p-2 rounded-lg ${isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-white"}`}
                >
                  {getIconForCategory(sheet.category)}
                </div>
                <div className="overflow-hidden">
                  <p
                    className={`text-[10px] uppercase font-bold tracking-tighter ${isActive ? "text-emerald-400" : "text-slate-500"}`}
                  >
                    {sheet.category}
                  </p>
                  <p
                    className={`text-sm font-semibold truncate ${isActive ? "text-white" : "text-slate-400"}`}
                  >
                    {sheet.title}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>
      </aside>

      <article className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          {activeSheet ? (
            <motion.div
              key={activeSheet._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-4 md:p-8"
            >
              <div className="mb-8">
                <h2 className="text-2xl md:text-4xl font-black text-white mb-2 uppercase italic tracking-tight">
                  {activeSheet.title}
                </h2>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-emerald-400 font-mono text-[10px] uppercase tracking-[0.2em]">
                    {activeSheet.category}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:block">
                <div className="hidden md:grid grid-cols-3 p-4 border-b border-white/10 text-[10px] font-black font-mono text-emerald-400 uppercase tracking-widest">
                  <div>LABEL ARTI</div>
                  <div>HURUF JEPANG</div>
                  <div>ROMAJI</div>
                </div>

                {combinedItems.length > 0 ? (
                  combinedItems.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="group flex flex-col md:flex-row md:items-center p-5 md:p-4 rounded-2xl md:rounded-none md:border-b border-white/5 hover:bg-white/[0.04] transition-all bg-white/5 md:bg-transparent "
                    >
                      <div className="md:w-1/3 mb-1 md:mb-0">
                        <span className="text-xs md:text-sm text-slate-400 font-medium">
                          {item.label}
                        </span>
                      </div>
                      <div className="md:w-1/3 mb-2 md:mb-0">
                        <span className="text-2xl md:text-xl font-japanese font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {item.jp}
                        </span>
                      </div>
                      <div className="md:w-1/3">
                        <span className="text-[10px] md:text-xs font-mono text-slate-500 uppercase tracking-tighter">
                          {item.romaji}
                        </span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-20 text-center text-slate-500 font-mono text-xs">
                    Belum ada data tersedia.
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center p-20 border border-dashed border-white/10 rounded-[2rem]">
              <p className="text-slate-600 font-mono animate-pulse uppercase tracking-widest text-sm">
                Pilih referensi di samping
              </p>
            </div>
          )}
        </AnimatePresence>
      </article>
    </section>
  );
}

function getIconForCategory(cat: string) {
  const c = cat?.toLowerCase() || "";
  if (c.includes("bilangan") || c.includes("angka")) return <Hash size={18} />;
  if (c.includes("waktu") || c.includes("hari") || c.includes("tanggal"))
    return <Clock size={18} />;
  if (c.includes("grammar") || c.includes("partikel"))
    return <BookOpen size={18} />;
  return <Layers size={18} />;
}
