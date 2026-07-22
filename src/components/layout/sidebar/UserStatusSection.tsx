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
import { LogOut } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

// ======================
// ANTARMUKA / TIPE DATA
// ======================
/**
 * Properties for UserStatusSection component.
 */
interface UserStatusSectionProps {
  /** Flag indicating if component has mounted on client. */
  hasMounted: boolean;
  /** User authentication status. */
  isAuthenticated: boolean;
  /** Full name of authenticated user. */
  userFullName: string | null;
  /** Callback function to trigger logout. */
  handleLogout: () => void;
}

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * Renders user profile card, theme toggle, and auth actions in sidebar footer.
 */
export function UserStatusSection({
  hasMounted,
  isAuthenticated,
  userFullName,
  handleLogout,
}: UserStatusSectionProps) {
  // Prevent hydration mismatch by rendering skeleton until mounted
  if (!hasMounted) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="size-10 rounded-xl" />
          <Skeleton className="h-10 flex-1 rounded-xl" />
        </div>
      </div>
    );
  }

  // Render user profile and logout button when authenticated
  if (isAuthenticated) {
    return (
      <div className="space-y-4">
        <div className="interactive-card flex items-center gap-3 p-3 rounded-lg group">
          {/* Batas Avatar Gradien Teranimasi */}
          <div className="relative size-12 shrink-0">
            {/* Continuous rotation animation for avatar border */}
            <m.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-xl bg-primary/20" 
            />
            <div className="absolute inset-[2px] rounded-xl bg-background flex items-center justify-center text-primary-foreground text-sm font-black shadow-lg overflow-hidden z-10">
              <div className="w-full h-full bg-primary flex items-center justify-center">
                {/* Fallback to 'U' if name is missing */}
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
              <div className="size-1 rounded-full bg-success" />
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
               className="w-full h-11 rounded-xl text-xs font-black uppercase tracking-widest border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground"
             >
               <LogOut size={16} className="mr-2" /> Keluar
             </Button>
           </m.div>
        </div>
      </div>
    );
  }

  // Render theme toggle and login redirect when unauthenticated
  return (
     <div className="space-y-4">
        <ThemeToggle />
        <m.div whileTap={{ scale: 0.95 }}>
          <Button
            asChild
            className="w-full h-11 text-[10px] uppercase tracking-[0.16em] rounded-xl"
          >
            <Link href="/login">Masuk atau Daftar</Link>
          </Button>
        </m.div>
     </div>
  );
}