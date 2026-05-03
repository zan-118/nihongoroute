"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProgressStore } from "@/store/useProgressStore";
import { useShallow } from "zustand/react/shallow";
import { createClient } from "@/lib/supabase/client";
import { motion, Variants } from "framer-motion";
import { Save, Upload, Trash2, LogOut, Settings as SettingsIcon, Layers, ShieldAlert, Database, Cloud, CloudCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useHasMounted } from "@/hooks/useHasMounted";
import { Skeleton } from "@/components/ui/skeleton";

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
  const { exportData, importData, isAuthenticated, userFullName, updateProfileName, dirtySrs, progress, clearDirtySrs } = useProgressStore(
    useShallow((state) => ({ 
      exportData: state.exportData, 
      importData: state.importData, 
      isAuthenticated: state.isAuthenticated,
      userFullName: state.userFullName,
      updateProfileName: state.updateProfileName,
      dirtySrs: state.dirtySrs,
      progress: state.progress,
      clearDirtySrs: state.clearDirtySrs
    }))
  );
  const hasMounted = useHasMounted();
  const [isSyncing, setIsSyncing] = useState(false);
  const [newName, setNewName] = useState(userFullName || "");
  const router = useRouter();
  const supabase = createClient();

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
        localStorage.removeItem("nihongoroute_save_data");
        localStorage.removeItem("nihongo-progress");
        window.location.reload();
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

      {!hasMounted ? (
        <div className="max-w-3xl mx-auto pt-12 space-y-8">
           <div className="space-y-4">
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-4 w-96" />
           </div>
           <Skeleton className="h-[200px] w-full rounded-3xl" />
           <Skeleton className="h-[200px] w-full rounded-2xl" />
        </div>
      ) : (
      <motion.div
        className="max-w-3xl mx-auto relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* HEADER */}
        <header className="mb-8 px-1">
          <motion.div variants={itemVariants}>
            <Badge variant="outline" className="bg-muted text-muted-foreground border-border px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5 w-fit neo-inset shadow-none">
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
          {/* PROFILE SECTION */}
          <motion.div variants={itemVariants}>
            <Card className="bg-card backdrop-blur-xl border border-border rounded-3xl p-6 md:p-8 neo-card shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16" />
              
              <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <span className="text-3xl font-black italic">{(userFullName || "S").charAt(0).toUpperCase()}</span>
                </div>
                
                <div className="flex-1 w-full text-center md:text-left">
                  <h2 className="text-xl font-black uppercase italic tracking-tight text-foreground mb-1">Profil Saya</h2>
                  <p className="text-xs text-muted-foreground mb-4 font-medium uppercase tracking-widest">Atur identitas belajarmu</p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <input 
                        type="text" 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Masukkan nama Anda..."
                        className="w-full h-12 bg-muted/50 border border-border rounded-xl px-4 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>
                    <Button 
                      onClick={() => {
                        updateProfileName(newName);
                        toast.success("Nama profil berhasil diperbarui!");
                      }}
                      className="h-12 bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] rounded-xl px-8 shadow-lg hover:shadow-primary/20 transition-all"
                    >
                      Simpan Nama
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* DATA MANAGEMENT CARD */}
          <motion.div variants={itemVariants}>
            <Card className="bg-card backdrop-blur-xl border border-border rounded-2xl p-6 md:p-7 neo-card shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/15">
                  <Database size={20} className="text-primary" />
                </div>
                <h2 className="text-foreground font-black uppercase italic tracking-tight text-base">Kelola Data & Akun</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  className="h-12 bg-muted/30 border-border hover:bg-primary/10 hover:border-primary/30 hover:text-primary text-muted-foreground rounded-xl uppercase tracking-wider font-bold text-[11px] transition-all group"
                >
                  <Save size={16} className="mr-2 group-hover:scale-110 transition-transform" /> Simpan Backup
                </Button>
                <Button
                  variant="outline"
                  onClick={handleImportData}
                  className="h-12 bg-muted/30 border-border hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-600 dark:hover:text-purple-400 text-muted-foreground rounded-xl uppercase tracking-wider font-bold text-[11px] transition-all group"
                >
                  <Upload size={16} className="mr-2 group-hover:scale-110 transition-transform" /> Muat Backup
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResetData}
                  className="h-12 bg-destructive/5 border-destructive/10 hover:bg-destructive/15 hover:border-destructive text-destructive rounded-xl uppercase tracking-wider font-bold text-[11px] transition-all group"
                >
                  <Trash2 size={16} className="mr-2 group-hover:scale-110 transition-transform" /> Reset Semua Progres
                </Button>
                {isAuthenticated && (
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="h-12 bg-destructive/10 border-destructive/15 hover:bg-destructive/20 hover:border-destructive text-destructive rounded-xl uppercase tracking-wider font-bold text-[11px] transition-all group"
                  >
                    <LogOut size={16} className="mr-2 group-hover:translate-x-0.5 transition-transform" /> Keluar Akun
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>

          {/* SYNC STATUS CARD */}
          <motion.div variants={itemVariants}>
            <Card className="bg-card backdrop-blur-xl border border-border rounded-2xl p-6 neo-card shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${dirtySrs.size > 0 ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                    {dirtySrs.size > 0 ? <Cloud size={24} /> : <CloudCheck size={24} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight text-foreground">Status Sinkronisasi</h3>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">
                      {dirtySrs.size > 0 ? `${dirtySrs.size} Item belum tersinkron` : "Semua data aman di Cloud"}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleManualSync}
                  disabled={isSyncing || dirtySrs.size === 0}
                  variant="outline" 
                  className="h-10 px-4 bg-muted/30 border-border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <RefreshCw size={14} className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? "Sinkron..." : "Sinkron Sekarang"}
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* DANGER ZONE INFO */}
          <motion.div variants={itemVariants}>
            <Card className="bg-destructive/[0.02] border-destructive/10 rounded-2xl p-5 md:p-6 neo-card shadow-sm flex items-start gap-4">
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
            <Card className="bg-muted/40 border border-border rounded-2xl p-5 neo-card shadow-sm">
              <h3 className="text-muted-foreground font-bold uppercase tracking-wider text-[10px] mb-3">Eksplorasi Lainnya</h3>
              <Button asChild variant="outline" className="w-full h-11 bg-muted/30 border-border justify-start hover:bg-background text-foreground rounded-xl font-bold uppercase tracking-wider text-[11px]">
                <Link href="/library">
                  <Layers size={16} className="mr-2 text-primary" /> Buka Pustaka Data
                </Link>
              </Button>
            </Card>
          </motion.div>
        </div>
      </motion.div>
      )}
    </div>
  );
}
