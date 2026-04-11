"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@/context/UserProgressContext";
import { motion } from "framer-motion";
import Link from "next/link";
import MemoryStats from "@/components/MemoryStats";
import DailyQuests from "@/components/DailyQuests";
import LevelUpOverlay from "@/components/LevelUpOverlay";

export default function DashboardPage() {
  const { progress, loading } = useProgress();
  const [guestId, setGuestId] = useState<string>("LOADING...");

  // Generate atau ambil ID saat komponen di-mount untuk mencegah Hydration Error
  useEffect(() => {
    let savedId = localStorage.getItem("nihongo_guest_id");
    if (!savedId) {
      savedId = "NP-" + Math.random().toString(36).substr(2, 6).toUpperCase();
      localStorage.setItem("nihongo_guest_id", savedId);
    }
    setGuestId(savedId);
  }, []);

  /* ================= DATA MANAGEMENT LOGIC ================= */

  const handleExportData = () => {
    const data = localStorage.getItem("nihongoroute_progress");
    if (!data) return alert("Belum ada progres untuk di-export.");

    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nihongoroute_backup_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event: any) => {
        try {
          const importedData = JSON.parse(event.target.result);
          // Validasi sederhana struktur data
          if (importedData.xp !== undefined && importedData.srs) {
            localStorage.setItem("nihongoroute_progress", event.target.result);
            window.location.reload();
          } else {
            alert("Format file tidak valid!");
          }
        } catch (err) {
          alert("Gagal membaca file.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleResetData = () => {
    if (
      confirm(
        "APAKAH KAMU YAKIN? Semua progres, level, dan hafalan SRS akan dihapus permanen.",
      )
    ) {
      localStorage.removeItem("nihongoroute_progress");
      window.location.reload();
    }
  };

  /* ================= RENDERING ================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1f242d] flex flex-col items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-16 h-16 bg-[#0ef] rounded-2xl shadow-[0_0_30px_#0ef]"
        />
        <p className="mt-8 text-[#0ef] font-black uppercase tracking-[0.4em] text-[10px]">
          Syncing Memory...
        </p>
      </div>
    );
  }

  const now = Date.now();
  const dueCount = Object.values(progress.srs).filter(
    (card: any) => card.nextReview <= now,
  ).length;

  return (
    <div className="min-h-screen bg-[#1f242d] pb-32">
      <LevelUpOverlay level={progress.level} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 md:pt-32">
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-4 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#0ef]/10 text-[#0ef] text-[10px] font-black uppercase tracking-widest border border-[#0ef]/20">
                Lvl {progress.level} Developer
              </span>
              <span className="text-white/20 text-xs font-bold uppercase tracking-widest">
                ID: {guestId}
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white italic uppercase tracking-tighter leading-none">
              Das<span className="text-[#0ef]">hboard</span>
            </h1>
          </motion.div>

          <Link href="/dashboard/review" className="relative group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 bg-[#0ef] text-[#1f242d] font-black rounded-2xl shadow-[0_0_30px_rgba(0,255,239,0.3)] uppercase text-sm tracking-widest flex items-center gap-4"
            >
              Mulai Review
              {dueCount > 0 && (
                <span className="bg-red-500 text-white px-2 py-0.5 rounded-lg text-[10px] animate-pulse">
                  {dueCount} DUE
                </span>
              )}
            </motion.div>
          </Link>
        </header>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT & CENTER COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            {/* XP PROGRESS BAR */}
            <section className="bg-[#1e2024] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
              <div className="flex justify-between items-end mb-4">
                <h3 className="text-white font-black uppercase italic tracking-tight">
                  Experience Points
                </h3>
                <span className="text-[#0ef] font-mono font-bold">
                  {progress.xp} XP
                </span>
              </div>
              <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden border border-white/5 p-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(progress.xp % 1000) / 10}%` }}
                  className="h-full bg-[#0ef] rounded-full shadow-[0_0_15px_#0ef]"
                />
              </div>
              <p className="mt-3 text-[9px] text-white/30 uppercase font-black tracking-widest">
                {1000 - (progress.xp % 1000)} XP lagi untuk level berikutnya
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <MemoryStats />
              <DailyQuests />
            </div>

            {/* QUICK LESSON SELECTOR DENGAN MENU BARU */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              <QuickLink
                href="/jlpt/n5"
                label="Materi N5"
                icon="⛩️"
                color="hover:border-blue-500/50"
              />
              <QuickLink
                href="/jlpt/n5/kanji"
                label="Kanji Power"
                icon="🈴"
                color="hover:border-purple-500/50"
              />
              <QuickLink
                href="/dictionary/verbs"
                label="Verb Dict"
                icon="🔍"
                color="hover:border-green-500/50"
              />
              <QuickLink
                href="/reference/grammar"
                label="Grammar"
                icon="📖"
                color="hover:border-yellow-500/50"
              />
              <QuickLink
                href="/reference/cheatsheet"
                label="Cheatsheet"
                icon="📋"
                color="hover:border-pink-500/50"
              />
              <QuickLink
                href="/support"
                label="Support"
                icon="☕"
                color="hover:border-orange-500/50"
              />
            </div>
          </div>

          {/* RIGHT COLUMN (INFO & DATA MANAGEMENT) */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-[#1e2024] to-transparent p-8 rounded-[2.5rem] border border-white/5">
              <h3 className="text-white/30 font-black uppercase tracking-widest text-[10px] mb-6">
                Global Performance
              </h3>
              <div className="space-y-6">
                <SimpleStat
                  label="Total Words"
                  value={Object.keys(progress.srs).length}
                />
                <SimpleStat
                  label="Accuracy"
                  value="84%"
                  color="text-green-400"
                />
                <SimpleStat
                  label="Streak"
                  value="5 Days"
                  color="text-orange-400"
                />
              </div>
            </div>

            {/* DATA MANAGEMENT CARD */}
            <div className="bg-[#1e2024] p-8 rounded-[2.5rem] border border-white/5">
              <h3 className="text-white/30 font-black uppercase tracking-widest text-[10px] mb-6 italic">
                Data Management
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleExportData}
                  className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group"
                >
                  <span className="text-[10px] font-black uppercase text-white/60 group-hover:text-[#0ef]">
                    Export Backup
                  </span>
                  <span className="text-lg">💾</span>
                </button>

                <button
                  onClick={handleImportData}
                  className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group"
                >
                  <span className="text-[10px] font-black uppercase text-white/60 group-hover:text-[#0ef]">
                    Import Data
                  </span>
                  <span className="text-lg">📥</span>
                </button>

                <button
                  onClick={handleResetData}
                  className="w-full flex items-center justify-between p-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-2xl transition-all group"
                >
                  <span className="text-[10px] font-black uppercase text-red-400/60 group-hover:text-red-400">
                    Clear Progress
                  </span>
                  <span className="text-lg">🗑️</span>
                </button>
              </div>
            </div>

            <div className="bg-[#0ef]/5 p-8 rounded-[2.5rem] border border-[#0ef]/10">
              <span className="text-2xl mb-4 block">💡</span>
              <h4 className="text-white font-black uppercase italic mb-2 tracking-tight">
                Sensei Says:
              </h4>
              <p className="text-sm text-[#c4cfde]/60 leading-relaxed italic">
                "Gunakan fitur Export Backup secara berkala untuk menjaga
                progres belajarmu tetap aman di perangkat lain."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* HELPER COMPONENTS */

function SimpleStat({ label, value, color = "text-white" }: any) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
        {label}
      </span>
      <span className={`text-xl font-black italic ${color}`}>{value}</span>
    </div>
  );
}

function QuickLink({ href, label, icon, color }: any) {
  return (
    <Link
      href={href}
      className={`bg-[#1e2024] p-6 rounded-[2rem] border border-white/5 transition-all group flex flex-col items-center gap-3 ${color}`}
    >
      <span className="text-2xl group-hover:scale-125 transition-transform">
        {icon}
      </span>
      <span className="text-[9px] font-black text-white/40 uppercase tracking-tighter group-hover:text-white">
        {label}
      </span>
    </Link>
  );
}
