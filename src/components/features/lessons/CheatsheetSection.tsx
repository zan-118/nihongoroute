/**
 * @file CheatsheetSection.tsx
 * @description Komponen seksi materi tabel rujukan cepat (CheatsheetSection) untuk menampilkan daftar kosakata, ungkapan, hirarki JLPT, dan istilah terkait.
 */

// ======================
// IMPOR
// ======================
import React from "react";
import { Zap } from "lucide-react";

// ======================
// ANTARMUKA / TIPE DATA
// ======================
interface CheatsheetItem {
  jp: string;
  romaji: string;
  label: string;
}

interface LinkedVocabItem {
  id?: string;
  _id?: string;
  word: string;
  meaning: string;
}

export interface CheatsheetData {
  id?: string;
  _id?: string;
  category: string;
  title: string;
  items?: CheatsheetItem[];
  linkedVocab?: LinkedVocabItem[];
}

interface CheatsheetSectionProps {
  cheatsheets: CheatsheetData[];
}

// ======================
// EKSEKUSI UTAMA
// ======================
export const CheatsheetSection: React.FC<CheatsheetSectionProps> = ({ cheatsheets }) => {
  if (!cheatsheets || cheatsheets.length === 0) return null;

  return (
    <section id="cheatsheet">
      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-xl font-black uppercase tracking-tight text-foreground flex items-center gap-3">
          <Zap size={24} className="text-warning fill-warning/20" /> Referensi Cepat
        </h2>
        <div className="h-[1px] flex-1 bg-border" />
      </div>
      <div className="space-y-12">
        {cheatsheets.map((c: CheatsheetData) => (
          <div key={c._id || c.id} className="neo-card overflow-hidden">
            <div 
              className="p-6 border-b"
              style={{ backgroundColor: "rgba(var(--warning-rgb), 0.05)", borderColor: "rgba(var(--warning-rgb), 0.1)" }}
            >
               <p className="text-[10px] font-black text-warning uppercase tracking-widest mb-1">{c.category}</p>
               <h3 className="text-xl font-black uppercase tracking-tight">{c.title}</h3>
            </div>
            <div className="p-8">
              {c.items && c.items.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                  {c.items.map((item: CheatsheetItem) => (
                    <div 
                      key={item.jp} 
                      className="p-5 rounded-2xl neo-inset transition-all flex flex-col items-center text-center"
                      // Apply hover styles inline to match rules
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(var(--warning-rgb), 0.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "";
                      }}
                    >
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
                    {c.linkedVocab.map((v: LinkedVocabItem) => (
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
