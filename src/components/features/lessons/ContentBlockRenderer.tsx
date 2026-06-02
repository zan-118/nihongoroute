"use client";

/**
 * @file ContentBlockRenderer.tsx
 * @description Komponen perender blok konten pelajaran untuk NihongoRoute.
 * Menangani rendering teks kaya (Rich Text) dari Sanity Portable Text serta berbagai blok kustom seperti
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
import { AlertCircle, Info, BookOpen, AlertTriangle, Globe, Hourglass, BarChart } from "lucide-react";
import { ContentBlock, ExampleSentence } from "@/types/database";
import FuriganaDisplay from "@/components/ui/FuriganaDisplay";
import { SmartJapanese } from "@/components/ui/SmartJapanese";
import TTSReader from "@/components/features/tools/tts/TTSReader";
import { PortableText } from "next-sanity";
import { VocabSection, VocabLessonItem } from "./VocabSection";
import { KanjiSection, KanjiLessonItem } from "./KanjiSection";

// ==========================================
// PENDUKUNG DESAIN & MARKDOWN PARSER
// ==========================================
function parseInlineStyles(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="text-foreground font-black">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="px-1.5 py-0.5 rounded bg-primary/5 border border-primary/10 text-primary font-mono text-xs md:text-sm font-bold mx-0.5">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={index} className="italic text-muted-foreground/90 font-medium">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

function renderWithMarkdown(children: React.ReactNode): React.ReactNode {
  if (!children) return children;

  if (typeof children === "string") {
    return parseInlineStyles(children);
  }

  if (Array.isArray(children)) {
    return children.map((child, i) => {
      const parsed = renderWithMarkdown(child);
      if (React.isValidElement(parsed)) {
        return React.cloneElement(parsed, { key: parsed.key ?? i });
      }
      return parsed;
    });
  }

  if (React.isValidElement(children)) {
    const props = children.props as { children?: React.ReactNode; [key: string]: unknown };
    if (props && "children" in props) {
      return React.cloneElement(
        children,
        { key: children.key },
        renderWithMarkdown(props.children)
      );
    }
  }

  return children;
}

// ==========================================
// ANTARMUKA & PROPS (INTERFACES)
// ==========================================
interface ContentBlockRendererProps {
  blocks: ContentBlock[];
  vocabList?: VocabLessonItem[];
  kanjiList?: KanjiLessonItem[];
}

interface SanityPortableTextBlock {
  _type?: string;
  _key?: string;
  [key: string]: unknown;
}

interface PortableTextValueProps {
  value: {
    _type: string;
    [key: string]: unknown;
  };
}

interface PortableTextChildrenProps {
  children?: React.ReactNode;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
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
        <h2 className="text-2xl font-black uppercase tracking-tight text-foreground mt-8 mb-4 border-b border-border pb-2 font-japanese">
          {renderWithMarkdown(children)}
        </h2>
      ),
      h3: ({ children }: PortableTextChildrenProps) => (
        <h3 className="text-xl font-black uppercase tracking-tight text-foreground mt-6 mb-3 font-japanese">
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

  return (
    <div className="space-y-10">
      {sorted.map((block, idx) => (
        <BlockItem 
          key={block.id || idx} 
          block={block} 
          components={components}
          vocabList={vocabList}
          kanjiList={kanjiList}
        />
      ))}
    </div>
  );
}

// ==========================================
// LENCANA PEDAGOGIS (PEDAGOGICAL BADGES)
// ==========================================
function PedagogicalBadges({ block }: { block: ContentBlock }) {
  const { pedagogical_role, difficulty_stage, estimated_reading_time } = block;

  if (!pedagogical_role && !difficulty_stage && !estimated_reading_time) return null;

  const roleMeta = {
    core_explanation: {
      label: "Penjelasan Utama",
      icon: BookOpen,
      className: "bg-primary/10 text-primary border border-primary/20",
    },
    practical_scenario: {
      label: "Skenario Praktis",
      icon: Globe,
      className: "bg-success/10 text-success border border-success/20",
    },
    pitfall_alert: {
      label: "Tips & Perangkap",
      icon: AlertTriangle,
      className: "bg-destructive/10 text-destructive border border-destructive/20",
    },
    cultural_note: {
      label: "Catatan Budaya",
      icon: Info,
      className: "bg-warning/10 text-warning border border-warning/20",
    },
  };

  const stageMeta = {
    introducing: {
      label: "Tahap: Pengenalan",
      className: "bg-muted text-muted-foreground border border-border",
    },
    guided: {
      label: "Tahap: Terbimbing",
      className: "bg-secondary/15 text-secondary border border-secondary/20",
    },
    autonomous: {
      label: "Tahap: Mandiri",
      className: "bg-success/15 text-success border border-success/20",
    },
  };

  const role = pedagogical_role ? roleMeta[pedagogical_role] : null;
  const stage = difficulty_stage ? stageMeta[difficulty_stage] : null;

  return (
    <div className="flex flex-wrap gap-2 mb-3.5 items-center">
      {role && (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${role.className}`}>
          <role.icon className="size-3.5" />
          {role.label}
        </span>
      )}
      {stage && (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${stage.className}`}>
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
function PortableTextBlockRenderer({ block, components }: { block: SanityPortableTextBlock; components: React.ComponentProps<typeof PortableText>["components"] }) {
  return (
    <div className="prose-custom max-w-none">
      <PortableText 
        value={[block as unknown as Record<string, unknown>] as unknown as React.ComponentProps<typeof PortableText>["value"]} 
        components={components} 
      />
    </div>
  );
}

// ==========================================
// RENDERER ITEM BLOK (BLOCK ITEM)
// ==========================================
function BlockItem({ 
  block,
  components,
  vocabList = [],
  kanjiList = []
}: { 
  block: ContentBlock;
  components: React.ComponentProps<typeof PortableText>["components"];
  vocabList?: VocabLessonItem[];
  kanjiList?: KanjiLessonItem[];
}) {
  const rawBlock = block as unknown as Record<string, unknown>;
  const type = block.type || rawBlock._type || "text";

  const isPortableText = rawBlock._type === "block" || 
                         rawBlock._type === "dialogueBlock" || 
                         rawBlock._type === "grammarBlock" || 
                         rawBlock._type === "calloutBlock" || 
                         rawBlock._type === "imageBlock" ||
                         rawBlock._type === "vocabBlock" ||
                         rawBlock._type === "kanjiBlock";

  return (
    <div className="group relative">
      <PedagogicalBadges block={block} />
      {(() => {
        if (isPortableText) {
          return <PortableTextBlockRenderer block={block as unknown as SanityPortableTextBlock} components={components} />;
        }

        switch (type as string) {
          case "callout":
            return <CalloutBlock block={block} />;
          case "dialogue":
            return <DialogueBlock block={block} />;
          case "grammar":
            return <GrammarBlock block={block} />;
          case "image":
            return <ImageBlock block={block} />;
          case "vocab":
          case "vocabBlock":
            return <VocabSection vocabList={vocabList} />;
          case "kanji":
          case "kanjiBlock":
            return <KanjiSection kanjiList={kanjiList} />;
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
// BLOK TEKS
// ==========================================
function TextBlock({ block }: { block: ContentBlock }) {
  return (
    <div className="space-y-4">
      {block.title && (
        <h3 className="text-xl font-black uppercase tracking-tight text-foreground">
          {block.title}
        </h3>
      )}
      {block.content && (
        <div className="space-y-3">
          {block.content.split("\n").filter(Boolean).map((line: string, pos: number) => (
            <div key={`text-${pos}`} className="text-lg leading-relaxed text-foreground/90 font-japanese">
              <SmartJapanese 
                word={line} 
                furigana={block.furigana?.split("\n")[pos] || ""} 
              />
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
function CalloutBlock({ block }: { block: ContentBlock }) {
  return (
    <div className="flex gap-4 p-6 rounded-[2rem] border border-border bg-card/45 backdrop-blur-md shadow-[0_8px_30px_rgba(var(--primary-rgb),0.03)] glass relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
      <Info className="size-5 text-primary flex-shrink-0 mt-0.5" />
      <div className="space-y-2">
        {block.title && (
          <p className="text-xs font-black uppercase tracking-wider text-primary">{block.title}</p>
        )}
        {block.content && (
          <p className="text-[15px] text-foreground/90 leading-relaxed font-medium">{parseInlineStyles(block.content)}</p>
        )}
        {block.translation && (
          <p className="text-xs text-muted-foreground italic border-t border-border/50 pt-2.5 mt-2.5 whitespace-pre-wrap">{parseInlineStyles(block.translation)}</p>
        )}
      </div>
    </div>
  );
}

// ==========================================
// BLOK TATA BAHASA
// ==========================================
function GrammarBlock({ block }: { block: ContentBlock }) {
  return (
    <div className="space-y-5 border border-border rounded-[2.5rem] bg-card/20 backdrop-blur-xl shadow-[0_15px_35px_rgba(var(--primary-rgb),0.02)] glass overflow-hidden group hover:border-primary/35 transition-all duration-500">
      <div className="bg-primary/5 px-6 py-4 border-b border-border flex justify-between items-center">
        <div>
          <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">
            Pola Kalimat (Grammar)
          </span>
          {block.title && (
            <h3 className="text-lg font-black text-foreground mt-1.5 tracking-tight">{block.title}</h3>
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
          <p className="text-sm text-muted-foreground font-medium leading-relaxed bg-muted/10 border-l-4 border-secondary/60 pl-4 py-2.5 rounded-r-xl whitespace-pre-wrap">
            {parseInlineStyles(block.translation)}
          </p>
        )}
        {block.examples && block.examples.length > 0 && (
          <ExamplesSection examples={block.examples} />
        )}
      </div>
    </div>
  );
}

// ==========================================
// BLOK PERCAKAPAN
// ==========================================
function DialogueBlock({ block }: { block: ContentBlock }) {
  const lines = block.content
    ? block.content.split("\n").filter(Boolean).map((line: string, i: number) => {
        const parts = line.split(/[：:]/);
        const furiLine = block.furigana?.split("\n")[i] || "";
        const furiParts = furiLine.split(/[：:]/);
        
        return {
          speaker: parts.length > 1 ? parts[0].trim() : `話者${i + 1}`,
          text: parts.length > 1 ? parts.slice(1).join("：").trim() : line.trim(),
          furigana: furiParts.length > 1 ? furiParts.slice(1).join("：").trim() : furiLine.trim(),
        };
      })
    : [];

  return (
    <div className="space-y-4">
      {block.title && (
        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">
          {block.title}
        </h3>
      )}
      <div className="space-y-4 border border-border rounded-[2rem] p-6 bg-card/10 backdrop-blur-lg shadow-[0_10px_35px_rgba(0,0,0,0.01)] glass">
        {lines.map((line: { speaker: string; text: string; furigana?: string }, pos: number) => (
          <div key={`dialogue-${pos}`} className="flex gap-4 items-start group">
            <span className="text-[10px] font-black text-secondary uppercase tracking-widest bg-secondary/15 border border-secondary/25 px-2.5 py-1 rounded-xl h-fit flex-shrink-0 mt-1">
              {line.speaker}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-xl font-japanese font-medium text-foreground leading-relaxed flex items-center gap-3 flex-wrap">
                <SmartJapanese word={line.text} furigana={line.furigana} />
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0">
                  <TTSReader text={line.text} speaker={line.speaker} minimal />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {block.translation && (
        <p className="text-sm text-muted-foreground italic px-4 border-l-2 border-border/70 whitespace-pre-wrap">{parseInlineStyles(block.translation)}</p>
      )}
    </div>
  );
}

// ==========================================
// BLOK GAMBAR
// ==========================================
function ImageBlock({ block }: { block: ContentBlock }) {
  if (!block.content) return null;
  return (
    <figure className="space-y-2">
      <div className="relative rounded-2xl overflow-hidden border border-border">
        <Image
          src={block.content}
          alt={block.title || "Gambar pelajaran"}
          width={800}
          height={450}
          className="w-full object-cover"
          unoptimized
        />
      </div>
      {block.title && (
        <figcaption className="text-xs text-muted-foreground text-center">
          {block.title}
        </figcaption>
      )}
    </figure>
  );
}

// ==========================================
// BAGIAN CONTOH
// ==========================================
function ExamplesSection({ examples }: { examples: ExampleSentence[] }) {
  if (!examples?.length) return null;
  return (
    <div className="space-y-3 mt-4">
      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
        Contoh Kalimat (Examples)
      </p>
      <div className="space-y-3">
        {examples.map((ex) => (
          <div key={ex.jp} className="border border-border rounded-2xl p-4 space-y-2 bg-card/10 hover:bg-card/20 hover:border-primary/20 transition-all duration-300 group">
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

