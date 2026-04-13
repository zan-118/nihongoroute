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
} from "lucide-react";

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
  ];

  return (
    <section className="flex flex-col lg:flex-row gap-6 lg:gap-10 min-h-[600px] relative z-10 pb-20 uppercase">
      {/* SIDEBAR / MOBILE NAV */}
      <aside className="w-full lg:w-80 flex flex-col gap-4 shrink-0">
        <div className="relative group">
          <input
            type="text"
            placeholder="Cari dataset..."
            className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 outline-none text-white transition-all font-mono text-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors"
            size={18}
          />
        </div>

        {/* Mobile Dropdown Trigger */}
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

        {/* Navigation List */}
        <nav
          className={`
          ${isMobileMenuOpen ? "flex" : "hidden"} 
          lg:flex flex-col gap-2 max-h-[50vh] lg:max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar
        `}
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
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 text-left group border ${
                  isActive
                    ? "bg-cyan-400/10 border-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                    : "bg-transparent border-white/5 hover:bg-white/5"
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-white"}`}
                >
                  {getIconForCategory(sheet.category)}
                </div>
                <div className="overflow-hidden">
                  <p
                    className={`text-[10px] uppercase font-bold tracking-tighter ${isActive ? "text-cyan-400" : "text-slate-500"}`}
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

      {/* CONTENT AREA */}
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
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-cyan-400 font-mono text-[10px] uppercase tracking-[0.2em]">
                    {activeSheet.category}
                  </span>
                </div>
              </div>

              {/* Responsive Table / Card View */}
              <div className="grid grid-cols-1 gap-3 md:block">
                {/* Header Table (Hanya muncul di Desktop) */}
                <div className="hidden md:grid grid-cols-3 p-4 border-b border-white/10 text-[10px] font-black font-mono text-cyan-400 uppercase tracking-widest">
                  <div>LABEL</div>
                  <div>TARGET (JP)</div>
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
                      {/* Label */}
                      <div className="md:w-1/3 mb-1 md:mb-0">
                        <span className="text-xs md:text-sm text-slate-400 font-medium">
                          {item.label}
                        </span>
                      </div>

                      {/* Japanese */}
                      <div className="md:w-1/3 mb-2 md:mb-0">
                        <span className="text-2xl md:text-xl font-japanese font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {item.jp}
                        </span>
                      </div>

                      {/* Romaji */}
                      <div className="md:w-1/3">
                        <span className="text-[10px] md:text-xs font-mono text-slate-500 uppercase tracking-tighter">
                          {item.romaji}
                        </span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-20 text-center text-slate-500 font-mono text-xs">
                    Belum ada item tersedia.
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center p-20 border border-dashed border-white/10 rounded-[2rem]">
              <p className="text-slate-600 font-mono animate-pulse uppercase tracking-widest text-sm">
                Pilih dataset di samping
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
