"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, Variants } from "framer-motion";
import { Settings as SettingsIcon, Layers, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useHasMounted } from "@/hooks/useHasMounted";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";
import { useAuthStore } from "@/store/useAuthStore";

// Sub-components
import ProfileSection from "./components/ProfileSection";
import DataManagementSection from "./components/DataManagementSection";
import SyncStatusSection from "./components/SyncStatusSection";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } },
};

export default function SettingsPage() {
  const { updateProfileName, resetUser, id, isGuest, name, xp, level, streak, todayReviewCount, lastStudyDate, studyDays, inventory } = useUserStore();
  const { dirtySrs, clearDirtySrs, resetSRS, srs } = useSRSStore();
  const { exportData, importData, resetUI, notifications, settings } = useUIStore();
  const { isAuthenticated, resetAuth } = useAuthStore();
  
  const hasMounted = useHasMounted();
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const progress = { id, isGuest, name, xp, level, streak, todayReviewCount, lastStudyDate, studyDays, inventory, srs, notifications, settings };

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "",
    isDestructive: false,
    onConfirm: () => {},
  });

  const openConfirm = (title: string, description: string, confirmText: string, isDestructive: boolean, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, title, description, confirmText, isDestructive, onConfirm });
  };
  const closeConfirm = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

  const resetAll = () => {
    resetAuth();
    resetUser();
    resetSRS();
    resetUI();
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
    openConfirm(
      "Hapus Semua Data?",
      "Peringatan: Semua progres belajar kamu bakal dihapus permanen. Tindakan ini gak bisa dibatalin lho!",
      "Ya, Hapus Semuanya",
      true,
      () => {
        resetAll();
        toast.success("Semua data progres telah direset.");
      }
    );
  };

  const handleLogout = () => {
    openConfirm(
      "Yakin Mau Keluar?",
      "Sesi belajarmu bakal diakhiri. Pastikan semua data sudah tersinkronisasi biar aman.",
      "Keluar Sekarang",
      true,
      async () => {
        await supabase.auth.signOut();
        resetAll();
        router.push("/login");
      }
    );
  };

  const handleManualSync = async () => {
    if (!isAuthenticated) {
      toast.error("Silakan login untuk sinkronisasi cloud!");
      return;
    }
    
    setIsSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { syncLocalToCloud } = await import("@/lib/supabase/sync");
        const success = await syncLocalToCloud(session.user.id, progress);
        if (success) {
          clearDirtySrs();
          toast.success("Data berhasil disinkronkan ke Cloud!");
        } else {
          toast.error("Sinkronisasi gagal. Coba lagi nanti.");
        }
      } else {
        toast.error("Sesi tidak ditemukan. Silakan login ulang.");
      }
    } catch (err) {
      console.error("Sync error:", err);
      toast.error("Terjadi kesalahan saat sinkronisasi.");
    } finally {
      setIsSyncing(false);
    }
  };

  if (!hasMounted) {
    return (
      <div className="max-w-3xl mx-auto pt-12 space-y-8 px-4">
         <div className="space-y-4">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-4 w-96" />
         </div>
         <Skeleton className="h-[200px] w-full rounded-3xl" />
         <Skeleton className="h-[200px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background relative overflow-hidden pt-12 pb-20 px-4 md:px-6 transition-colors duration-300">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[300px] bg-primary/5 blur-[100px] rounded-full pointer-events-none opacity-40" />
      
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
        className="max-w-3xl mx-auto relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <header className="mb-8 px-1">
          <motion.div variants={itemVariants}>
            <Badge variant="outline" className="bg-muted text-muted-foreground border-border px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5 w-fit shadow-none">
              <SettingsIcon size={12} /> Konfigurasi
            </Badge>
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl font-black text-foreground italic tracking-tighter uppercase mb-3">
            Pengaturan
          </motion.h1>
          <motion.p variants={itemVariants} className="text-muted-foreground text-sm font-medium max-w-lg leading-relaxed">
            Atur data belajar dan akunmu di sini. Jangan lupa backup biar progresmu selalu aman!
          </motion.p>
        </header>

        <div className="grid grid-cols-1 gap-5 px-1">
          <ProfileSection 
            name={name || ""} 
            isAuthenticated={isAuthenticated} 
            updateProfileName={updateProfileName} 
            itemVariants={itemVariants} 
          />

          <DataManagementSection 
            isAuthenticated={isAuthenticated}
            handleExportData={handleExportData}
            handleImportData={handleImportData}
            handleResetData={handleResetData}
            handleLogout={handleLogout}
            itemVariants={itemVariants}
          />

          <SyncStatusSection 
            dirtySrsCount={dirtySrs.size}
            isSyncing={isSyncing}
            handleManualSync={handleManualSync}
            itemVariants={itemVariants}
          />

          {/* DANGER ZONE INFO */}
          <motion.div variants={itemVariants}>
            <Card className="bg-destructive/[0.02] border-destructive/10 rounded-2xl p-5 md:p-6 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-destructive/10 flex items-center justify-center border border-destructive/15">
                <ShieldAlert size={20} className="text-destructive" />
              </div>
              <div className="flex-1">
                <h4 className="text-foreground font-bold uppercase text-sm mb-1">Zona Bahaya!</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Ingat ya, hapus data berarti semua XP dan hafalanmu hilang selamanya. Pikir-pikir dulu atau simpan backup-nya ya!
                </p>
              </div>
            </Card>
          </motion.div>

          {/* MOBILE EXTRA NAV */}
          <motion.div variants={itemVariants} className="md:hidden">
            <Card className="bg-muted/40 border border-border rounded-2xl p-5 shadow-sm">
              <h3 className="text-muted-foreground font-bold uppercase tracking-wider text-xs mb-3">Eksplorasi Lainnya</h3>
              <Button asChild variant="outline" className="w-full h-11 bg-muted/30 border-border justify-start hover:bg-background text-foreground rounded-xl font-bold uppercase tracking-wider text-xs">
                <Link href="/library">
                  <Layers size={16} className="mr-2 text-primary" /> Buka Pustaka Data
                </Link>
              </Button>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
