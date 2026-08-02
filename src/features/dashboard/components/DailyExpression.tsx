/**
 * @file DailyExpression.tsx
 * @description Dashboard spotlight component displaying "Expression of the Day".
 * Displays Japanese text, readings (Romaji/Kana), and Indonesian translations fetched from Supabase.
 * @module features/dashboard/components
 */

// ==========================================
// Import & Dependencies
// ==========================================
import { RandomExpression } from "@/actions/expressions.actions";
import { Sparkles } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";

// ==========================================
// Component Props Interface
// ==========================================
/**
 * Props for DailyExpression component.
 */
interface DailyExpressionProps {
 /** Expression data from CMS. Can be null. */
 expression: RandomExpression | null;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * Show random Japanese expression. Display text, reading, translation.
 */
export default function DailyExpression({ expression }: DailyExpressionProps) {
 // No expression data. Render nothing.
 if (!expression) return null;

 // Get Indonesian translation. Fallback to English meaning.
 const meaningId = expression.indonesia[0] ?? expression.meanings[0] ?? "";

 return (
 <div className="relative group">
 {/* Tombou Register Mark */}
 <div className="absolute -top-[6px] -right-[6px] w-[14px] h-[14px] pointer-events-none z-20">
 <div className="absolute top-0 right-0 w-[14px] h-[1px] bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
 <div className="absolute top-0 right-0 w-[1px] h-[14px] bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
 </div>

 <Card
 aria-label="Ungkapan Hari Ini"
 className="rounded-2xl border border-border/50 dark:border-white/10 bg-card p-6 md:p-8 relative overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.015)] group-hover:border-primary/45 transition-colors duration-500"
 >
 {/* Pola tradisional Asanoha Jepang */}
 <div className="absolute inset-0 bg-asanoha pointer-events-none opacity-30" />

 {/* Bagian Header */}
 <div className="relative z-10 flex items-center gap-2 mb-5">
 <div className="flex items-center justify-center size-7 rounded-lg bg-primary/10">
 <Sparkles size={14} className="text-primary" />
 </div>
 <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
 Ungkapan Hari Ini
 </span>
 {expression.jlpt_level && (
 <span className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded-[4px] bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
 {expression.jlpt_level}
 </span>
 )}
 </div>

 {/* Teks Ungkapan Utama */}
 <div className="relative z-10 space-y-3 text-center py-4 transition-transform duration-300 hover:scale-[1.02]">
 <p
 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-tight"
 lang="ja"
 style={{ fontFamily: "var(--font-noto-serif-jp)" }}
 aria-label={`Ungkapan: ${expression.text}`}
 >
 {expression.text}
 </p>
 <p
 className="text-xs md:text-sm text-primary/80 font-black tracking-widest font-mono uppercase"
 lang="ja"
 >
 {expression.reading}
 </p>
 </div>

 {/* Pembatas Visual */}
 <div className="relative z-10 my-4 h-[1px] " />

 {/* Arti Bahasa Indonesia */}
 <p className="relative z-10 text-center text-sm text-foreground/80 leading-relaxed font-bold tracking-wide italic">
 "{meaningId}"
 </p>
 </Card>
 </div>
 );
}