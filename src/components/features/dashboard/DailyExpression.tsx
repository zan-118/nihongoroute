import { RandomExpression } from "@/actions/expressions.actions";
import { Sparkles } from "lucide-react";

interface DailyExpressionProps {
  expression: RandomExpression | null;
}

export default function DailyExpression({ expression }: DailyExpressionProps) {
  if (!expression) return null;

  const meaningId = expression.indonesia[0] ?? expression.meanings[0] ?? "";

  return (
    <section
      aria-label="Ungkapan Hari Ini"
      className="rounded-[2.5rem] md:rounded-[3rem] border border-border bg-card/40 backdrop-blur-md p-6 md:p-8 relative overflow-hidden shadow-[0_0_40px_-10px_rgba(var(--primary-rgb),0.08)]"
    >
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--primary-rgb),0.02)_1px,transparent_1px)] bg-[size:100%_4px] opacity-40 pointer-events-none" />

      {/* Glow accent */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-2 mb-5">
        <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-primary/10">
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
      <div className="relative z-10 space-y-2 text-center py-4">
        <p
          className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight"
          lang="ja"
          aria-label={`Ungkapan: ${expression.text}`}
        >
          {expression.text}
        </p>
        <p
          className="text-sm md:text-base text-muted-foreground font-medium tracking-widest"
          lang="ja"
        >
          {expression.reading}
        </p>
      </div>

      {/* Divider */}
      <div className="relative z-10 my-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Arti Indonesia */}
      <p className="relative z-10 text-center text-sm text-foreground/80 leading-relaxed font-medium">
        {meaningId}
      </p>
    </section>
  );
}
