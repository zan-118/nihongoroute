/**
 * @file Topbar.tsx
 * @description Komponen bilah atas premium (Topbar) dengan pencarian global, status sinkronisasi awan, pengaturan tampilan bahasa Jepang (Furigana), notifikasi, dan navigasi profil.
 */

"use client";

// ======================
// IMPOR
// ======================
import { useState, useEffect } from "react";
import { Search, Bell, Menu, Cloud, RefreshCw, CloudOff, CloudUpload, ChevronLeft, BookOpen, Eye, EyeOff } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/useUIStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useNavbar } from "@/components/layout/hooks/useNavbar";
import NotificationPopover from "@/components/features/user/NotificationPopover";
import SearchModal from "@/components/features/tools/search/SearchModal";
import UserNav from "@/components/features/user/UserNav";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { getRouteLabel } from "@/lib/routes";

// ======================
// EKSEKUSI UTAMA
// ======================
export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const { pathname } = useNavbar();
  const notifications = useUIStore((s) => s.notifications);
  const isSyncing = useUIStore((s) => s.isSyncing);
  const syncError = useUIStore((s) => s.syncError);
  const hasPendingSync = useSRSStore((s) => s.dirtySrs.size > 0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const unreadNotifications = notifications?.filter((n: { read: boolean }) => !n.read).length || 0;

  // Logika breadcrumb
  const pathSegments = pathname.split('/').filter(Boolean);

  // Pintasan global CMD+K
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
    <header className="topbar-shell sticky top-0 z-40 w-full px-3 sm:px-4 md:px-8 lg:px-10 py-3 flex items-center justify-between transition-all">
      <div className="flex items-center gap-3 sm:gap-5 min-w-0">
        {/* Menu Seluler atau Pengalih Kembali */}
        <div className="md:hidden flex items-center gap-2">
          {pathSegments.length > 1 ? (
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

        <div className="flex flex-col min-w-0 max-w-[190px] sm:max-w-[280px] md:max-w-[360px] lg:max-w-none">
          <h1 className="text-sm md:text-lg font-black text-foreground tracking-tight truncate leading-none uppercase md:max-w-[18rem] lg:max-w-none">
            {pathSegments.length > 0 ? getRouteLabel(pathSegments[pathSegments.length - 1]) : "Beranda"}
          </h1>
          {pathSegments.length > 1 && (
             <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.16em] mt-1 truncate">
               {getRouteLabel(pathSegments[pathSegments.length - 2])}
             </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
        {/* Indikator Status Sinkronisasi */}
        <div 
          aria-live="polite"
          aria-atomic="true"
          className="status-pill hidden sm:flex items-center gap-2 px-2.5 md:px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] transition-all overflow-hidden min-w-fit md:min-w-[108px]"
        >
          <AnimatePresence mode="wait">
            {isSyncing ? (
              <m.div 
                key="syncing"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <RefreshCw size={12} className="animate-spin text-primary" aria-hidden="true" />
                <span className="animate-pulse hidden md:inline">Sinkronisasi…</span>
              </m.div>
            ) : syncError ? (
              <m.div 
                key="error"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <CloudOff size={12} className="text-destructive drop-shadow-[0_0_8px_rgb(var(--destructive-rgb)/0.4)]" aria-hidden="true" />
                <span className="text-destructive/90 hidden md:inline">Gagal Sinkron</span>
              </m.div>
            ) : hasPendingSync ? (
              <m.div 
                key="pending"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <CloudUpload size={12} className="text-warning drop-shadow-[0_0_8px_rgb(var(--warning-rgb)/0.4)]" aria-hidden="true" />
                <span className="text-warning/90 hidden md:inline">Tertunda</span>
              </m.div>
            ) : (
              <m.div 
                key="synced"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <Cloud size={12} className="text-success drop-shadow-[0_0_8px_rgb(var(--success-rgb)/0.4)]" aria-hidden="true" />
                <span className="text-success/70 hidden md:inline">Tersinkronisasi</span>
              </m.div>
            )}
          </AnimatePresence>
        </div>
        {/* Tombol Pencarian Global - Lebar Disesuaikan */}
        <div 
          onClick={() => setIsSearchOpen(true)}
          className="hidden lg:flex relative w-44 xl:w-64 group cursor-pointer"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors" size={15} />
          <div className="control-surface w-full h-10 pl-10 pr-3 rounded-xl text-[10px] uppercase font-bold tracking-[0.16em] text-muted-foreground flex items-center justify-between transition-all">
            Cari…
            <kbd className="hidden xl:inline-flex h-5 select-none items-center gap-1 rounded-md border border-border bg-muted/70 px-1.5 font-mono text-[10px] font-medium opacity-100">
              <span className="text-[10px]">⌘</span>K
            </kbd>
          </div>
        </div>

        {/* Ikon Pencarian Seluler/Desktop Kecil */}
        <button type="button" 
          onClick={() => setIsSearchOpen(true)}
          aria-label="Buka Pencarian"
          className="action-icon lg:hidden size-11"
        >
          <Search size={18} />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 sm:border-l sm:border-border/60 sm:pl-2 md:pl-4">
          {/* Pengalih Mode Tampilan Bahasa Jepang */}
          <div className="flex items-center gap-1 p-1 rounded-xl control-surface">
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
                    ? "brand-button shadow-none text-primary-foreground"
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

          <div className="flex items-center gap-2 relative">
             <m.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              aria-label={`Notifikasi (${unreadNotifications} belum dibaca)`}
              aria-expanded={isNotificationsOpen}
              className={`size-11 flex items-center justify-center rounded-xl transition-all relative ${
                isNotificationsOpen 
                  ? 'brand-button shadow-none'
                  : 'action-icon text-muted-foreground hover:text-primary'
              }`}
             >
                <Bell size={18} />
                {unreadNotifications > 0 && (
                  <span className="absolute top-3 right-3 size-1.5 bg-destructive rounded-full shadow-[0_0_8px_rgb(var(--destructive-rgb)/1)] animate-pulse" />
                )}
             </m.button>

             <NotificationPopover 
              isOpen={isNotificationsOpen} 
              onClose={() => setIsNotificationsOpen(false)} 
             />
          </div>
        </div>

        <div className="w-[1px] h-6 bg-border/50 mx-1 hidden sm:block" />

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
