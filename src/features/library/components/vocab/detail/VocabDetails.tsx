"use client";

/**
 * @file VocabDetails.tsx
 * @description Komponen penayang atribut detail kosakata (Vocab Details).
 * Menampilkan lencana (badge) part of speech (hinshi), level JLPT, dan informasi pitch accent.
 */

// IMPOR UTAMA

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ANTARMUKA & TIPE DATA

/**
 * Properties for VocabDetails component.
 * @property {string} [hinshi] - Part of speech classification.
 * @property {string} [jlptLevel] - Japanese Language Proficiency Test level.
 * @property {string} [pitchAccent] - Pitch accent pattern information.
 */
interface VocabDetailsProps {
 hinshi?: string;
 jlptLevel?: string;
 pitchAccent?: string;
}

// KOMPONEN UTAMA: VocabDetails

/**
 * Renders vocabulary metadata badges including part of speech, JLPT level, and pitch accent.
 * 
 * @param {VocabDetailsProps} props - Component properties.
 * @returns {JSX.Element} Card component containing metadata badges.
 */
export function VocabDetails({ hinshi, jlptLevel, pitchAccent }: VocabDetailsProps) {
 return (
 <Card className="p-6 bg-card/20 border-border rounded-2xl md:rounded-3xl hover:border-primary/40 transition-all group overflow-hidden relative flex flex-col justify-center gap-4 font-sans glass shadow-sm">
 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Atribut Kata</span>
 
 {/* Container Lencana Atribut */}
 <div className="flex flex-wrap gap-2">
 {/* Fallback to default label if part of speech is missing */}
 <Badge variant="outline" className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl bg-primary/10 text-primary border-primary/20">
 {hinshi || "Kosakata"}
 </Badge>
 {/* Render JLPT badge only if level is provided */}
 {jlptLevel && (
 <Badge variant="outline" className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl bg-secondary/10 text-secondary border-secondary/20">
 JLPT {jlptLevel}
 </Badge>
 )}
 {/* Render pitch accent badge only if pattern is provided */}
 {pitchAccent && (
 <Badge variant="secondary" className="px-3 py-1.5 text-[9px] font-bold tracking-widest bg-muted border-border">
 PITCH: {pitchAccent}
 </Badge>
 )}
 </div>
 </Card>
 );
}