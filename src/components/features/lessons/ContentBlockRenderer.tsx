"use client";

import React from "react";
import Image from "next/image";
import { AlertCircle, Info, BookOpen, AlertTriangle, Globe, Hourglass, BarChart } from "lucide-react";
import { ContentBlock, ExampleSentence } from "@/types/database";
import FuriganaDisplay from "@/components/ui/FuriganaDisplay";
import { SmartJapanese } from "@/components/ui/SmartJapanese";
import TTSReader from "@/components/features/tools/tts/TTSReader";
import { PortableText } from "next-sanity";
import { VocabSection } from "./VocabSection";
import { KanjiSection } from "./KanjiSection";

interface ContentBlockRendererProps {
  blocks: ContentBlock[];
  vocabList?: any[];
  kanjiList?: any[];
}

export default function ContentBlockRenderer({ 
  blocks,
  vocabList = [],
  kanjiList = []
}: ContentBlockRendererProps) {
  if (!blocks?.length) return null;

  // Define components dynamically to close over vocabList and kanjiList
  const components = {
    types: {
      dialogueBlock: ({ value }: any) => <DialogueBlock block={value} />,
      grammarBlock: ({ value }: any) => <GrammarBlock block={value} />,
      calloutBlock: ({ value }: any) => <CalloutBlock block={value} />,
      imageBlock: ({ value }: any) => <ImageBlock block={value} />,
      vocabBlock: () => <VocabSection vocabList={vocabList} />,
      kanjiBlock: () => <KanjiSection kanjiList={kanjiList} />,
    },
    block: {
      h2: ({ children }: any) => (
        <h2 className="text-2xl font-black uppercase tracking-tight text-foreground mt-8 mb-4 border-b border-border pb-2 font-japanese">
          {children}
        </h2>
      ),
      h3: ({ children }: any) => (
        <h3 className="text-xl font-black uppercase tracking-tight text-foreground mt-6 mb-3 font-japanese">
          {children}
        </h3>
      ),
      normal: ({ children }: any) => (
        <p className="text-lg leading-relaxed text-foreground/90 font-japanese mb-4">
          {children}
        </p>
      ),
      blockquote: ({ children }: any) => (
        <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
          {children}
        </blockquote>
      )
    },
    list: {
      bullet: ({ children }: any) => (
        <ul className="list-disc pl-6 mb-4 space-y-2 text-lg text-foreground/90 font-japanese">
          {children}
        </ul>
      ),
      number: ({ children }: any) => (
        <ol className="list-decimal pl-6 mb-4 space-y-2 text-lg text-foreground/90 font-japanese">
          {children}
        </ol>
      )
    }
  };

  // Sort by order if available
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
          <role.icon className="w-3.5 h-3.5" />
          {role.label}
        </span>
      )}
      {stage && (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${stage.className}`}>
          <BarChart className="w-3 h-3 mr-1" />
          {stage.label}
        </span>
      )}
      {estimated_reading_time && (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted/50 text-muted-foreground border border-border/60">
          <Hourglass className="w-3 h-3 mr-1 text-muted-foreground/75" />
          {estimated_reading_time} menit baca
        </span>
      )}
    </div>
  );
}

function PortableTextBlockRenderer({ block, components }: { block: any; components: any }) {
  return (
    <div className="prose-custom max-w-none">
      <PortableText value={[block]} components={components} />
    </div>
  );
}

function BlockItem({ 
  block,
  components,
  vocabList = [],
  kanjiList = []
}: { 
  block: ContentBlock;
  components: any;
  vocabList?: any[];
  kanjiList?: any[];
}) {
  const type = block.type || (block as any)._type || "text";

  const isPortableText = (block as any)._type === "block" || 
                         (block as any)._type === "dialogueBlock" || 
                         (block as any)._type === "grammarBlock" || 
                         (block as any)._type === "calloutBlock" || 
                         (block as any)._type === "imageBlock" ||
                         (block as any)._type === "vocabBlock" ||
                         (block as any)._type === "kanjiBlock";

  return (
    <div className="group relative">
      <PedagogicalBadges block={block} />
      {(() => {
        if (isPortableText) {
          return <PortableTextBlockRenderer block={block} components={components} />;
        }

        switch (type as any) {
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

// ─── Text Block ───────────────────────────────────────────────────────────────

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
          {block.content.split("\n").filter(Boolean).map((line: string, i: number) => (
            <div key={i} className="text-lg leading-relaxed text-foreground/90 font-japanese">
              <SmartJapanese 
                word={line} 
                furigana={block.furigana?.split("\n")[i] || ""} 
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
        <p className="text-sm text-muted-foreground italic border-l-2 border-border pl-4">
          {block.translation}
        </p>
      )}
      {block.examples && block.examples.length > 0 && (
        <ExamplesSection examples={block.examples} />
      )}
    </div>
  );
}

// ─── Callout Block ────────────────────────────────────────────────────────────

function CalloutBlock({ block }: { block: ContentBlock }) {
  return (
    <div className="flex gap-4 p-5 rounded-xl bg-primary/5 border border-primary/20">
      <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
      <div className="space-y-2">
        {block.title && (
          <p className="text-sm font-bold text-primary">{block.title}</p>
        )}
        {block.content && (
          <p className="text-sm text-foreground/80 leading-relaxed">{block.content}</p>
        )}
        {block.translation && (
          <p className="text-xs text-muted-foreground italic">{block.translation}</p>
        )}
      </div>
    </div>
  );
}

// ─── Grammar Block ────────────────────────────────────────────────────────────

function GrammarBlock({ block }: { block: ContentBlock }) {
  return (
    <div className="space-y-4 border border-border rounded-xl overflow-hidden">
      <div className="bg-muted/30 px-5 py-3 border-b border-border">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Grammar Point
        </span>
        {block.title && (
          <h3 className="text-lg font-black text-foreground mt-0.5">{block.title}</h3>
        )}
      </div>
      <div className="px-5 pb-5 space-y-3">
        {block.content && (
          <div className="font-japanese text-xl leading-relaxed">
            <SmartJapanese word={block.content} furigana={block.furigana} />
          </div>
        )}
        {block.furigana && (
          <div className="text-sm text-muted-foreground font-japanese">{block.furigana}</div>
        )}
        {block.translation && (
          <p className="text-sm text-muted-foreground italic">{block.translation}</p>
        )}
        {block.examples && block.examples.length > 0 && (
          <ExamplesSection examples={block.examples} />
        )}
      </div>
    </div>
  );
}

// ─── Dialogue Block ───────────────────────────────────────────────────────────

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
    <div className="space-y-3">
      {block.title && (
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
          {block.title}
        </h3>
      )}
      <div className="space-y-3 border border-border rounded-xl p-5 bg-muted/10">
        {lines.map((line: { speaker: string; text: string; furigana?: string }, i: number) => (
          <div key={i} className="flex gap-3 group">
            <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-1 rounded h-fit flex-shrink-0 mt-1">
              {line.speaker}
            </span>
            <div className="flex-1">
              <div className="text-lg font-japanese font-medium text-foreground leading-relaxed flex items-center gap-3">
                <SmartJapanese word={line.text} furigana={line.furigana} />
                <TTSReader text={line.text} minimal />
              </div>
            </div>
          </div>
        ))}
      </div>
      {block.translation && (
        <p className="text-sm text-muted-foreground italic px-2">{block.translation}</p>
      )}
    </div>
  );
}

// ─── Image Block ──────────────────────────────────────────────────────────────

function ImageBlock({ block }: { block: ContentBlock }) {
  if (!block.content) return null;
  return (
    <figure className="space-y-2">
      <div className="relative rounded-xl overflow-hidden border border-border">
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

// ─── Examples Section ─────────────────────────────────────────────────────────

function ExamplesSection({ examples }: { examples: ExampleSentence[] }) {
  if (!examples?.length) return null;
  return (
    <div className="space-y-2 mt-3">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        Contoh Kalimat
      </p>
      {examples.map((ex, i) => (
        <div key={i} className="border border-border rounded-lg p-3 space-y-1 bg-background">
          <div className="flex items-center gap-2">
            <FuriganaDisplay
              text={ex.jp}
              furigana={ex.furigana || ""}
              size="medium"
              interactive
            />
            <TTSReader text={ex.jp} minimal />
          </div>
          {ex.romaji && (
            <p className="text-xs text-muted-foreground font-mono">{ex.romaji}</p>
          )}
          <p className="text-sm text-muted-foreground italic">{ex.id}</p>
        </div>
      ))}
    </div>
  );
}
