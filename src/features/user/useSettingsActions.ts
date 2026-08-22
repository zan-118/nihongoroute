"use client";

/**
 * @file useSettingsActions.ts
 * @description Hook kustom (Custom Hook) untuk mengelola seluruh interaksi pada halaman Pengaturan Akun.
 * Menyediakan fungsionalitas ekspor/impor data JSON, reset progres belajar, logout, serta sinkronisasi progres manual ke cloud Supabase.
 */

// IMPOR

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";
import { useAuthStore } from "@/store/useAuthStore";
import { buildSrsUpdates, buildLessonUpdates } from "@/lib/cloud-sync-payload";
import { toast } from "sonner";

// HOOK UTAMA

/**
 * Manage account settings actions.
 * Handle export, import, reset, logout, cloud sync.
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

 // Sync state indicator.
 const [isSyncing, setIsSyncing] = useState(false);
 
 // Confirmation modal state.
 const [confirmModal, setConfirmModal] = useState({
 isOpen: false,
 title: "",
 description: "",
 confirmText: "",
 isDestructive: false,
 onConfirm: () => {},
 });

 /**
 * Open confirmation modal.
 */
 const openConfirm = useCallback((
 title: string,
 description: string,
 confirmText: string,
 isDestructive: boolean,
 onConfirm: () => void
 ) => {
 setConfirmModal({ isOpen: true, title, description, confirmText, isDestructive, onConfirm });
 }, []);

 /**
 * Close confirmation modal.
 */
 const closeConfirm = useCallback(() => {
 setConfirmModal((prev) => ({ ...prev, isOpen: false }));
 }, []);

 /**
 * Reset all local stores.
 */
 const resetAll = useCallback(() => {
 resetAuth();
 resetUser();
 resetSRS();
 resetUI();
 }, [resetAuth, resetUser, resetSRS, resetUI]);

 /**
 * Export user data to JSON.
 */
 const handleExportData = useCallback(() => {
 exportData();
 }, [exportData]);

 /**
 * Import user data from JSON.
 */
 const handleImportData = useCallback(() => {
 // Create hidden file input to trigger file picker.
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
 // Reload page to apply imported state.
 window.location.reload();
 } else {
 alert("File-nya nggak valid atau rusak. Coba file lain ya.");
 }
 };
 reader.readAsText(file);
 };
 input.click();
 }, [importData]);

 /**
 * Trigger reset confirmation.
 */
 const handleResetData = useCallback(() => {
 openConfirm(
 "Hapus Semua Data Belajar?",
 "Semua progres belajarmu bakal dihapus permanen dan nggak bisa dikembalikan.",
 "Ya, Hapus Permanen",
 true,
 () => {
 resetAll();
 toast.success("Data belajar udah direset.");
 }
 );
 }, [openConfirm, resetAll]);

 /**
 * Trigger logout confirmation.
 */
 const handleLogout = useCallback(() => {
 openConfirm(
 "Mau Keluar?",
 "Kamu akan keluar dari akun. Pastikan datamu udah tersinkron ke cloud ya.",
 "Keluar Sekarang",
 true,
 async () => {
 await supabase.auth.signOut();
 resetAll();
 router.push("/login");
 }
 );
 }, [openConfirm, resetAll, router, supabase.auth]);

 /**
 * Sync local progress to Supabase.
 */
 const handleManualSync = useCallback(async () => {
 if (!isAuthenticated) {
 toast.error("Login dulu ya biar data belajarmu bisa disinkronkan ke cloud.");
 return;
 }
 
 setIsSyncing(true);
 try {
 const { data: { session } } = await supabase.auth.getSession();
 if (session?.user) {
 // Build relational updates
 const srsUpdates = buildSrsUpdates(srs, new Set(Object.keys(srs)));
 const lessonUpdates = buildLessonUpdates(completedLessons, new Set(Object.keys(completedLessons)));

 const { error: rpcError } = await supabase.rpc('sync_user_progress', {
 p_full_name: name,
 p_xp: xp,
 p_streak: streak,
 p_today_review_count: todayReviewCount,
 p_last_study_date: lastStudyDate,
 p_study_days: studyDays,
 p_inventory: inventory,
 p_settings: settings,
 p_srs_updates: srsUpdates,
 p_lesson_updates: lessonUpdates
 });

 if (!rpcError) {
 clearDirtySrs();
 toast.success("Oke, datamu udah disimpan ke cloud!");
 } else {
 toast.error("Waduh, sinkronisasinya gagal. Coba lagi nanti ya.");
 }
 } else {
 toast.error("Sesinya udah habis. Coba login lagi ya.");
 }
 } catch (err) {
 console.error("Sync error:", err);
 toast.error("Ada masalah waktu sinkronisasi. Coba lagi nanti ya.");
 } finally {
 setIsSyncing(false);
 }
 }, [
 isAuthenticated,
 supabase,
 clearDirtySrs,
 name,
 xp,
 streak,
 todayReviewCount,
 lastStudyDate,
 studyDays,
 inventory,
 completedLessons,
 srs,
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