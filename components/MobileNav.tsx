/**
 * LOKASI FILE: components/MobileNav.tsx
 * KONSEP: Mobile-First Neumorphic (Navigasi Seluler)
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Layers, LayoutDashboard, BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: Home, label: "Beranda" },
    { href: "/courses", icon: BookOpen, label: "Materi" },
    { href: "/review", icon: BrainCircuit, label: "Hafalan" },
    { href: "/library", icon: Layers, label: "Pustaka" },
    { href: "/dashboard", icon: LayoutDashboard, label: "Dasbor" },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
      <nav className="bg-[#0a0c10]/90 backdrop-blur-2xl border border-white/[0.05] rounded-[2rem] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] neo-card">
        <ul className="flex justify-between items-center px-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <li key={item.href} className="w-[18%] relative">
                <Link
                  href={item.href}
                  className="flex flex-col items-center justify-center py-2.5 rounded-[1.5rem] transition-all relative z-10 group"
                >
                  <div
                    className={`mb-1 transition-all duration-300 ${
                      isActive
                        ? "text-cyber-neon scale-110 drop-shadow-[0_0_8px_rgba(0,238,255,0.5)]"
                        : "text-slate-500 group-hover:text-white"
                    }`}
                  >
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span
                    className={`text-[8px] font-bold uppercase tracking-widest transition-all duration-300 ${
                      isActive
                        ? "text-cyber-neon opacity-100"
                        : "text-slate-500 opacity-80"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>

                {/* Indikator Latar Belakang Aktif */}
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute inset-0 bg-cyber-neon/5 border border-cyber-neon/20 rounded-[1.5rem] z-0 shadow-[inset_0_0_15px_rgba(0,238,255,0.05)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
