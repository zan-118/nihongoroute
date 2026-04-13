"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Coffee } from "lucide-react";
import { usePathname } from "next/navigation";

export default function FloatingSupport() {
  const pathname = usePathname();

  if (pathname === "/support" || pathname?.startsWith("/studio")) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-[100]"
    >
      <Link href="/support" className="group flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-cyber-neon rounded-2xl blur-xl opacity-20 group-hover:opacity-40 animate-pulse transition-opacity" />

          <div className="relative w-12 h-12 md:w-14 md:h-14 bg-cyber-surface border border-white/10 rounded-2xl flex items-center justify-center shadow-[10px_10px_20px_rgba(0,0,0,0.4)] group-hover:border-cyber-neon/50 transition-all active:scale-90">
            <Coffee
              size={22}
              className="text-white/60 group-hover:text-cyber-neon transition-colors"
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-cyber-bg shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
