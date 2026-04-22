/**
 * @file AppBreadcrumbs.tsx
 * @description Komponen navigasi hirarki (Breadcrumbs) untuk membantu user melacak lokasi halaman.
 * @module AppBreadcrumbs
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
}

export default function AppBreadcrumbs({ items }: AppBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 mb-6">
      <Link
        href="/dashboard"
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-cyber-neon/10 hover:border-cyber-neon/30 text-slate-400 hover:text-cyber-neon transition-all"
      >
        <Home size={14} />
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight size={14} className="text-slate-600 shrink-0" />
          {item.active ? (
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-200 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href || "#"}
              className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-cyber-neon transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
