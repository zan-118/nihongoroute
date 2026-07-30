"use client";

/**
 * @file ContentBlockRenderer.tsx
 * @description Komponen perender blok konten pelajaran untuk NihongoRoute.
 * Menangani rendering teks kaya (Rich Text) serta berbagai blok kustom seperti
 * tata bahasa (grammar), percakapan (dialogue), sorotan (callout), gambar (image), kosakata (vocab), dan kanji.
 *
 * @package components/features/lessons
 * @project NihongoRoute
 */

// ==========================================
// IMPOR
// ==========================================
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, Info, BookOpen, AlertTriangle, Globe, Hourglass, BarChart, ChevronDown } from "@/components/ui/icons";
import { ContentBlock, ExampleSentence } from "@/types/database";
import { FuriganaDisplay, SmartJapanese } from "@/components/ui/japanese";
import TTSReader from "@/components/features/tools/tts/TTSReader";
import { OfflineAudio } from "@/components/ui/OfflineAudio";
import { detectVoice, fetchTTSAudio, speakWithWebSpeech } from "@/lib/tts";
import { VocabSection, VocabLessonItem } from "./VocabSection";
import { KanjiSection, KanjiLessonItem } from "./KanjiSection";

// Refactored helpers & components
import { parseInlineStyles, renderWithMarkdown, parseNotesToJSX } from "@/lib/utils/markdown-parser";
import { TableBlock } from "./blocks/TableBlock";
import { CalloutBlock } from "./blocks/CalloutBlock";
import { GrammarBlock } from "./blocks/GrammarBlock";
import { DialogueBlock } from "./blocks/DialogueBlock";

// ==========================================
// ANTARMUKA & PROPS (INTERFACES)
// ==========================================

/**
 * Props for ContentBlockRenderer component.
 */
interface ContentBlockRendererProps {
  blocks: ContentBlock[];
  vocabList?: VocabLessonItem[];
  kanjiList?: KanjiLessonItem[];
}

/**
 * Structure representing a Portable Text block.
 */
interface PortableTextBlock {
  _type?: string;
  _key?: string;
  [key: string]: unknown;
}

/**
 * Props for Portable Text custom type components.
 */
interface PortableTextValueProps {
  value: {
    _type: string;
    [key: string]: unknown;
  };
}

/**
 * Props for Portable Text block level components.
 */
interface PortableTextChildrenProps {
  children?: React.ReactNode;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================

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

  // Definisikan komponen secara dinamis untuk menutup (closure) vocabList dan kanjiList
  const components = {
    types: {
      dialogueBlock: ({ value }: PortableTextValueProps) => <DialogueBlock block={value as unknown as ContentBlock} />,
      grammarBlock: ({ value }: PortableTextValueProps) => <GrammarBlock block={value as unknown as ContentBlock} />,
      calloutBlock: ({ value }: PortableTextValueProps) => <CalloutBlock block={value as unknown as ContentBlock} />,
      imageBlock: ({ value }: PortableTextValueProps) => <ImageBlock block={value as unknown as ContentBlock} />,
      vocabBlock: () => <VocabSection vocabList={vocabList} />,
      kanjiBlock: () => <KanjiSection kanjiList={kanjiList} />,
    },
    block: {
      h2: ({ children }: PortableTextChildrenProps) => (
        <h2 className="text-2xl uppercase tracking-tight text-foreground mt-8 mb-4 border-b border-border pb-2 font-japanese">
          {renderWithMarkdown(children)}
        </h2>
      ),
      h3: ({ children }: PortableTextChildrenProps) => (
        <h3 className="text-xl uppercase tracking-tight text-foreground mt-6 mb-3 font-japanese">
          {renderWithMarkdown(children)}
        </h3>
      ),
      normal: ({ children }: PortableTextChildrenProps) => (
        <p className="text-lg leading-relaxed text-foreground/90 font-japanese mb-4">
          {renderWithMarkdown(children)}
        </p>
      ),
      blockquote: ({ children }: PortableTextChildrenProps) => (
        <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
          {renderWithMarkdown(children)}
        </blockquote>
      )
    },
    list: {
      bullet: ({ children }: PortableTextChildrenProps) => (
        <ul className="list-disc pl-6 mb-4 space-y-2 text-lg text-foreground/90 font-japanese">
          {children}
        </ul>
      ),
      number: ({ children }: PortableTextChildrenProps) => (
        <ol className="list-decimal pl-6 mb-4 space-y-2 text-lg text-foreground/90 font-japanese">
          {children}
        </ol>
      )
    },
    listItem: {
      bullet: ({ children }: PortableTextChildrenProps) => (
        <li className="leading-relaxed">
          {renderWithMarkdown(children)}
        </li>
      ),
      number: ({ children }: PortableTextChildrenProps) => (
        <li className="leading-relaxed">
          {renderWithMarkdown(children)}
        </li>
      )
    }
  };

