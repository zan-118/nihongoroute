/**
 * @file UserStatusSection.tsx
 * @description Komponen status pengguna dan navigasi logout/pengaturan tema pada bagian bawah sidebar.
 */

"use client";

// ======================
// IMPOR
// ======================
import React from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

// ======================
// ANTARMUKA / TIPE DATA
// ======================
interface UserStatusSectionProps {
  hasMounted: boolean;
  isAuthenticated: boolean;
  userFullName: string | null;
  handleLogout: () => void;
}

// ======================
// EKSEKUSI UTAMA
// ======================
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
          <Skeleton className="size-10 rounded-xl" />
          <Skeleton className="h-10 flex-1 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 premium-surface rounded-xl group hover:border-primary/30 transition-all duration-500">
          {/* Batas Avatar Gradien Teranimasi */}
          <div className="relative size-12 shrink-0">
            <m.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-xl bg-gradient-to-tr from-primary via-success to-secondary opacity-35 blur-[2px]"
            />
            <div className="absolute inset-[2px] rounded-xl bg-background flex items-center justify-center text-primary-foreground text-sm font-black shadow-lg overflow-hidden z-10">
              <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                {userFullName ? userFullName.charAt(0).toUpperCase() : "U"}
              </div>
            </div>
            {/* Overlay Lencana Level */}
            <div className="absolute -bottom-1 -right-1 size-5 bg-foreground text-background text-[8px] font-black rounded-full border-2 border-background flex items-center justify-center z-20 shadow-lg">
              L
            </div>
          </div>
          
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-black text-foreground uppercase truncate tracking-wider group-hover:text-primary transition-colors">
              {userFullName || "Pelajar"}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="size-1 rounded-full bg-success animate-pulse" />
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                Sinkronisasi Aktif
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
           <ThemeToggle />
           <m.div whileTap={{ scale: 0.95 }} className="flex-1">
             <Button
               variant="ghost"
               onClick={handleLogout}
               className="w-full h-11 rounded-xl bg-destructive/5 hover:bg-destructive hover:text-destructive-foreground text-destructive text-xs font-black uppercase tracking-widest transition-all border border-destructive/10"
             >
               <LogOut size={16} className="mr-2" /> Keluar
             </Button>
           </m.div>
        </div>
      </div>
    );
  }

  return (
     <div className="space-y-4">
        <ThemeToggle />
        <m.div whileTap={{ scale: 0.95 }}>
          <Button
            asChild
            className="w-full h-11 bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-[0.16em] rounded-xl shadow-lg border-none hover:opacity-95 hover:shadow-primary/20 transition-all"
          >
            <Link href="/login">Masuk atau Daftar</Link>
          </Button>
        </m.div>
     </div>
  );
}
