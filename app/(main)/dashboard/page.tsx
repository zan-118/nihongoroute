"use client";

import { useEffect, useState, useRef } from "react";
import { useProgress } from "@/context/UserProgressContext";
import { loadProgress, ProgressState } from "@/lib/progress";
import { motion } from "framer-motion";
import Link from "next/link";
import MemoryStats from "@/components/MemoryStats";
import DailyQuests from "@/components/DailyQuests";
import Heatmap from "@/components/Heatmap";
import LevelUpOverlay from "@/components/LevelUpOverlay";
import { client } from "@/sanity/lib/client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { BrainCircuit, PlayCircle } from "lucide-react";

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
        backgroundColor: "#0a0c10",
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

  const handleExportData = () => {
    exportData();
  };

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
        "⚠️ PERINGATAN: Semua progres, level, dan hafalan Anda akan dihapus permanen secara lokal. Apakah Anda yakin ingin mengulang dari awal?",
      )
    ) {
      localStorage.removeItem("nihongoroute_save_data");
      localStorage.removeItem("nihongo-progress");
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-16 h-16 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full shadow-[0_0_30px_rgba(34,211,238,0.5)]"
        />
        <p className="mt-8 text-cyan-400 font-mono font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">
          Memuat Data...
        </p>
      </div>
    );
  }

  const now = Date.now();
  const dueCount = Object.values(progress.srs).filter(
    (card) => card.nextReview <= now,
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 md:pt-12 relative z-10 pb-32">
      <LevelUpOverlay level={progress.level} />

      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12 border-b border-white/5 pb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-4 mb-3 font-mono">
            <span className="neo-inset px-3 py-1 text-cyan-400 text-[10px] font-black uppercase tracking-widest border border-cyan-400/30">
              Pengguna Lvl {progress.level}
            </span>
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
              ID: {guestId}
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter drop-shadow-lg">
            Das<span className="text-cyan-400">hboard</span>
          </h1>
        </motion.div>

        {/* ✨ SMART CALL TO ACTION */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full lg:w-auto"
        >
          {dueCount > 0 ? (
            <Link
              href="/review"
              className="flex items-center justify-center gap-3 w-full md:w-auto bg-cyan-400 hover:bg-cyan-300 text-black px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(34,211,238,0.4)]"
            >
              <BrainCircuit size={20} />
              <span>Mulai Hafalan ({dueCount} Kartu)</span>
            </Link>
          ) : (
            <Link
              href="/courses"
              className="flex items-center justify-center gap-3 w-full md:w-auto bg-blue-500/20 border border-blue-500/50 hover:bg-blue-500/30 text-blue-400 px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
            >
              <PlayCircle size={20} />
              <span>Pelajari Materi Baru</span>
            </Link>
          )}
        </motion.div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
        {/* Kolom Kiri */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <section className="neo-card p-6 md:p-8 relative overflow-hidden">
            <div className="flex justify-between items-end mb-4 relative z-10">
              <h2 className="text-white font-black uppercase italic tracking-widest text-xs md:text-sm">
                Poin <span className="text-white/30">Pengalaman</span>
              </h2>
              <span className="text-cyan-400 font-mono font-bold text-lg drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                {progress.xp} XP
              </span>
            </div>
            <div className="neo-inset w-full h-4 overflow-hidden relative z-10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(progress.xp % 1000) / 10}%` }}
                transition={{ duration: 1, ease: "circOut" }}
                className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.6)]"
              />
            </div>
            <p className="mt-4 text-[9px] text-slate-500 uppercase font-black tracking-widest font-mono text-right relative z-10">
              Butuh {1000 - (progress.xp % 1000)} XP untuk Naik Level
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <DailyQuests />
            <MemoryStats />
          </div>

          <Heatmap studyDays={stats?.studyDays || {}} />
        </div>

        {/* Kolom Kanan */}
        <div className="space-y-6 md:space-y-8">
          <section className="neo-card p-6 md:p-8 bg-gradient-to-br from-[#0f1115] to-[#0a0c10]">
            <h2 className="text-cyan-400 font-mono font-black uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
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
                label="Diulang Hari Ini"
                value={stats?.todayReviewCount || 0}
                color="text-emerald-400"
              />
            </div>
          </section>

          <nav className="grid grid-cols-2 gap-4">
            <QuickLink href="/courses/jlpt-n5" label="Materi N5" icon="⛩️" />
            <QuickLink
              href="/courses/jlpt-n5/kanji"
              label="Kamus Kanji"
              icon="🈴"
            />
            <QuickLink href="/library" label="Koleksi" icon="🏛️" />
            <QuickLink href="/support" label="Bantuan" icon="☕" />
          </nav>

          <section className="neo-card p-6 md:p-8">
            <h2 className="text-slate-500 font-mono font-black uppercase tracking-widest text-[10px] mb-6">
              Pengaturan Data
            </h2>
            <div className="space-y-3">
              <button
                onClick={handleExportData}
                className="neo-inset w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all group"
              >
                <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-cyan-400 transition-colors">
                  Simpan Data Lokal
                </span>
                <span className="text-lg group-hover:scale-110 transition-transform">
                  💾
                </span>
              </button>
              <button
                onClick={handleImportData}
                className="neo-inset w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all group"
              >
                <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-indigo-400 transition-colors">
                  Muat Data Lokal
                </span>
                <span className="text-lg group-hover:scale-110 transition-transform">
                  📥
                </span>
              </button>
              <button
                onClick={handleResetData}
                className="neo-inset border-red-500/20 w-full flex items-center justify-between p-4 hover:bg-red-500/10 transition-all group mt-6"
              >
                <span className="text-[10px] font-black uppercase text-red-500/80 group-hover:text-red-400">
                  Hapus Semua Data
                </span>
                <span className="text-lg group-hover:scale-110 transition-transform">
                  ⚠️
                </span>
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* EXAM HISTORY */}
      <section className="mt-12 mb-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest italic border-l-4 border-amber-500 pl-4">
            Riwayat <span className="text-amber-500">Ujian</span>
          </h3>
          {examHistory.length > 0 && (
            <button
              onClick={handleDownloadCertificate}
              disabled={isExporting}
              className="neo-inset px-6 py-3 text-cyan-400 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isExporting ? "Membuat PDF..." : "📥 Unduh Sertifikat"}
            </button>
          )}
        </div>

        <div
          ref={certificateRef}
          className="neo-card p-8 md:p-12 relative overflow-hidden"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[150px] font-black italic opacity-[0.02] text-white pointer-events-none whitespace-nowrap">
            NIHONGO PATH
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-end border-b border-white/10 pb-6 mb-8">
              <div>
                <h4 className="text-cyan-400 font-mono text-[10px] uppercase tracking-[0.3em] mb-1">
                  Laporan Hasil Ujian
                </h4>
                <p className="text-white text-lg font-bold font-mono tracking-widest">
                  {guestId}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest font-bold">
                  Level Saat Ini
                </p>
                <p className="text-amber-500 text-2xl font-black italic uppercase">
                  LVL {progress.level}
                </p>
              </div>
            </div>

            {examHistory.length > 0 ? (
              <div className="space-y-6">
                {examHistory.map((exam) => (
                  <div key={exam._id} className="neo-inset p-6 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-white/5">
                      <div>
                        <h5 className="text-white font-black italic uppercase tracking-wide text-xl md:text-2xl mb-1">
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
                            className={`text-3xl font-black font-mono ${exam.passed ? "text-emerald-400" : "text-rose-400"}`}
                          >
                            {exam.score}{" "}
                            <span className="text-sm text-slate-600">
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500 text-sm font-mono uppercase tracking-widest">
                  Belum ada data ujian yang terekam.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

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
    <div className="neo-inset flex justify-between items-center p-4">
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
    <Link
      href={href}
      className="neo-card p-5 hover:border-cyan-400/30 transition-all duration-300 group flex flex-col items-center gap-3"
    >
      <span className="text-2xl group-hover:scale-110 transition-transform drop-shadow-md">
        {icon}
      </span>
      <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-tighter group-hover:text-white transition-colors text-center">
        {label}
      </span>
    </Link>
  );
}

function SectionScore({ label, score }: { label: string; score: number }) {
  return (
    <div className="neo-card !bg-transparent p-4">
      <p className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-widest mb-1">
        {label}
      </p>
      <p className="text-lg font-mono text-white">{score}%</p>
    </div>
  );
}
