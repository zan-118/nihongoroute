/**
 * @file DailyExpression.tsx
 * @description Komponen dashboard untuk menampilkan "Ungkapan Hari Ini" secara interaktif.
 * Menerima data ungkapan acak dari database Supabase, menampilkan teks Jepang, cara baca (Romaji/Kana),
 * serta arti terjemahan dalam Bahasa Indonesia.
 *
 * @package components/features/dashboard
 * @project NihongoRoute
 */

// ==========================================
// IMPOR
// ==========================================
import { RandomExpression } from "@/actions/expressions.actions";
import { Sparkles } from "@/components/ui/icons";

// ==========================================
// ANTARMUKA & PROPS (INTERFACES)
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
    <section
      aria-label="Ungkapan Hari Ini"
      className="rounded-2xl md:rounded-3xl border border-border bg-card/40  p-6 md:p-8 relative overflow-hidden shadow-[0_0_40px_-10px_rgb(var(--primary-rgb)/0.08)] hover:border-primary/30 hover:shadow-[0_0_45px_rgb(var(--primary-rgb)/0.12)] transition-all duration-500"
    >
      {/* Pola kisi halus di latar belakang */}
      <div className="absolute inset-0 bg-[linear-gradient(rgb(var(--primary-rgb)/0.02)_1px,transparent_1px)] bg-[size:100%_4px] opacity-40 pointer-events-none" />

      {/* Pola tradisional Asanoha Jepang */}
      <div className="absolute inset-0 bg-asanoha pointer-events-none" />

      {/* Kilau gradasi di sudut kanan atas */}
      <div className="absolute -top-10 -right-10 size-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Bagian Header */}
      <div className="relative z-10 flex items-center gap-2 mb-5">
        <div className="flex items-center justify-center size-7 rounded-xl bg-primary/10">
          <Sparkles size={14} className="text-primary" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
          Ungkapan Hari Ini
        </span>
        {expression.jlpt_level && (
          <span className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
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
      <div className="relative z-10 my-4 h-[1px] bg-gradient-to-r from-transparent via-border/80 to-transparent" />

      {/* Arti Bahasa Indonesia */}
      <p className="relative z-10 text-center text-sm text-foreground/80 leading-relaxed font-bold tracking-wide italic">
        "{meaningId}"
      </p>
    </section>
  );
}