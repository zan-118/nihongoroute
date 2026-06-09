/**
 * @file AppBreadcrumbs.tsx
 * @description Komponen navigasi hirarki (Breadcrumbs) dengan estetika Cyber-Glass.
 */

"use client";

// ======================
// IMPOR
// ======================
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";
import type { BreadcrumbItem } from "@/lib/routes";

// ======================
// ANTARMUKA / TIPE DATA
// ======================
interface AppBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

// ======================
// EKSEKUSI UTAMA
// ======================
export default function AppBreadcrumbs({ items, className = "" }: AppBreadcrumbsProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      data-tour="breadcrumbs"
      className={cn(
        "status-pill flex max-w-full items-center gap-1 overflow-x-auto px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] scrollbar-none md:text-xs",
        className
      )}
    >
      {items.map((item, index) => (
        <m.div 
          key={`${item.label}-${index}`} 
          className="flex shrink-0 items-center gap-1.5"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: index * 0.03 }}
        >
          {index > 0 && <ChevronRight size={12} className="shrink-0 text-muted-foreground/25" />}
          
          {item.active ? (
            <span
              aria-current="page"
              className="inline-flex min-h-8 max-w-[13rem] items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 text-primary shadow-[0_0_18px_rgb(var(--primary-rgb)/0.08)] md:max-w-[18rem]"
              title={item.label}
            >
              {index === 0 && <Home size={13} className="mb-0.5 shrink-0" />}
              <span className="truncate">
                {item.label}
              </span>
            </span>
          ) : (
            <Link
              href={item.href || "#"}
              className="inline-flex min-h-8 max-w-[11rem] items-center gap-1.5 rounded-lg px-2 text-muted-foreground transition-colors hover:text-foreground md:max-w-[16rem]"
              title={item.label}
            >
              {index === 0 && <Home size={13} className="mb-0.5 shrink-0" />}
              <span className="truncate">{item.label}</span>
            </Link>
          )}
        </m.div>
      ))}
    </nav>
  );
}
