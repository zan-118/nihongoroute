"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Hash, Clock, BookOpen, Layers } from "lucide-react";

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

  const filteredSheets = safeSheets.filter((sheet) => {
    if (!sheet) return false;
    const searchLower = (searchTerm || "").toLowerCase();
    const titleMatch = (sheet.title || "").toLowerCase().includes(searchLower);
    const catMatch = (sheet.category || "").toLowerCase().includes(searchLower);
    return titleMatch || catMatch;
  });

  const activeSheet = safeSheets.find((s) => s?._id === selectedSheetId);
  const combinedItems = [
    ...(activeSheet?.linkedVocab || []),
    ...(activeSheet?.items || []),
  ];

  return (
    <section className="flex flex-col lg:flex-row gap-8 min-h-[600px] relative z-10 pb-20">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
        <div className="relative group">
          {/* Menggunakan neo-inset untuk Search Bar */}
          <input
            type="text"
            placeholder="Search dataset..."
            className="neo-inset w-full p-4 pl-12 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 outline-none text-white transition-all font-mono text-sm placeholder:text-slate-600"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors"
            size={18}
          />
        </div>

        <nav className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {filteredSheets?.length > 0 ? (
            filteredSheets.map((sheet) => {
              const isActive = selectedSheetId === sheet._id;
              return (
                <button
                  key={sheet._id}
                  onClick={() => setSelectedSheetId(sheet._id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 text-left group ${
                    isActive
                      ? "neo-inset border-cyan-400/50 shadow-[inset_0_0_15px_rgba(34,211,238,0.1)]"
                      : "neo-card border-transparent hover:border-white/10"
                  }`}
                >
                  <div
                    className={`p-3 rounded-xl transition-colors ${
                      isActive
                        ? "bg-cyan-400/20 text-cyan-400"
                        : "bg-white/5 text-slate-500 group-hover:text-white"
                    }`}
                  >
                    {getIconForCategory(sheet.category)}
                  </div>
                  <div className="overflow-hidden">
                    <p
                      className={`text-[9px] uppercase font-black font-mono tracking-widest mb-1 transition-colors ${
                        isActive ? "text-cyan-400" : "text-slate-500"
                      }`}
                    >
                      {sheet.category}
                    </p>
                    <p
                      className={`text-sm font-bold truncate w-full transition-colors ${
                        isActive ? "text-white" : "text-slate-400"
                      }`}
                    >
                      {sheet.title}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-center p-8 text-slate-500 text-xs font-mono border border-dashed border-white/10 rounded-2xl">
              No Data Available
            </div>
          )}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <article className="flex-1 w-full overflow-hidden">
        <AnimatePresence mode="wait">
          {activeSheet ? (
            <motion.div
              key={activeSheet._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="neo-card p-6 md:p-10 min-h-full flex flex-col"
            >
              <header className="flex justify-between items-end mb-8 border-b border-white/5 pb-6">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-3 uppercase tracking-tighter italic drop-shadow-md">
                    {activeSheet.title}
                  </h2>
                  <p className="text-cyan-400 font-mono text-[10px] uppercase tracking-widest opacity-80 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    Dataset: {activeSheet.category}
                  </p>
                </div>
              </header>

              <div className="neo-inset overflow-hidden flex-1 w-full">
                <div className="overflow-x-auto custom-scrollbar w-full h-full max-h-[60vh]">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead className="sticky top-0 bg-[#0f1115] z-10 shadow-md">
                      <tr className="border-b border-white/5">
                        <th className="p-5 md:p-6 text-[10px] font-black font-mono text-cyan-400 uppercase tracking-[0.2em] w-1/3 whitespace-nowrap">
                          Item Label
                        </th>
                        <th className="p-5 md:p-6 text-[10px] font-black font-mono text-cyan-400 uppercase tracking-[0.2em] w-1/3 whitespace-nowrap">
                          Target (JP)
                        </th>
                        <th className="p-5 md:p-6 text-[10px] font-black font-mono text-cyan-400 uppercase tracking-[0.2em] w-1/3 whitespace-nowrap">
                          Romaji
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {combinedItems.length > 0 ? (
                        combinedItems.map((item, idx) => (
                          <motion.tr
                            key={idx}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.02 }}
                            className="group hover:bg-white/5 transition-colors"
                          >
                            <td className="p-5 md:p-6">
                              <span className="text-slate-400 font-medium text-sm">
                                {item.label}
                              </span>
                            </td>
                            <td className="p-5 md:p-6">
                              <span className="text-white text-xl md:text-2xl font-japanese font-bold group-hover:text-cyan-400 transition-colors drop-shadow-sm">
                                {item.jp}
                              </span>
                            </td>
                            <td className="p-5 md:p-6">
                              <span className="text-slate-500 font-mono text-xs group-hover:text-slate-300 transition-colors">
                                {item.romaji}
                              </span>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="p-10 text-center text-slate-500 font-mono text-xs"
                          >
                            No items in this cheatsheet yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-600 border border-dashed border-white/10 rounded-[3rem] p-20">
              <span className="text-6xl mb-6 opacity-30">📡</span>
              <p className="font-mono font-black uppercase tracking-widest text-sm text-center">
                Awaiting Data Selection
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
