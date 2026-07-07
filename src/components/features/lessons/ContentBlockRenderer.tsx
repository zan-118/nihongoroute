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
import Link from "next/link";
import { AlertCircle, Info, BookOpen, AlertTriangle, Globe, Hourglass, BarChart, ChevronDown } from "lucide-react";
import { ContentBlock, ExampleSentence } from "@/types/database";
import FuriganaDisplay from "@/components/ui/FuriganaDisplay";
import { SmartJapanese } from "@/components/ui/SmartJapanese";
import TTSReader from "@/components/features/tools/tts/TTSReader";
import { OfflineAudio } from "@/components/ui/OfflineAudio";
import { detectVoice, fetchTTSAudio, speakWithWebSpeech } from "@/lib/tts";
import { PortableText } from "next-sanity";
import { VocabSection, VocabLessonItem } from "./VocabSection";
import { KanjiSection, KanjiLessonItem } from "./KanjiSection";

// ==========================================
// PENDUKUNG DESAIN & MARKDOWN PARSER
// ==========================================
function parseInlineStyles(text: string): React.ReactNode[] {
  if (!text || typeof text !== "string") return [];
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*|\[.*?\]\(.*?\))/g);
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
        <code 
          key={index} 
          className="px-1.5 py-0.5 rounded text-primary font-mono text-xs md:text-sm font-bold mx-0.5"
          style={{ backgroundColor: "rgb(var(--primary-rgb)/0.05)", borderColor: "rgb(var(--primary-rgb)/0.1)", borderWidth: "1px" }}
        >
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
    if (part.startsWith("[") && part.includes("](")) {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        const [, linkText, url] = match;
        const isExternal = url.startsWith("http");
        if (isExternal) {
          return (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-bold transition-all"
            >
              {linkText}
            </a>
          );
        } else {
          return (
            <Link
              key={index}
              href={url}
              className="text-primary hover:underline font-bold transition-all"
            >
              {linkText}
            </Link>
          );
        }
      }
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

