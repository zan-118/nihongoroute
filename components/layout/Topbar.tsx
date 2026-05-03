"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Bell, Menu, ChevronRight, Zap, Trophy } from "lucide-react";
import { useNavbar } from "@/components/layout/navbar/useNavbar";
import NotificationPopover from "@/components/features/user/NotificationPopover";
import SearchModal from "@/components/features/tools/search/SearchModal";
import UserNav from "@/components/features/user/UserNav";
import { useHasMounted } from "@/hooks/useHasMounted";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const hasMounted = useHasMounted();
  const { pathname, progress } = useNavbar();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const unreadNotifications = progress.notifications?.filter(n => !n.read).length || 0;

  // Breadcrumb logic
  const pathSegments = pathname.split('/').filter(Boolean);

  // Global CMD+K shortcut
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
  
  return (
    <>
    <header className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-xl border-b border-border/50 px-4 md:px-8 py-3 flex items-center justify-between transition-all">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-muted/50 border border-border/50 text-muted-foreground hover:text-primary transition-all"
        >
           <Menu size={20} />
        </button>

        <div className="flex flex-col">
          <nav className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">
            <Link href="/dashboard" className="hover:text-primary transition-colors">Route</Link>
            {pathSegments.map((segment, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <ChevronRight size={10} className="opacity-40" />
                <Link 
                  href={`/${pathSegments.slice(0, idx + 1).join('/')}`}
                  className={`hover:text-primary transition-colors ${idx === pathSegments.length - 1 ? 'text-primary/70 pointer-events-none' : ''}`}
                >
                  {segment.replace(/-/g, ' ')}
                </Link>
              </div>
            ))}
          </nav>
          <h1 className="text-xs md:text-sm font-black text-foreground uppercase tracking-wider capitalize">
            {pathSegments.length > 0 ? pathSegments[pathSegments.length - 1].replace(/-/g, ' ') : "Dashboard"}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        {/* Progress Pill */}
        {!hasMounted ? (
          <Skeleton className="hidden sm:block h-8 w-32 rounded-2xl" />
        ) : (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted/50 border border-border/50 rounded-2xl">
            <div className="flex items-center gap-1.5">
              <Trophy size={14} className="text-amber-500" />
              <span className="text-xs font-black text-foreground">{progress.level}</span>
            </div>
            <div className="w-[1px] h-3 bg-border mx-1" />
            <div className="flex items-center gap-1.5">
              <Zap size={14} className="text-primary" />
              <span className="text-xs font-black text-foreground">{progress.xp} <span className="opacity-50">XP</span></span>
            </div>
          </div>
        )}

        {/* Global Search Button */}
        <div 
          onClick={() => setIsSearchOpen(true)}
          className="hidden lg:flex relative w-48 xl:w-64 group cursor-pointer"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors" size={14} />
          <div className="w-full h-8 pl-9 pr-4 bg-muted/50 border border-border/50 rounded-xl text-xs uppercase font-bold tracking-widest text-muted-foreground/60 flex items-center justify-between hover:border-primary/30 transition-all">
            Cari materi...
            <kbd className="hidden xl:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-xs font-medium opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>

        {/* Mobile Search Icon */}
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-muted/50 border border-border/50 text-muted-foreground hover:text-primary transition-all"
        >
          <Search size={18} />
        </button>

        <ThemeToggle />

        <div className="flex items-center gap-2 relative">
           <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all relative ${
              isNotificationsOpen 
                ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(0,238,255,0.4)]' 
                : 'bg-muted/50 border border-border/50 text-muted-foreground hover:text-primary'
            }`}
           >
              <Bell size={18} />
              {unreadNotifications > 0 && (
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,1)] animate-pulse" />
              )}
           </button>

           <NotificationPopover 
            isOpen={isNotificationsOpen} 
            onClose={() => setIsNotificationsOpen(false)} 
           />
        </div>

        <div className="w-[1px] h-6 bg-border mx-1 hidden sm:block" />

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
