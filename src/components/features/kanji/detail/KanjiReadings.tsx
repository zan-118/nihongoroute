"use client";

import { Card } from "@/components/ui/card";
import { Play } from "lucide-react";

interface KanjiReadingsProps {
  onyomi?: string;
  kunyomi?: string;
}

export function KanjiReadings({ onyomi, kunyomi }: KanjiReadingsProps) {
  return (
    <>
      {/* Onyomi Bento */}
      <Card className="p-6 md:p-8 bg-card/20 backdrop-blur-xl border-border rounded-[2.5rem] hover:border-primary/40 transition-all relative overflow-hidden flex flex-col justify-center col-span-1 group">
        <div className="absolute top-4 right-6 opacity-[0.05] group-hover:scale-110 transition-transform text-primary">
          <Play size={40} aria-hidden="true" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary block mb-2 md:mb-3 relative z-10">Onyomi</span>
        <span className="text-2xl md:text-3xl lg:text-4xl font-japanese font-black text-foreground leading-tight tracking-tight relative z-10">
          {onyomi || "—"}
        </span>
      </Card>

      {/* Kunyomi Bento */}
      <Card className="p-6 md:p-8 bg-card/20 backdrop-blur-xl border-border rounded-[2.5rem] hover:border-primary/40 transition-all relative overflow-hidden flex flex-col justify-center col-span-1 group">
        <div className="absolute top-4 right-6 opacity-[0.05] group-hover:scale-110 transition-transform text-success">
          <Play size={40} aria-hidden="true" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-success block mb-2 md:mb-3 relative z-10">Kunyomi</span>
        <span className="text-2xl md:text-3xl lg:text-4xl font-japanese font-black text-foreground leading-tight tracking-tight relative z-10">
          {kunyomi || "—"}
        </span>
      </Card>
    </>
  );
}
