"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/courses", label: "Materi Belajar" },
    { href: "/library", label: "Koleksi Data" },
    { href: "/review", label: "Hafalan Aktif" },
  ];

  return (
    <header className="hidden md:flex fixed top-0 w-full z-50 bg-[#0a0c10]/80 backdrop-blur-xl border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 lg:h-20 w-full flex items-center justify-between gap-2">
        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center gap-2 lg:gap-3 group shrink-0"
        >
          {/* ✨ GAMBAR LOGO ASLI */}
          <div className="relative w-8 h-8 lg:w-10 lg:h-10 shrink-0 group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
            <Image
              src="/logo-branding.svg"
              alt="Logo NihongoRoute"
              fill
              className="object-contain rounded-lg lg:rounded-xl"
              priority
            />
          </div>

          <span className="text-lg lg:text-xl font-black text-white italic tracking-tighter uppercase drop-shadow-md hidden min-[850px]:block">
            Nihongo<span className="text-cyan-400">Route</span>
          </span>
        </Link>

        {/* MENU TENGAH */}
        <nav className="flex items-center gap-3 lg:gap-8">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-[9px] lg:text-xs font-black uppercase tracking-[0.2em] transition-colors py-2 whitespace-nowrap"
              >
                <span
                  className={
                    isActive
                      ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                      : "text-slate-400 hover:text-white"
                  }
                >
                  {link.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-5 lg:-bottom-7 left-0 right-0 h-[3px] bg-cyan-400 rounded-t-full shadow-[0_-2px_10px_rgba(34,211,238,0.8)]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* TOMBOL DASHBOARD KANAN */}
        <Link href="/dashboard" className="shrink-0">
          <button className="bg-cyber-surface px-4 py-2 lg:px-6 lg:py-2.5 rounded-xl text-[9px] lg:text-xs font-black uppercase tracking-widest text-slate-300 hover:text-cyan-400 transition-all border border-white/5 hover:border-cyan-400/30 hover:bg-cyan-400/5 shadow-inner hover:shadow-[0_0_15px_rgba(34,211,238,0.1)] whitespace-nowrap">
            Area Belajar
          </button>
        </Link>
      </div>
    </header>
  );
}
