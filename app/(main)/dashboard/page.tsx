"use client";

import { useEffect, useState } from "react";
import { useProgressStore } from "@/store/useProgressStore";
import { useShallow } from "zustand/react/shallow";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import MemoryStats from "@/components/MemoryStats";
import DailyQuests from "@/components/DailyQuests";
import Heatmap from "@/components/Heatmap";
import SRSAnalytics from "@/components/SRSAnalytics";
import LevelUpOverlay from "@/components/LevelUpOverlay";
import ConfirmModal from "@/components/ConfirmModal";
import { BrainCircuit, Save, Upload, Trash2, Sparkles, BookMarked, Target, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// ======================
// CONFIG / CONSTANTS
// ======================
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0, filter: "blur(10px)" },
  visible: {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};

export default function DashboardPage() {
  const { progress, loading, exportData, importData, userFullName, isAuthenticated } = useProgressStore(
    useShallow((state) => ({
      progress: state.progress,
      loading: state.loading,
      exportData: state.exportData,
      importData: state.importData,
      userFullName: state.userFullName,
      isAuthenticated: state.isAuthenticated,
    }))
  );
  const [guestId, setGuestId] = useState<string>("MEMUAT...");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "",
    isDestructive: false,
    onConfirm: () => {},
  });

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let savedId = localStorage.getItem("nihongo_guest_id");
    if (!savedId) {
      savedId = "NP-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      localStorage.setItem("nihongo_guest_id", savedId);
    }
    setGuestId(savedId);
  }, []);

  const handleExportData = () => exportData();

  const handleImportData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    input.onchange = (e: any) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reader.onload = (event: any) => {
        const result = event.target?.result as string;
        if (importData(result)) window.location.reload();
        else alert("Format file data tidak valid atau rusak!");
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const openConfirm = (title: string, description: string, confirmText: string, isDestructive: boolean, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, title, description, confirmText, isDestructive, onConfirm });
  };
  const closeConfirm = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

  const handleResetData = () => {
    openConfirm(
      "Hapus Semua Data?",
      "Peringatan: Semua progres belajar akan dihapus permanen secara lokal. Tindakan ini tidak dapat dibatalkan.",
      "Ya, Hapus Data",
      true,
      () => {
        localStorage.removeItem("nihongoroute_save_data");
        localStorage.removeItem("nihongo-progress");
        window.location.reload();
      }
    );
  };

  const handleLogout = () => {
    openConfirm(
      "Keluar Akun?",
      "Sesi belajar Anda akan diakhiri. Pastikan data sudah tersinkronisasi sebelum keluar.",
      "Keluar",
      true,
      async () => {
        await supabase.auth.signOut();
        router.push("/login");
      }
    );
  };

  const now = Date.now();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dueCount = Object.values(progress.srs).filter((card: any) => card.nextReview <= now).length;
  const displayName = userFullName || "Pelajar";
  const xpNeeded = 1000 - (progress.xp % 1000);
  const xpProgress = (progress.xp % 1000) / 10;

  return (
    <div className="w-full min-h-screen bg-[#05060A] relative overflow-hidden pt-32 pb-24 px-4 md:px-8">
      {/* BACKGROUND EFFECTS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-cyber-neon/10 blur-[120px] rounded-[100%] pointer-events-none opacity-50" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

      <LevelUpOverlay level={progress.level} />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmText={confirmModal.confirmText}
        isDestructive={confirmModal.isDestructive}
        onConfirm={confirmModal.onConfirm}
      />

      <motion.div
        className="max-w-7xl mx-auto relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* HEADER HERO SECTION */}
        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center justify-between mb-16">
          <div className="flex-1 w-full flex flex-col items-center lg:items-start text-center lg:text-left">
            {loading ? (
              <Skeleton className="h-6 w-32 rounded-full mb-6" />
            ) : (
              <Badge variant="outline" className="bg-cyber-neon/10 text-cyber-neon border-cyber-neon/30 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 w-fit">
                <Sparkles size={14} /> ID: {guestId}
              </Badge>
            )}
            
            {loading ? (
              <div className="space-y-4 mb-4">
                <Skeleton className="h-16 w-64 md:w-96" />
                <Skeleton className="h-4 w-48 md:w-64" />
              </div>
            ) : (
              <>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[1.1] mb-4">
                  Selamat Datang Kembali, <br className="hidden lg:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-neon to-blue-500 drop-shadow-[0_0_20px_rgba(0,238,255,0.3)]">
                    {displayName}!
                  </span>
                </h1>
                <p className="text-slate-400 text-sm md:text-base font-medium max-w-lg leading-relaxed">
                  Senang melihatmu lagi! Yuk, lanjut asah kemampuan bahasamu dan temukan hal seru baru hari ini.
                </p>
              </>
            )}
          </div>

          {/* MAIN CALL TO ACTION */}
          <div className="w-full lg:w-[400px] shrink-0">
            {loading ? (
              <Skeleton className="h-[280px] w-full rounded-2xl" />
            ) : (
            <Card className="p-6 md:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden group transition-all duration-300 hover:border-cyber-neon/40 hover:bg-cyber-neon/[0.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-cyber-neon/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,238,255,0.3)] border ${dueCount > 0 ? 'bg-cyber-neon/20 border-cyber-neon/50' : 'bg-emerald-500/20 border-emerald-500/50 animate-pulse'}`}>
                  {dueCount > 0 ? (
                    <BrainCircuit size={40} className="text-cyber-neon" />
                  ) : (
                    <Sparkles size={40} className="text-emerald-400" />
                  )}
                </div>
                
                <h3 className={`text-lg md:text-xl font-black uppercase tracking-tight mb-2 ${dueCount > 0 ? 'text-white' : 'text-emerald-400'}`}>
                  {dueCount > 0 ? "Waktunya Sapa Ingatan!" : "Ingatanmu Hebat!"}
                </h3>
                <p className="text-slate-400 text-xs md:text-sm mb-6 font-medium">
                  {dueCount > 0 
                    ? `Ada ${dueCount} kosakata yang kangen kamu nih. Yuk, segarkan ingatanmu sebentar!` 
                    : "Semua hafalanmu masih segar bugar! Mau coba pelajari materi baru?"}
                </p>

                {dueCount > 0 ? (
                  <Button asChild className="w-full h-14 bg-cyber-neon hover:bg-white text-black font-black uppercase tracking-widest rounded-2xl text-[10px] md:text-xs transition-all shadow-[0_0_20px_rgba(0,238,255,0.4)] border-none">
                    <Link href="/review">
                      Mulai Sesi Review <Target size={16} className="ml-2" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full h-14 bg-white hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-2xl text-[10px] md:text-xs transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] border-none">
                    <Link href="/courses">
                      Pelajari Materi Baru <BookMarked size={16} className="ml-2" />
                    </Link>
                  </Button>
                )}
              </div>
            </Card>
            )}
          </div>
        </motion.div>

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 mb-20">
          
          {/* LEVEL & XP CARD (SPAN 8) */}
          <motion.div variants={itemVariants} className="md:col-span-8">
            {loading ? (
              <Skeleton className="h-[250px] w-full rounded-2xl" />
            ) : (
              <Card className="h-full bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 md:p-8 flex flex-col justify-center relative overflow-hidden group transition-all duration-300 hover:border-emerald-500/30">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                  <div>
                    <h2 className="text-slate-500 font-bold uppercase tracking-widest text-[9px] md:text-[10px] mb-2">
                      Level Kamu
                    </h2>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl md:text-6xl font-black text-white tracking-tighter">
                        {progress.level}
                      </span>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 font-bold uppercase tracking-widest text-[8px] md:text-[9px]">
                        Status Belajar
                      </Badge>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <span className="text-cyber-neon font-mono font-black text-3xl drop-shadow-[0_0_10px_rgba(0,238,255,0.4)]">
                      {progress.xp} <span className="text-sm text-cyber-neon/70">XP</span>
                    </span>
                  </div>
                </div>
                
                <div className="relative z-10">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                    <span>Progres ke Level {progress.level + 1}</span>
                    <span>{xpProgress}%</span>
                  </div>
                  <Progress
                    value={xpProgress}
                    className="h-3 bg-black/50 border border-white/10"
                    indicatorClassName="bg-gradient-to-r from-emerald-400 via-cyber-neon to-blue-500 shadow-[0_0_15px_rgba(0,238,255,0.5)]"
                  />
                  <p className="mt-4 text-[10px] text-slate-500 uppercase font-bold tracking-widest font-mono text-center md:text-right">
                    Kumpulkan <span className="text-white">{xpNeeded} XP</span> lagi untuk naik level!
                  </p>
                </div>
              </Card>
            )}
          </motion.div>

          {/* STATS HIGHLIGHT (SPAN 4) */}
          <motion.div variants={itemVariants} className="md:col-span-4 flex flex-col gap-6">
            {loading ? (
              <>
                <Skeleton className="h-[110px] w-full rounded-2xl" />
                <Skeleton className="h-[110px] w-full rounded-2xl" />
              </>
            ) : (
              <>
                <Card className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between group overflow-hidden relative transition-all duration-300 hover:border-amber-500/30 shadow-none">
                  <h3 className="text-amber-500/60 font-bold uppercase tracking-widest text-[9px]">
                    Semangat Belajar
                  </h3>
                  <div className="flex items-end gap-2 mt-2">
                    <span className="text-4xl font-black text-amber-400 tracking-tighter">
                      {progress.streak}
                    </span>
                    <span className="text-amber-500/80 font-bold uppercase tracking-widest text-[10px] mb-1">Hari</span>
                  </div>
                </Card>
                
                <Card className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between group overflow-hidden relative transition-all duration-300 hover:border-blue-500/30 shadow-none">
                  <h3 className="text-blue-400/60 font-bold uppercase tracking-widest text-[9px]">
                    Total Kosakata
                  </h3>
                  <div className="flex items-end gap-2 mt-2">
                    <span className="text-4xl font-black text-blue-400 tracking-tighter">
                      {Object.keys(progress.srs).length}
                    </span>
                    <span className="text-blue-400/80 font-bold uppercase tracking-widest text-[10px] mb-1">Kata</span>
                  </div>
                </Card>
              </>
            )}
          </motion.div>

          {/* DAILY QUESTS, MEMORY STATS, SRS ANALYTICS */}
          <motion.div variants={itemVariants} className="md:col-span-4">
            {loading ? <Skeleton className="h-[400px] w-full rounded-2xl" /> : <DailyQuests />}
          </motion.div>
          
          <motion.div variants={itemVariants} className="md:col-span-4">
            {loading ? <Skeleton className="h-[400px] w-full rounded-2xl" /> : <MemoryStats />}
          </motion.div>

          <motion.div variants={itemVariants} className="md:col-span-4">
            {loading ? <Skeleton className="h-[400px] w-full rounded-2xl" /> : <SRSAnalytics />}
          </motion.div>

          {/* HEATMAP */}
          <motion.div variants={itemVariants} className="md:col-span-12">
            {loading ? <Skeleton className="h-[220px] w-full rounded-2xl" /> : <Heatmap studyDays={progress.studyDays} />}
          </motion.div>

          {/* SETTINGS / DANGER ZONE */}
          <motion.div variants={itemVariants} className="md:col-span-12">
            <Card className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 md:p-8">
              <h2 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-8 flex items-center gap-3">
                <div className="w-1 h-1 rounded-full bg-slate-700" />
                Pengaturan Akun & Data
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  className="h-14 bg-black/40 border-white/10 hover:bg-cyber-neon/10 hover:border-cyber-neon/30 hover:text-cyber-neon text-slate-300 rounded-2xl uppercase tracking-widest font-bold text-[10px] transition-all"
                >
                  <Save size={16} className="mr-2" /> Backup Data
                </Button>
                <Button
                  variant="outline"
                  onClick={handleImportData}
                  className="h-14 bg-black/40 border-white/10 hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-400 text-slate-300 rounded-2xl uppercase tracking-widest font-bold text-[10px] transition-all"
                >
                  <Upload size={16} className="mr-2" /> Restore Data
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResetData}
                  className="h-14 bg-red-500/5 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 text-red-400 rounded-2xl uppercase tracking-widest font-bold text-[10px] transition-all"
                >
                  <Trash2 size={16} className="mr-2" /> Reset Data
                </Button>
                {isAuthenticated && (
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="h-14 bg-red-500/10 border-red-500/30 hover:bg-red-500/30 hover:border-red-500/50 text-red-400 rounded-2xl uppercase tracking-widest font-bold text-[10px] transition-all"
                  >
                    <LogOut size={16} className="mr-2" /> Keluar
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
