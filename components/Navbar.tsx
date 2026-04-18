/**
 * LOKASI FILE: components/Navbar.tsx
 * PERBAIKAN: Penambahan menu Exams & Peningkatan Kontras
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/courses", label: "Materi Belajar" },
    { href: "/exams", label: "Simulasi Ujian" }, // ✨ Menu Exams ditambahkan
    { href: "/library", label: "Koleksi Data" },
    { href: "/review", label: "Hafalan Aktif" },
  ];

  return (
    <header className="hidden md:flex fixed top-0 w-full z-50 bg-[#0a0c10]/90 backdrop-blur-xl border-b border-white/[0.05] transition-all">
      <div className="max-w-7xl mx-auto px-6 h-20 w-full flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative w-10 h-10 group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
            <Image
              src="/logo-branding.svg"
              alt="NihongoRoute"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xl font-black text-white italic tracking-tighter uppercase">
            Nihongo<span className="text-cyan-400">Route</span>
          </span>
        </Link>

        {/* NAV MENU */}
        <nav className="flex items-center gap-8">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-xs font-black uppercase tracking-[0.2em] py-2"
              >
                <span
                  className={
                    isActive
                      ? "text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]"
                      : "text-slate-500 hover:text-white transition-colors"
                  }
                >
                  {link.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-[29px] left-0 right-0 h-[3px] bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* DASHBOARD BUTTON */}
        <Link href="/dashboard">
          <button className="bg-[#0f1117] px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-slate-300 border border-white/10 hover:border-cyan-400/50 hover:text-cyan-400 shadow-[4px_4px_10px_rgba(0,0,0,0.5),-4px_-4px_10px_rgba(255,255,255,0.02)] transition-all active:scale-95">
            Dashboard
          </button>
        </Link>
      </div>
    </header>
  );
}
