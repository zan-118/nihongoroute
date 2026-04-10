"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TTSReader from "@/components/TTSReader";

export default function VerbListClient({
  initialVerbs,
}: {
  initialVerbs: any[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeGroup, setActiveGroup] = useState<number | null>(null);

  const filteredVerbs = initialVerbs.filter((verb) => {
    const matchesSearch =
      verb.masu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verb.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verb.jisho.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = activeGroup ? verb.group === activeGroup : true;
    return matchesSearch && matchesGroup;
  });

  return (
    <section>
      {/* SEARCH BAR & FILTER */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-1 group">
          <input
            type="text"
            placeholder="Cari kata kerja (makan, tabemasu, 食べる)..."
            className="w-full p-4 bg-[#1e2024] border border-white/5 rounded-2xl focus:ring-2 focus:ring-[#0ef] focus:border-transparent outline-none transition-all text-white pr-12"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-100 transition-opacity">
            🔍
          </span>
        </div>

        <div className="flex gap-2 p-1 bg-[#1e2024] rounded-2xl border border-white/5">
          {[1, 2, 3].map((g) => (
            <button
              key={g}
              onClick={() => setActiveGroup(activeGroup === g ? null : g)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeGroup === g
                  ? g === 1
                    ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    : g === 2
                      ? "bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                      : "bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                  : "text-white/40 hover:bg-white/5"
              }`}
            >
              Grup {g}
            </button>
          ))}
        </div>
      </div>

      {/* VERB GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredVerbs.map((verb) => (
            <motion.div
              key={verb._id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#1e2024] p-6 rounded-[2rem] border border-white/5 hover:border-white/20 transition-all group relative overflow-hidden"
            >
              {/* Background Accent */}
              <div
                className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-10 transition-opacity group-hover:opacity-20 ${verb.group === 1 ? "bg-blue-500" : verb.group === 2 ? "bg-orange-500" : "bg-green-500"}`}
              />

              <div className="flex justify-between items-start mb-6">
                <span className={`badge-g${verb.group}`}>
                  GROUP {verb.group}
                </span>
                <TTSReader text={verb.masu} minimal={true} />
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-black text-white tracking-tight mb-1">
                  {verb.masu}
                </h3>
                <p className="text-[#0ef] text-xs font-mono uppercase tracking-widest opacity-60">
                  {verb.jisho}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-6">
                <ConjugationBox label="~Te" value={verb.te} />
                <ConjugationBox label="~Nai" value={verb.nai} />
                <ConjugationBox label="~Ta" value={verb.ta} />
                <ConjugationBox label="Bab" value={verb.lesson} />
              </div>

              <div className="pt-4 border-t border-white/5">
                <p className="text-white/60 text-sm font-bold italic">
                  "{verb.meaning}"
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredVerbs.length === 0 && (
        <div className="py-20 text-center text-white/20 font-black uppercase tracking-[0.3em]">
          Data tidak ditemukan
        </div>
      )}
    </section>
  );
}

function ConjugationBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
      <span className="text-[8px] font-black text-white/30 uppercase block mb-1 tracking-widest">
        {label}
      </span>
      <span className="text-white text-xs font-bold">{value || "-"}</span>
    </div>
  );
}
