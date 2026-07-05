/**
 * @file MobileNav.tsx
 * @description Komponen navigasi bawah premium khusus perangkat seluler (Cyber-glass design).
 */

"use client";

// ======================
// IMPOR
// ======================
import Link from "next/link";
import { m } from "framer-motion";
import { useMobileNav } from "@/components/layout/hooks/useMobileNav";

// ======================
// EKSEKUSI UTAMA
// ======================
export default function MobileNav() {
  const { pathname, navItems } = useMobileNav();

  return (
    <div data-tour="mobile-nav" className="md:hidden fixed bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] left-1/2 -translate-x-1/2 w-[min(94vw,28rem)] z-50">
      <nav className="mobile-nav-shell rounded-lg p-1.5 transition-all duration-500 overflow-hidden relative">
        <div className="absolute inset-x-5 top-0 h-px bg-border/40 pointer-events-none" />
        
        <ul className="flex justify-between items-center relative z-10 gap-1 px-1">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <li key={item.href + item.label} className="flex-1 relative">
                <Link
                  href={item.href}
                  className="min-h-[56px] flex flex-col items-center justify-center py-2 relative group rounded-xl"
                >
                  {/* Indikator Latar Belakang Fluid */}
                  {isActive && (
                    <m.div
                      layoutId="mobile-nav-pill"
                      className="absolute inset-x-0.5 inset-y-0.5 bg-primary/10 border border-primary/20 rounded-xl z-0"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}

                  <m.div
                    animate={{
                      y: isActive ? -1 : 0,
                      scale: isActive ? 1.1 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`relative z-10 p-1.5 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    <item.icon 
                      size={18} 
                      strokeWidth={isActive ? 2.5 : 2} 
                    />
                  </m.div>
                  
                  <span
                    className={`text-[8px] font-black uppercase tracking-[0.08em] mt-0.5 transition-all duration-300 relative z-10 ${
                      isActive 
                        ? "text-primary opacity-100" 
                        : "text-muted-foreground opacity-75"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