  // Urutkan berdasarkan kolom order jika tersedia
  const sorted = [...blocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Pisahkan blok gambar untuk ditampilkan sebagai hero banner di paling atas
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
              components={components}
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
            components={components}
            vocabList={vocabList}
            kanjiList={kanjiList}
          />
        ))}
      </div>
    </div>
  );
}

// ==========================================
// LENCANA PEDAGOGIS (PEDAGOGICAL BADGES)
// ==========================================

/**
 * Renders pedagogical metadata badges (role, stage, reading time) for a block.
 */
function PedagogicalBadges({ block }: { block: ContentBlock }) {
  const { pedagogical_role, difficulty_stage, estimated_reading_time } = block;

  if (!pedagogical_role && !difficulty_stage && !estimated_reading_time) return null;

  const roleMeta = {
    core_explanation: {
      label: "Penjelasan Utama",
      icon: BookOpen,
      className: "text-primary",
      style: { backgroundColor: "rgb(var(--primary-rgb)/0.1)", borderColor: "rgb(var(--primary-rgb)/0.2)", borderWidth: "1px" },
    },
    practical_scenario: {
      label: "Skenario Praktis",
      icon: Globe,
      className: "text-success",
      style: { backgroundColor: "rgb(var(--success-rgb)/0.1)", borderColor: "rgb(var(--success-rgb)/0.2)", borderWidth: "1px" },
    },
    pitfall_alert: {
      label: "Tips & Perangkap",
      icon: AlertTriangle,
      className: "text-destructive",
      style: { backgroundColor: "rgb(var(--destructive-rgb)/0.1)", borderColor: "rgb(var(--destructive-rgb)/0.2)", borderWidth: "1px" },
    },
    cultural_note: {
      label: "Catatan Budaya",
      icon: Info,
      className: "text-warning",
      style: { backgroundColor: "rgb(var(--warning-rgb)/0.1)", borderColor: "rgb(var(--warning-rgb)/0.2)", borderWidth: "1px" },
    },
  };

  const stageMeta = {
    introducing: {
      label: "Tahap: Pengenalan",
      className: "text-muted-foreground border border-border bg-muted/50",
      style: {},
    },
    guided: {
      label: "Tahap: Terbimbing",
      className: "text-secondary",
      style: { backgroundColor: "rgb(var(--secondary-rgb)/0.15)", borderColor: "rgb(var(--secondary-rgb)/0.2)", borderWidth: "1px" },
    },
    autonomous: {
      label: "Tahap: Mandiri",
      className: "text-success",
      style: { backgroundColor: "rgb(var(--success-rgb)/0.15)", borderColor: "rgb(var(--success-rgb)/0.2)", borderWidth: "1px" },
    },
  };

  const role = pedagogical_role ? roleMeta[pedagogical_role] : null;
  const stage = difficulty_stage ? stageMeta[difficulty_stage] : null;

  return (
    <div className="flex flex-wrap gap-2 mb-3.5 items-center">
      {role && (
        <span 
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${role.className}`}
          style={role.style}
        >
          <role.icon className="size-3.5" />
          {role.label}
        </span>
      )}
      {stage && (
        <span 
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${stage.className}`}
          style={stage.style}
        >
          <BarChart className="size-3 mr-1" />
          {stage.label}
        </span>
      )}
      {estimated_reading_time && (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted/50 text-muted-foreground border border-border/60">
          <Hourglass className="size-3 mr-1 text-muted-foreground/75" />
          {estimated_reading_time} menit baca
        </span>
      )}
    </div>
  );
}

// ==========================================
// PORTABLE TEXT BLOCK RENDERER
// ==========================================

/**
 * Renders a single Portable Text block using custom renderer.
 */
function PortableTextBlockRenderer({ block, components }: { block: PortableTextBlock; components: Record<string, Record<string, unknown>> }) {
  const style = ((block.style as string) || "normal");
  const blockChildren = (block.children as Array<{ text: string }> || []);
  const text = blockChildren.map((c) => c.text).join("");

  const blockRenderers = components.block || {};
  const renderFn = (blockRenderers[style] || blockRenderers.normal) as ((props: { children: string }) => React.ReactNode) | undefined;
  return (
    <div className="prose-custom max-w-none">
      {renderFn ? renderFn({ children: text }) : <p className="text-lg leading-relaxed text-foreground/90 font-japanese mb-4">{text}</p>}
    </div>
  );
}

