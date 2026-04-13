"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/courses", label: "Learn" },
    { href: "/library", label: "Library" },
    { href: "/review", label: "Review" },
  ];

  return (
    <header className="hidden md:flex fixed top-0 w-full z-50 bg-[#0a0c10]/70 backdrop-blur-md border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 w-full flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-cyan-400 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.4)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] transition-all">
            <span className="text-[#0a0c10] font-black text-xl italic font-mono">
              N
            </span>
          </div>
          <span className="text-xl font-black text-white italic tracking-tighter uppercase">
            Nihongo<span className="text-cyan-400">Route</span>
          </span>
        </Link>

        {/* MENU TENGAH */}
        <nav className="flex items-center gap-8">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm font-bold uppercase tracking-widest transition-colors py-2"
              >
                <span
                  className={
                    isActive
                      ? "text-cyan-400"
                      : "text-slate-400 hover:text-white"
                  }
                >
                  {link.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-7 left-0 right-0 h-1 bg-cyan-400 shadow-[0_-2px_10px_rgba(34,211,238,0.8)]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* TOMBOL DASHBOARD KANAN */}
        <Link href="/dashboard">
          <button className="neo-card px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-300 hover:text-cyan-400 transition-colors border border-white/5 hover:border-cyan-400/30">
            Dashboard
          </button>
        </Link>
      </div>
    </header>
  );
}
