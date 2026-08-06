/**
 * @file SettingsView.tsx
 * @description Main user settings view component integrating profile preferences, notification toggles, data management, and sync status.
 * @module features/settings
 */

"use client";

import { m, Variants } from "framer-motion";
import { Settings as SettingsIcon, Layers, Shield } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useHasMounted } from "@/hooks/useHasMounted";
import { Skeleton } from "@/components/ui/skeleton";

import { useSettingsActions } from "@/features/user/useSettingsActions";
import ProfileSection from "./components/ProfileSection";
import PreferencesSection from "./components/PreferencesSection";
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

export function SettingsView() {
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
 <Skeleton className="h-50 w-full rounded-xl" />
 <Skeleton className="h-50 w-full rounded-lg" />
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
 <Badge variant="outline" className="bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-[4px] text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2 w-fit shadow-sm">
 <SettingsIcon size={14} className="animate-spin-slow" /> Konfigurasi Sistem
 </Badge>
 </m.div>
 <m.h1 variants={itemVariants} className="text-4xl md:text-5xl font-black text-foreground italic tracking-tighter uppercase mb-4 leading-none select-none">
 Pengaturan Akun
 </m.h1>
 <m.p variants={itemVariants} className="text-muted-foreground text-sm md:text-base font-semibold max-w-xl leading-relaxed opacity-70">
 Atur profil dan preferensi belajarmu. Pakai sinkronisasi Cloud biar riwayat belajarmu aman di berbagai perangkat.
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

 <m.div variants={itemVariants} className="relative group">
 <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 pointer-events-none z-20">
 <div className="absolute top-0 right-0 w-3.5 h-px bg-destructive/30 group-hover:bg-destructive transition-colors duration-500" />
 <div className="absolute top-0 right-0 w-px h-3.5 bg-destructive/30 group-hover:bg-destructive transition-colors duration-500" />
 </div>

 <Card className="bg-destructive/2 border border-destructive/20 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 group hover:bg-destructive/4 transition-all duration-300">
 <div className="size-14 shrink-0 rounded-lg bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-md group-hover:scale-105 transition-transform">
 <Shield size={28} className="text-destructive" />
 </div>
 <div className="flex-1 text-center md:text-left">
 <h4 className="text-destructive uppercase italic tracking-tighter text-lg mb-2">Zona Berbahaya</h4>
 <p className="text-muted-foreground text-sm leading-relaxed opacity-60 font-medium">
 Penghapusan data bersifat permanen. Semua pencapaian, streak, dan data memori SRS kamu akan dihapus sepenuhnya dari sistem.
 </p>
 </div>
 </Card>
 </m.div>

 <m.div variants={itemVariants} className="md:hidden">
 <Card className="bg-card border border-border/50 dark:border-white/10 rounded-2xl p-6 shadow-sm">
 <h3 className="text-primary uppercase tracking-[0.2em] text-[10px] mb-4">Navigasi Lanjutan</h3>
 <Button asChild variant="ghost" className="w-full h-14 bg-background/50 border border-border justify-start hover:bg-primary/10 hover:text-primary rounded-lg rounded-br-none font-black uppercase tracking-widest text-[10px] transition-all">
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

export default SettingsView;
