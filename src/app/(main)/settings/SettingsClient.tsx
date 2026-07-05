"use client";

import { m, Variants } from "framer-motion";
import { Settings as SettingsIcon, Layers, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useHasMounted } from "@/hooks/useHasMounted";
import { Skeleton } from "@/components/ui/skeleton";

// Hook & Sub-komponen
import { useSettingsActions } from "@/components/features/user/useSettingsActions";
import ProfileSection from "./_components/ProfileSection";
import PreferencesSection from "./_components/PreferencesSection";
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

export default function SettingsClient() {
  const hasMounted = useHasMounted();
  const {
    name,
    xp,
    streak,
    isAuthenticated,
    updateProfileName,
    dirtySrsCount,
    isSyncing,
    confirmModal,
    closeConfirm,
    handleExportData,
    handleImportData,
    handleResetData,
    handleLogout,
    handleManualSync,
  } = useSettingsActions();

  if (!hasMounted) {
    return (
      <div className="max-w-3xl mx-auto pt-12 space-y-8 px-4">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <Skeleton className="h-[200px] w-full rounded-lg" />
      </div>
    );
  }

  return (
    <>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmText={confirmModal.confirmText}
        isDestructive={confirmModal.isDestructive}
        onConfirm={confirmModal.onConfirm}
      />

      <m.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container max-w-4xl mx-auto py-12 md:py-20 relative z-10 px-4 md:px-6"
      >
        <header className="mb-12 px-1">
          <m.div variants={itemVariants}>
            <Badge variant="outline" className="glass bg-background/20 text-primary border-primary/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2 w-fit shadow-[0_0_20px_rgb(var(--primary-rgb)/0.1)]">
              <SettingsIcon size={14} className="animate-spin-slow" /> Konfigurasi Sistem
            </Badge>
          </m.div>
          <m.h1 variants={itemVariants} className="text-4xl md:text-5xl font-black text-foreground italic tracking-tighter uppercase mb-4 leading-none select-none">
            Pengaturan Akun
          </m.h1>
          <m.p variants={itemVariants} className="text-muted-foreground text-sm md:text-base font-semibold max-w-xl leading-relaxed opacity-70">
            Atur profil dan preferensi belajar Anda. Gunakan sinkronisasi Cloud untuk menjaga keamanan riwayat belajar Anda di berbagai perangkat.
          </m.p>
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

          <PreferencesSection itemVariants={itemVariants} />

          <SyncStatusSection
            dirtySrsCount={dirtySrsCount}
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
          <m.div variants={itemVariants}>
            <Card className="bg-destructive/[0.02] border border-destructive/10 rounded-[2rem] p-6 md:p-8 shadow-lg flex flex-col md:flex-row items-center md:items-start gap-6 group hover:bg-destructive/[0.04] transition-all duration-300">
              <div className="size-14 shrink-0 rounded-lg bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldAlert size={28} className="text-destructive" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-destructive uppercase italic tracking-tighter text-lg mb-2">Zona Berbahaya</h4>
                <p className="text-muted-foreground text-sm leading-relaxed opacity-60 font-medium">
                  Penghapusan data bersifat permanen. Seluruh pencapaian, streak, dan data memori SRS Anda akan dihapus sepenuhnya dari sistem.
                </p>
              </div>
            </Card>
          </m.div>

          {/* MOBILE EXTRA NAV */}
          <m.div variants={itemVariants} className="md:hidden">
            <Card className="bg-background/[0.04]  border border-border rounded-[2rem] p-6 shadow-lg">
              <h3 className="text-primary uppercase tracking-[0.2em] text-[10px] mb-4">Navigasi Lanjutan</h3>
              <Button asChild variant="ghost" className="w-full h-14 bg-background/[0.03] border border-border justify-start hover:bg-primary/10 hover:text-primary rounded-lg font-black uppercase tracking-widest text-[10px] transition-all">
                <Link href="/library">
                  <Layers size={18} className="mr-3 text-primary" /> Buka Perpustakaan
                </Link>
              </Button>
            </Card>
          </m.div>
        </div>
      </m.div>
    </>
  );
}
