"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

/**
 * Custom Hook: useSettingsActions
 * 
 * Mengelola interaksi menu pengaturan, meliputi sinkronisasi data manual lokal ke cloud Supabase,
 * ekspor/impor data progres sebagai file JSON, hapus permanen seluruh data progres (reset data),
 * pembaruan profil pengguna, dan keluar akun (logout) dengan dialog konfirmasi khusus.
 * 
 * @returns {Object} Kumpulan properti data profil dan callback aksi pengaturan
 * @returns {string} name - Nama profil pengguna saat ini
 * @returns {number} xp - Jumlah poin XP pengguna saat ini
 * @returns {number} streak - Jumlah hari beruntun (streak) belajar
 * @returns {boolean} isAuthenticated - Menunjukkan apakah pengguna masuk via akun cloud
 * @returns {Function} updateProfileName - Callback untuk memperbarui nama profil
 * @returns {number} dirtySrsCount - Jumlah kartu SRS yang belum tersinkronisasi
 * @returns {boolean} isSyncing - Menandakan apakah sinkronisasi manual sedang berjalan
 * @returns {Object} confirmModal - State dialog konfirmasi (isOpen, title, description, dll.)
 * @returns {Function} closeConfirm - Callback untuk menutup modal konfirmasi
 * @returns {Function} handleExportData - Callback untuk mengekspor progres belajar ke berkas JSON
 * @returns {Function} handleImportData - Callback untuk mengimpor berkas JSON progres belajar
 * @returns {Function} handleResetData - Callback untuk menghapus seluruh progres belajar lokal
 * @returns {Function} handleLogout - Callback untuk mengakhiri sesi login pengguna
 * @returns {Function} handleManualSync - Callback untuk memaksa sinkronisasi local data ke cloud Supabase
 */
export function useSettingsActions() {
  const router = useRouter();
  const supabase = createClient();

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

  const [isSyncing, setIsSyncing] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "",
    isDestructive: false,
    onConfirm: () => {},
  });

  const openConfirm = useCallback((
    title: string,
    description: string,
    confirmText: string,
    isDestructive: boolean,
    onConfirm: () => void
  ) => {
    setConfirmModal({ isOpen: true, title, description, confirmText, isDestructive, onConfirm });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const resetAll = useCallback(() => {
    resetAuth();
    resetUser();
    resetSRS();
    resetUI();
  }, [resetAuth, resetUser, resetSRS, resetUI]);

  const handleExportData = useCallback(() => {
    exportData();
  }, [exportData]);

  const handleImportData = useCallback(() => {
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
        if (await importData(result)) {
          window.location.reload();
        } else {
          alert("Format file data tidak valid atau rusak!");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [importData]);

  const handleResetData = useCallback(() => {
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
  }, [openConfirm, resetAll]);

  const handleLogout = useCallback(() => {
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
  }, [openConfirm, resetAll, router, supabase.auth]);

  const handleManualSync = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error("Silakan login untuk sinkronisasi cloud!");
      return;
    }
    
    setIsSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { syncLocalToCloud } = await import("@/lib/supabase/sync");
        const progressData = {
          id,
          isGuest,
          name,
          xp,
          level,
          streak,
          todayReviewCount,
          lastStudyDate,
          studyDays,
          inventory,
          completedLessons,
          srs,
          notifications,
          settings,
        };
        const success = await syncLocalToCloud(session.user.id, progressData);
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
  }, [
    isAuthenticated,
    supabase.auth,
    clearDirtySrs,
    id,
    isGuest,
    name,
    xp,
    level,
    streak,
    todayReviewCount,
    lastStudyDate,
    studyDays,
    inventory,
    completedLessons,
    srs,
    notifications,
    settings,
  ]);

  return {
    name,
    xp,
    streak,
    isAuthenticated,
    updateProfileName,
    dirtySrsCount: dirtySrs.size,
    isSyncing,
    confirmModal,
    closeConfirm,
    handleExportData,
    handleImportData,
    handleResetData,
    handleLogout,
    handleManualSync,
  };
}
