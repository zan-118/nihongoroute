"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { 
  Trophy, 
  LogOut,
  ChevronRight
} from "lucide-react";
import { useNavbar } from "@/components/layout/navbar/useNavbar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useHasMounted } from "@/hooks/useHasMounted";
import { Skeleton } from "@/components/ui/skeleton";

function SidebarItem({ item, pathname, onClick }: { item: { href: string; label: string; icon: React.ElementType }; pathname: string; onClick?: () => void }) {
  const isActive = pathname.startsWith(item.href);
  return (
    <Link href={item.href} onClick={onClick}>
      <motion.div
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative group overflow-hidden ${
          isActive 
            ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(0,238,255,0.05)]" 
            : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
        }`}
      >
        {/* Active Side Glow */}
        {isActive && (
          <motion.div 
            layoutId="active-side-glow"
            className="absolute left-0 top-1/4 bottom-1/4 w-[2px] bg-primary shadow-[0_0_12px_rgba(0,238,255,1)] rounded-full"
          />
        )}

        <item.icon size={18} className={`${isActive ? "drop-shadow-[0_0_8px_rgba(0,238,255,0.5)]" : ""} group-hover:scale-110 transition-transform`} />
        <span className="text-[11px] font-bold uppercase tracking-widest flex-1">
          {item.label}
        </span>
        {isActive && (
          <motion.div 
            layoutId="sidebar-active-indicator"
            className="w-1 h-1 rounded-full bg-primary shadow-[0_0_10px_rgba(0,238,255,0.8)]" 
          />
        )}
        <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-all ${isActive ? 'text-primary' : 'text-muted-foreground'} group-hover:translate-x-0.5`} />
      </motion.div>
    </Link>
  );
}

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const hasMounted = useHasMounted();
  const { pathname, isAuthenticated, userFullName, handleLogout, links } = useNavbar();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] md:hidden"
        />
      )}

      <aside className={`fixed top-0 left-0 h-screen bg-card/95 md:bg-card/30 backdrop-blur-2xl border-r border-border p-6 z-[60] flex flex-col w-72 transition-transform duration-500 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Background Neural Overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,238,255,0.02)_0%,transparent_50%)] pointer-events-none" />
      
      {/* LOGO */}
      <div className="mb-12 flex items-center gap-4 relative z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 group-hover:rotate-12 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(0,238,255,0.4)]">
            <Image
              src="/logo-branding.svg"
              alt="NihongoRoute"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
             <span className="text-xl font-black text-foreground italic tracking-tighter uppercase leading-none">
               Nihongo<span className="text-primary">Route</span>
             </span>
             <span className="text-[8px] font-bold text-primary/50 uppercase tracking-widest mt-1">Ecosystem</span>
          </div>
        </Link>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-8 relative z-10 overflow-y-auto pr-2 custom-scrollbar">
        {/* Utama */}
        <div className="space-y-1">
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-3 ml-4 opacity-50">
            Platform
          </div>
          {links.main.map((item) => (
            <SidebarItem key={item.href} item={item} pathname={pathname} onClick={onClose} />
          ))}
        </div>

        {/* Belajar */}
        <div className="space-y-1">
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-3 ml-4 opacity-50">
            Pembelajaran
          </div>
          {links.learn.map((item) => (
            <SidebarItem key={item.href} item={item} pathname={pathname} onClick={onClose} />
          ))}
        </div>

        {/* Sistem */}
        <div className="space-y-1">
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-3 ml-4 opacity-50">
            Sistem
          </div>
          {links.system.map((item) => (
            <SidebarItem key={item.href} item={item} pathname={pathname} onClick={onClose} />
          ))}
        </div>

        {/* Quick Progress - UX Improvement */}
        <div className="pt-4 px-2 pb-2">
          {!hasMounted ? (
            <Skeleton className="h-32 w-full rounded-2xl" />
          ) : (
            <div className="bg-muted/30 border border-border/50 rounded-2xl p-4 relative overflow-hidden group/target">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <div className="flex justify-between items-start mb-3 relative z-10">
                <span className="text-[10px] font-black text-foreground uppercase tracking-wider">Target Hari Ini</span>
                <Trophy size={14} className="text-amber-500 group-hover/target:rotate-12 transition-transform" />
              </div>
              <div className="space-y-3 relative z-10">
                 <div>
                    <div className="flex justify-between text-[9px] font-bold text-muted-foreground uppercase mb-1.5">
                      <span>Materi Selesai</span>
                      <span className="text-foreground">2/5</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "40%" }}
                        className="h-full bg-primary" 
                      />
                    </div>
                 </div>
                 <Link href="/courses">
                   <Button variant="ghost" className="w-full h-8 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/10">
                     Lanjutkan Belajar
                   </Button>
                 </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* FOOTER ACTIONS */}
      <div className="mt-auto space-y-4 relative z-10 pt-6 border-t border-border">
         {!hasMounted ? (
           <div className="space-y-4">
              <Skeleton className="h-16 w-full rounded-2xl" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-10 flex-1 rounded-xl" />
              </div>
           </div>
         ) : isAuthenticated ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-2xl border border-border">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-primary-foreground text-sm font-black shadow-lg">
                  {userFullName ? userFullName.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-black text-foreground uppercase truncate tracking-wider">
                    {userFullName || "Pelajar"}
                  </span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                    Akun Aktif
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                 <ThemeToggle />
                 <Button
                   variant="ghost"
                   onClick={handleLogout}
                   className="flex-1 h-10 rounded-xl bg-red-500/5 hover:bg-red-500 hover:text-white dark:hover:text-black text-red-500 text-[10px] font-black uppercase tracking-widest transition-all border border-red-500/10"
                 >
                   <LogOut size={16} className="mr-2" /> Keluar
                 </Button>
              </div>
            </div>
         ) : (
            <div className="space-y-4">
               <ThemeToggle />
               <Button
                 asChild
                 className="w-full h-12 bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg border-none hover:opacity-90"
               >
                 <Link href="/login">Masuk / Daftar</Link>
               </Button>
            </div>
         )}
         <div className="text-center">
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.4em]">NihongoRoute v2.0</span>
         </div>
      </div>
    </aside>
    </>
  );
}
