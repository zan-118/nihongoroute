"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFloatingSupport } from "./useFloatingSupport";

export default function FloatingSupport() {
  const { isHidden } = useFloatingSupport();

  if (isHidden) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="fixed bottom-36 right-4 md:bottom-10 md:right-10 z-[40]"
    >
      <Link href="/support" className="group block">
        <div className="relative">
          <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-10 group-hover:opacity-30 animate-pulse transition-opacity" />

          <Button
            variant="ghost"
            size="icon"
            className="relative w-14 h-14 md:w-16 md:h-16 bg-card dark:bg-slate-900 border border-border dark:border-white/10 rounded-full flex items-center justify-center neo-card shadow-lg group-hover:border-red-500/50 group-hover:bg-red-500/10 transition-all active:scale-90 cursor-pointer h-auto"
          >
            <Coffee
              size={24}
              className="text-muted-foreground group-hover:text-red-500 transition-colors duration-300"
            />
            <div className="absolute top-1 right-1 md:top-2 md:right-2 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-background shadow-lg animate-ping opacity-40" />
            <div className="absolute top-1 right-1 md:top-2 md:right-2 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-background" />
          </Button>
        </div>
      </Link>
    </motion.div>
  );
}
