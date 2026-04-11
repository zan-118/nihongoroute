"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Hash, Clock, BookOpen, Layers } from "lucide-react";

/* ============================= */
/* TYPES */
/* ============================= */
interface SheetItem {
  label: string;
  jp: string;
  romaji: string;
}

interface Cheatsheet {
  _id: string;
  title: string;
  category: string;
  items: SheetItem[];
}

/* ============================= */
/* COMPONENT */
/* ============================= */
export default function CheatsheetClient({
  initialSheets = [], // Fallback bawaan agar tidak undefined
}: {
  initialSheets: Cheatsheet[];
}) {
  // ✨ FIX: Pastikan selalu berupa array yang valid
  const safeSheets = Array.isArray(initialSheets) ? initialSheets : [];

  const [searchTerm, setSearchTerm] = useState("");

  // Ambil ID pertama dengan aman
  const [selectedSheetId, setSelectedSheetId] = useState<string>(
    safeSheets.length > 0 ? safeSheets[0]._id : "",
  );

  // Filter pencarian berdasarkan judul atau kategori tabel
  const filteredSheets = safeSheets.filter(
    (sheet) =>
      sheet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sheet.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const activeSheet = safeSheets.find((s) => s._id === selectedSheetId);

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[600px] relative z-10">
      {/* SIDEBAR NAVIGATION (System Panel) */}
      <aside className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
        {/* Search Input */}
        <div className="relative group">
          <input
            type="text"
            placeholder="Search dataset..."
            className="w-full p-5 bg-[#1e2024] border border-white/5 rounded-2xl focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none text-white shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] transition-all font-mono text-sm placeholder:text-white/20"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-purple-400 transition-colors"
            size={18}
          />
        </div>

        {/* Categories List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {filteredSheets.length > 0 ? (
            filteredSheets.map((sheet) => {
              const isActive = selectedSheetId === sheet._id;
              return (
                <button
                  key={sheet._id}
                  onClick={() => setSelectedSheetId(sheet._id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 text-left group ${
                    isActive
                      ? "bg-[#15171a] border-purple-500/50 shadow-[inset_0_0_15px_rgba(168,85,247,0.15)]"
                      : "bg-[#1e2024] border-white/5 hover:border-white/20 shadow-[6px_6px_15px_rgba(0,0,0,0.3)]"
                  }`}
                >
                  <div
                    className={`p-3 rounded-xl border shadow-inner transition-colors ${isActive ? "bg-purple-500/10 border-purple-500/30 text-purple-400" : "bg-[#15171a] border-white/5 text-white/20 group-hover:text-white/60"}`}
                  >
                    {getIconForCategory(sheet.category)}
                  </div>
                  <div className="overflow-hidden">
                    <p
                      className={`text-[9px] uppercase font-black tracking-widest mb-1 transition-colors ${isActive ? "text-purple-400" : "text-white/30"}`}
                    >
                      {sheet.category}
                    </p>
                    <p
                      className={`text-sm font-bold truncate w-full transition-colors ${isActive ? "text-white" : "text-[#c4cfde]/80"}`}
                    >
                      {sheet.title}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-center p-8 text-white/20 text-xs font-mono border-2 border-dashed border-white/5 rounded-2xl">
              No Data Available
            </div>
          )}
        </div>
      </aside>

      {/* CONTENT AREA: DATA GRID */}
      <main className="flex-1 w-full overflow-hidden">
        <AnimatePresence mode="wait">
          {activeSheet ? (
            <motion.div
              key={activeSheet._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-[#1e2024] rounded-[3rem] p-6 md:p-10 border border-white/5 shadow-[15px_15px_40px_rgba(0,0,0,0.6)] min-h-full flex flex-col"
            >
              <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-6">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-3 uppercase tracking-tighter italic drop-shadow-md">
                    {activeSheet.title}
                  </h2>
                  <p className="text-purple-400 font-mono text-[10px] uppercase tracking-widest opacity-80 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                    Dataset: {activeSheet.category}
                  </p>
                </div>
              </div>

              {/* Responsive Data Table */}
              <div className="rounded-[2rem] border border-white/5 bg-[#15171a] shadow-[inset_0_2px_10px_rgba(0,0,0,0.4)] overflow-hidden flex-1 w-full">
                <div className="overflow-x-auto custom-scrollbar w-full h-full">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-[#1e2024] border-b border-white/5">
                        <th className="p-5 md:p-6 text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] w-1/3 whitespace-nowrap">
                          Item Label
                        </th>
                        <th className="p-5 md:p-6 text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] w-1/3 whitespace-nowrap">
                          Target (JP)
                        </th>
                        <th className="p-5 md:p-6 text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] w-1/3 whitespace-nowrap">
                          Romaji
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {activeSheet.items?.map((item, idx) => (
                        <motion.tr
                          key={idx}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.02 }}
                          className="group hover:bg-white/5 transition-colors"
                        >
                          <td className="p-5 md:p-6">
                            <span className="text-white/60 font-medium text-sm">
                              {item.label}
                            </span>
                          </td>
                          <td className="p-5 md:p-6">
                            <span className="text-white text-xl md:text-2xl font-japanese font-bold group-hover:text-purple-400 transition-colors drop-shadow-sm">
                              {item.jp}
                            </span>
                          </td>
                          <td className="p-5 md:p-6">
                            <span className="text-[#c4cfde]/40 font-mono text-xs group-hover:text-[#c4cfde] transition-colors">
                              {item.romaji}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white/20 border-2 border-dashed border-white/5 rounded-[3rem] p-20">
              <span className="text-6xl mb-6 opacity-50">📡</span>
              <p className="font-mono font-black uppercase tracking-widest text-sm text-center">
                Awaiting Data Selection
                <br />
                <span className="text-[10px] mt-2 block opacity-50">
                  (Atau data di Sanity masih kosong)
                </span>
              </p>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Helper untuk memilih ikon berdasarkan kategori
function getIconForCategory(cat: string) {
  const c = cat?.toLowerCase() || "";
  if (c.includes("bilangan") || c.includes("angka")) return <Hash size={18} />;
  if (c.includes("waktu") || c.includes("hari") || c.includes("tanggal"))
    return <Clock size={18} />;
  if (c.includes("grammar") || c.includes("partikel"))
    return <BookOpen size={18} />;
  return <Layers size={18} />;
}
