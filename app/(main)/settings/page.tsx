"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProgressStore } from "@/store/useProgressStore";
import { useShallow } from "zustand/react/shallow";
import { createClient } from "@/lib/supabase/client";
import { motion, Variants } from "framer-motion";
import { Save, Upload, Trash2, LogOut, Settings as SettingsIcon, BookOpen, Layers, ShieldAlert, Database, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import ConfirmModal from "@/components/ConfirmModal";

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
  const { exportData, importData, isAuthenticated } = useProgressStore(
    useShallow((state) => ({ exportData: state.exportData, importData: state.importData, isAuthenticated: state.isAuthenticated }))
  );
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

  return (
    <div className="w-full min-h-screen bg-[#05060A] relative overflow-hidden pt-24 pb-20 px-4 md:px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[300px] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none opacity-40" />
      
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
        {/* HEADER */}
        <header className="mb-8 px-1">
          <motion.div variants={itemVariants}>
            <Badge variant="outline" className="bg-slate-900/50 text-slate-500 border-white/5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5 w-fit neo-inset shadow-none">
              <SettingsIcon size={12} /> Konfigurasi
            </Badge>
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase mb-3">
            Pengaturan
          </motion.h1>
          <motion.p variants={itemVariants} className="text-slate-500 text-sm font-medium max-w-lg leading-relaxed">
            Atur data belajar dan akunmu di sini. Jangan lupa backup biar progresmu selalu aman!
          </motion.p>
        </header>

        <div className="grid grid-cols-1 gap-5 px-1">
          {/* DATA MANAGEMENT CARD */}
          <motion.div variants={itemVariants}>
            <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 rounded-2xl p-6 md:p-7 neo-card shadow-none">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/15">
                  <Database size={20} className="text-cyan-400" />
                </div>
                <h2 className="text-white font-black uppercase italic tracking-tight text-base">Kelola Data & Akun</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  className="h-12 bg-black/30 border-white/5 hover:bg-cyan-400/10 hover:border-cyan-400/30 hover:text-cyan-400 text-slate-400 rounded-xl uppercase tracking-wider font-bold text-[11px] transition-all group"
                >
                  <Save size={16} className="mr-2 group-hover:scale-110 transition-transform" /> Simpan Backup
                </Button>
                <Button
                  variant="outline"
                  onClick={handleImportData}
                  className="h-12 bg-black/30 border-white/5 hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-400 text-slate-400 rounded-xl uppercase tracking-wider font-bold text-[11px] transition-all group"
                >
                  <Upload size={16} className="mr-2 group-hover:scale-110 transition-transform" /> Muat Backup
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResetData}
                  className="h-12 bg-red-500/5 border-red-500/10 hover:bg-red-500/15 hover:border-red-500/30 text-red-400 rounded-xl uppercase tracking-wider font-bold text-[11px] transition-all group"
                >
                  <Trash2 size={16} className="mr-2 group-hover:scale-110 transition-transform" /> Reset Semua Progres
                </Button>
                {isAuthenticated && (
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="h-12 bg-red-500/10 border-red-500/15 hover:bg-red-500/20 hover:border-red-500/40 text-red-400 rounded-xl uppercase tracking-wider font-bold text-[11px] transition-all group"
                  >
                    <LogOut size={16} className="mr-2 group-hover:translate-x-0.5 transition-transform" /> Keluar Akun
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>

          {/* DANGER ZONE INFO */}
          <motion.div variants={itemVariants}>
            <Card className="bg-red-500/[0.02] border-red-500/10 rounded-2xl p-5 md:p-6 neo-card shadow-none flex items-start gap-4">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/15">
                <ShieldAlert size={20} className="text-red-500" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-bold uppercase text-sm mb-1">Zona Bahaya!</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Ingat ya, hapus data berarti semua XP dan hafalanmu hilang selamanya. Pikir-pikir dulu atau simpan backup-nya ya!
                </p>
              </div>
            </Card>
          </motion.div>

          {/* MOBILE EXTRA NAV */}
          <motion.div variants={itemVariants} className="md:hidden">
            <Card className="bg-slate-900/40 border-white/5 rounded-2xl p-5 neo-card shadow-none">
              <h3 className="text-slate-600 font-bold uppercase tracking-wider text-[10px] mb-3">Eksplorasi Lainnya</h3>
              <Button asChild variant="outline" className="w-full h-11 bg-black/30 border-white/5 justify-start hover:bg-white/10 text-white rounded-xl font-bold uppercase tracking-wider text-[11px]">
                <Link href="/library">
                  <Layers size={16} className="mr-2 text-cyan-400" /> Buka Pustaka Data
                </Link>
              </Button>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
