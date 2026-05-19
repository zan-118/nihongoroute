"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { LEVELS, HINSHI } from "./types";

interface VocabFilterPanelProps {
  search: string;
  setSearch: (val: string) => void;
  level: string;
  setLevel: (val: string) => void;
  hinshi: string;
  setHinshi: (val: string) => void;
  showRomaji: boolean;
  setShowRomaji: (val: boolean) => void;
}

export function VocabFilterPanel({
  search,
  setSearch,
  level,
  setLevel,
  hinshi,
  setHinshi,
  showRomaji,
  setShowRomaji,
}: VocabFilterPanelProps) {
  return (
    <div className="mb-10 md:mb-16 bg-card p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-border neo-card shadow-sm">
      <div className="flex flex-col gap-6 md:gap-8">
        <div className="relative group w-full">
          <Search
            className="absolute left-5 md:left-7 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors z-10"
            size={20}
            aria-hidden="true"
          />
          <Input
            placeholder="Masukkan kanji, kana, romaji, atau definisi..."
            className="w-full pl-12 md:pl-16 pr-6 md:pr-8 py-6 md:py-8 h-auto bg-muted/30 border-border rounded-2xl md:rounded-[2rem] text-sm md:text-base text-foreground placeholder:text-muted-foreground font-medium neo-inset shadow-none focus-visible:ring-primary/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
          <div className="space-y-4">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground block ml-1">
              Level JLPT
            </span>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {LEVELS.map((l) => (
                <Button
                  key={l}
                  variant="ghost"
                  onClick={() => setLevel(l)}
                  className={`px-4 py-2 md:px-6 md:py-3 h-auto rounded-xl text-xs md:text-xs font-bold transition-all border ${
                    level === l
                      ? "bg-primary text-primary-foreground border-none shadow-lg"
                      : "bg-muted border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {l}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground block ml-1">
              Jenis Kata
            </span>
            <select
              value={hinshi}
              onChange={(e) => setHinshi(e.target.value)}
              className="w-full px-5 md:px-6 py-3 md:py-4 bg-muted border border-border rounded-xl md:rounded-2xl text-xs md:text-xs font-bold uppercase tracking-widest text-foreground outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
            >
              {HINSHI.map((h) => (
                <option key={h.value} value={h.value} className="bg-card py-2 uppercase tracking-widest">
                  {h.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full lg:w-auto flex items-center justify-between lg:justify-end gap-4 px-4 py-3 bg-muted/20 border border-border rounded-xl md:rounded-2xl neo-inset">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Tampilkan Romaji</span>
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tight">
              Pemandu bacaan Latin
            </span>
          </div>
          <Switch checked={showRomaji} onCheckedChange={setShowRomaji} className="data-[state=checked]:bg-primary" />
        </div>
      </div>
    </div>
  );
}
