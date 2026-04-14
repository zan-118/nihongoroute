"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Coffee } from "lucide-react";
import { usePathname } from "next/navigation";

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
      <Link href="/support" className="group flex items-center gap-3">
        <div className="relative">
          {/* Pendaran Cahaya */}
          <div className="absolute inset-0 bg-cyan-400 rounded-full blur-xl opacity-20 group-hover:opacity-40 animate-pulse transition-opacity" />

          {/* Tombol Utama */}
          <div className="relative w-12 h-12 md:w-14 md:h-14 bg-cyber-surface border border-white/10 rounded-full flex items-center justify-center shadow-[5px_5px_15px_rgba(0,0,0,0.5),inset_0_2px_5px_rgba(255,255,255,0.05)] group-hover:border-cyan-400/50 group-hover:bg-cyan-400/10 transition-all active:scale-90 cursor-pointer">
            <Coffee
              size={20}
              className="text-white/60 group-hover:text-cyan-400 transition-colors"
            />
            {/* Titik Notifikasi Merah */}
            <div className="absolute top-0 right-0 md:top-1 md:right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#15171a] shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
