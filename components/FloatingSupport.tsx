"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Coffee } from "lucide-react";
import { usePathname } from "next/navigation";

export default function FloatingSupport() {
  const pathname = usePathname();

  // Sembunyikan tombol jika sedang di halaman Support itu sendiri atau Sanity Studio
  if (pathname === "/support" || pathname.startsWith("/studio")) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-[100]"
    >
      <Link href="/support" className="group flex items-center gap-3">
        {/* Tooltip Label (Muncul saat hover di Desktop) */}
        <span className="hidden md:block opacity-0 group-hover:opacity-100 transition-all duration-300 bg-[#1e2024] text-[#0ef] text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-[#0ef]/20 shadow-[0_0_20px_rgba(0,238,255,0.1)]">
          Support NihongoRoute
        </span>

        {/* The Icon Button */}
        <div className="relative">
          {/* Animated Glow Rings */}
          <div className="absolute inset-0 bg-[#0ef] rounded-2xl blur-xl opacity-20 group-hover:opacity-40 animate-pulse transition-opacity" />

          <div className="relative w-12 h-12 md:w-14 md:h-14 bg-[#1e2024] border border-white/10 rounded-2xl flex items-center justify-center shadow-[10px_10px_20px_rgba(0,0,0,0.4)] group-hover:border-[#0ef]/50 transition-all active:scale-90">
            <Coffee
              size={22}
              className="text-white/60 group-hover:text-[#0ef] transition-colors"
            />

            {/* Notification Dot (Small detail to catch eye) */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1f242d] shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
