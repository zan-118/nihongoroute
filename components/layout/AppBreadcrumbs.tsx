/**
 * @file AppBreadcrumbs.tsx
 * @description Komponen navigasi hirarki (Breadcrumbs) untuk membantu user melacak lokasi halaman.
 * @module AppBreadcrumbs
 */

"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

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
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted border border-border hover:bg-primary/10 hover:border-primary/30 text-muted-foreground hover:text-primary transition-all shadow-sm"
      >
        <Home size={14} />
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight size={14} className="text-muted-foreground/30 shrink-0" />
          {item.active ? (
            <span className="text-xs md:text-xs font-black uppercase tracking-widest text-foreground bg-muted border border-border px-3 py-1.5 rounded-lg shadow-sm">
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href || "#"}
              className="text-xs md:text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
