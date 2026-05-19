"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface KanjiRadicalsProps {
  radicals?: string[];
}

export function KanjiRadicals({ radicals }: KanjiRadicalsProps) {
  return (
    <Card className="p-8 bg-card/20 backdrop-blur-xl border-border rounded-[2.5rem] hover:border-primary/40 transition-all md:col-span-3 lg:col-span-2 flex flex-col justify-center">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block mb-4">Radikal Utama</span>
      <div className="flex flex-wrap gap-3">
        {radicals && radicals.length > 0 ? (
          radicals.map((rad, i) => (
            <Badge key={i} variant="secondary" className="px-5 py-2.5 rounded-xl bg-muted/40 border border-border text-2xl font-japanese hover:border-primary/40 transition-all">
              {rad}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-muted-foreground italic">Tidak ada data radikal.</span>
        )}
      </div>
    </Card>
  );
}
