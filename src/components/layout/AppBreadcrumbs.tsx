/**
 * @file AppBreadcrumbs.tsx
 * @description Komponen navigasi hirarki (Breadcrumbs) dengan estetika Cyber-Glass.
 */

"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { motion } from "framer-motion";

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface AppBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function AppBreadcrumbs({ items, className = "" }: AppBreadcrumbsProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center flex-wrap gap-3 mb-10 ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link
          href="/dashboard"
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-card/30 backdrop-blur-md border border-border/50 hover:bg-primary/10 hover:border-primary/30 text-muted-foreground hover:text-primary transition-all shadow-lg group"
        >
          <Home size={16} className="group-hover:scale-110 transition-transform" />
        </Link>
      </motion.div>

      {items.map((item, index) => (
        <motion.div 
          key={index} 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 + 0.1 }}
        >
          <ChevronRight size={14} className="text-muted-foreground/20 shrink-0" />
          
          {item.active ? (
            <div className="relative group">
              <div className="absolute -inset-1 bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              <span className="relative text-[10px] font-black uppercase tracking-[0.2em] text-foreground bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
                {item.label}
              </span>
            </div>
          ) : (
            <Link
              href={item.href || "#"}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-all hover:translate-x-0.5"
            >
              {item.label}
            </Link>
          )}
        </motion.div>
      ))}
    </nav>
  );
}
