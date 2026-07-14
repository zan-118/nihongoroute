/**
 * @file KanjiInfoCard.tsx
 * @description Komponen untuk menampilkan kartu informasi detail Kanji, mencakup definisi, radikal utama, dan jembatan keledai (mnemonic) studi.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import React from "react";
import { BookOpen, Sparkles } from "lucide-react";

// ==========================================
// TIPE DATA / INTERFACE
// ==========================================
/**
 * Props for KanjiInfoCard component.
 */
interface KanjiInfoCardProps {
  /** List of radical characters. */
  radicals?: string[];
  /** Mnemonic text or Sanity Portable Text block array. */
  mnemonics?: string | unknown[]; // Konten Portable Text editor/sanity
  /** English meaning of the kanji. */
  meaning?: string;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * Renders kanji details including meaning, radicals, and mnemonics.
 * 
 * @param props - Component properties.
 * @returns Kanji info card element.
 */
export default function KanjiInfoCard({
  radicals = [],
  mnemonics,
  meaning,
}: KanjiInfoCardProps) {
  // ==========================================
  // RENDER KOMPONEN
  // ==========================================
  return (
    <div className="flex flex-col gap-6 w-full max-w-[400px]">
      {/* Bagian Arti */}
      {meaning && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Definisi</span>
          <h2 className="text-2xl text-foreground tracking-tight uppercase">
            {meaning}
          </h2>
        </div>
      )}

      {/* Bagian Radikal */}
      {radicals.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
             <BookOpen size={14} className="text-primary/50" />
             <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Radikal</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {radicals.map((radical) => (
              <div 
                key={`radical-${radical}`}
                className="px-3 py-1.5 rounded-xl bg-muted border border-border text-sm font-japanese font-bold text-foreground shadow-sm"
              >
                {radical}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bagian Jembatan Keledai (Mnemonic) */}
      {mnemonics && (
        <div className="flex flex-col gap-3">
           <div className="flex items-center gap-2">
             <Sparkles size={14} className="text-primary/50" />
             <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Studi Mnemonic</span>
          </div>
          <div className="bg-muted/50 border border-border rounded-lg p-5 text-[13px] text-foreground/70 leading-relaxed font-medium italic shadow-inner">
            {typeof mnemonics === "string"
              ? mnemonics
              : Array.isArray(mnemonics)
                ? mnemonics
                    .map((block: unknown) => {
                      // Cast block to extract text from Sanity Portable Text structure
                      const b = block as { children?: { text?: string }[]; text?: string };
                      return (
                        b?.children
                          ?.map((c) => c?.text || "")
                          .join("") || b?.text || (typeof block === "string" ? block as string : "")
                      );
                    })
                    .filter(Boolean)
                    .join(" ")
                : null}
          </div>
        </div>
      )}
    </div>
  );
}