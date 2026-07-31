"use client";

/**
 * @file ContentBlockRenderer.tsx
 * @description Komponen perender utama blok konten pelajaran.
 * Memanfaat pencocokan registri `renderContentBlock` dan `PedagogicalBadges`
 * untuk merender teks kaya (Rich Text) dan blok kustom interaktif secara modular.
 *
 * @package components/features/lessons
 * @project NihongoRoute
 */

import React from "react";
import { ContentBlock } from "@/types/database";
import { VocabLessonItem } from "./VocabSection";
import { KanjiLessonItem } from "./KanjiSection";
import { renderWithMarkdown } from "@/lib/utils/markdown-parser";
import { PedagogicalBadges } from "./blocks/PedagogicalBadges";
import { renderContentBlock } from "./blocks/LessonBlockRegistry";

interface ContentBlockRendererProps {
  blocks: ContentBlock[];
  vocabList?: VocabLessonItem[];
  kanjiList?: KanjiLessonItem[];
}

interface PortableTextBlock {
  _type?: string;
  style?: string;
  children?: Array<{ text: string }>;
  [key: string]: unknown;
}

/**
 * Renders a list of content blocks, handling standard text, custom blocks,
 * and specialized sections like vocabulary and kanji.
 */
export default function ContentBlockRenderer({ 
  blocks,
  vocabList = [],
  kanjiList = []
}: ContentBlockRendererProps) {
  if (!blocks?.length) return null;

  const sorted = [...blocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const isImageBlock = (b: ContentBlock) => {
    const raw = b as unknown as Record<string, unknown>;
    const t = b.type || raw._type;
    return (t as string) === "image" || (t as string) === "imageBlock";
  };
  
  const imageBlocks = sorted.filter(isImageBlock);
  const otherBlocks = sorted.filter(b => !isImageBlock(b));

  return (
    <div className="space-y-10">
      {imageBlocks.length > 0 && (
        <div className="mb-14">
          {imageBlocks.map((block, idx) => (
            <BlockItem 
              key={block.id || `img-${idx}`} 
              block={block} 
              vocabList={vocabList}
              kanjiList={kanjiList}
            />
          ))}
        </div>
      )}
      <div className="space-y-10">
        {otherBlocks.map((block, idx) => (
          <BlockItem 
            key={block.id || idx} 
            block={block} 
            vocabList={vocabList}
            kanjiList={kanjiList}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Wrapper component that determines the correct renderer for a given content block.
 */
function BlockItem({ 
  block,
  vocabList = [],
  kanjiList = []
}: { 
  block: ContentBlock;
  vocabList?: VocabLessonItem[];
  kanjiList?: KanjiLessonItem[];
}) {
  const rawBlock = block as unknown as Record<string, unknown>;
  const isPortableText = rawBlock._type === "block";

  return (
    <div className="group relative">
      <PedagogicalBadges block={block} />
      {isPortableText ? (
        <PortableTextBlockRenderer block={block as unknown as PortableTextBlock} />
      ) : (
        renderContentBlock({ block, vocabList, kanjiList })
      )}
    </div>
  );
}

/**
 * Renders a single Portable Text block using inline markdown parser.
 */
function PortableTextBlockRenderer({ block }: { block: PortableTextBlock }) {
  const style = block.style || "normal";
  const blockChildren = block.children || [];
  const text = blockChildren.map((c) => c.text).join("");

  if (style === "h2") {
    return (
      <h2 className="text-2xl uppercase tracking-tight text-foreground mt-8 mb-4 border-b border-border pb-2 font-japanese">
        {renderWithMarkdown(text)}
      </h2>
    );
  }

  if (style === "h3") {
    return (
      <h3 className="text-xl uppercase tracking-tight text-foreground mt-6 mb-3 font-japanese">
        {renderWithMarkdown(text)}
      </h3>
    );
  }

  if (style === "blockquote") {
    return (
      <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
        {renderWithMarkdown(text)}
      </blockquote>
    );
  }

  return (
    <div className="prose-custom max-w-none">
      <p className="text-lg leading-relaxed text-foreground/90 font-japanese mb-4">
        {renderWithMarkdown(text)}
      </p>
    </div>
  );
}