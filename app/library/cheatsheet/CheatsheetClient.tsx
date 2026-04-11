"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Table, Hash, Clock, BookOpen, Layers } from "lucide-react";

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

export default function CheatsheetClient({
  initialSheets,
}: {
  initialSheets: Cheatsheet[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSheetId, setSelectedSheetId] = useState<string>(
    initialSheets[0]?._id || "",
  );

  // Filter sheets berdasarkan search (judul tabel)
  const filteredSheets = initialSheets.filter(
    (sheet) =>
      sheet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sheet.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const activeSheet = initialSheets.find((s) => s._id === selectedSheetId);

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full lg:w-80 space-y-6">
        {/* Search inside Cheatsheet */}
        <div className="relative group">
          <input
            type="text"
            placeholder="Cari tabel..."
            className="w-full p-4 bg-[#1e2024] border border-white/5 rounded-2xl focus:ring-2 focus:ring-[#0ef] outline-none text-white shadow-[8px_8px_16px_#15171a,-8px_-8px_16px_#27292e] transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-[#0ef] transition-colors"
            size={18}
          />
        </div>

        {/* Categories List */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredSheets.map((sheet) => (
            <button
              key={sheet._id}
              onClick={() => setSelectedSheetId(sheet._id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                selectedSheetId === sheet._id
                  ? "bg-[#1e2024] border-[#0ef]/50 shadow-[inset_4px_4px_8px_#15171a,inset_-4px_-4px_8px_#27292e] text-[#0ef]"
                  : "bg-[#1e2024] border-white/5 text-white/40 hover:border-white/20 shadow-[6px_6px_12px_#15171a,-6px_-6px_12px_#27292e]"
              }`}
            >
              <div
                className={`p-2 rounded-xl bg-white/5 ${selectedSheetId === sheet._id ? "text-[#0ef]" : "text-white/20"}`}
              >
                {getIconForCategory(sheet.category)}
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase font-black tracking-widest opacity-50">
                  {sheet.category}
                </p>
                <p className="text-sm font-bold truncate w-40">{sheet.title}</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* CONTENT AREA: THE TABLE */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {activeSheet ? (
            <motion.div
              key={activeSheet._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-[#1e2024] rounded-[3rem] p-8 border border-white/5 shadow-[20px_20px_60px_#15171a,-20px_-20px_60px_#27292e] min-h-full"
            >
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                <div>
                  <h2 className="text-3xl font-black text-white mb-1 uppercase tracking-tighter">
                    {activeSheet.title}
                  </h2>
                  <p className="text-[#0ef] font-mono text-xs uppercase tracking-widest opacity-60">
                    Category: {activeSheet.category}
                  </p>
                </div>
                <div className="hidden md:block p-4 rounded-2xl bg-white/5 border border-white/5">
                  <Table className="text-[#0ef]" />
                </div>
              </div>

              {/* Responsive Table */}
              <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="p-5 text-[10px] font-black text-[#0ef] uppercase tracking-[0.2em]">
                        Label / Arti
                      </th>
                      <th className="p-5 text-[10px] font-black text-[#0ef] uppercase tracking-[0.2em]">
                        Japanese
                      </th>
                      <th className="p-5 text-[10px] font-black text-[#0ef] uppercase tracking-[0.2em]">
                        Romaji
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {activeSheet.items.map((item, idx) => (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group hover:bg-white/5 transition-colors"
                      >
                        <td className="p-5">
                          <span className="text-white/60 font-medium text-sm">
                            {item.label}
                          </span>
                        </td>
                        <td className="p-5">
                          <span className="text-white text-2xl font-japanese font-bold group-hover:text-[#0ef] transition-colors">
                            {item.jp}
                          </span>
                        </td>
                        <td className="p-5">
                          <span className="text-[#0ef]/40 font-mono text-xs italic group-hover:text-[#0ef]/80 transition-colors">
                            {item.romaji}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-full text-white/10 font-black text-4xl uppercase tracking-widest">
              Pilih Tabel
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Helper untuk ikon dinamis berdasarkan kategori
function getIconForCategory(cat: string) {
  const c = cat.toLowerCase();
  if (c.includes("bilangan") || c.includes("angka")) return <Hash size={18} />;
  if (c.includes("waktu") || c.includes("hari")) return <Clock size={18} />;
  if (c.includes("grammar") || c.includes("partikel"))
    return <BookOpen size={18} />;
  return <Layers size={18} />;
}
