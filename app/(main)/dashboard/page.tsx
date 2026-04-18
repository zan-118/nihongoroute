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
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  BrainCircuit,
  PlayCircle,
  Download,
  Save,
  Upload,
  Trash2,
} from "lucide-react";

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

  const handleDownloadCertificate = async () => {
    if (!certificateRef.current) return;
    setIsExporting(true);
    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        backgroundColor: "#080a0f",
        scale: 2,
        logging: false,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`Sertifikat_NihongoRoute_${guestId}.pdf`);
    } catch (error) {
      console.error("Gagal membuat PDF:", error);
      alert("Terjadi kesalahan saat mengunduh sertifikat.");
    } finally {
      setIsExporting(false);
    }
  };

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
    <main className="min-h-screen bg-[#080a0f] text-slate-300 pt-28 pb-32 px-4 md:px-8 relative overflow-hidden">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
          {/* KOLOM KIRI (Progress & Stats) */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <motion.section
              variants={itemVariants}
              className="bg-[#0d1117] rounded-[2rem] p-8 border border-white/5 shadow-[12px_12px_30px_#050608,-10px_-10px_25px_rgba(255,255,255,0.02)]"
            >
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-white font-black uppercase italic tracking-widest text-sm">
                  Poin <span className="text-slate-500">Pengalaman</span>
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
              <p className="mt-4 text-[10px] text-slate-500 uppercase font-black tracking-widest font-mono text-right">
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
          <div className="space-y-6 md:space-y-8">
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
              className="grid grid-cols-2 gap-4"
            >
              <QuickLink href="/courses/n5" label="Materi N5" icon="⛩️" />
              <QuickLink
                href="/courses/jlpt-n5/kanji"
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
              <h2 className="text-slate-500 font-mono font-black uppercase tracking-widest text-[10px] mb-6">
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

        {/* EXAM HISTORY */}
        <motion.section variants={itemVariants} className="mt-20 mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <h3 className="text-2xl font-black text-white uppercase tracking-widest italic border-l-4 border-amber-500 pl-4 leading-none">
              Riwayat <span className="text-amber-500">Ujian</span>
            </h3>
            {examHistory.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadCertificate}
                disabled={isExporting}
                className="bg-[#0a0c10] border border-white/10 shadow-[inset_2px_2px_8px_#050608,inset_-2px_-2px_8px_rgba(255,255,255,0.02)] px-6 py-3 rounded-xl text-cyan-400 text-[10px] font-black uppercase tracking-widest hover:border-cyan-400/50 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Download size={14} />{" "}
                {isExporting ? "Membuat PDF..." : "Unduh Sertifikat"}
              </motion.button>
            )}
          </div>

          <div
            ref={certificateRef}
            className="bg-[#0d1117] rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-[15px_15px_40px_#050608,-10px_-10px_30px_rgba(255,255,255,0.01)] relative overflow-hidden"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] md:text-[180px] font-black italic opacity-[0.02] text-white pointer-events-none whitespace-nowrap select-none">
              NIHONGO ROUTE
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-end border-b border-white/10 pb-6 mb-8">
                <div>
                  <h4 className="text-cyan-400 font-mono text-[10px] uppercase tracking-[0.3em] mb-2">
                    Laporan Hasil Ujian
                  </h4>
                  <p className="text-white text-xl font-bold font-mono tracking-widest bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                    {guestId}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest font-bold mb-1">
                    Level Pengguna
                  </p>
                  <p className="text-amber-500 text-3xl font-black italic uppercase drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                    LVL {progress.level}
                  </p>
                </div>
              </div>

              {examHistory.length > 0 ? (
                <div className="space-y-6">
                  {examHistory.map((exam) => (
                    <motion.div
                      key={exam._id}
                      whileHover={{ x: 5 }}
                      className="bg-[#0a0c10] border border-white/5 shadow-[inset_4px_4px_10px_#050608,inset_-2px_-2px_8px_rgba(255,255,255,0.02)] rounded-2xl p-6 md:p-8"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-white/5">
                        <div>
                          <h5 className="text-white font-black italic uppercase tracking-wide text-2xl mb-2">
                            {exam.examTitle}
                          </h5>
                          <p className="text-slate-500 text-xs font-mono">
                            {new Date(exam.completedAt).toLocaleString("id-ID")}
                          </p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-slate-500 font-mono text-[10px] font-black uppercase tracking-widest mb-1">
                              Skor Total
                            </p>
                            <p
                              className={`text-4xl font-black font-mono ${exam.passed ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]" : "text-rose-400"}`}
                            >
                              {exam.score}{" "}
                              <span className="text-base text-slate-600">
                                / 180
                              </span>
                            </p>
                          </div>
                          <div
                            className={`px-4 py-2 rounded-xl font-black font-mono uppercase tracking-widest text-xs border ${exam.passed ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"}`}
                          >
                            {exam.passed ? "LULUS" : "GAGAL"}
                          </div>
                        </div>
                      </div>

                      {exam.sectionScores && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <SectionScore
                            label="Kosakata"
                            score={exam.sectionScores.vocabulary}
                          />
                          <SectionScore
                            label="Tata Bahasa"
                            score={exam.sectionScores.grammar}
                          />
                          <SectionScore
                            label="Membaca"
                            score={exam.sectionScores.reading}
                          />
                          <SectionScore
                            label="Mendengar"
                            score={exam.sectionScores.listening}
                          />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border border-dashed border-white/10 rounded-[2rem] bg-[#080a0f]">
                  <p className="text-slate-500 text-sm font-mono uppercase tracking-widest">
                    Belum ada data ujian yang terekam.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.section>
      </motion.div>
    </main>
  );
}

// --- SUB-COMPONENTS (With Neumorphic Styling) ---

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
      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
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
        <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-tighter group-hover:text-cyan-400 transition-colors text-center">
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
      className={`w-full bg-[#0a0c10] shadow-[inset_3px_3px_8px_#050608,inset_-2px_-2px_6px_rgba(255,255,255,0.02)] border ${isDanger ? "border-red-500/20 text-red-500/80" : "border-white/5 text-slate-400"} p-4 rounded-xl flex items-center justify-between transition-colors ${hoverColor} group`}
    >
      <span className="text-[10px] font-black uppercase tracking-widest">
        {label}
      </span>
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
    </motion.button>
  );
}

function SectionScore({ label, score }: { label: string; score: number }) {
  return (
    <div className="bg-[#080a0f] border border-white/5 rounded-xl p-4 text-center">
      <p className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-widest mb-1">
        {label}
      </p>
      <p className="text-xl font-black italic text-white">{score}%</p>
    </div>
  );
}
