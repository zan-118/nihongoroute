/**
 * LOKASI FILE: app/(main)/dashboard/page.tsx
 * KONSEP: Cyber-Dark Neumorphic + Framer Motion
 */

"use client";

import { useEffect, useState, useRef } from "react";
import { useProgress } from "@/context/UserProgressContext";
import { loadProgress, ProgressState } from "@/lib/progress";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import MemoryStats from "@/components/MemoryStats";
import DailyQuests from "@/components/DailyQuests";
import Heatmap from "@/components/Heatmap";
import LevelUpOverlay from "@/components/LevelUpOverlay";
import { client } from "@/sanity/lib/client";

import { BrainCircuit, PlayCircle, Save, Upload, Trash2 } from "lucide-react";

// --- KONFIGURASI ANIMASI ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

export default function DashboardPage() {
  const { progress, loading, exportData, importData } = useProgress();
  const [guestId, setGuestId] = useState<string>("MEMUAT...");
  const [stats, setStats] = useState<ProgressState | null>(null);

  const [examHistory, setExamHistory] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let savedId = localStorage.getItem("nihongo_guest_id");
    if (!savedId) {
      savedId =
        "NP-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      localStorage.setItem("nihongo_guest_id", savedId);
    }
    setGuestId(savedId);
    setStats(loadProgress());

    const fetchHistory = async () => {
      try {
        const query = `*[_type == "examResult" && guestId == $id] | order(completedAt desc)`;
        const data = await client.fetch(query, { id: savedId });
        setExamHistory(data);
      } catch (error) {
        console.error("Gagal menarik riwayat ujian:", error);
      }
    };
    fetchHistory();
  }, []);

  const handleExportData = () => exportData();

  const handleImportData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const result = event.target?.result as string;
        if (importData(result)) window.location.reload();
        else alert("Format file data tidak valid atau rusak!");
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleResetData = () => {
    if (
      confirm(
        "⚠️ PERINGATAN: Semua progres akan dihapus permanen secara lokal. Apakah Anda yakin?",
      )
    ) {
      localStorage.removeItem("nihongoroute_save_data");
      localStorage.removeItem("nihongo-progress");
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080a0f] flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-16 h-16 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full shadow-[0_0_30px_rgba(34,211,238,0.5)]"
        />
        <p className="mt-8 text-cyan-400 font-mono font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">
          SINKRONISASI DATA...
        </p>
      </div>
    );
  }

  const now = Date.now();
  const dueCount = Object.values(progress.srs).filter(
    (card) => card.nextReview <= now,
  ).length;

  return (
    // DIUBAH: Dihapus pt-28, pb-32. Diubah menjadi div w-full.
    <div className="w-full px-4 md:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none animate-pulse" />

      <LevelUpOverlay level={progress.level} />

      <motion.div
        className="max-w-7xl mx-auto relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* HEADER SECTION */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16 border-b border-white/5 pb-10">
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-4 mb-4 font-mono">
              <span className="bg-[#0a0c10] shadow-[inset_2px_2px_8px_#050608,inset_-2px_-2px_8px_rgba(255,255,255,0.02)] px-4 py-1.5 rounded-lg text-cyan-400 text-[10px] font-black uppercase tracking-widest border border-cyan-400/20">
                Pengguna Lvl {progress.level}
              </span>
              <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                ID: {guestId}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter drop-shadow-lg">
              Das
              <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                hboard
              </span>
            </h1>
          </motion.div>

          <motion.div variants={itemVariants} className="w-full lg:w-auto">
            {dueCount > 0 ? (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/review"
                  className="flex items-center justify-center gap-3 w-full md:w-auto bg-cyan-400 text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-colors shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:bg-white"
                >
                  <BrainCircuit size={20} />
                  <span>Mulai Hafalan ({dueCount} Kartu)</span>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/courses"
                  className="flex items-center justify-center gap-3 w-full md:w-auto bg-[#0d1117] border border-cyan-400/30 text-cyan-400 px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-colors shadow-[10px_10px_25px_#050608,-8px_-8px_20px_rgba(255,255,255,0.02)] hover:border-cyan-400 hover:bg-cyan-400/10"
                >
                  <PlayCircle size={20} />
                  <span>Pelajari Materi Baru</span>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </header>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mb-20">
          {/* KOLOM KIRI (Progress & Stats) */}
          <div className="lg:col-span-2 space-y-8 md:space-y-12">
            <motion.section
              variants={itemVariants}
              className="bg-[#0d1117] rounded-[2rem] p-8 border border-white/5 shadow-[12px_12px_30px_#050608,-10px_-10px_25px_rgba(255,255,255,0.02)]"
            >
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-white font-black uppercase italic tracking-widest text-sm">
                  Poin <span className="text-slate-300">Pengalaman</span>
                </h2>
                <span className="text-cyan-400 font-mono font-black text-xl drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                  {progress.xp} XP
                </span>
              </div>
              <div className="bg-[#080a0f] w-full h-5 rounded-full overflow-hidden border border-white/5 shadow-[inset_4px_4px_10px_#050608,inset_-2px_-2px_5px_rgba(255,255,255,0.02)]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(progress.xp % 1000) / 10}%` }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_15px_rgba(34,211,238,0.6)] rounded-full relative"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] -translate-x-full animate-[shimmer_2s_infinite]" />
                </motion.div>
              </div>
              <p className="mt-4 text-[10px] text-slate-300 uppercase font-black tracking-widest font-mono text-right">
                Butuh {1000 - (progress.xp % 1000)} XP untuk Naik Level
              </p>
            </motion.section>

            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
            >
              <DailyQuests />
              <MemoryStats />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Heatmap studyDays={stats?.studyDays || {}} />
            </motion.div>
          </div>

          {/* KOLOM KANAN (Overview & Actions) */}
          <div className="space-y-8 md:space-y-12">
            <motion.section
              variants={itemVariants}
              className="bg-gradient-to-br from-[#121620] to-[#0d1117] rounded-[2rem] p-8 border border-white/5 shadow-[12px_12px_30px_#050608,-10px_-10px_25px_rgba(255,255,255,0.02)]"
            >
              <h2 className="text-cyan-400 font-mono font-black uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
                Statistik Belajar
              </h2>
              <div className="space-y-4">
                <SimpleStat
                  label="Total Kata"
                  value={Object.keys(progress.srs).length}
                />
                <SimpleStat
                  label="Beruntun"
                  value={`${stats?.streak || 0} Hari`}
                  color="text-amber-400"
                />
                <SimpleStat
                  label="Review Hari Ini"
                  value={stats?.todayReviewCount || 0}
                  color="text-emerald-400"
                />
              </div>
            </motion.section>

            <motion.nav
              variants={itemVariants}
              className="grid grid-cols-2 gap-5 md:gap-6"
            >
              <QuickLink href="/courses/n5" label="Materi N5" icon="⛩️" />
              <QuickLink
                href="/courses/n5/kanji"
                label="Kamus Kanji"
                icon="🈴"
              />
              <QuickLink href="/exams" label="Pusat Ujian" icon="📝" />
              <QuickLink href="/library" label="Koleksi" icon="🏛️" />
            </motion.nav>

            <motion.section
              variants={itemVariants}
              className="bg-[#0d1117] rounded-[2rem] p-8 border border-white/5 shadow-[12px_12px_30px_#050608,-10px_-10px_25px_rgba(255,255,255,0.02)]"
            >
              <h2 className="text-slate-300 font-mono font-black uppercase tracking-widest text-[10px] mb-6">
                Pengaturan Data
              </h2>
              <div className="space-y-4">
                <SettingsButton
                  icon={<Save size={16} />}
                  label="Simpan Data Lokal"
                  onClick={handleExportData}
                  hoverColor="hover:text-cyan-400 hover:border-cyan-400/30"
                />
                <SettingsButton
                  icon={<Upload size={16} />}
                  label="Muat Data Lokal"
                  onClick={handleImportData}
                  hoverColor="hover:text-indigo-400 hover:border-indigo-400/30"
                />
                <SettingsButton
                  icon={<Trash2 size={16} />}
                  label="Hapus Semua Data"
                  onClick={handleResetData}
                  hoverColor="hover:text-red-400 hover:border-red-400/30 hover:bg-red-500/5"
                  isDanger
                />
              </div>
            </motion.section>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// --- SUB-COMPONENTS ---
function SimpleStat({
  label,
  value,
  color = "text-white",
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="bg-[#0a0c10] shadow-[inset_3px_3px_8px_#050608,inset_-2px_-2px_6px_rgba(255,255,255,0.02)] rounded-xl flex justify-between items-center p-4 border border-white/5">
      <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest">
        {label}
      </span>
      <span className={`text-lg font-black italic ${color} font-mono`}>
        {value}
      </span>
    </div>
  );
}

function QuickLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  return (
    <motion.div whileHover={{ y: -5, transition: { duration: 0.2 } }}>
      <Link
        href={href}
        className="bg-[#0d1117] border border-white/5 shadow-[6px_6px_15px_#050608,-4px_-4px_10px_rgba(255,255,255,0.01)] rounded-2xl p-5 hover:border-cyan-400/30 transition-colors flex flex-col items-center gap-3 group"
      >
        <span className="text-3xl group-hover:scale-110 transition-transform drop-shadow-md">
          {icon}
        </span>
        <span className="text-[9px] font-mono font-black text-slate-200 uppercase tracking-tighter group-hover:text-cyan-400 transition-colors text-center">
          {label}
        </span>
      </Link>
    </motion.div>
  );
}

function SettingsButton({ icon, label, onClick, hoverColor, isDanger }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full bg-[#0a0c10] shadow-[inset_3px_3px_8px_#050608,inset_-2px_-2px_6px_rgba(255,255,255,0.02)] border ${isDanger ? "border-red-500/20 text-red-500/80" : "border-white/5 text-slate-200"} p-4 rounded-xl flex items-center justify-between transition-colors ${hoverColor} group`}
    >
      <span className="text-[10px] font-black uppercase tracking-widest">
        {label}
      </span>
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
    </motion.button>
  );
}
