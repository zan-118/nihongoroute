/**
 * @file KanjiStrokeHero.tsx
 * @description Komponen hero bento utama untuk menampilkan visualisasi pemutar coretan Kanji, definisi, level JLPT, dan tombol add-to-SRS.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import KanjiStrokePlayer from "@/components/features/kanji/components/KanjiStrokePlayer";
import { AddToSRSButton } from "@/components/features/srs/button/AddToSRSButton";

// ==========================================
// TIPE DATA / INTERFACE
// ==========================================
/**
 * Props for KanjiStrokeHero component.
 */
interface KanjiStrokeHeroProps {
  /** Unique identifier for SRS tracking */
  id?: string;
  /** Target kanji character */
  character: string;
  /** SVG path data for stroke order animation */
  strokeOrderSvg?: string;
  /** Primary meaning of the kanji */
  meaning: string;
  /** JLPT level (N1-N5) */
  jlpt?: string;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * Hero panel component displaying kanji stroke animation, meaning, JLPT level, and SRS action.
 */
export function KanjiStrokeHero({ id, character, strokeOrderSvg, meaning, jlpt }: KanjiStrokeHeroProps) {
  // ==========================================
  // RENDER KOMPONEN
  // ==========================================
  return (
    <Card className="p-6 sm:p-8 md:p-12 bg-card/20  border-border rounded-2xl md:rounded-3xl hover:border-primary/40 transition-all flex flex-col items-center justify-center group relative overflow-hidden glass shadow-[0_0_30px_rgba(var(--primary-rgb),0.05)]">
      {/* Top-right SRS action button */}
      <div className="absolute top-4 right-4 z-20">
        {id && <AddToSRSButton wordId={id} />}
      </div>
      
      {/* Decorative background glow elements */}
      <div className="absolute top-0 right-0 size-32 bg-primary/10 rounded-bl-3xl -mr-8 -mt-8 blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
      <div className="absolute bottom-0 left-0 size-32 bg-secondary/10 rounded-tr-3xl -ml-8 -mb-8 blur-3xl group-hover:bg-secondary/20 transition-all duration-700" />
      
      {/* Interactive stroke order player */}
      <div className="w-full max-w-[180px] sm:max-w-[200px] md:max-w-[300px] relative z-10 flex justify-center">
        <KanjiStrokePlayer 
          character={character} 
          strokeOrderSvg={strokeOrderSvg}
          size={200}
        />
      </div>

      {/* Meaning and JLPT badge */}
      <div className="mt-6 md:mt-8 flex flex-col items-center gap-3 relative z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground tracking-tighter uppercase text-center drop-shadow-sm">
          {meaning}
        </h1>
        <Badge variant="outline" className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl bg-primary/10 text-primary border-primary/20">
           JLPT {jlpt || "N/A"}
        </Badge>
      </div>
    </Card>
  );
}