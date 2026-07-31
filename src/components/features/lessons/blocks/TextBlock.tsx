"use client";

import React from "react";
import { ContentBlock, ExampleSentence } from "@/types/database";
import { SmartJapanese, FuriganaDisplay } from "@/components/ui/japanese";
import { TTSReader } from "@/components/features/media";
import { parseInlineStyles, renderWithMarkdown } from "@/lib/utils/markdown-parser";

/**
 * Renders standard text blocks, supporting furigana, translations, and example sentences.
 */
export function TextBlock({ block }: { block: ContentBlock }) {
  return (
    <div className="space-y-4">
      {block.title && (
        <h3 className="text-xl uppercase tracking-tight text-foreground">
          {block.title}
        </h3>
      )}
      {block.content && (
        <div className="space-y-3">
          {block.content.split("\n").filter(Boolean).map((line: string, pos: number) => (
            <div key={`text-${pos}`} className="text-lg leading-relaxed text-foreground/90 font-japanese">
              {block.furigana ? (
                <SmartJapanese 
                  word={line} 
                  furigana={block.furigana.split("\n")[pos] || ""} 
                />
              ) : (
                renderWithMarkdown(line)
              )}
            </div>
          ))}
        </div>
      )}
      {block.furigana && (
        <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-4 py-2 font-japanese">
          {block.furigana}
        </div>
      )}
      {block.translation && (
        <p className="text-sm text-muted-foreground italic border-l-2 border-border pl-4 whitespace-pre-wrap">
          {parseInlineStyles(block.translation)}
        </p>
      )}
      {block.examples && block.examples.length > 0 && (
        <ExamplesSection examples={block.examples} />
      )}
    </div>
  );
}

/**
 * Renders a list of example sentences with furigana, romaji, translation, and TTS.
 */
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
