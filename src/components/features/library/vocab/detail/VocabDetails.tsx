"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface VocabDetailsProps {
  hinshi?: string;
  jlptLevel?: string;
  pitchAccent?: string;
}

export function VocabDetails({ hinshi, jlptLevel, pitchAccent }: VocabDetailsProps) {
  return (
    <Card className="p-6 bg-card/20 backdrop-blur-xl border-border rounded-[2rem] hover:border-primary/40 transition-all group overflow-hidden relative col-span-1 flex flex-col justify-center gap-4">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Atribut Kata</span>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl bg-primary/10 text-primary border-primary/20">
          {hinshi || "Kosakata"}
        </Badge>
        {jlptLevel && (
          <Badge variant="outline" className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl bg-secondary/10 text-secondary border-secondary/20">
            JLPT {jlptLevel}
          </Badge>
        )}
        {pitchAccent && (
          <Badge variant="secondary" className="px-3 py-1.5 text-[9px] font-bold tracking-widest bg-muted border-border">
            PITCH: {pitchAccent}
          </Badge>
        )}
      </div>
    </Card>
  );
}
