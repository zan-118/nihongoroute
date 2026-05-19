"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonSidebarProps {
  nav: { slug: string; title: string }[];
  currentSlug: string;
  categoryId: string;
  categoryTitle: string;
}

export default function LessonSidebar({ 
  nav, 
  currentSlug, 
  categoryId,
  categoryTitle 
}: LessonSidebarProps) {
  return (
    <aside className="w-full lg:w-80 shrink-0 hidden lg:block">
      <div className="sticky top-24 space-y-6">
        {/* Header Kategori */}
        <div className="p-6 rounded-[2rem] bg-card/30 backdrop-blur-md border border-border/50 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <BookOpen size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Kursus Ini
            </span>
          </div>
          <h3 className="text-lg font-black tracking-tight text-foreground leading-tight">
            {categoryTitle}
          </h3>
        </div>

        {/* Daftar Pelajaran */}
        <nav className="p-4 rounded-[2.5rem] bg-card/20 backdrop-blur-xl border border-border/40 shadow-xl overflow-hidden">
          <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar space-y-1">
            {nav.map((lesson, idx) => {
              const isActive = lesson.slug === currentSlug;
              return (
                <Link
                  key={lesson.slug}
                  href={`/courses/${categoryId}/${lesson.slug}`}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-[0_10px_20px_rgba(var(--primary-rgb),0.2)]" 
                      : "hover:bg-primary/5 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
                  )}
                  <span className={cn(
                    "text-[10px] font-black w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                    isActive 
                      ? "bg-primary/20 border-primary/20 text-primary-foreground" 
                      : "bg-muted/30 border-border group-hover:border-primary/30 text-muted-foreground"
                  )}>
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold truncate flex-1 tracking-tight">
                    {lesson.title}
                  </span>
                  {isActive ? (
                    <CheckCircle2 size={14} className="shrink-0" />
                  ) : (
                    <ChevronRight size={14} className="shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Progress Card (Placeholder for now) */}
        <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-2">Statistik Kamu</p>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-3xl font-black text-foreground leading-none">
                {Math.round((nav.findIndex(l => l.slug === currentSlug) + 1) / nav.length * 100)}%
              </span>
              <span className="text-[10px] font-bold text-muted-foreground mb-1">Selesai</span>
            </div>
            <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-1000" 
                style={{ width: `${(nav.findIndex(l => l.slug === currentSlug) + 1) / nav.length * 100}%` }}
              />
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 text-primary/5 group-hover:scale-110 transition-transform duration-700">
            <BookOpen size={100} />
          </div>
        </div>
      </div>
    </aside>
  );
}
