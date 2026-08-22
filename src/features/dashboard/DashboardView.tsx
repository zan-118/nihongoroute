/**
 * @file DashboardView.tsx
 * @description Main dashboard view component aggregating user progress stats, daily expression spotlights, SRS review summaries, and tabs.
 * @module features/dashboard
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";

import { m, Variants } from "framer-motion";
import dynamic from "next/dynamic";
import DashboardSettings from "@/features/dashboard/components/DashboardSettings";
import LevelUpOverlay from "@/features/gamification/LevelUpOverlay";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { toast } from "sonner";
import { summarizeSrs } from "@/lib/srs-summary";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { type RandomExpression } from "@/actions/expressions.actions";
import { buildProgressSummary, formatUserIdentifier } from "@/features/dashboard/dashboard-stats-engine";
import { DashboardTabs } from "@/features/dashboard/components/DashboardTabs";
import { HomePanel } from "@/features/dashboard/components/panels/HomePanel";
import { ProgressPanel } from "@/features/dashboard/components/panels/ProgressPanel";

/** Dynamic import for achievements grid to optimize initial load. */
const AchievementsGrid = dynamic(() => import("@/features/gamification/AchievementsGrid"), { 
 ssr: false,
 loading: () => <div className="h-50 w-full animate-pulse bg-muted rounded-lg" />
});

import { Home, Pulse, Trophy, Settings } from "@/components/ui/icons";

// CONFIG / CONSTANTS

/** Animation variants for dashboard items. */
const itemVariants: Variants = {
 hidden: { y: 16, opacity: 0 },
 visible: {
 y: 0,
 opacity: 1,
 transition: { type: "spring", stiffness: 100, damping: 20 },
 },
};

/** Navigation tabs configuration. */
const TABS = [
 { id: "beranda", label: "Beranda", icon: Home },
 { id: "progres", label: "Progres", icon: Pulse },
 { id: "pencapaian", label: "Koleksi", icon: Trophy },
 { id: "pengaturan", label: "Setelan", icon: Settings },
];

/** Props for DashboardView component. */
export interface DashboardViewProps {
 /** Random expression of the day. */
 expression: RandomExpression | null;
 /** Course structure metadata. */
 courseMetadata: Array<{
 id?: string;
 _id?: string;
 title: string;
 slug: string;
 lessons: Array<{
 id?: string;
 _id?: string;
 title: string;
 slug: string;
 }>;
 }>;
}

/**
 * Main dashboard view component.
 */
