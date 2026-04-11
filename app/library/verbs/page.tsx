"use client";

import { useState, useEffect, useMemo } from "react";
import { client } from "@/sanity/lib/client";
import { allVerbsQuery } from "@/lib/queries";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import TTSReader from "@/components/TTSReader";

export default function VerbDictionaryPage() {
  const [verbs, setVerbs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVerbs() {
      try {
        const data = await client.fetch(allVerbsQuery);
        setVerbs(data);
      } catch (error) {
        console.error("Failed to fetch verbs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchVerbs();
  }, []);

  // Mesin Pencari & Filter Client-Side
  const filteredVerbs = useMemo(() => {
    return verbs.filter((verb) => {
      const matchesGroup =
        activeGroup === "ALL" || verb.group?.toString() === activeGroup;

      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        verb.meaning?.toLowerCase().includes(searchLower) ||
        verb.jisho?.includes(searchLower) ||
        verb.masu?.includes(searchLower) ||
        verb.furigana?.includes(searchLower);

      return matchesGroup && matchesSearch;
    });
  }, [verbs, searchQuery, activeGroup]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#15171a] flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#0ef]/20 border-t-[#0ef] rounded-full shadow-[0_0_30px_rgba(0,255,239,0.5)]"
        />
        <p className="mt-8 text-[#0ef] font-mono font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">
          Indexing Database...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#15171a] pt-24 pb-32 px-4 md:px-8 relative overflow-hidden">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* BREADCRUMB */}
        <nav className="mb-8 font-mono text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3">
          <Link
            href="/jlpt"
            className="text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
          >
            Library Hub
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-white/60 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            Verb Database
          </span>
        </nav>

        {/* HEADER */}
        <header className="mb-12 border-b border-white/5 pb-8">
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter drop-shadow-lg flex items-center gap-4">
            <span className="text-5xl md:text-7xl">🔍</span> Verb{" "}
            <span className="text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              Matrix
            </span>
          </h1>
          <p className="mt-4 text-[#c4cfde]/60 text-sm max-w-xl leading-relaxed">
            Pusat data konjugasi kata kerja. Cari, saring berdasarkan grup, dan
            pelajari perubahan bentuk kata kerja secara mendetail.
          </p>
        </header>

        {/* CYBER SEARCH & FILTER BAR */}
        <div className="bg-[#1e2024] p-4 md:p-6 rounded-[2rem] border border-white/5 shadow-[15px_15px_40px_rgba(0,0,0,0.6),inset_0_2px_10px_rgba(0,0,0,0.2)] mb-10 flex flex-col md:flex-row gap-6 sticky top-20 z-50 backdrop-blur-xl">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <span className="text-white/30 text-xl">⌨️</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meaning, romaji, or kana..."
              className="w-full bg-[#15171a] border border-white/10 text-white text-sm rounded-2xl pl-14 pr-6 py-4 focus:outline-none focus:border-[#0ef]/50 focus:ring-1 focus:ring-[#0ef]/50 transition-all shadow-inner placeholder:text-white/20 font-mono"
            />
          </div>

          {/* Group Filters */}
          <div className="flex gap-2 bg-[#15171a] p-2 rounded-2xl border border-white/5 shadow-inner overflow-x-auto no-scrollbar">
            {["ALL", "1", "2", "3"].map((group) => {
              const isActive = activeGroup === group;
              return (
                <button
                  key={group}
                  onClick={() => setActiveGroup(group)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                      : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  {group === "ALL" ? "All Verbs" : `Group ${group}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* RESULTS INFO */}
        <div className="mb-6 flex justify-between items-end px-2">
          <span className="text-[#0ef] font-mono text-[10px] uppercase tracking-[0.3em] font-black drop-shadow-[0_0_5px_rgba(0,255,239,0.5)]">
            Query Results
          </span>
          <span className="bg-[#1e2024] px-4 py-1.5 rounded-lg border border-white/10 font-mono text-white/40 text-xs shadow-inner">
            <span className="text-white font-bold">{filteredVerbs.length}</span>{" "}
            Matches
          </span>
        </div>

        {/* VERB LIST */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredVerbs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-[#1e2024] rounded-[3rem] border border-white/5 border-dashed"
              >
                <span className="text-6xl mb-4 block opacity-50">📡</span>
                <p className="text-white/60 font-mono uppercase tracking-widest text-sm">
                  No verbs matched your query
                </p>
              </motion.div>
            ) : (
              filteredVerbs.map((verb) => {
                const isExpanded = expandedId === verb._id;

                return (
                  <motion.div
                    key={verb._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`bg-[#1e2024] rounded-[2rem] border transition-all duration-300 overflow-hidden ${
                      isExpanded
                        ? "border-[#0ef]/50 shadow-[0_0_30px_rgba(0,255,239,0.1)]"
                        : "border-white/5 hover:border-white/20 shadow-[6px_6px_15px_rgba(0,0,0,0.5)]"
                    }`}
                  >
                    {/* Header (Clickable) */}
                    <div
                      onClick={() =>
                        setExpandedId(isExpanded ? null : verb._id)
                      }
                      className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer group"
                    >
                      <div className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Group Badge */}
                        <div
                          className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner border ${
                            verb.group === 1
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                              : verb.group === 2
                                ? "bg-green-500/10 text-green-400 border-green-500/30"
                                : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                          }`}
                        >
                          G{verb.group}
                        </div>

                        <div>
                          <ruby className="text-3xl md:text-4xl font-black text-white tracking-wide group-hover:text-[#0ef] transition-colors">
                            {verb.jisho}
                            <rt className="text-[11px] text-[#0ef] font-normal tracking-widest opacity-80">
                              {verb.furigana}
                            </rt>
                          </ruby>
                          <p className="text-[#c4cfde]/80 text-sm mt-2 font-medium">
                            {verb.meaning}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                        <TTSReader text={verb.jisho} minimal={true} />
                        <div
                          className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                            isExpanded
                              ? "bg-[#0ef]/20 border-[#0ef]/50 text-[#0ef] rotate-180"
                              : "bg-[#15171a] border-white/10 text-white/40 group-hover:border-white/30"
                          }`}
                        >
                          ↓
                        </div>
                      </div>
                    </div>

                    {/* Conjugation Details (Expanded) */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-white/5 bg-[#15171a]/50"
                        >
                          <div className="p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <ConjugationCard
                              label="Masu (Sopan)"
                              value={verb.masu}
                            />
                            <ConjugationCard
                              label="Te (Sambung/Minta)"
                              value={verb.te}
                            />
                            <ConjugationCard
                              label="Nai (Negatif)"
                              value={verb.nai}
                            />
                            <ConjugationCard
                              label="Ta (Lampau)"
                              value={verb.ta}
                            />
                            <ConjugationCard
                              label="Te-iru (Sedang)"
                              value={verb.teiru}
                            />
                            <ConjugationCard
                              label="Tai (Ingin)"
                              value={verb.tai}
                            />
                            <ConjugationCard
                              label="Kanou (Bisa)"
                              value={verb.kanou}
                            />
                            <ConjugationCard
                              label="Meirei (Perintah)"
                              value={verb.meirei}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Helper Component untuk Kartu Konjugasi
function ConjugationCard({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <div className="bg-[#1e2024] p-4 rounded-xl border border-white/5 shadow-inner hover:border-blue-500/30 transition-colors group">
      <span className="block text-[9px] font-black uppercase tracking-widest text-white/30 mb-2 group-hover:text-blue-400/80 transition-colors">
        {label}
      </span>
      <span className="text-white font-bold text-lg font-japanese group-hover:text-[#0ef] transition-colors">
        {value}
      </span>
    </div>
  );
}
