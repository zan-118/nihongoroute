"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface KanjiHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  levelFilter: string | null;
  onLevelFilterChange: (level: string | null) => void;
}

export function KanjiHeader({
  search,
  onSearchChange,
  levelFilter,
  onLevelFilterChange,
}: KanjiHeaderProps) {
  const levels = ["N5", "N4", "N3", "N2", "N1"];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-tight text-foreground mb-4">
          Pustaka <span className="text-primary">Kanji</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Pelajari struktur dan cara penulisan kanji standar JLPT. Gunakan filter level untuk memfokuskan target pembelajaran Anda.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" aria-hidden="true" />
          <Input 
            placeholder="Cari kanji, arti, atau cara baca..." 
            className="pl-12 h-14 bg-card/40 backdrop-blur-xl border border-border rounded-2xl text-lg shadow-2xl focus:ring-primary/20"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {levels.map(lvl => (
            <Button
              key={lvl}
              variant={levelFilter === lvl ? "default" : "outline"}
              className={`h-14 px-6 rounded-2xl font-bold transition-all duration-300 ${
                levelFilter === lvl 
                  ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]" 
                  : "bg-card/40 border border-border hover:bg-muted"
              }`}
              onClick={() => onLevelFilterChange(levelFilter === lvl ? null : lvl)}
            >
              {lvl}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
