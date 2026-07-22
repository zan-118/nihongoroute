import React from "react";
import Link from "next/link";
import { ChevronDown } from "@/components/ui/icons";
import { ContentBlock, ExampleSentence } from "@/types/database";
import { SmartJapanese } from "@/components/ui/SmartJapanese";
import FuriganaDisplay from "@/components/ui/FuriganaDisplay";
import TTSReader from "@/components/features/tools/tts/TTSReader";
import { parseInlineStyles, parseNotesToJSX } from "@/lib/utils/markdown-parser";

interface GrammarBlockProps {
  block: ContentBlock;
}

export function GrammarBlock({ block }: GrammarBlockProps) {
  const raw = block as ContentBlock & { notes?: string; slug?: string };
  const notes = raw.notes;
  const slug = raw.slug;

  return (
    <div className="space-y-5 rounded-2xl md:rounded-3xl shadow-[0_15px_35px_rgb(var(--primary-rgb)/0.02)] glass overflow-hidden group hover:border-[rgb(var(--primary-rgb)/0.35)] transition-all duration-500">
      <div 
        className="px-6 py-4 border-b border-border flex justify-between items-center"
        style={{ backgroundColor: "rgb(var(--primary-rgb)/0.05)" }}
      >
        <div>
          <span 
            className="text-[9px] font-black text-primary uppercase tracking-widest px-2 py-0.5 rounded"
            style={{ backgroundColor: "rgb(var(--primary-rgb)/0.1)" }}
          >
            Pola Kalimat (Grammar)
          </span>
          {block.title && (
            <h3 className="text-lg text-foreground mt-1.5 tracking-tight">{block.title}</h3>
          )}
        </div>
      </div>
      <div className="px-6 pb-6 space-y-4">
        {block.content && block.content !== block.title && (
          <div className="font-japanese text-2xl font-black text-foreground tracking-wide leading-relaxed">
            <SmartJapanese word={block.content} furigana={block.furigana} />
          </div>
        )}
        {block.translation && (
          <p 
            className="text-sm text-muted-foreground font-medium leading-relaxed pl-4 py-2.5 rounded-r-xl whitespace-pre-wrap border-l-4"
            style={{ 
              backgroundColor: "rgb(var(--muted-rgb)/0.1)", 
              borderLeftColor: "rgb(var(--secondary-rgb)/0.6)" 
            }}
          >
            {parseInlineStyles(block.translation)}
          </p>
        )}
        {block.examples && block.examples.length > 0 && (
          <ExamplesSection examples={block.examples} />
        )}
        
        {/* Catatan Tambahan & Tabel Penjelasan (Collapsible) */}
        {notes && (
          <div className="mt-5 pt-4 border-t border-border/50">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer text-xs font-black uppercase tracking-widest text-primary hover:text-secondary transition-colors select-none">
                <span>Catatan Tambahan & Tabel Penjelasan</span>
                <span className="transition-transform duration-300 group-open:rotate-180">
                  <ChevronDown className="size-4" />
                </span>
              </summary>
              <div className="mt-4 pt-3 border-t border-border/30 text-sm md:text-base leading-relaxed text-muted-foreground select-text">
                {parseNotesToJSX(notes)}
              </div>
            </details>
          </div>
        )}

        {/* Link Detail Pola */}
        {slug && (
          <div className="mt-4 pt-4 border-t border-border/30 flex justify-end">
            <Link 
              href={`/library/grammar/${slug}`}
              target="_blank"
              className="text-xs font-black uppercase tracking-widest text-primary hover:text-secondary transition-colors inline-flex items-center gap-1.5 select-none"
            >
              <span>Pelajari Lebih Detail Halaman Pola →</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function ExamplesSection({ examples }: { examples: ExampleSentence[] }) {
  if (!examples?.length) return null;
  return (
    <div className="space-y-3 mt-4">
      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
        Contoh Kalimat (Examples)
      </p>
      <div className="space-y-3">
        {examples.map((ex) => (
          <div 
            key={ex.jp} 
            className="border border-border rounded-lg p-4 space-y-2 transition-all duration-300 group"
            style={{ backgroundColor: "rgb(var(--card-rgb)/0.1)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgb(var(--card-rgb)/0.2)";
              e.currentTarget.style.borderColor = "rgb(var(--primary-rgb)/0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgb(var(--card-rgb)/0.1)";
              e.currentTarget.style.borderColor = "";
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <FuriganaDisplay
                  text={ex.jp}
                  furigana={ex.furigana || ""}
                  size="medium"
                  interactive
                />
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0">
                <TTSReader text={ex.jp} minimal />
              </div>
            </div>
            {ex.romaji && (
              <p className="text-xs text-primary/80 font-mono tracking-wide">{ex.romaji}</p>
            )}
            <p className="text-sm text-muted-foreground font-medium">{parseInlineStyles(ex.id)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
