"use client";

import { Card } from "@/components/ui/card";
import { Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface KanjiRef {
  id?: string;
  _id?: string;
  character: string;
  meaning: string;
  onyomi: string;
  kunyomi: string;
  slug: string;
}

interface VocabRef {
  id?: string;
  _id?: string;
  word: string;
  meaning: string;
  romaji?: string;
  slug?: string;
}

interface VocabRelatedProps {
  relatedKanji?: KanjiRef[];
  synonyms?: VocabRef[];
  antonyms?: VocabRef[];
}

export function VocabRelated({ relatedKanji, synonyms, antonyms }: VocabRelatedProps) {
  const hasContent = (relatedKanji?.length || 0) > 0 || (synonyms?.length || 0) > 0 || (antonyms?.length || 0) > 0;

  return (
    <Card className="p-6 md:p-8 bg-card/20 backdrop-blur-xl border-border rounded-[2rem] hover:border-primary/40 transition-all group overflow-hidden relative md:col-span-full lg:col-span-2 space-y-8">
      {/* Related Kanji */}
      {relatedKanji && relatedKanji.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <LinkIcon size={16} aria-hidden="true" className="text-primary" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Karakter Kanji</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {relatedKanji.map((kanji) => (
              <Link key={kanji.id || kanji._id} href={`/library/kanji/${kanji.character}`}>
                <div className="p-2 pr-4 bg-[rgba(var(--muted-rgb),0.3)] border border-border rounded-xl flex items-center gap-3 hover:border-primary/40 transition-all group/kanji">
                  <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-xl font-japanese group-hover/kanji:text-primary transition-colors">
                    {kanji.character}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-foreground uppercase">{kanji.meaning}</p>
                    <p className="text-[8px] font-bold text-muted-foreground mt-0.5">{kanji.onyomi} • {kanji.kunyomi}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Synonyms */}
      {synonyms && synonyms.length > 0 && (
        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block">Sinonim</span>
          <div className="flex flex-wrap gap-2">
            {synonyms.map((s) => (
              <Link key={s.id || s._id} href={`/library/vocab/${s.slug}`}>
                <Badge variant="secondary" className="px-3 py-1.5 rounded-lg bg-muted border border-border hover:border-primary/40 transition-all cursor-pointer">
                  <span className="font-japanese mr-1.5">{s.word}</span>
                  <span className="text-[8px] opacity-60">({s.meaning})</span>
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Antonyms */}
      {antonyms && antonyms.length > 0 && (
        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block">Antonim</span>
          <div className="flex flex-wrap gap-2">
            {antonyms.map((a) => (
              <Link key={a.id || a._id} href={`/library/vocab/${a.slug}`}>
                <Badge variant="secondary" className="px-3 py-1.5 rounded-lg bg-muted border border-border hover:border-destructive/40 transition-all cursor-pointer">
                  <span className="font-japanese mr-1.5">{a.word}</span>
                  <span className="text-[8px] opacity-60">({a.meaning})</span>
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {!hasContent && (
         <p className="text-xs text-muted-foreground italic">Tidak ada referensi tambahan untuk kata ini.</p>
      )}
    </Card>
  );
}
