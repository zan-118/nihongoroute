/**
 * @file Topbar.tsx
 * @description Premium application topbar component with global search triggers, cloud sync status badges, furigana toggles, notifications popovers, and profile navigation.
 */

"use client";

// ==========================================
// Import & Dependencies
// ==========================================
import { useState, useEffect } from "react";
import { Search, Bell, Menu, Cloud, RefreshCw, ChevronLeft, BookOpen, Eye, EyeOff, Share2 } from "@/components/ui/icons";
import { m, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUIStore } from "@/store/useUIStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useNavbar } from "./useNavbar";
import { useSyncNotifications } from "@/hooks/useSyncNotifications";
import dynamic from "next/dynamic";

const NotificationPopover = dynamic(() => import("@/features/user/NotificationPopover"), { ssr: false });
const SearchModal = dynamic(() => import("@/features/tools/search/SearchModal"), { ssr: false });
import UserNav from "@/features/user/UserNav";
import { ThemeToggle } from "./ThemeToggle";
import { getBreadcrumbItems, getCurrentRouteLabel, getParentRouteLabel } from "@/lib/routes";

// ==========================================
// Main Component
// ==========================================
/**
 * Render application top header bar.
 * @param props Component properties containing menu click handler.
 * @returns {React.ReactElement} Top navigation bar interface.
 * @storeAccess Accesses `useUIStore` and `useSRSStore`.
 */