function TableBlock({ block }: { block: ContentBlock }) {
  const headers = block.headers || [];
  const rows = block.rows || [];
  const hasHeaders = headers.some(h => h.trim() !== "");

  return (
    <div className="my-4 overflow-x-auto rounded-lg border border-border bg-card/5 shadow-[0_0_20px_rgb(var(--primary-rgb)/0.02)] select-text">
      <table className="w-full text-left border-collapse text-[13px] md:text-sm">
        {hasHeaders && (
          <thead>
            <tr className="border-b border-border bg-primary/5">
              {headers.map((col: string, idx: number) => (
                <th key={`th-${idx}`} className="px-4 py-2.5 font-black text-primary uppercase tracking-wider select-none">
                  {renderWithMarkdown(col)}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-border/40">
          {rows.map((row: string[], rowIdx: number) => (
            <tr key={`tr-${rowIdx}`} className="hover:bg-card/10 transition-colors">
              {row.map((col: string, colIdx: number) => (
                <td key={`td-${colIdx}`} className="px-4 py-3 font-semibold text-muted-foreground leading-relaxed">
                  {renderWithMarkdown(col)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
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
function CalloutBlock({ block }: { block: ContentBlock }) {
  return (
    <div className="flex gap-4 p-6 rounded-2xl md:rounded-3xl shadow-[0_8px_30px_rgb(var(--primary-rgb)/0.03)] glass relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
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
// PARSER CATATAN TATA BAHASA (GRAMMAR NOTES)
// ==========================================
function parseNotesToJSX(notes: string): React.ReactNode {
  const lines = notes.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: { type: "ul" | "ol"; items: string[] } | null = null;
  let currentTable: string[] | null = null;

  const flushList = (key: string) => {
    if (!currentList) return;
    const ListTag = currentList.type;
    elements.push(
      <ListTag 
        key={key} 
        className={
          currentList.type === "ul" 
            ? "list-disc pl-6 my-3 space-y-1.5 select-text text-sm md:text-base text-muted-foreground/90" 
            : "list-decimal pl-6 my-3 space-y-1.5 select-text text-sm md:text-base text-muted-foreground/90"
        }
      >
        {currentList.items.map((item, idx) => (
          <li key={idx} className="leading-relaxed">
            {parseInlineStyles(item)}
          </li>
        ))}
      </ListTag>
    );
    currentList = null;
  };

  const flushTable = (key: string) => {
    if (!currentTable || currentTable.length < 2) return;
    
    const headerLine = currentTable[0];
    const headerCols = headerLine.split("|").slice(1, -1).map(c => c.trim());
    
    const rowLines = currentTable.slice(2);
    const rows = rowLines.map(line => line.split("|").slice(1, -1).map(c => c.trim()));

    elements.push(
      <div key={key} className="my-4 overflow-x-auto rounded-lg border border-border bg-card/5 shadow-[0_0_20px_rgb(var(--primary-rgb)/0.02)] select-text">
        <table className="w-full text-left border-collapse text-[11px] md:text-xs">
          <thead>
            <tr className="border-b border-border bg-primary/5">
              {headerCols.map((col, idx) => (
                <th key={`th-${idx}`} className="px-3 py-2 font-black text-primary uppercase tracking-wider select-none">
                  {parseInlineStyles(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {rows.map((row, rowIdx) => (
              <tr key={`tr-${rowIdx}`} className="hover:bg-card/10 transition-colors">
                {row.map((col, colIdx) => (
                  <td key={`td-${colIdx}`} className="px-3 py-2.5 font-semibold text-muted-foreground leading-relaxed">
                    {parseInlineStyles(col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    currentTable = null;
  };

  const flushAll = (key: string) => {
    flushList(`${key}-list`);
    flushTable(`${key}-table`);
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushAll(`flush-${index}`);
      return;
    }

    if (trimmed.startsWith("|")) {
      flushList(`table-interrupt-list-${index}`);
      if (!currentTable) {
        currentTable = [trimmed];
      } else {
        currentTable.push(trimmed);
      }
      return;
    }

    flushTable(`table-interrupt-other-${index}`);

    if ((trimmed.startsWith("*") && !trimmed.startsWith("**")) || trimmed.startsWith("-")) {
      const itemText = trimmed.substring(1).trim();
      if (!currentList || currentList.type !== "ul") {
        flushList(`list-interrupt-other-${index}`);
        currentList = { type: "ul", items: [itemText] };
      } else {
        currentList.items.push(itemText);
      }
      return;
    }

    const matchOrdered = trimmed.match(/^(\d+)\.\s(.*)/);
    if (matchOrdered) {
      const itemText = matchOrdered[2].trim();
      if (!currentList || currentList.type !== "ol") {
        flushList(`list-interrupt-other-${index}`);
        currentList = { type: "ol", items: [itemText] };
      } else {
        currentList.items.push(itemText);
      }
      return;
    }

    flushList(`list-flush-${index}`);

    if (trimmed.startsWith("⚠️")) {
      elements.push(
        <div 
          key={`warning-${index}`} 
          className="p-3 md:p-4 rounded-xl border border-destructive/20 bg-[rgb(var(--destructive-rgb)/0.05)] text-foreground/90 font-semibold my-4 text-xs md:text-sm flex gap-2.5 items-start shadow-[0_0_20px_rgb(var(--destructive-rgb)/0.05)] select-text"
        >
          <span className="text-destructive text-base mt-0.5 select-none">⚠️</span>
          <div className="flex-1 leading-relaxed">
            {parseInlineStyles(trimmed.substring(2).trim())}
          </div>
        </div>
      );
      return;
    }

    elements.push(
      <p key={`para-${index}`} className="font-semibold text-muted-foreground/85 leading-relaxed text-sm md:text-base">
        {parseInlineStyles(trimmed)}
      </p>
    );
  });

  flushAll("final");
  return <div className="space-y-3">{elements}</div>;
}

// ==========================================
// BLOK TATA BAHASA
// ==========================================
function GrammarBlock({ block }: { block: ContentBlock }) {
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

// ==========================================
// BLOK PERCAKAPAN
// ==========================================
function DialogueBlock({ block }: { block: ContentBlock }) {
  const lines = React.useMemo(() => {
    return block.content
      ? block.content.split("\n").filter(Boolean).map((line: string, i: number) => {
          const parts = line.split(/[：:]/);
          const furiLine = block.furigana?.split("\n")[i] || "";
          const furiParts = furiLine.split(/[：:]/);
          
          // Speaker undefined (bukan string fallback) agar detectVoice pakai rotasi fallbackIndex
          // — selaras dengan generate_sanity_dialogs.js yang juga set speaker = null untuk baris tanpa label
          const rawSpeaker = parts.length > 1 ? parts[0].trim() : undefined;
          
          return {
            speaker: rawSpeaker,
            text: parts.length > 1 ? parts.slice(1).join("：").trim() : line.trim(),
            furigana: furiParts.length > 1 ? furiParts.slice(1).join("：").trim() : furiLine.trim(),
          };
        })
      : [];
  }, [block.content, block.furigana]);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playingIndex, setPlayingIndex] = React.useState<number | null>(null);
  const currentAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const playTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPlayback = React.useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
    }
    setIsPlaying(false);
    setPlayingIndex(null);
  }, []);

  async function playLine(index: number) {
    if (index >= lines.length) {
      stopPlayback();
      return;
    }
    setPlayingIndex(index);
    setIsPlaying(true);

    const line = lines[index];
    const voice = detectVoice(line.speaker, index);

    const fallbackWebSpeech = () => {
      speakWithWebSpeech(
        line.text,
        voice,
        1,
        () => {
          playTimeoutRef.current = setTimeout(() => {
            playLine(index + 1);
          }, 800);
        },
        () => {
          stopPlayback();
        }
      );
    };

    try {
      const audioUrl = await fetchTTSAudio(line.text, voice, "medium");
      if (audioUrl) {
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
        }
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;
        audio.play();

        audio.onended = () => {
          playTimeoutRef.current = setTimeout(() => {
            playLine(index + 1);
          }, 800);
        };

        audio.onerror = () => {
          fallbackWebSpeech();
        };
      } else {
        fallbackWebSpeech();
      }
    } catch {
      fallbackWebSpeech();
    }
  }

  const togglePlayAll = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      playLine(0);
    }
  };

  React.useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
      }
    };
  }, []);

  const audioSrc = (block.audio_url || block.audioUrl) as string | undefined;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        {block.title ? (
          <h3 className="text-xs text-muted-foreground uppercase tracking-widest">
            {block.title}
          </h3>
        ) : (
          <div />
        )}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          {audioSrc && (
            <OfflineAudio 
              src={audioSrc}
              controls
              className="w-full sm:w-64 h-10 filter brightness-90 contrast-125 shrink-0"
            />
          )}
          {lines.length > 0 && (
            <button
              onClick={togglePlayAll}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm shrink-0 ${
                isPlaying
                  ? "bg-success/15 border-success/30 text-success"
                  : "bg-muted/50 border-border text-muted-foreground hover:text-success hover:bg-success/5 hover:border-success/20"
              }`}
              aria-label={isPlaying ? "Jeda Dialog AI" : "Putar Semua Dialog AI"}
            >
              {isPlaying ? (
                <>
                  <span className="size-2 bg-success rounded-full animate-ping" />
                  <span>Jeda AI</span>
                </>
              ) : (
                <>
                  <svg className="size-3 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  <span>Putar Dialog (AI)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4 rounded-2xl md:rounded-3xl p-6 shadow-[0_10px_35px_rgb(var(--foreground-rgb)/0.01)] glass">
        {lines.map((line: { speaker: string | undefined; text: string; furigana?: string }, pos: number) => {
          const isLinePlaying = playingIndex === pos;
          return (
            <div 
              key={`dialogue-${pos}`} 
              className={`flex gap-4 items-start group p-2.5 rounded-lg transition-all duration-300 ${
                isLinePlaying 
                  ? "bg-secondary/10 border-l-4 border-l-secondary pl-3.5 shadow-[0_0_15px_rgb(var(--secondary-rgb)/0.05)]" 
                  : "hover:bg-muted/10"
              }`}
            >
              <span 
                className="text-[10px] font-black text-secondary uppercase tracking-widest px-2.5 py-1 rounded-xl h-fit flex-shrink-0 mt-1 border"
                style={{ backgroundColor: "rgb(var(--secondary-rgb)/0.15)", borderColor: "rgb(var(--secondary-rgb)/0.25)" }}
              >
                {line.speaker}
              </span>
              <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                <div 
                  className="text-xl font-japanese font-medium text-foreground leading-relaxed cursor-pointer flex-1"
                  onClick={async () => {
                    if (isPlaying) {
                      stopPlayback();
                      playLine(pos);
                    } else {
                      const voice = detectVoice(line.speaker, pos);
                      try {
                        const audioUrl = await fetchTTSAudio(line.text, voice, "medium");
                        if (audioUrl) {
                          if (currentAudioRef.current) {
                            currentAudioRef.current.pause();
                          }
                          const audio = new Audio(audioUrl);
                          currentAudioRef.current = audio;
                          audio.play();
                        } else {
                          speakWithWebSpeech(line.text, voice, 1);
                        }
                      } catch {
                        speakWithWebSpeech(line.text, voice, 1);
                      }
                    }
                  }}
                >
                  <SmartJapanese word={line.text} furigana={line.furigana} />
                </div>
                <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 shrink-0 self-center">
                  <TTSReader text={line.text} speaker={line.speaker} minimal />
                </div>
              </div>
            </div>
          );
        })}
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
    <figure className="w-full mb-10">
      <div className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden border border-border/80 shadow-[0_15px_40px_rgba(var(--primary-rgb),0.1)] glass group">
        <Image
          src={block.content}
          alt={block.title || "Gambar pelajaran"}
          width={1200}
          height={1200}
          className="w-full h-auto max-h-[60vh] object-contain transition-transform duration-700 group-hover:scale-[1.02]"
          unoptimized
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

