import React from "react";
import { Zap } from "lucide-react";

interface CheatsheetSectionProps {
  cheatsheets: any[];
}

export const CheatsheetSection: React.FC<CheatsheetSectionProps> = ({ cheatsheets }) => {
  if (!cheatsheets || cheatsheets.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-xl font-black uppercase tracking-tight text-foreground flex items-center gap-3">
          <Zap size={24} className="text-warning fill-warning/20" /> Referensi Cepat
        </h2>
        <div className="h-[1px] flex-1 bg-border" />
      </div>
      <div className="space-y-12">
        {cheatsheets.map((c: any) => (
          <div key={c._id || c.id} className="neo-card overflow-hidden">
            <div className="bg-warning/5 p-6 border-b border-warning/10">
               <p className="text-[10px] font-black text-warning uppercase tracking-widest mb-1">{c.category}</p>
               <h3 className="text-xl font-black uppercase tracking-tight">{c.title}</h3>
            </div>
            <div className="p-8">
              {c.items && c.items.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                  {c.items.map((item: any, idx: number) => (
                    <div key={idx} className="p-5 rounded-2xl neo-inset hover:bg-warning/5 transition-all flex flex-col items-center text-center">
                      <span className="text-2xl font-japanese font-black mb-1">{item.jp}</span>
                      <span className="text-[10px] font-bold text-warning/80 uppercase tracking-widest mb-2">{item.romaji}</span>
                      <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {c.linkedVocab && c.linkedVocab.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-6 text-center">Kosakata Terkait</h4>
                  <div className="flex flex-wrap justify-center gap-3">
                    {c.linkedVocab.map((v: any) => (
                      <div key={v._id || v.id} className="px-4 py-2 rounded-xl bg-card border border-border text-sm font-bold flex items-center gap-2">
                        <span className="text-primary">{v.word}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">({v.meaning})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
