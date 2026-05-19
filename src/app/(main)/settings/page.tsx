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
import ProfileSection from "./_components/ProfileSection";
import DataManagementSection from "./_components/DataManagementSection";
import SyncStatusSection from "./_components/SyncStatusSection";

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
  const updateProfileName = useUserStore((state) => state.updateProfileName);
  const resetUser = useUserStore((state) => state.resetUser);
  const id = useUserStore((state) => state.id);
  const isGuest = useUserStore((state) => state.isGuest);
  const name = useUserStore((state) => state.name);
  const xp = useUserStore((state) => state.xp);
  const level = useUserStore((state) => state.level);
  const streak = useUserStore((state) => state.streak);
  const todayReviewCount = useUserStore((state) => state.todayReviewCount);
  const lastStudyDate = useUserStore((state) => state.lastStudyDate);
  const studyDays = useUserStore((state) => state.studyDays);
  const inventory = useUserStore((state) => state.inventory);
  const completedLessons = useUserStore((state) => state.completedLessons);
  
  const dirtySrs = useSRSStore((state) => state.dirtySrs);
  const clearDirtySrs = useSRSStore((state) => state.clearDirtySrs);
  const resetSRS = useSRSStore((state) => state.resetSRS);
  const srs = useSRSStore((state) => state.srs);
  
  const exportData = useUIStore((state) => state.exportData);
  const importData = useUIStore((state) => state.importData);
  const resetUI = useUIStore((state) => state.resetUI);
  const notifications = useUIStore((state) => state.notifications);
  const settings = useUIStore((state) => state.settings);
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const resetAuth = useAuthStore((state) => state.resetAuth);
  
   const hasMounted = useHasMounted();
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const progress = { id, isGuest, name, xp, level, streak, todayReviewCount, lastStudyDate, studyDays, inventory, completedLessons, srs, notifications, settings };

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
      reader.onload = async (event: ProgressEvent<FileReader>) => {
        const result = event.target?.result as string;
        if (await importData(result)) window.location.reload();
        else alert("Format file data tidak valid atau rusak!");
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleResetData = () => {
    openConfirm(
      "Hapus Seluruh Riwayat Belajar?",
      "Peringatan: Seluruh progres belajar Anda akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.",
      "Ya, Hapus Permanen",
      true,
      () => {
        resetAll();
        toast.success("Semua data progres telah direset.");
      }
    );
  };

  const handleLogout = () => {
    openConfirm(
      "Akhiri Sesi Belajar?",
      "Sesi belajar Anda akan diakhiri. Pastikan data sudah tersinkronisasi ke Cloud untuk keamanan progres Anda.",
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
    <div className="relative min-h-screen">
      {/* Premium Ambient Background Grid & Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 neural-grid opacity-[0.12] mix-blend-overlay" />
        <div className="absolute top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/10 blur-[130px] rounded-full animate-pulse pointer-events-none" />
        <div className="absolute bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-secondary/5 blur-[130px] rounded-full animate-pulse pointer-events-none" style={{ animationDelay: '1.5s' }} />
      </div>

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
        className="container max-w-4xl mx-auto py-12 md:py-20 relative z-10 px-4 md:px-6"
      >
        <header className="mb-12 px-1">
          <motion.div variants={itemVariants}>
            <Badge variant="outline" className="glass bg-background/20 text-primary border-primary/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2 w-fit shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
              <SettingsIcon size={14} className="animate-spin-slow" /> Konfigurasi Sistem
            </Badge>
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-black text-foreground italic tracking-tighter uppercase mb-4 leading-none select-none">
            Pengaturan Akun
          </motion.h1>
          <motion.p variants={itemVariants} className="text-muted-foreground text-sm md:text-base font-semibold max-w-xl leading-relaxed opacity-70">
            Atur profil dan preferensi belajar Anda. Gunakan sinkronisasi Cloud untuk menjaga keamanan riwayat belajar Anda di berbagai perangkat.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 gap-8 px-1">
          <ProfileSection 
            name={name || ""} 
            xp={xp}
            streak={streak}
            isAuthenticated={isAuthenticated} 
            updateProfileName={updateProfileName} 
            itemVariants={itemVariants} 
          />

          <SyncStatusSection 
            dirtySrsCount={dirtySrs.size}
            isSyncing={isSyncing}
            handleManualSync={handleManualSync}
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

          {/* DANGER ZONE INFO */}
          <motion.div variants={itemVariants}>
            <Card className="bg-destructive/[0.02] border border-destructive/10 rounded-[2rem] p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-center md:items-start gap-6 group hover:bg-destructive/[0.04] transition-all duration-500">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldAlert size={28} className="text-destructive" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-destructive font-black uppercase italic tracking-tighter text-lg mb-2">Zona Berbahaya</h4>
                <p className="text-muted-foreground text-sm leading-relaxed opacity-60 font-medium">
                  Penghapusan data bersifat permanen. Seluruh pencapaian, streak, dan data memori SRS Anda akan dihapus sepenuhnya dari sistem.
                </p>
              </div>
            </Card>
          </motion.div>

          {/* MOBILE EXTRA NAV */}
          <motion.div variants={itemVariants} className="md:hidden">
            <Card className="bg-background/[0.02] backdrop-blur-xl border border-border rounded-[2rem] p-6 shadow-2xl">
              <h3 className="text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-4">Navigasi Lanjutan</h3>
              <Button asChild variant="ghost" className="w-full h-14 bg-background/[0.03] border border-border justify-start hover:bg-primary/10 hover:text-primary rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all">
                <Link href="/library">
                  <Layers size={18} className="mr-3 text-primary" /> Buka Perpustakaan
                </Link>
              </Button>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
