"use client";

import Link from "next/link";
import { BookOpen, Home, Library } from "lucide-react";
import { Card } from "@/components/ui/card";
import { GrammarLevelNav } from "./GrammarLevelNav";

interface GrammarHeaderProps {
  levels: string[];
  selectedLevel: string;
  onLevelChange: (level: string) => void;
}

export function GrammarHeader({
  levels,
  selectedLevel,
  onLevelChange,
}: GrammarHeaderProps) {
  return (
    <>
      <nav className="mb-6 md:mb-10 flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-xs font-bold text-muted-foreground uppercase tracking-widest">
        <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1.5 md:gap-2">
          <Home size={14} /> <span className="hidden sm:inline">Beranda</span>
        </Link>
        <span className="text-muted-foreground/20">/</span>
        <Link href="/library" className="hover:text-primary transition-colors flex items-center gap-1.5 md:gap-2">
          <Library size={14} /> <span className="hidden sm:inline">Pustaka</span>
        </Link>
        <span className="text-muted-foreground/20">/</span>
        <span className="text-primary flex items-center gap-1.5 md:gap-2">
          <BookOpen size={14} /> <span className="hidden sm:inline">Tata Bahasa</span>
          <span className="sm:hidden">Tata Bahasa</span>
        </span>
      </nav>

      <header className="mb-6 md:mb-12">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 md:gap-8 border-b border-border pb-6 md:pb-12">
          <div className="flex items-center gap-4 md:gap-6">
            <Card className="w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-2xl bg-primary/10 border-primary/20 flex items-center justify-center neo-inset shadow-none">
              <BookOpen size={24} className="text-primary md:w-8 md:h-8" />
            </Card>
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-none mb-1 md:mb-2">
                Panduan <span className="text-primary">Tata Bahasa</span>
              </h1>
              <span className="text-[10px] md:text-xs text-muted-foreground font-medium tracking-tight uppercase tracking-widest">Pahami pola kalimat biar naklukin JLPT.</span>
            </div>
          </div>

          <GrammarLevelNav 
            levels={levels}
            selectedLevel={selectedLevel}
            onLevelChange={onLevelChange}
          />
        </div>
      </header>
    </>
  );
}
