"use client";

import { useEffect, useState } from "react";
import { useProgressStore } from "@/store/useProgressStore";
import { useShallow } from "zustand/react/shallow";
import { motion, Variants } from "framer-motion";
import dynamic from "next/dynamic";
import DashboardHero from "@/components/features/dashboard/DashboardHero";
import DashboardStats from "@/components/features/dashboard/DashboardStats";
import DashboardSettings from "@/components/features/dashboard/DashboardSettings";
import LevelUpOverlay from "@/components/features/gamification/LevelUpOverlay";
import ConfirmModal from "@/components/ui/ConfirmModal";

const KanjiProgressGrid = dynamic(() => import("@/components/features/dashboard/KanjiProgressGrid"), { 
  ssr: false,
  loading: () => <div className="h-[200px] w-full animate-pulse bg-muted rounded-2xl" />
});

const AchievementsGrid = dynamic(() => import("@/components/features/gamification/AchievementsGrid"), { 
  ssr: false,
  loading: () => <div className="h-[200px] w-full animate-pulse bg-muted rounded-2xl" />
});
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
  const { progress, loading, exportData, importData, isAuthenticated } = useProgressStore(
    useShallow((state) => ({
      progress: state.progress,
      loading: state.loading,
      exportData: state.exportData,
      importData: state.importData,
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
  const dueCount = Object.values(progress.srs).filter((card) => card.nextReview <= now).length;
  const xpNeeded = 1000 - (progress.xp % 1000);
  const xpProgress = (progress.xp % 1000) / 10;

  return (
    <div className="max-w-7xl mx-auto relative z-10">
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
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <DashboardHero 
          loading={loading} 
          guestId={guestId} 
          dueCount={dueCount} 
          itemVariants={itemVariants} 
        />

        <DashboardStats 
          loading={loading} 
          progress={progress} 
          xpNeeded={xpNeeded} 
          xpProgress={xpProgress} 
          itemVariants={itemVariants} 
        />

        <motion.div variants={itemVariants} className="mb-16">
          <KanjiProgressGrid />
        </motion.div>

        <motion.div variants={itemVariants} className="mb-16">
          <div className="flex flex-col mb-8">
            <h2 className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Pencapaian & Badge
            </h2>
            <h3 className="text-lg md:text-xl font-black text-foreground uppercase tracking-tight">
              Koleksi <span className="text-primary">Trophy</span> Kamu
            </h3>
          </div>
          <AchievementsGrid />
        </motion.div>

        <DashboardSettings 
          isAuthenticated={isAuthenticated}
          handleExportData={handleExportData}
          handleImportData={handleImportData}
          handleResetData={handleResetData}
          handleLogout={handleLogout}
          itemVariants={itemVariants}
        />
      </motion.div>
    </div>
  );
}
