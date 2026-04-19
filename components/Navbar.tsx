/**
 * LOKASI FILE: components/Navbar.tsx
 * KONSEP: Mobile-First Neumorphic (Navbar Utama)
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/courses", label: "Materi" },
    { href: "/exams", label: "Ujian" },
    { href: "/library", label: "Pustaka" },
    { href: "/review", label: "Hafalan" },
  ];

  return (
    <header className="hidden md:flex fixed top-0 w-full z-50 bg-cyber-bg/80 backdrop-blur-xl border-b border-white/[0.03] transition-all">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 w-full flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-4 group shrink-0">
          <div className="relative w-10 h-10 lg:w-11 lg:h-11 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(0,238,255,0.3)]">
            <Image
              src="/logo-branding.svg"
              alt="NihongoRoute"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xl lg:text-2xl font-black text-white italic tracking-tighter uppercase">
            Nihongo<span className="text-cyber-neon drop-shadow-[0_0_10px_rgba(0,238,255,0.5)]">Route</span>
          </span>
        </Link>

        {/* NAV MENU */}
        <nav className="flex items-center gap-6 lg:gap-10">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] lg:tracking-[0.25em] py-2 group"
              >
                <span
                  className={
                    isActive
                      ? "text-cyber-neon drop-shadow-[0_0_10px_rgba(0,238,255,0.6)]"
                      : "text-slate-400 group-hover:text-white transition-all duration-300"
                  }
                >
                  {link.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-[29px] left-0 right-0 h-[3px] bg-cyber-neon shadow-[0_0_20px_rgba(0,238,255,0.8)] rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* DASHBOARD BUTTON */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] px-6 lg:px-8 h-10 lg:h-12 neo-inset border-white/5 bg-black/40 hover:bg-cyber-neon hover:text-black text-slate-200 transition-all duration-500 rounded-xl"
            >
              Dasbor
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
