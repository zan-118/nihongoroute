import React from "react";
import { Information } from "@/components/ui/icons";
import { ContentBlock } from "@/types/database";
import { parseInlineStyles } from "@/lib/utils/markdown-parser";

interface CalloutBlockProps {
 block: ContentBlock;
}

export function CalloutBlock({ block }: CalloutBlockProps) {
 return (
 <div className="flex gap-4 p-6 rounded-2xl shadow-sm bg-card border border-border/50 dark:border-white/10 relative overflow-hidden group hover:border-primary/45 transition-all duration-500">
 <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
 <Information className="size-5 text-primary flex-shrink-0 mt-0.5" />
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
