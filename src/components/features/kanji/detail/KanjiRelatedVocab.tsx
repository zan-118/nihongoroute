"use client";

import { Card } from "@/components/ui/card";
import { Link as LinkIcon, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { SmartJapanese } from "@/components/ui/SmartJapanese";

interface VocabRef {
  id: string;
  _id?: string;
  word: string;
  furigana: string;
  meaning: string;
  romaji?: string;
  slug?: string;
}

interface KanjiRelatedVocabProps {
  relatedVocab?: VocabRef[];
}

export function KanjiRelatedVocab({ relatedVocab }: KanjiRelatedVocabProps) {
  return (
    <Card className="p-6 md:p-10 bg-card/20 backdrop-blur-xl border-border rounded-[2.5rem] hover:border-primary/40 transition-all md:col-span-full lg:col-span-2">
      <div className="flex items-center gap-3 mb-6">
        <LinkIcon size={18} className="text-primary" aria-hidden="true" />
        <h2 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-foreground">Kosakata Terkait</h2>
      </div>
      
      {relatedVocab && relatedVocab.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {relatedVocab.map((vocab) => (
            <Link key={vocab.id || vocab._id} href={`/library/vocab/${vocab.slug}`}>
              <Card className="p-4 sm:p-6 bg-card/20 border-border rounded-2xl flex items-center gap-4 hover:bg-card/40 hover:border-primary/30 transition-all group cursor-pointer shadow-none">
                <div className="flex-1 min-w-0">
                  <div className="text-lg md:text-xl font-bold text-foreground font-japanese group-hover:text-primary transition-colors">
                    <SmartJapanese word={vocab.word} furigana={vocab.furigana} />
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground truncate mt-1">{vocab.meaning}</p>
                </div>
                <ChevronLeft size={16} className="rotate-180 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" aria-hidden="true" />
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">Belum ada kosakata yang terhubung ke karakter ini.</p>
      )}
    </Card>
  );
}
