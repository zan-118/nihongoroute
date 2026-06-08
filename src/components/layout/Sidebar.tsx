/**
 * @file Sidebar.tsx
 * @description Komponen panel navigasi samping desktop untuk mengarahkan pengguna ke berbagai fitur.
 */

"use client";

import { m } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useNavbar } from "@/components/layout/hooks/useNavbar";
import { useHasMounted } from "@/hooks/useHasMounted";
import { ROUTES } from "@/lib/routes";
import { SidebarItem } from "./sidebar/SidebarItem";
import { UserStatusSection } from "./sidebar/UserStatusSection";

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const hasMounted = useHasMounted();
  const { pathname, isAuthenticated, userFullName, handleLogout, links } = useNavbar();

  return (
    <>
      {isOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-foreground/35 backdrop-blur-sm z-[55] md:hidden"
        />
      )}

      <aside className={`fixed top-0 left-0 h-dvh bg-[hsl(var(--sidebar))] md:bg-[hsl(var(--sidebar)/0.92)] md:backdrop-blur-2xl border-r border-border/75 p-4 sm:p-5 z-[60] flex flex-col w-[18rem] transition-transform duration-500 md:translate-x-0 shadow-[20px_0_60px_rgba(0,0,0,0.08)] dark:shadow-[20px_0_70px_rgba(0,0,0,0.32)] ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(var(--primary-rgb),0.045),transparent_26%,rgba(var(--secondary-rgb),0.025))] pointer-events-none" />

        <div className="mb-7 flex items-center gap-4 relative z-10 px-1">
          <Link href="/" className="flex items-center gap-3 group rounded-xl focus-visible:ring-offset-0">
            <div className="relative size-9 group-hover:rotate-6 transition-transform duration-500 drop-shadow-[0_8px_18px_rgba(var(--primary-rgb),0.22)]">
              <Image
                src="/logo-branding.svg"
                alt="NihongoRoute"
                fill
                priority
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[1.05rem] font-black text-foreground tracking-tight uppercase leading-none">
                Nihongo<span className="text-primary">Route</span>
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[7px] font-bold text-primary/70 uppercase tracking-[0.2em]">
                  Ecosystem
                </span>
                <span className="size-0.5 rounded-full bg-border" />
                <span className="text-[7px] font-black text-muted-foreground/55 uppercase tracking-[0.2em]">
                  v2.0
                </span>
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-7 relative z-10 overflow-y-auto pr-1 custom-scrollbar">
          <div className="space-y-1">
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.28em] mb-3 ml-3 opacity-70">
              Platform
            </div>
            {links.main.map((item) => (
              <SidebarItem key={item.href} item={item} pathname={pathname} onClick={onClose} />
            ))}
          </div>

          <div className="space-y-1">
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.28em] mb-3 ml-3 opacity-70">
              Pembelajaran
            </div>
            {links.learn.map((item) => (
              <SidebarItem key={item.href} item={item} pathname={pathname} onClick={onClose} />
            ))}
          </div>

          <div className="space-y-1">
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.28em] mb-3 ml-3 opacity-70">
              Sistem
            </div>
            {links.system.map((item) => (
              <SidebarItem key={item.href} item={item} pathname={pathname} onClick={onClose} />
            ))}
          </div>
        </nav>

        <div className="mt-auto space-y-4 relative z-10 pt-5 border-t border-border/75">
          <UserStatusSection
            hasMounted={hasMounted}
            isAuthenticated={isAuthenticated}
            userFullName={userFullName}
            handleLogout={handleLogout}
          />
        </div>

        <div className="mt-5 pt-4 border-t border-border/70 relative z-10">
          <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/55">
            <Link
              href={ROUTES.PRIVACY}
              className="inline-flex min-h-8 items-center px-1 hover:text-primary transition-colors"
            >
              Privacy
            </Link>
            <span className="size-1 rounded-full bg-muted" />
            <Link
              href={ROUTES.TERMS}
              className="inline-flex min-h-8 items-center px-1 hover:text-primary transition-colors"
            >
              Terms
            </Link>
            <span className="size-1 rounded-full bg-muted" />
            <span className="opacity-50">&copy; 2026</span>
          </div>
          <div className="md:hidden flex justify-center mt-4">
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}
