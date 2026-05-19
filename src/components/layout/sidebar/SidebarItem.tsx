"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight, LucideIcon } from "lucide-react";

interface SidebarItemProps {
  item: {
    href: string;
    label: string;
    icon: LucideIcon;
  };
  pathname: string;
  onClick?: () => void;
}

/**
 * Komponen item navigasi individu dalam sidebar.
 */
export function SidebarItem({ item, pathname, onClick }: SidebarItemProps) {
  const isActive = pathname.startsWith(item.href);
  return (
    <Link href={item.href} onClick={onClick}>
      <motion.div
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-500 relative group overflow-hidden ${
          isActive 
            ? "bg-primary/10 text-primary border border-primary/30 shadow-[0_0_25px_rgba(var(--primary-rgb),0.1)]" 
            : "text-muted-foreground hover:bg-background/5 hover:text-foreground border border-transparent"
        }`}
      >
        {/* Active Side Glow */}
        {isActive && (
          <motion.div 
            layoutId="active-side-glow"
            className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),1)] rounded-full"
            animate={{ 
              boxShadow: ["0 0 10px rgba(var(--primary-rgb),0.6)", "0 0 20px rgba(var(--primary-rgb),0.9)", "0 0 10px rgba(var(--primary-rgb),0.6)"] 
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        <item.icon size={16} className={`${isActive ? "text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.6)]" : "text-muted-foreground"} group-hover:scale-110 transition-all duration-300`} />
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] flex-1 transition-colors duration-300 ${isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
          {item.label}
        </span>
        {isActive && (
          <motion.div 
            layoutId="sidebar-active-indicator"
            className="w-1 h-1 rounded-full bg-primary shadow-[0_0_12px_rgba(var(--primary-rgb),1)]" 
          />
        )}
        <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-all ${isActive ? 'text-primary' : 'text-muted-foreground'} group-hover:translate-x-1`} />
      </motion.div>
    </Link>
  );
}
