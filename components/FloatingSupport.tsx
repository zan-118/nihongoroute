/**
 * LOKASI FILE: components/FloatingSupport.tsx
 * KONSEP: Cyber-Dark Neumorphic (Service Uplink)
 */

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Coffee, Radio } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function FloatingSupport() {
  const pathname = usePathname();

  // Menyembunyikan tombol di halaman yang membutuhkan fokus penuh
  if (
    pathname === "/support" ||
    pathname?.startsWith("/studio") ||
    pathname?.includes("/exam") ||
    pathname === "/review"
  ) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ y: -5 }}
      // PERBAIKAN POSISI: bottom-36 di mobile agar benar-benar aman dari tabrakan MobileNav
      className="fixed bottom-36 right-4 md:bottom-10 md:right-10 z-[40]"
    >
      <Link href="/support" className="group block">
        <div className="relative">
          {/* Neural Glow */}
          <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-10 group-hover:opacity-30 animate-pulse transition-opacity" />

          {/* Tombol Utama */}
          <Button
            variant="ghost"
            size="icon"
            className="relative w-14 h-14 md:w-16 md:h-16 bg-cyber-surface border border-white/10 rounded-full flex items-center justify-center neo-card shadow-none group-hover:border-red-500/50 group-hover:bg-red-500/10 transition-all active:scale-90 cursor-pointer h-auto"
          >
            <Coffee
              size={24}
              className="text-slate-500 group-hover:text-red-500 transition-colors duration-300"
            />
            {/* Status Indicator */}
            <div className="absolute top-1 right-1 md:top-2 md:right-2 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-cyber-bg shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-ping opacity-40" />
            <div className="absolute top-1 right-1 md:top-2 md:right-2 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-cyber-bg" />
          </Button>
        </div>
      </Link>
    </motion.div>
  );
}
