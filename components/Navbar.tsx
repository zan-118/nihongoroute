"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard } from "lucide-react";
import { useNavbar } from "./layout/navbar/useNavbar";

export default function Navbar() {
  const { pathname, isAuthenticated, userFullName, handleLogout, links } = useNavbar();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="hidden md:flex fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50">
      <div className="bg-slate-950/70 backdrop-blur-2xl border border-white/10 rounded-3xl h-20 w-full flex items-center justify-between px-6 lg:px-8 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(0,238,255,0.05)]">
        
        {/* LOGO SECTION */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative w-10 h-10 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(0,238,255,0.4)]">
            <Image
              src="/logo-branding.svg"
              alt="NihongoRoute"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xl font-black text-white italic tracking-tighter uppercase">
            Nihongo<span className="text-cyber-neon drop-shadow-[0_0_10px_rgba(0,238,255,0.5)]">Route</span>
          </span>
        </Link>

        {/* NAVIGATION LINKS */}
        <nav className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-5 py-2.5 rounded-xl group overflow-hidden"
              >
                <span
                  className={`relative z-10 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                    isActive
                      ? "text-cyber-neon drop-shadow-[0_0_5px_rgba(0,238,255,0.5)]"
                      : "text-slate-500 group-hover:text-white"
                  }`}
                >
                  {link.label}
                </span>
                
                {isActive && (
                  <motion.div
                    layoutId="desktop-nav-indicator"
                    className="absolute inset-0 bg-cyber-neon/10 border border-cyber-neon/20 rounded-xl"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              </Link>
            );
          })}
        </nav>

        {/* ACTIONS SECTION */}
        <div className="flex items-center gap-3">
          {!isMounted ? (
            <div className="h-11 w-32 bg-white/5 animate-pulse rounded-2xl" />
          ) : isAuthenticated ? (
            <div className="flex items-center bg-black/40 border border-white/10 rounded-2xl p-1.5">
              {/* ... (existing profile info) */}
              <div className="flex items-center gap-3 px-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyber-neon to-blue-600 flex items-center justify-center text-black text-xs font-black shadow-[0_0_15px_rgba(0,238,255,0.4)]">
                  {userFullName ? userFullName.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase max-w-[120px] truncate">
                  {userFullName || "Pelajar"}
                </span>
              </div>
              
              <div className="w-px h-6 bg-white/10 mx-2" />
              
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="w-9 h-9 rounded-xl hover:bg-cyber-neon/20 hover:text-cyber-neon text-slate-300 transition-colors"
                title="Dasbor"
              >
                <Link href="/dashboard">
                  <LayoutDashboard size={18} />
                </Link>
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="w-9 h-9 rounded-xl hover:bg-red-500/20 hover:text-red-400 text-slate-300 transition-colors ml-1"
                title="Keluar"
              >
                <LogOut size={18} />
              </Button>
            </div>
          ) : (
            <Button
              asChild
              className="h-11 px-6 rounded-2xl bg-cyber-neon hover:bg-white text-black font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(0,238,255,0.3)] hover:scale-105 active:scale-95 border-none"
            >
              <Link href="/login">
                Masuk / Daftar
              </Link>
            </Button>
          )}
        </div>
        
      </div>
    </header>
  );
}
