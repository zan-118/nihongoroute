"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TTSReader from "@/components/TTSReader";
import { X, Search, Info } from "lucide-react";

export default function VerbListClient({
  initialVerbs,
}: {
  initialVerbs: any[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeGroup, setActiveGroup] = useState<number | null>(null);
  const [selectedVerb, setSelectedVerb] = useState<any | null>(null);

  const filteredVerbs = initialVerbs.filter((verb) => {
    const matchesSearch =
      verb.jisho.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verb.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verb.masu.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = activeGroup ? verb.group === activeGroup : true;
    return matchesSearch && matchesGroup;
  });

  return (
    <section>
      {/* HEADER CONTROLS: SEARCH & FILTER */}
      <div className="flex flex-col xl:flex-row gap-6 mb-12">
        {/* Search Bar */}
        <div className="relative flex-1 group">
          <input
            type="text"
            placeholder="Cari kata kerja (makan, taberu, 食べる)..."
            className="w-full p-5 bg-[#1e2024] border border-white/5 rounded-[2rem] focus:ring-2 focus:ring-[#0ef] outline-none transition-all text-white pr-14 shadow-[10px_10px_20px_#15171a,-10px_-10px_20px_#27292e]"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-[#0ef] transition-colors"
            size={20}
          />
        </div>

        {/* Group Filter Buttons */}
        <div className="flex gap-3 p-2 bg-[#1e2024] rounded-[2rem] border border-white/5 shadow-[10px_10px_20px_#15171a,-10px_-10px_20px_#27292e]">
          {[1, 2, 3].map((g) => (
            <button
              key={g}
              onClick={() => setActiveGroup(activeGroup === g ? null : g)}
              className={`flex-1 md:flex-none px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                activeGroup === g
                  ? g === 1
                    ? "bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                    : g === 2
                      ? "bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.5)]"
                      : "bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.5)]"
                  : "text-white/30 hover:bg-white/5 hover:text-white"
              }`}
            >
              Group {g}
            </button>
          ))}
          {activeGroup && (
            <button
              onClick={() => setActiveGroup(null)}
              className="px-4 text-white/20 hover:text-red-500 transition-colors text-xs font-bold uppercase"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* VERB GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredVerbs.map((verb) => (
            <motion.div
              key={verb._id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => setSelectedVerb(verb)}
              className="bg-[#1e2024] p-8 rounded-[2.5rem] border border-white/5 hover:border-[#0ef]/30 transition-all group relative cursor-pointer shadow-[15px_15px_30px_#15171a,-15px_-15px_30px_#27292e]"
            >
              <div className="flex justify-between items-start mb-6">
                <span
                  className={`px-4 py-1 rounded-full text-[9px] font-black tracking-widest border ${
                    verb.group === 1
                      ? "border-blue-500/30 text-blue-400 bg-blue-500/5"
                      : verb.group === 2
                        ? "border-orange-500/30 text-orange-400 bg-orange-500/5"
                        : "border-green-500/30 text-green-400 bg-green-500/5"
                  }`}
                >
                  G{verb.group}
                </span>
                <TTSReader text={verb.jisho} minimal={true} />
              </div>

              <div className="mb-6">
                <h3 className="text-3xl font-black text-white tracking-tighter mb-2 group-hover:text-[#0ef] transition-colors">
                  {verb.jisho}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[#0ef] text-[10px] font-mono font-bold uppercase tracking-widest bg-[#0ef]/5 px-2 py-1 rounded-md">
                    {verb.meaning}
                  </p>
                  <span className="text-white/30 font-japanese text-xs">
                    {verb.furigana}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <p className="opacity-30 uppercase font-black mb-1">Masu</p>
                  <p className="text-white/80 font-bold">{verb.masu}</p>
                </div>
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <p className="opacity-30 uppercase font-black mb-1">
                    Te-Form
                  </p>
                  <p className="text-yellow-500 font-bold">{verb.te}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* MODAL DETAIL (13+ KONJUGASI) */}
      <AnimatePresence>
        {selectedVerb && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVerb(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-full max-w-3xl bg-[#1e2024] rounded-[3.5rem] p-10 shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden"
            >
              <button
                onClick={() => setSelectedVerb(null)}
                className="absolute top-8 right-8 p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all shadow-lg"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-10 pb-8 border-b border-white/5">
                <div
                  className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-2xl ${
                    selectedVerb.group === 1
                      ? "bg-blue-600 shadow-blue-500/20"
                      : selectedVerb.group === 2
                        ? "bg-orange-600 shadow-orange-500/20"
                        : "bg-green-600 shadow-green-500/20"
                  }`}
                >
                  {selectedVerb.group}
                </div>
                <div>
                  <h2 className="text-5xl font-black text-white mb-2 tracking-tighter italic">
                    {selectedVerb.jisho}
                  </h2>
                  <div className="flex items-center gap-3">
                    <p className="text-[#0ef] font-mono font-black text-lg uppercase bg-[#0ef]/10 px-3 py-1 rounded-xl">
                      {selectedVerb.meaning}
                    </p>
                    <span className="text-white/40 text-xl font-japanese italic">
                      ({selectedVerb.furigana})
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid 13+ Konjugasi */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[50vh] pr-4 custom-scrollbar">
                <DetailBox
                  label="Bentuk Masu"
                  value={selectedVerb.masu}
                  color="text-white"
                />
                <DetailBox
                  label="Bentuk Te"
                  value={selectedVerb.te}
                  color="text-yellow-400"
                />
                <DetailBox
                  label="Bentuk Nai"
                  value={selectedVerb.nai}
                  color="text-red-400"
                />
                <DetailBox
                  label="Bentuk Lampau"
                  value={selectedVerb.ta}
                  color="text-blue-400"
                />
                <DetailBox
                  label="Sedang (~Teiru)"
                  value={selectedVerb.teiru}
                  color="text-green-400"
                />
                <DetailBox
                  label="Ingin (~Tai)"
                  value={selectedVerb.tai}
                  color="text-pink-400"
                />
                <DetailBox
                  label="Harus (~Nakereba)"
                  value={selectedVerb.nakereba}
                  color="text-orange-400"
                />
                <DetailBox
                  label="Bisa (Potensial)"
                  value={selectedVerb.kanou}
                  color="text-cyan-400"
                />
                <DetailBox
                  label="Menyuruh (Kausatif)"
                  value={selectedVerb.shieki}
                  color="text-purple-400"
                />
                <DetailBox
                  label="Pasif (Dikenai)"
                  value={selectedVerb.ukemi}
                  color="text-indigo-400"
                />
                <DetailBox
                  label="Pengandaian (~Ba)"
                  value={selectedVerb.katei}
                  color="text-emerald-400"
                />
                <DetailBox
                  label="Ajakan (~Ikou)"
                  value={selectedVerb.ikou}
                  color="text-amber-400"
                />
                <DetailBox
                  label="Penyesalan (~Teshimau)"
                  value={selectedVerb.teshimau}
                  color="text-rose-400"
                />
                <DetailBox
                  label="Perintah (Meirei)"
                  value={selectedVerb.meirei}
                  color="text-white bg-red-600/20 px-2 rounded"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

function DetailBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white/2 p-4 rounded-2xl border border-white/5 hover:bg-white/5 transition-all group/box">
      <span className="text-[8px] font-black text-white/20 uppercase block mb-1 tracking-[0.2em] group-hover/box:text-[#0ef] transition-colors">
        {label}
      </span>
      <span className={`text-sm font-bold tracking-tight ${color}`}>
        {value || "-"}
      </span>
    </div>
  );
}
