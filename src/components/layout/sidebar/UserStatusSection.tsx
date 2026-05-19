"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface UserStatusSectionProps {
  hasMounted: boolean;
  isAuthenticated: boolean;
  userFullName: string | null;
  handleLogout: () => void;
}

/**
 * Komponen status pengguna dan aksi (Login/Logout, Theme) di bawah sidebar.
 */
export function UserStatusSection({
  hasMounted,
  isAuthenticated,
  userFullName,
  handleLogout,
}: UserStatusSectionProps) {
  if (!hasMounted) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-10 flex-1 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-background/[0.03] backdrop-blur-md rounded-2xl border border-border group hover:border-primary/30 transition-all duration-500">
          {/* Animated Gradient Avatar Border */}
          <div className="relative w-12 h-12 shrink-0">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-xl bg-gradient-to-tr from-primary via-blue-500 to-cyan-400 opacity-40 blur-[2px]"
            />
            <div className="absolute inset-[2px] rounded-xl bg-background flex items-center justify-center text-primary-foreground text-sm font-black shadow-lg overflow-hidden z-10">
              <div className="w-full h-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                {userFullName ? userFullName.charAt(0).toUpperCase() : "U"}
              </div>
            </div>
            {/* Level Badge Overlay */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-foreground text-background text-[8px] font-black rounded-full border-2 border-background flex items-center justify-center z-20 shadow-lg">
              L
            </div>
          </div>
          
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-black text-foreground uppercase truncate tracking-wider group-hover:text-primary transition-colors">
              {userFullName || "Pelajar"}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1 h-1 rounded-full bg-success animate-pulse" />
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                Sinkronisasi Aktif
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
           <ThemeToggle />
           <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
             <Button
               variant="ghost"
               onClick={handleLogout}
               className="w-full h-10 rounded-xl bg-destructive/5 hover:bg-destructive hover:text-destructive-foreground text-destructive text-xs font-black uppercase tracking-widest transition-all border border-destructive/10"
             >
               <LogOut size={16} className="mr-2" /> Keluar
             </Button>
           </motion.div>
        </div>
      </div>
    );
  }

  return (
     <div className="space-y-4">
        <ThemeToggle />
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            asChild
            className="w-full h-11 bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-lg border-none hover:opacity-90 hover:shadow-primary/20 transition-all"
          >
            <Link href="/login">Masuk atau Daftar</Link>
          </Button>
        </motion.div>
     </div>
  );
}