export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
 const router = useRouter();
 const { pathname } = useNavbar();
 const notifications = useUIStore((s) => s.notifications);
 const isSyncing = useUIStore((s) => s.isSyncing);
 const syncError = useUIStore((s) => s.syncError);
 const hasPendingSync = useSRSStore((s) => s.dirtySrs.size > 0);
 const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
 const [isSearchOpen, setIsSearchOpen] = useState(false);

 useSyncNotifications();
 const unreadNotifications = notifications?.filter((n: { read: boolean }) => !n.read).length || 0;

 const breadcrumbItems = getBreadcrumbItems(pathname);
 const currentRouteLabel = getCurrentRouteLabel(pathname);
 const parentRouteLabel = getParentRouteLabel(pathname);
 
 const handleSharePage = async () => {
 const shareData = {
 title: document.title || "NihongoRoute",
 text: "Yuk belajar Bahasa Jepang bareng di NihongoRoute!",
 url: window.location.origin + pathname,
 };

 if (navigator.share) {
 try {
 await navigator.share(shareData);
 } catch (err) {
 console.log("Batal/Gagal share:", err);
 }
 } else {
 try {
 await navigator.clipboard.writeText(window.location.origin + pathname);
 toast.success("Link halaman udah disalin!");
 } catch (err) {
 console.error("Gagal menyalin tautan:", err);
 }
 }
 };

 useEffect(() => {
 const down = (e: KeyboardEvent) => {
 if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
 e.preventDefault();
 setIsSearchOpen((open) => !open);
 }
 };
 document.addEventListener("keydown", down);
 return () => document.removeEventListener("keydown", down);
 }, []);
 
 const readingMode = useUIStore((s) => s.readingState.mode);

 return (
 <>
 <header data-tour="topbar" className="topbar-shell sticky top-0 z-40 w-full px-3 sm:px-4 md:px-8 lg:px-10 py-3 flex items-center justify-between transition-all bg-background/95 backdrop-blur-md border-b border-border/40">
 <div className="flex items-center gap-3 sm:gap-5 min-w-0">
 <div className="md:hidden flex items-center gap-2">
 {breadcrumbItems.length > 1 ? (
 <div className="flex items-center gap-1">
 <m.button 
 whileTap={{ scale: 0.9 }}
 onClick={() => router.back()}
 aria-label="Kembali ke Halaman Sebelumnya"
 className="action-icon size-11"
 >
 <ChevronLeft size={20} />
 </m.button>
 <m.button 
 whileTap={{ scale: 0.9 }}
 onClick={onMenuClick}
 aria-label="Buka Menu Navigasi"
 className="action-icon size-11"
 >
 <Menu size={18} />
 </m.button>
 </div>
 ) : (
 <m.button 
 whileTap={{ scale: 0.9 }}
 onClick={onMenuClick}
 aria-label="Buka Menu Navigasi"
 className="action-icon size-11"
 >
 <Menu size={20} />
 </m.button>
 )}
 </div>

 <div className="hidden md:flex flex-col min-w-0 max-w-47.5 sm:max-w-70 md:max-w-90 lg:max-w-none">
 <p className="text-sm md:text-lg text-foreground tracking-tight truncate leading-none uppercase md:max-w-[18rem] lg:max-w-none">
 {currentRouteLabel}
 </p>
 {parentRouteLabel && (
 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.16em] mt-1 truncate">
 {parentRouteLabel}
 </span>
 )}
 </div>
 </div>

 <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
 <div 
 aria-live="polite"
 aria-atomic="true"
 className="status-pill hidden sm:flex items-center justify-center p-2 transition-all"
 >
 <AnimatePresence mode="wait">
 {isSyncing ? (
 <m.div 
 key="syncing"
 initial={{ opacity: 0, x: 10 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -10 }}
 className="flex items-center"
 >
 <RefreshCw size={12} className="animate-spin text-primary" aria-hidden="true" />
 <span className="sr-only">Sinkronisasi…</span>
 </m.div>
 ) : syncError ? (
 <m.div 
 key="error"
 initial={{ opacity: 0, x: 10 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -10 }}
 className="flex items-center"
 >
 <Cloud size={12} className="text-destructive" aria-hidden="true" />
 <span className="text-destructive/90 sr-only">Sinkron Gagal</span>
 </m.div>
 ) : hasPendingSync ? (
 <m.div 
 key="pending"
 initial={{ opacity: 0, x: 10 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -10 }}
 className="flex items-center"
 >
 <Cloud size={12} className="text-warning" aria-hidden="true" />
 <span className="text-warning/90 sr-only">Menunggu</span>
 </m.div>
 ) : (
 <m.div 
 key="synced"
 initial={{ opacity: 0, x: 10 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -10 }}
 className="flex items-center"
 >
 <Cloud size={12} className="text-success" aria-hidden="true" />
 <span className="text-success/70 sr-only">Tersinkron</span>
 </m.div>
 )}
 </AnimatePresence>
 </div>

 <div 
 data-tour="topbar-search"
 onClick={() => setIsSearchOpen(true)}
 className="hidden lg:flex relative w-44 xl:w-64 group cursor-pointer"
 >
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors" size={15} />
 <div className="bg-card border border-border transition-colors hover:border-primary/40 w-full h-10 pl-10 pr-3 rounded-xl text-[10px] uppercase font-bold tracking-[0.16em] text-muted-foreground flex items-center justify-between transition-all">
 Cari…
 <kbd className="hidden xl:inline-flex h-5 select-none items-center gap-1 rounded-md border border-border bg-muted/70 px-1.5 font-mono text-[10px] font-medium opacity-100">
 <span className="text-[10px]">⌘</span>K
 </kbd>
 </div>
 </div>

 <button type="button" 
 data-tour="topbar-search-mobile"
 onClick={() => setIsSearchOpen(true)}
 aria-label="Buka Pencarian"
 className="action-icon lg:hidden size-11"
 >
 <Search size={18} />
 </button>

 <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 sm:border-l sm:border-border/60 sm:pl-2 md:pl-4">
 <div data-tour="reading-mode" className="flex items-center gap-1 p-1 rounded-xl bg-card border border-border transition-colors hover:border-primary/40">
 {[
 { id: "kanji", icon: BookOpen, label: "Kanji" },
 { id: "furigana", icon: Eye, label: "Furi" },
 { id: "hiragana", icon: EyeOff, label: "Hira" },
 ].map((disp, idx, arr) => (
 <m.button
 key={disp.id}
 whileTap={{ scale: 0.9 }}
 onClick={() => {
 if (window.innerWidth < 640) {
 const nextMode = arr[(idx + 1) % arr.length].id;
 useUIStore.getState().setReadingState({ mode: nextMode as "kanji" | "furigana" | "hiragana" });
 } else {
 useUIStore.getState().setReadingState({ mode: disp.id as "kanji" | "furigana" | "hiragana" });
 }
 }}
 className={`size-8 flex items-center justify-center rounded-lg transition-all ${
 readingMode === disp.id
 ? "bg-primary text-primary-foreground hover:bg-primary/92 shadow-none text-primary-foreground"
 : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
 } ${readingMode !== disp.id ? 'hidden sm:flex' : 'flex'}`}
 aria-label={`Mode ${disp.label}`}
 >
 <disp.icon size={13} />
 </m.button>
 ))}
 </div>

 <div className="hidden sm:flex">
 <ThemeToggle />
 </div>

 <m.button
 whileTap={{ scale: 0.9 }}
 onClick={handleSharePage}
 aria-label="Bagikan Halaman Ini"
 className="size-11 flex items-center justify-center rounded-xl action-icon text-muted-foreground hover:text-primary transition-all"
 >
 <Share2 size={18} />
 </m.button>

 <div className="flex items-center gap-2 relative">
 <m.button 
 data-tour="notifications"
 whileTap={{ scale: 0.9 }}
 onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
 aria-label={`Notifikasi (${unreadNotifications} belum dibaca)`}
 aria-expanded={isNotificationsOpen}
 className={`size-11 flex items-center justify-center rounded-xl transition-all relative ${
 isNotificationsOpen 
 ? 'bg-primary text-primary-foreground hover:bg-primary/92 shadow-none'
 : 'action-icon text-muted-foreground hover:text-primary'
 }`}
 >
 <Bell size={18} />
 {unreadNotifications > 0 && (
 <span className="absolute top-3 right-3 size-1.5 bg-destructive rounded-full" />
 )}
 </m.button>

 <NotificationPopover 
 isOpen={isNotificationsOpen} 
 onClose={() => setIsNotificationsOpen(false)} 
 />
 </div>
 </div>

 <div className="w-px h-6 bg-border/50 mx-1 hidden sm:block" />

 <UserNav />
 </div>
 </header>

 <SearchModal 
 isOpen={isSearchOpen} 
 onClose={() => setIsSearchOpen(false)} 
 />
 </>
 );
}
