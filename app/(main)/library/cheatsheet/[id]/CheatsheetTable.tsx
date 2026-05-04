"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as wanakana from "wanakana";
import { splitFurigana } from "@/lib/furigana";

interface SheetItem {
  label: string;
  jp: string;
  romaji: string;
}

interface CheatsheetTableProps {
  items: SheetItem[];
}

export function CheatsheetTable({ items }: CheatsheetTableProps) {
  const formatLabel = (text: string) => {
    if (!text) return text;
    const keywords = [
      "Contoh", "Catatan", "Penting", "Fakta budaya", 
      "Perubahan fonetis", "Nuansa", "Tips", "Catatan menarik",
      "Pengecualian penting", "Batas", "Fakta budaya", "Nuansa sosial"
    ];
    
    let formatted = text;
    keywords.forEach(key => {
      const regex = new RegExp(`(${key}:)`, 'g');
      formatted = formatted.replace(regex, '<strong class="text-primary font-bold">$1</strong>');
    });

    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  if (!items || items.length === 0) {
    return (
      <div className="px-8 py-20 text-center text-muted-foreground font-medium italic bg-card/50 rounded-[3rem] border border-border/50">
        Belum ada data tersedia untuk cheatsheet ini.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto no-scrollbar rounded-[3rem] border border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-muted/50 border-b border-border/50">
            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-primary/60 w-20 text-center">No</th>
            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-primary/60 w-1/3">Konteks / Label</th>
            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-primary/60">Ekspresi (JP)</th>
            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-primary/60 text-right">Opsi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {items.map((item, idx) => (
            <tr key={idx} className="group hover:bg-primary/[0.01] transition-all duration-300">
              <td className="px-8 py-10 text-center">
                <span className="text-sm font-black text-muted-foreground/20 italic group-hover:text-primary/30 transition-colors">
                  {String(idx + 1).padStart(2, '0')}
                </span>
              </td>
              <td className="px-8 py-10">
                <div className="text-base md:text-lg font-bold text-foreground leading-tight mb-1 group-hover:text-primary transition-colors">
                  {formatLabel(item.label)}
                </div>
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                  Meaning & Context
                </div>
              </td>
              <td className="px-8 py-10">
                <div className="flex flex-col gap-1.5">
                  <div className="text-3xl md:text-4xl font-japanese font-black text-foreground tracking-tighter leading-normal">
                    {(() => {
                      const hiraReading = wanakana.toHiragana(item.romaji || "");
                      return splitFurigana(item.jp || "", hiraReading).map((chunk, i) => (
                        chunk.furi ? (
                          <ruby key={i}>
                            {chunk.text}
                            <rt className="text-[10px] md:text-xs text-primary font-bold tracking-widest mb-1 select-none">
                              {chunk.furi}
                            </rt>
                          </ruby>
                        ) : (
                          <span key={i}>{chunk.text}</span>
                        )
                      ));
                    })()}
                  </div>
                  <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">
                    {item.romaji}
                  </div>
                </div>
              </td>
              <td className="px-8 py-10 text-right">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="rounded-xl hover:bg-primary/10 hover:text-primary text-muted-foreground transition-all"
                  onClick={() => {
                    navigator.clipboard.writeText(item.jp);
                    toast.success("Disalin ke papan klip!");
                  }}
                >
                  <Copy size={18} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
