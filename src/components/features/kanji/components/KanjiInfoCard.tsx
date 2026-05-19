import React from "react";
import { BookOpen, Sparkles } from "lucide-react";

interface KanjiInfoCardProps {
  radicals?: string[];
  mnemonics?: any; // Portable Text content
  meaning?: string;
}

export default function KanjiInfoCard({
  radicals = [],
  mnemonics,
  meaning,
}: KanjiInfoCardProps) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-[400px]">
      {/* Meaning Section */}
      {meaning && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Definition</span>
          <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">
            {meaning}
          </h2>
        </div>
      )}

      {/* Radicals Section */}
      {radicals.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
             <BookOpen size={14} className="text-primary/50" />
             <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Radicals</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {radicals.map((radical, idx) => (
              <div 
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-muted border border-border text-sm font-japanese font-bold text-foreground shadow-sm"
              >
                {radical}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mnemonics Section */}
      {mnemonics && (
        <div className="flex flex-col gap-3">
           <div className="flex items-center gap-2">
             <Sparkles size={14} className="text-primary/50" />
             <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Mnemonic Study</span>
          </div>
          <div className="bg-muted/50 border border-border rounded-2xl p-5 text-[13px] text-foreground/70 leading-relaxed font-medium italic shadow-inner">
            {typeof mnemonics === "string"
              ? mnemonics
              : Array.isArray(mnemonics)
                ? mnemonics
                    .map((block: any) =>
                      block?.children
                        ?.map((c: any) => c?.text || "")
                        .join("") || block?.text || (typeof block === "string" ? block : "")
                    )
                    .filter(Boolean)
                    .join(" ")
                : null}
          </div>
        </div>
      )}
    </div>
  );
}