// ==========================================
// RENDERER ITEM BLOK (BLOCK ITEM)
// ==========================================

/**
 * Wrapper component that determines the correct renderer for a given content block.
 */
function BlockItem({ 
  block,
  components,
  vocabList = [],
  kanjiList = []
}: { 
  block: ContentBlock;
  components: Record<string, Record<string, unknown>>;
  vocabList?: VocabLessonItem[];
  kanjiList?: KanjiLessonItem[];
}) {
  const rawBlock = block as unknown as Record<string, unknown>;
  const type = block.type || rawBlock._type || "text";

  // Check if block is structured as a Rich Text block
  const isPortableText = rawBlock._type === "block";

  return (
    <div className="group relative">
      <PedagogicalBadges block={block} />
      {(() => {
        if (isPortableText) {
          return <PortableTextBlockRenderer block={block as unknown as PortableTextBlock} components={components} />;
        }

        switch (type as string) {
          case "callout":
          case "calloutBlock":
            return <CalloutBlock block={block} />;
          case "dialogue":
          case "dialogueBlock":
            return <DialogueBlock block={block} />;
          case "grammar":
          case "grammarBlock":
            return <GrammarBlock block={block} />;
          case "image":
          case "imageBlock":
            return <ImageBlock block={block} />;
          case "vocab":
          case "vocabBlock":
            return <VocabSection vocabList={vocabList} />;
          case "kanji":
          case "kanjiBlock":
            return <KanjiSection kanjiList={kanjiList} />;
          case "list":
            return <ListBlock block={block} />;
          case "table":
            return <TableBlock block={block} />;
          case "heading":
            return <HeadingBlock block={block} />;
          case "text":
          case "article":
          default:
            return <TextBlock block={block} />;
        }
      })()}
    </div>
  );
}

// ==========================================
// PENINGKATAN BLOK MARKDOWN KUSTOM
// ==========================================

/**
 * Renders heading blocks (H1, H2, H3) with markdown support.
 */
function HeadingBlock({ block }: { block: ContentBlock }) {
  const level = block.level || 2;
  const Tag = level === 3 ? "h3" : level === 1 ? "h1" : "h2";
  const className = level === 3
    ? "text-xl uppercase tracking-tight text-foreground mt-6 mb-3 font-japanese"
    : level === 1
    ? "text-3xl uppercase tracking-tight text-foreground mt-10 mb-5 font-japanese"
    : "text-2xl uppercase tracking-tight text-foreground mt-8 mb-4 border-b border-border pb-2 font-japanese";

  return (
    <Tag className={className}>
      {renderWithMarkdown(block.content || "")}
    </Tag>
  );
}

/**
 * Renders ordered or unordered list blocks.
 */
function ListBlock({ block }: { block: ContentBlock }) {
  const items = block.items || [];
  const listType = block.listType || "bullet";
  const Tag = listType === "number" ? "ol" : "ul";
  const className = listType === "number"
    ? "list-decimal pl-6 mb-4 space-y-2 text-lg text-foreground/90 font-japanese"
    : "list-disc pl-6 mb-4 space-y-2 text-lg text-foreground/90 font-japanese";

  return (
    <Tag className={className}>
      {items.map((item: string, pos: number) => (
        <li key={pos} className="leading-relaxed">
          {renderWithMarkdown(item)}
        </li>
      ))}
    </Tag>
  );
}



// ==========================================
// BLOK TEKS
// ==========================================

/**
 * Renders standard text blocks, supporting furigana, translations, and example sentences.
 */
function TextBlock({ block }: { block: ContentBlock }) {
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

// ==========================================
// BLOK CALLOUT
// ==========================================









// ==========================================
// BLOK GAMBAR
// ==========================================

/**
 * Renders image blocks with optional captions.
 */
function ImageBlock({ block }: { block: ContentBlock }) {
  if (!block.content) return null;
  return (
    <figure className="w-full mb-10">
      <div className="relative w-full rounded-2xl overflow-hidden border border-border/50 dark:border-white/10 shadow-[0_4px_25px_rgba(0,0,0,0.015)] bg-card group">
        <Image
          src={block.content}
          alt={block.title || "Gambar pelajaran"}
          width={1200}
          height={1200}
          className="w-full h-auto max-h-[60vh] object-contain transition-transform duration-700 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
        />
      </div>
      {block.title && (
        <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-center mt-6">
          {block.title}
        </figcaption>
      )}
    </figure>
  );
}

// ==========================================
// BAGIAN CONTOH
// ==========================================

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