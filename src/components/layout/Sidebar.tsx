"use client";

import { m } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useNavbar } from "@/components/layout/hooks/useNavbar";
import { useHasMounted } from "@/hooks/useHasMounted";

// Domain Components
import { SidebarItem } from "./sidebar/SidebarItem";
import { UserStatusSection } from "./sidebar/UserStatusSection";
import { ThemeToggle } from "./ThemeToggle";
import { ROUTES } from "@/lib/routes";

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const hasMounted = useHasMounted();
  const { pathname, isAuthenticated, userFullName, handleLogout, links } = useNavbar();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[55] md:hidden"
        />
      )}

      <aside className={`fixed top-0 left-0 h-screen bg-background/60 backdrop-blur-3xl border-r border-border p-6 z-[60] flex flex-col w-72 transition-transform duration-500 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Background Neural Overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(var(--primary-rgb),0.02)_0%,transparent_50%)] pointer-events-none" />
      
      {/* LOGO */}
      <div className="mb-10 flex items-center gap-4 relative z-10 px-2">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative size-8 group-hover:rotate-12 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]">
            <Image
              src="/logo-branding.svg"
              alt="NihongoRoute"
              fill
              priority
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
             <span className="text-lg font-black text-foreground italic tracking-tighter uppercase leading-none">
               Nihongo<span className="text-primary">Route</span>
             </span>
             <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[7px] font-bold text-primary/50 uppercase tracking-[0.2em]">Ecosystem</span>
                <span className="size-0.5 rounded-full bg-border" />
                <span className="text-[7px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">v2.0</span>
             </div>
          </div>
        </Link>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-8 relative z-10 overflow-y-auto pr-2 custom-scrollbar">
        {/* Utama */}
        <div className="space-y-1">
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.4em] mb-4 ml-4 opacity-40">
            Platform
          </div>
          {links.main.map((item) => (
            <SidebarItem key={item.href} item={item} pathname={pathname} onClick={onClose} />
          ))}
        </div>

        {/* Belajar */}
        <div className="space-y-1">
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.4em] mb-4 ml-4 opacity-40">
            Pembelajaran
          </div>
          {links.learn.map((item) => (
            <SidebarItem key={item.href} item={item} pathname={pathname} onClick={onClose} />
          ))}
        </div>

        {/* Sistem */}
        <div className="space-y-1">
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.4em] mb-4 ml-4 opacity-40">
            Sistem
          </div>
          {links.system.map((item) => (
            <SidebarItem key={item.href} item={item} pathname={pathname} onClick={onClose} />
          ))}
        </div>

      </nav>

      {/* FOOTER ACTIONS */}
      <div className="mt-auto space-y-4 relative z-10 pt-6 border-t border-border">
         <UserStatusSection 
            hasMounted={hasMounted}
            isAuthenticated={isAuthenticated}
            userFullName={userFullName}
            handleLogout={handleLogout}
         />
      </div>

      {/* MINI FOOTER - LEGAL & INFO */}
      <div className="mt-6 pt-4 border-t border-border relative z-10">
        <div className="flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
          <Link href={ROUTES.PRIVACY} className="hover:text-primary transition-colors">Privacy</Link>
          <span className="size-1 rounded-full bg-muted" />
          <Link href={ROUTES.TERMS} className="hover:text-primary transition-colors">Terms</Link>
          <span className="size-1 rounded-full bg-muted" />
          <span className="opacity-50">© 2024</span>
        </div>
        <div className="md:hidden flex justify-center mt-4">
           <ThemeToggle />
        </div>
      </div>
    </aside>
    </>
  );
}
