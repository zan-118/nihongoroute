"use client";

/**
 * @file VocabRelated.tsx
 * @description Komponen penampil referensi kanji/kosakata terkait (Vocab Related).
 * Menampilkan tautan ke kanji pembentuk kosakata, sinonim, antonim, beserta arti singkatnya.
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import { Card } from "@/components/ui/card";
import { Link as LinkIcon } from "@/components/ui/icons";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

// ==========================================
// ANTARMUKA & TIPE DATA
// ==========================================

/**
 * Kanji reference data structure.
 */
interface KanjiRef {
  id?: string;
  _id?: string;
  character: string;
  meaning: string;
  onyomi: string;
  kunyomi: string;
  slug: string;
}

/**
 * Vocabulary reference data structure.
 */
interface VocabRef {
  id?: string;
  _id?: string;
  word: string;
  meaning: string;
  romaji?: string;
  slug?: string;
}

/**
 * Props for VocabRelated component.
 */
interface VocabRelatedProps {
  relatedKanji?: KanjiRef[];
  synonyms?: VocabRef[];
  antonyms?: VocabRef[];
}

// ==========================================
// KOMPONEN UTAMA: VocabRelated
// ==========================================
/**
 * Component displays related kanji, synonyms, and antonyms.
 * 
 * @param props - Component properties.
 * @returns Rendered component.
 */
export function VocabRelated({ relatedKanji, synonyms, antonyms }: VocabRelatedProps) {
  // Check if any related data exists to render.
  const hasContent = (relatedKanji?.length || 0) > 0 || (synonyms?.length || 0) > 0 || (antonyms?.length || 0) > 0;

  return (
    <Card className="p-6 md:p-8 bg-card/20  border-border rounded-2xl md:rounded-3xl hover:border-primary/40 transition-all group overflow-hidden relative space-y-8 font-sans glass shadow-[0_0_20px_rgba(var(--primary-rgb),0.02)]">
      
      {/* Tampilan Karakter Kanji Terkait */}
      {relatedKanji && relatedKanji.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <LinkIcon size={16} aria-hidden="true" className="text-primary" />
            <h2 className="text-xs uppercase tracking-[0.2em] text-foreground">Karakter Kanji</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {relatedKanji.map((kanji) => {
              // Render kanji card.
              const kanjiEl = (
                <div className="p-2 pr-4 bg-[rgb(var(--muted-rgb)/0.3)] border border-border rounded-xl flex items-center gap-3 transition-all group/kanji hover:border-primary/40">
                  <div className="size-10 rounded-lg bg-background border border-border flex items-center justify-center text-xl font-japanese group-hover/kanji:text-primary transition-colors">
                    {kanji.character}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-foreground uppercase">{kanji.meaning || "Kanji"}</p>
                    <p className="text-[8px] font-bold text-muted-foreground mt-0.5">
                      {kanji.onyomi || "?"} • {kanji.kunyomi || "?"}
                    </p>
                  </div>
                </div>
              );

              // Link to kanji detail page if slug exists.
              if (kanji.slug) {
                return (
                  <Link key={kanji.id || kanji._id || kanji.character} href={`/library/kanji/${kanji.slug}`}>
                    {kanjiEl}
                  </Link>
                );
              }

              return <div key={kanji.character}>{kanjiEl}</div>;
            })}
          </div>
        </div>
      )}

      {/* Tampilan Sinonim (Kata Searti) */}
      {synonyms && synonyms.length > 0 && (
        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block">Sinonim</span>
          <div className="flex flex-wrap gap-2">
            {synonyms.map((s) => {
              // Check if vocab has valid link target.
              const hasLink = !!(s.slug || s.id || s._id);
              const badgeEl = (
                <Badge 
                  variant="secondary" 
                  className={`px-3 py-1.5 rounded-lg bg-muted border border-border transition-all ${
                    hasLink ? "hover:border-primary/40 cursor-pointer" : "opacity-80"
                  }`}
                >
                  <span className="font-japanese mr-1.5">{s.word}</span>
                  {s.meaning && <span className="text-[8px] opacity-60">({s.meaning})</span>}
                </Badge>
              );

              // Link to vocab detail page if target exists.
              if (hasLink) {
                return (
                  <Link key={s.id || s._id || s.word} href={`/library/vocab/${s.slug}`}>
                    {badgeEl}
                  </Link>
                );
              }

              return <span key={s.word}>{badgeEl}</span>;
            })}
          </div>
        </div>
      )}

      {/* Tampilan Antonim (Lawan Kata) */}
      {antonyms && antonyms.length > 0 && (
        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block">Antonim</span>
          <div className="flex flex-wrap gap-2">
            {antonyms.map((a) => {
              // Check if vocab has valid link target.
              const hasLink = !!(a.slug || a.id || a._id);
              const badgeEl = (
                <Badge 
                  variant="secondary" 
                  className={`px-3 py-1.5 rounded-lg bg-muted border border-border transition-all ${
                    hasLink ? "hover:border-destructive/40 cursor-pointer" : "opacity-80"
                  }`}
                >
                  <span className="font-japanese mr-1.5">{a.word}</span>
                  {a.meaning && <span className="text-[8px] opacity-60">({a.meaning})</span>}
                </Badge>
              );

              // Link to vocab detail page if target exists.
              if (hasLink) {
                return (
                  <Link key={a.id || a._id || a.word} href={`/library/vocab/${a.slug}`}>
                    {badgeEl}
                  </Link>
                );
              }

              return <span key={a.word}>{badgeEl}</span>;
            })}
          </div>
        </div>
      )}
      
      {!hasContent && (
         <p className="text-xs text-muted-foreground italic">Tidak ada referensi tambahan untuk kata ini.</p>
      )}
    </Card>
  );
}