export function DashboardView({ courseMetadata, expression }: DashboardViewProps) {
 // Auth store selectors
 const isAuthenticated = useAuthStore(s => s.isAuthenticated);
 const resetAuth = useAuthStore(s => s.resetAuth);

 // User store selectors
 const id = useUserStore(s => s.id);
 const isGuest = useUserStore(s => s.isGuest);
 const name = useUserStore(s => s.name);
 const xp = useUserStore(s => s.xp);
 const level = useUserStore(s => s.level);
 const streak = useUserStore(s => s.streak);
 const todayReviewCount = useUserStore(s => s.todayReviewCount);
 const lastStudyDate = useUserStore(s => s.lastStudyDate);
 const studyDays = useUserStore(s => s.studyDays);
 const inventory = useUserStore(s => s.inventory);
 const resetUser = useUserStore(s => s.resetUser);

 // SRS store selectors
 const resetSRS = useSRSStore(s => s.resetSRS);
 const dueCount = useSRSStore(s => summarizeSrs(s.srs).due);

 // UI store selectors
 const loading = useUIStore(s => s.loading);
 const resetUI = useUIStore(s => s.resetUI);
 const exportData = useUIStore(s => s.exportData);
 const importData = useUIStore(s => s.importData);
 const notifications = useUIStore(s => s.notifications);
 const settings = useUIStore(s => s.settings);

 /** Reset all local and global state stores. */
 const resetProgress = () => {
 resetAuth();
 resetUser();
 resetSRS();
 resetUI();
 };

 /** Memoized user progress object. */
 const progress = useMemo(() => {
 return buildProgressSummary({
 id: id || undefined,
 isGuest,
 name: name || undefined,
 xp,
 level,
 streak,
 todayReviewCount,
 lastStudyDate,
 studyDays,
 inventory,
 settings,
 });
 }, [
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
 settings,
 ]);

 const [guestId, setGuestId] = useState<string>("MENYIAPKAN...");
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

 // Fetch or generate unique identifier for guest or authenticated user
 useEffect(() => {
 const checkId = async () => {
 if (isAuthenticated) {
 const { data: { session } } = await supabase.auth.getSession();
 if (session?.user) {
 setGuestId(formatUserIdentifier(session.user.id, true));
 return;
 }
 }
 let savedId = localStorage.getItem("nihongo_guest_id");
 if (!savedId) {
 savedId = formatUserIdentifier(null, false);
 localStorage.setItem("nihongo_guest_id", savedId);
 }
 setGuestId(formatUserIdentifier(savedId, false));
 };
 checkId();
 }, [isAuthenticated, supabase.auth]);

 /** Trigger JSON data export. */
 const handleExportData = () => exportData();
 
 /** Trigger JSON data import via file reader. */
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

 /** Open confirmation modal with custom settings. */
 const openConfirm = (title: string, description: string, confirmText: string, isDestructive: boolean, onConfirm: () => void) => {
 setConfirmModal({ isOpen: true, title, description, confirmText, isDestructive, onConfirm });
 };
 
 /** Close confirmation modal. */
 const closeConfirm = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

 /** Reset all user data after confirmation. */
 const handleResetData = () => {
 openConfirm(
 "Hapus Seluruh Riwayat Belajar?",
 "Tindakan ini akan menghapus permanen seluruh progres, XP, dan pencapaianmu secara lokal. Kamu yakin?",
 "Ya, Hapus Permanen",
 true,
 () => {
 resetProgress();
 toast.success("Data telah dibersihkan.");
 window.location.reload(); 
 }
 );
 };

 /** Log out user and clear local state. */
 const handleLogout = () => {
 openConfirm(
 "Akhiri Sesi Belajar?",
 "Kamu akan keluar dari akun. Pastikan progres terakhirmu sudah tersimpan di cloud ya.",
 "Keluar Sekarang",
 true,
 async () => {
 await supabase.auth.signOut();
 resetProgress();
 router.push("/login");
 }
 );
 };

 // Calculate XP progress for current level (1000 XP per level)
 const xpNeeded = 1000 - (progress.xp % 1000);
 const xpProgress = (progress.xp % 1000) / 10;

 const [activeTab, setActiveTab] = useState("beranda");

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

 <DashboardTabs 
 tabs={TABS}
 activeTab={activeTab}
 onTabChange={setActiveTab}
 />

 <m.div
 key={activeTab}
 id={`${activeTab}-panel`}
 role="tabpanel"
 tabIndex={0}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3 }}
 className="mt-8.5"
 >
 {activeTab === "beranda" && (
 <HomePanel
 loading={loading}
 guestId={guestId}
 dueCount={dueCount}
 itemVariants={itemVariants}
 isAuthenticated={isAuthenticated}
 expression={expression}
 courseMetadata={courseMetadata}
 />
 )}

 {activeTab === "progres" && (
 <ProgressPanel
 loading={loading}
 progress={progress}
 xpNeeded={xpNeeded}
 xpProgress={xpProgress}
 itemVariants={itemVariants}
 courseMetadata={courseMetadata}
 />
 )}

 {activeTab === "pencapaian" && (
 <div className="space-y-8.5">
 <div className="flex flex-col gap-2">
 <div className="flex items-center gap-3.25">
 <div className="w-8.5 h-px bg-primary/40" />
 <h2 className="text-[10px] uppercase tracking-wider text-primary">
 Koleksi
 </h2>
 </div>
 <h3 className="text-3xl tracking-tight text-foreground">
 Pencapaian <span className="text-muted-foreground font-medium">& Hadiah</span>
 </h3>
 </div>
 <AchievementsGrid />
 </div>
 )}

 {activeTab === "pengaturan" && (
 <DashboardSettings 
 isAuthenticated={isAuthenticated}
 handleExportData={handleExportData}
 handleImportData={handleImportData}
 handleResetData={handleResetData}
 handleLogout={handleLogout}
 itemVariants={itemVariants}
 />
 )}
 </m.div>
 </div>
 );
}

export default DashboardView;
