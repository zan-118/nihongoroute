/**
 * @file app/(main)/dashboard/page.tsx
 * @description Pusat kendali pengguna (Dashboard) yang menampilkan level progres (XP), jadwal hafalan flashcard harian (SRS), heatmap aktivitas, riwayat ujian, serta konfigurasi manajemen data lokal.
 * @module Client Component
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

import { BrainCircuit, PlayCircle, Save, Upload, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

/**
 * Komponen Utama Halaman Dashboard.
 * Menampilkan ringkasan status pengguna (Guest ID otomatis), metrik pertumbuhan XP,
 * serta menjadi gerbang navigasi utama menuju sesi Review memori SRS dan modul pembelajaran.
 * 
 * @returns {JSX.Element} Antarmuka Dasbor interaktif.
 */
export default function DashboardPage() {
  const { progress, loading, exportData, importData } = useProgress();
  const [guestId, setGuestId] = useState<string>("MEMUAT...");
  const [stats, setStats] = useState<ProgressState | null>(null);

  const [examHistory, setExamHistory] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Membaca ID Pengunjung anonim (Guest ID) dari Local Storage. 
    // Jika belum ada (pengguna baru), sistem akan otomatis menggenerasikan serangkaian ID acak.
    let savedId = localStorage.getItem("nihongo_guest_id");
    if (!savedId) {
      savedId =
        "NP-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      localStorage.setItem("nihongo_guest_id", savedId);
    }
    setGuestId(savedId);
    setStats(loadProgress());

    // Menarik riwayat hasil simulasi JLPT dari Sanity CMS berdasarkan Guest ID saat ini
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

  /**
   * Logika Import Data (Pemulihan Cadangan):
   * Membuka pemilih file sistem secara terprogram, membaca isi file berekstensi .json,
   * kemudian memasukkannya ke dalam konteks progres untuk memulihkan status (XP/SRS) lokal.
   */
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

  /**
   * Logika Hard Reset:
   * Menghapus semua kunci terkait penyimpanan game/sistem dan menyegarkan ulang sesi.
   */
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
        <Loader2 className="w-16 h-16 text-cyber-neon animate-spin drop-shadow-[0_0_15px_rgba(0,238,255,0.5)]" />
        <p className="mt-8 text-cyber-neon font-mono font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">
          SINKRONISASI DATA...
        </p>
      </div>
    );
  }

  // Menghitung berapa banyak kartu kosakata yang jadwal pengulangannya (nextReview) sudah tiba saat ini
  const now = Date.now();
  const dueCount = Object.values(progress.srs).filter(
    (card) => card.nextReview <= now,
  ).length;

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 relative overflow-hidden pb-24 pt-8">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyber-neon/5 blur-[150px] rounded-full pointer-events-none animate-pulse" />

      <LevelUpOverlay level={progress.level} />

      <motion.div
        className="max-w-7xl mx-auto relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* HEADER SECTION */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12 md:mb-16 border-b border-white/5 pb-8 md:pb-10">
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 md:gap-4 mb-4 font-mono">
              <Badge
                variant="outline"
                className="bg-[#0a0c10] neo-inset px-3 py-1 md:px-4 md:py-1.5 rounded-lg text-cyber-neon text-[9px] md:text-[10px] font-black uppercase tracking-widest border-cyber-neon/20"
              >
                Pengguna Lvl {progress.level}
              </Badge>
              <span className="text-white/40 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                ID: {guestId}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white italic tracking-tighter drop-shadow-lg leading-none">
              Das<span className="text-cyber-neon drop-shadow-[0_0_15px_rgba(0,238,255,0.4)]">hboard</span>
            </h1>
          </motion.div>

          <motion.div variants={itemVariants} className="w-full lg:w-auto">
            {dueCount > 0 ? (
              <Button
                asChild
                className="flex items-center justify-center gap-3 w-full lg:w-auto bg-cyber-neon text-black px-6 py-6 md:px-8 md:py-8 h-auto rounded-2xl md:rounded-[2rem] font-black uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(0,238,255,0.3)] hover:bg-white hover:scale-105 active:scale-95 text-[10px] md:text-xs"
              >
                <Link href="/review">
                  <BrainCircuit size={20} className="md:w-6 md:h-6" />
                  <span>Mulai Hafalan ({dueCount} Kartu)</span>
                </Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                asChild
                className="flex items-center justify-center gap-3 w-full lg:w-auto bg-[#0d1117] border-cyber-neon/30 text-cyber-neon px-6 py-6 md:px-8 md:py-8 h-auto rounded-2xl md:rounded-[2rem] font-black uppercase tracking-widest transition-all shadow-xl hover:border-cyber-neon hover:bg-cyber-neon/10 hover:scale-105 active:scale-95 text-[10px] md:text-xs"
              >
                <Link href="/courses">
                  <PlayCircle size={20} className="md:w-6 md:h-6" />
                  <span>Pelajari Materi Baru</span>
                </Link>
              </Button>
            )}
          </motion.div>
        </header>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mb-20">
          {/* KOLOM KIRI (Progress & Stats) */}
          <div className="lg:col-span-2 space-y-8 md:space-y-12">
            <motion.section variants={itemVariants}>
              <Card className="rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border-white/5 shadow-2xl bg-[#0a0c10]">
                <div className="flex justify-between items-end mb-6">
                  <h2 className="text-white font-black uppercase tracking-widest text-xs md:text-sm">
                    Poin <span className="text-slate-400">Pengalaman</span>
                  </h2>
                  <span className="text-cyber-neon font-mono font-black text-xl md:text-2xl drop-shadow-[0_0_8px_rgba(0,238,255,0.5)]">
                    {progress.xp} XP
                  </span>
                </div>
                <Progress
                  value={(progress.xp % 1000) / 10}
                  className="h-4 md:h-5 bg-[#121620] border border-white/5 neo-inset"
                  indicatorClassName="bg-gradient-to-r from-cyber-neon to-blue-500 shadow-[0_0_15px_rgba(0,238,255,0.6)]"
                />
                <p className="mt-4 text-[9px] md:text-[10px] text-slate-400 uppercase font-bold tracking-widest font-mono text-right">
                  Butuh {1000 - (progress.xp % 1000)} XP untuk Naik Level
                </p>
              </Card>
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
            <motion.section variants={itemVariants}>
              <Card className="bg-gradient-to-br from-[#121620] to-[#0d1117] rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border-white/5 shadow-2xl">
                <h2 className="text-cyber-neon font-mono font-black uppercase tracking-widest text-[10px] md:text-xs mb-6 md:mb-8 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyber-neon animate-pulse shadow-[0_0_10px_#0ef]" />
                  Statistik Belajar
                </h2>
                <div className="space-y-4 md:space-y-5">
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
              </Card>
            </motion.section>

            <motion.nav
              variants={itemVariants}
              className="grid grid-cols-2 gap-4 md:gap-6"
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

            <motion.section variants={itemVariants}>
              <Card className="rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border-white/5 shadow-2xl bg-[#0a0c10]">
                <h2 className="text-slate-400 font-mono font-black uppercase tracking-widest text-[10px] md:text-xs mb-6 md:mb-8">
                  Pengaturan Data
                </h2>
                <div className="space-y-3 md:space-y-4">
                  <SettingsButton
                    icon={<Save size={18} />}
                    label="Simpan Data Lokal"
                    onClick={handleExportData}
                    hoverColor="hover:text-cyber-neon hover:border-cyber-neon/30"
                  />
                  <SettingsButton
                    icon={<Upload size={18} />}
                    label="Muat Data Lokal"
                    onClick={handleImportData}
                    hoverColor="hover:text-indigo-400 hover:border-indigo-400/30"
                  />
                  <SettingsButton
                    icon={<Trash2 size={18} />}
                    label="Hapus Semua Data"
                    onClick={handleResetData}
                    hoverColor="hover:text-red-400 hover:border-red-400/30 hover:bg-red-500/5"
                    isDanger
                  />
                </div>
              </Card>
            </motion.section>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

