"use client";

/**
 * @file GrammarCard.tsx
 * @description Komponen kartu tampilan ringkas untuk tata bahasa (Grammar Card).
 * Menampilkan ringkasan pola kalimat berarsitektur Double-Bezel (Doppelrand).
 */

import Link from "next/link";
import { ArrowUpRight, BookOpen } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/routes";

interface GrammarCardProps {
 article: {
 id?: string;
 _id: string;
 title: string;
 slug: string;
 };
 index: number;
 selectedLevel: string;
}

/**
 * Double-Bezel Grammar card component.
 * 
 * @param props Component properties.
 * @returns React element.
 */
export function GrammarCard({ article, index, selectedLevel }: GrammarCardProps) {
 return (
 <div
 className="group font-sans border-b border-border/30 py-4 hover:border-emerald-500/50 transition-colors"
 style={{ 
 contentVisibility: 'auto', 
 containIntrinsicSize: '0 80px',
 }}
 >
 <Link href={ROUTES.LIBRARY.GRAMMAR(article.slug || article.id || article._id)} className="block">
 <div className="flex items-center justify-between gap-4">
 <div className="flex items-center gap-3 min-w-0">
 <span className="text-xs font-mono font-bold text-muted-foreground/50 w-8 shrink-0">
 #{String(index + 1).padStart(2, "0")}
 </span>
 <div className="min-w-0">
 <h2 className="text-base sm:text-lg text-foreground font-black font-japanese leading-snug group-hover:text-emerald-500 transition-colors truncate">
 {article.title}
 </h2>
 </div>
 </div>

 <div className="flex items-center gap-3 shrink-0">
 <Badge className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
 {selectedLevel.toUpperCase()}
 </Badge>
 <ArrowUpRight size={14} className="text-muted-foreground/40 group-hover:text-emerald-500 transition-colors" />
 </div>
 </div>
 </Link>
 </div>
 );
}