import React from "react";
import Link from "next/link";
import { ChevronDown } from "@/components/ui/icons";
import { ContentBlock, ExampleSentence } from "@/types/database";
import { SmartJapanese, FuriganaDisplay } from "@/components/ui/japanese";
import { TTSReader } from "@/features/media";
import { parseInlineStyles, parseNotesToJSX } from "@/lib/utils/markdown-parser";

interface GrammarBlockProps {
 block: ContentBlock;
}

export function GrammarBlock({ block }: GrammarBlockProps) {
 const raw = block as ContentBlock & { notes?: string; slug?: string };
 const notes = raw.notes;
 const slug = raw.slug;

 return (
 <div className="relative group/grammar">
 {/* Tombou Register Mark */}
 <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 pointer-events-none z-20">
 <div className="absolute top-0 right-0 w-3.5 h-px bg-primary/20 group-hover/grammar:bg-primary transition-colors duration-500" />
 <div className="absolute top-0 right-0 w-px h-3.5 bg-primary/20 group-hover/grammar:bg-primary transition-colors duration-500" />
 </div>

 <div className="space-y-5 rounded-2xl bg-card border border-border/50 dark:border-white/10 shadow-sm overflow-hidden group transition-all duration-500">
 <div 
 className="px-6 py-4 border-b border-border flex justify-between items-center"
 style={{ backgroundColor: "hsl(var(--primary)/0.05)" }}
 >
 <div>
 <span 
 className="text-[9px] font-black text-primary uppercase tracking-widest px-2 py-0.5 rounded-[4px]"
 style={{ backgroundColor: "hsl(var(--primary)/0.1)" }}
 >
 Pola Kalimat (Grammar)
 </span>
 {block.title && (
 <h3 className="text-lg text-foreground mt-1.5 tracking-tight font-bold">{block.title}</h3>
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
 className="text-sm text-muted-foreground font-medium leading-relaxed pl-4 py-2.5 rounded-r-lg whitespace-pre-wrap border-l-4"
 style={{ 
 backgroundColor: "hsl(var(--muted)/0.1)", 
 borderLeftColor: "hsl(var(--secondary)/0.6)" 
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
 <summary className="flex items-center justify-between cursor-pointer text-xs font-black uppercase tracking-widest text-primary hover:opacity-80 transition-opacity select-none">
 <span>Catatan Tambahan & Tabel Penjelasan</span>
 <span className="transition-transform duration-300 group-open:rotate-180">
 <ChevronDown className="size-4" />
 </span>
 </summary>
 <div className="mt-4 pt-3 border-t border-border/30 text-sm md:text-base leading-relaxed text-foreground select-text">
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
 className="text-xs font-black uppercase tracking-widest text-primary hover:opacity-80 transition-opacity inline-flex items-center gap-1.5 select-none"
 >
 <span>Pelajari Lebih Detail di Halaman Pola →</span>
 </Link>
 </div>
 )}
 </div>
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
 style={{ backgroundColor: "hsl(var(--card)/0.1)" }}
 onMouseEnter={(e) => {
 e.currentTarget.style.backgroundColor = "hsl(var(--card)/0.2)";
 e.currentTarget.style.borderColor = "hsl(var(--primary)/0.2)";
 }}
 onMouseLeave={(e) => {
 e.currentTarget.style.backgroundColor = "hsl(var(--card)/0.1)";
 e.currentTarget.style.borderColor = "";
 }}
 >
 <div className="flex items-center justify-between gap-4">
 <div className="flex-1 min-w-0">
 <FuriganaDisplay
 text={ex.jp}
 furigana={ex.furigana || ""}
 size="medium"
 />
 </div>
 <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0">
 <TTSReader text={ex.jp} minimal />
 </div>
 </div>
 {ex.romaji && (
 <p className="text-sm text-foreground/80 font-medium tracking-wide">{ex.romaji}</p>
 )}
 <p className="text-sm text-foreground font-medium">{parseInlineStyles(ex.id)}</p>
 </div>
 ))}
 </div>
 </div>
 );
}