/**
 * Komponen pembantu untuk menampilkan poin statistik sederhana (Metrik).
 */
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
    <Card className="bg-[#080a0f] neo-inset rounded-2xl flex justify-between items-center p-5 border-white/5">
      <span className="text-[10px] md:text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
        {label}
      </span>
      <span className={`text-xl md:text-2xl font-black italic ${color} font-mono`}>
        {value}
      </span>
    </Card>
  );
}

/**
 * Komponen pembantu untuk kartu tautan navigasi instan (Quick Access).
 */
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
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="w-full h-full"
    >
      <Link href={href} passHref legacyBehavior>
        <Card className="p-6 md:p-8 border-white/5 shadow-xl hover:border-cyber-neon/30 hover:bg-cyber-neon/5 transition-all flex flex-col items-center justify-center gap-4 group cursor-pointer h-full rounded-[2rem]">
          <span className="text-4xl md:text-5xl group-hover:scale-110 transition-transform drop-shadow-lg">
            {icon}
          </span>
          <span className="text-[10px] md:text-xs font-mono font-bold text-slate-300 uppercase tracking-widest group-hover:text-cyber-neon transition-colors text-center">
            {label}
          </span>
        </Card>
      </Link>
    </motion.div>
  );
}

/**
 * Komponen pembantu untuk menampilkan tombol aksi pada panel pengaturan data.
 */
function SettingsButton({ icon, label, onClick, hoverColor, isDanger }: any) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={`w-full bg-[#080a0f] neo-inset border h-auto ${isDanger ? "border-red-500/20 text-red-500/80" : "border-white/5 text-slate-300"} p-5 md:p-6 rounded-2xl flex items-center justify-between transition-all ${hoverColor} group hover:scale-[1.02] active:scale-[0.98]`}
    >
      <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">
        {label}
      </span>
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
    </Button>
  );
}
