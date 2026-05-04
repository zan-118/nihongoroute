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
    <div className="w-full rounded-[2rem] md:rounded-[3rem] border border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl overflow-hidden">
      <table className="w-full text-left border-collapse table-auto">
        <thead>
          <tr className="bg-muted/50 border-b border-border/50">
            <th className="px-4 md:px-8 py-4 md:py-6 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary/60 w-12 md:w-20 text-center">No</th>
            <th className="px-4 md:px-8 py-4 md:py-6 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary/60">Materi</th>
            <th className="px-4 md:px-8 py-4 md:py-6 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary/60 text-right w-16 md:w-24">Opsi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {items.map((item, idx) => (
            <tr key={idx} className="group hover:bg-primary/[0.01] transition-all duration-300">
              <td className="px-4 md:px-8 py-6 md:py-10 text-center align-top">
                <span className="text-xs md:text-sm font-black text-muted-foreground/20 italic group-hover:text-primary/30 transition-colors">
                  {String(idx + 1).padStart(2, '0')}
                </span>
              </td>
              <td className="px-4 md:px-8 py-6 md:py-10">
                <div className="flex flex-col gap-4 md:gap-6">
                  {/* Expression Section */}
                  <div className="flex flex-col gap-1.5">
                    <div className="text-2xl md:text-4xl font-japanese font-black text-foreground tracking-tighter leading-tight">
                      {(() => {
                        const hiraReading = wanakana.toHiragana(item.romaji || "");
                        return splitFurigana(item.jp || "", hiraReading).map((chunk, i) => (
                          chunk.furi ? (
                            <ruby key={i}>
                              {chunk.text}
                              <rt className="text-[9px] md:text-xs text-primary font-bold tracking-widest mb-1 select-none">
                                {chunk.furi}
                              </rt>
                            </ruby>
                          ) : (
                            <span key={i}>{chunk.text}</span>
                          )
                        ));
                      })()}
                    </div>
                    <div className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em] italic opacity-80">
                      {item.romaji}
                    </div>
                  </div>

                  {/* Label Section */}
                  <div className="space-y-1">
                    <div className="text-sm md:text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                      {formatLabel(item.label)}
                    </div>
                    <div className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                      Meaning & Context
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 md:px-8 py-6 md:py-10 text-right align-top">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl hover:bg-primary/10 hover:text-primary text-muted-foreground transition-all"
                  onClick={() => {
                    navigator.clipboard.writeText(item.jp);
                    toast.success("Disalin ke papan klip!");
                  }}
                >
                  <Copy size={14} className="md:w-[18px] md:h-[18px]" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
