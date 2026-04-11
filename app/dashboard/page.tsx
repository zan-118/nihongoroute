"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@/context/UserProgressContext";
import { loadProgress, ProgressState } from "@/lib/progress";
import { motion } from "framer-motion";
import Link from "next/link";
import MemoryStats from "@/components/MemoryStats";
import DailyQuests from "@/components/DailyQuests";
import Heatmap from "@/components/Heatmap";
import LevelUpOverlay from "@/components/LevelUpOverlay";

export default function DashboardPage() {
  const { progress, loading, exportData, importData } = useProgress();
  const [guestId, setGuestId] = useState<string>("LOADING...");
  const [stats, setStats] = useState<ProgressState | null>(null);

  useEffect(() => {
    // Load Guest ID
    let savedId = localStorage.getItem("nihongo_guest_id");
    if (!savedId) {
      savedId =
        "NP-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      localStorage.setItem("nihongo_guest_id", savedId);
    }
    setGuestId(savedId);

    // Load Stats (Streak & Study Days for Heatmap)
    setStats(loadProgress());
  }, []);

  /* ================= DATA MANAGEMENT LOGIC ================= */

  const handleExportData = () => {
    exportData(); // Menggunakan fungsi dari Context yang sudah kita perbaiki
  };

  const handleImportData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const success = importData(event.target.result);
        if (success) {
          window.location.reload();
        } else {
          alert("Format file tidak valid atau rusak!");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleResetData = () => {
    if (
      confirm(
        "⚠️ WARNING: INITIATING DATA PURGE. Semua progres, level, dan memori SRS akan dihapus permanen. Lanjutkan?",
      )
    ) {
      localStorage.removeItem("nihongoroute_save_data");
      localStorage.removeItem("nihongo-progress"); // Reset juga statistik hariannya
      window.location.reload();
    }
  };

  /* ================= RENDERING ================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#15171a] flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#0ef]/20 border-t-[#0ef] rounded-full shadow-[0_0_30px_rgba(0,255,239,0.5)]"
        />
        <p className="mt-8 text-[#0ef] font-mono font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">
          Syncing Neural Link...
        </p>
      </div>
    );
  }

  const now = Date.now();
  const dueCount = Object.values(progress.srs).filter(
    (card: any) => card.nextReview <= now,
  ).length;

  return (
    <div className="min-h-screen bg-[#15171a] pb-32 overflow-hidden relative">
      {/* Background Cyber Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <LevelUpOverlay level={progress.level} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 md:pt-32 relative z-10">
        {/* HEADER SECTION */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12 border-b border-white/5 pb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-4 mb-2 font-mono">
              <span className="px-3 py-1 rounded bg-[#0ef]/10 text-[#0ef] text-[10px] font-black uppercase tracking-widest border border-[#0ef]/30 shadow-[0_0_10px_rgba(0,255,239,0.2)]">
                Lvl {progress.level} User
              </span>
              <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                ID: {guestId}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter drop-shadow-lg">
              Das<span className="text-[#0ef]">hboard</span>
            </h1>
          </motion.div>

          <Link
            href="/dashboard/review"
            className="relative group w-full lg:w-auto"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full lg:w-auto px-10 py-5 bg-[#0ef] text-[#15171a] font-black rounded-2xl shadow-[0_0_30px_rgba(0,255,239,0.4)] uppercase text-sm tracking-widest flex items-center justify-between lg:justify-center gap-4 transition-all hover:bg-white"
            >
              Mulai Review
              {dueCount > 0 && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-lg text-[10px] animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]">
                  {dueCount} DUE
                </span>
              )}
            </motion.div>
          </Link>
        </header>

        {/* MAIN BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
          {/* Kolom Kiri: Quests & Stats */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* XP PROGRESS BAR CYBER */}
            <section className="bg-[#1e2024] p-6 md:p-8 rounded-[2.5rem] border border-white/5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5),5px_5px_15px_rgba(0,0,0,0.4)] relative overflow-hidden">
              <div className="flex justify-between items-end mb-4 relative z-10">
                <h3 className="text-white font-black uppercase italic tracking-widest text-xs md:text-sm">
                  Experience <span className="text-white/30">Points</span>
                </h3>
                <span className="text-[#0ef] font-mono font-bold text-lg drop-shadow-[0_0_8px_rgba(0,255,239,0.5)]">
                  {progress.xp} XP
                </span>
              </div>
              <div className="w-full bg-[#15171a] h-4 rounded-full overflow-hidden border border-white/5 p-1 shadow-inner relative z-10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(progress.xp % 1000) / 10}%` }}
                  transition={{ duration: 1, ease: "circOut" }}
                  className="h-full bg-gradient-to-r from-[#0ef] to-blue-500 rounded-full shadow-[0_0_15px_rgba(0,255,239,0.6)] relative"
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/40 rounded-t-full opacity-50" />
                </motion.div>
              </div>
              <p className="mt-4 text-[9px] text-[#c4cfde]/40 uppercase font-black tracking-widest font-mono text-right relative z-10">
                {1000 - (progress.xp % 1000)} XP to Next Level
              </p>
            </section>

            {/* Quests & Memory Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <DailyQuests />
              <MemoryStats />
            </div>

            {/* Heatmap Widget */}
            <Heatmap studyDays={stats?.studyDays || {}} />
          </div>

          {/* Kolom Kanan: Info & System Actions */}
          <div className="space-y-6 md:space-y-8">
            {/* GLOBAL PERFORMANCE */}
            <div className="bg-gradient-to-br from-[#1e2024] to-[#15171a] p-6 md:p-8 rounded-[2.5rem] border border-white/5 shadow-[15px_15px_40px_rgba(0,0,0,0.6)]">
              <h3 className="text-[#0ef] font-black uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0ef] animate-pulse" />
                System Performance
              </h3>
              <div className="space-y-6">
                <SimpleStat
                  label="Total Words"
                  value={Object.keys(progress.srs).length}
                />
                <SimpleStat
                  label="Streak"
                  value={`${stats?.streak || 0} Days`}
                  color="text-orange-400"
                  glow="drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                />
                <SimpleStat
                  label="Daily Reviews"
                  value={stats?.todayReviewCount || 0}
                  color="text-green-400"
                />
              </div>
            </div>

            {/* QUICK LINKS */}
            <div className="grid grid-cols-2 gap-4">
              <QuickLink
                href="/jlpt/n5"
                label="Materi N5"
                icon="⛩️"
                color="hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
              />
              <QuickLink
                href="/jlpt/n5/kanji"
                label="Kanji DB"
                icon="🈴"
                color="hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]"
              />
              <QuickLink
                href="/library"
                label="Library"
                icon="🏛️"
                color="hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]"
              />
              <QuickLink
                href="/support"
                label="Support"
                icon="☕"
                color="hover:border-orange-500/50 hover:shadow-[0_0_20px_rgba(249,115,22,0.2)]"
              />
            </div>

            {/* DATA MANAGEMENT */}
            <div className="bg-[#1e2024] p-6 md:p-8 rounded-[2.5rem] border border-white/5">
              <h3 className="text-white/30 font-black uppercase tracking-widest text-[10px] mb-6 italic">
                Data Protocol
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleExportData}
                  className="w-full flex items-center justify-between p-4 bg-[#15171a] hover:bg-[#1a1c20] border border-white/5 rounded-2xl transition-all group shadow-inner"
                >
                  <span className="text-[10px] font-black uppercase text-white/60 group-hover:text-[#0ef] transition-colors">
                    Export Save
                  </span>
                  <span className="text-lg group-hover:scale-110 transition-transform">
                    💾
                  </span>
                </button>
                <button
                  onClick={handleImportData}
                  className="w-full flex items-center justify-between p-4 bg-[#15171a] hover:bg-[#1a1c20] border border-white/5 rounded-2xl transition-all group shadow-inner"
                >
                  <span className="text-[10px] font-black uppercase text-white/60 group-hover:text-blue-400 transition-colors">
                    Import Save
                  </span>
                  <span className="text-lg group-hover:scale-110 transition-transform">
                    📥
                  </span>
                </button>
                <button
                  onClick={handleResetData}
                  className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl transition-all group mt-6"
                >
                  <span className="text-[10px] font-black uppercase text-red-400/80 group-hover:text-red-400">
                    System Format
                  </span>
                  <span className="text-lg group-hover:scale-110 transition-transform">
                    ⚠️
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* HELPER COMPONENTS */

function SimpleStat({ label, value, color = "text-white", glow = "" }: any) {
  return (
    <div className="flex justify-between items-center bg-[#15171a] p-4 rounded-2xl border border-white/5 shadow-inner">
      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
        {label}
      </span>
      <span className={`text-xl font-black italic ${color} ${glow} font-mono`}>
        {value}
      </span>
    </div>
  );
}

function QuickLink({ href, label, icon, color }: any) {
  return (
    <Link
      href={href}
      className={`bg-[#1e2024] p-5 rounded-3xl border border-white/5 transition-all duration-300 group flex flex-col items-center gap-3 shadow-[6px_6px_15px_rgba(0,0,0,0.5),-4px_-4px_10px_rgba(255,255,255,0.02)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.5)] active:translate-y-1 ${color}`}
    >
      <span className="text-2xl group-hover:scale-110 transition-transform drop-shadow-md">
        {icon}
      </span>
      <span className="text-[9px] font-black text-white/40 uppercase tracking-tighter group-hover:text-white transition-colors">
        {label}
      </span>
    </Link>
  );
}
