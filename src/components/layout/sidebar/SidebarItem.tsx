/**
 * @file SidebarItem.tsx
 * @description Komponen item menu navigasi individu pada sidebar desktop.
 */

"use client";

// ======================
// IMPOR
// ======================
import React from "react";
import { m } from "framer-motion";
import Link from "next/link";
import { ChevronRight, LucideIcon } from "lucide-react";

// ======================
// ANTARMUKA / TIPE DATA
// ======================
interface SidebarItemProps {
  item: {
    href: string;
    label: string;
    icon: LucideIcon;
  };
  pathname: string;
  onClick?: () => void;
}

// ======================
// EKSEKUSI UTAMA
// ======================
export function SidebarItem({ item, pathname, onClick }: SidebarItemProps) {
  const isActive = pathname.startsWith(item.href);
  return (
    <Link href={item.href} onClick={onClick}>
      <m.div
        whileHover={{ x: 3 }}
        whileTap={{ scale: 0.985 }}
        className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden ${
          isActive 
            ? "bg-primary/[0.11] text-primary border border-primary/25 shadow-[0_10px_26px_rgb(var(--primary-rgb)/0.08)]"
            : "text-muted-foreground hover:bg-card/55 hover:text-foreground border border-transparent"
        }`}
      >
        {/* Pendar Samping Aktif */}
        {isActive && (
          <m.div 
            layoutId="active-side-glow"
            className="absolute left-0 top-2 bottom-2 w-[3px] bg-primary rounded-full"
          />
        )}

        <div className={`size-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
          isActive ? "bg-primary/[0.12] text-primary" : "bg-transparent text-muted-foreground group-hover:bg-muted/70 group-hover:text-foreground"
        }`}>
          <item.icon size={16} strokeWidth={2.1} />
        </div>
        <span className={`text-[10px] font-black uppercase tracking-[0.16em] flex-1 transition-colors duration-300 ${isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
          {item.label}
        </span>
        {isActive && (
          <m.div 
            layoutId="sidebar-active-indicator"
            className="size-1.5 rounded-full bg-primary"
          />
        )}
        <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-all ${isActive ? 'text-primary' : 'text-muted-foreground'} group-hover:translate-x-0.5`} />
      </m.div>
    </Link>
  );
}
