"use client";

import { Button } from "@/components/ui/button";
import { Swords } from "lucide-react";
import { KanaType, KanaCategory } from "./kana-data";

interface KanaControlsProps {
  type: KanaType;
  setType: (type: KanaType) => void;
  category: KanaCategory;
  setCategory: (cat: KanaCategory) => void;
  startQuiz: () => void;
  themeColor: string;
  themeBorder: string;
  themeAccent: string;
}

export function KanaControls({
  type,
  setType,
  category,
  setCategory,
  startQuiz,
  themeColor,
  themeBorder,
  themeAccent,
}: KanaControlsProps) {
  const isHira = type === "hiragana";

  return (
    <div className="mb-6 md:mb-8 space-y-4 md:space-y-6">
      <div className="bg-muted p-1 rounded-2xl border border-border flex gap-1 shadow-inner relative max-w-sm">
        <Button
          variant={isHira ? "default" : "ghost"}
          onClick={() => setType("hiragana")}
          className={`relative z-10 flex-1 py-6 rounded-xl font-bold uppercase tracking-widest text-xs md:text-xs transition-all duration-500 h-10 ${isHira ? "bg-primary text-foreground hover:bg-primary shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
        >
          Hiragana
        </Button>
        <Button
          variant={!isHira ? "default" : "ghost"}
          onClick={() => setType("katakana")}
          className={`relative z-10 flex-1 py-6 rounded-xl font-bold uppercase tracking-widest text-xs md:text-xs transition-all duration-500 h-10 ${!isHira ? "bg-secondary text-foreground hover:bg-secondary/90 shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
        >
          Katakana
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 md:gap-3">
          {[
            { id: "seion", label: "Utama" },
            { id: "dakuon", label: "Turunan" },
            { id: "yoon", label: "Gabungan" },
          ].map((cat) => (
            <Button
              key={cat.id}
              variant={category === cat.id ? "default" : "outline"}
              onClick={() => setCategory(cat.id as KanaCategory)}
              className={`px-3 md:px-5 py-2 md:py-2.5 h-auto rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                category === cat.id
                  ? `bg-muted ${themeColor} ${themeBorder} border-opacity-50`
                  : "bg-transparent text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        <Button 
          onClick={startQuiz}
          className={`w-full md:w-auto px-6 py-3 h-auto rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 ${themeAccent} text-foreground shadow-lg hover:opacity-90 border-none`}
        >
          <Swords size={16} className="mr-2" /> Latihan
        </Button>
      </div>
    </div>
  );
}
