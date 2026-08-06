import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, Zap } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Hero component for the landing page.
 * Pure Server Component for instant SSG rendering and zero client JS overhead.
 * Displays branding, value proposition, call-to-action buttons, and decorative elements.
 * 
 * @returns React element representing the hero section.
 */
export function Hero() {
  return (
    <section className="relative min-h-[560px] md:min-h-[600px] lg:min-h-[640px] flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16 mb-12 md:mb-16 py-8 md:py-10">
      {/* Decorative background glow effects */}
      <div className="pointer-events-none absolute -left-28 top-10 size-72 rounded-full bg-primary/20 blur-[60px] dark:bg-primary/15 ambient-glow will-change-transform" />
      <div className="pointer-events-none absolute left-1/3 bottom-6 size-64 rounded-full bg-secondary/10 blur-[65px] dark:bg-secondary/12 ambient-glow will-change-transform" />

      <div className="relative z-10 flex-1 flex flex-col items-start text-left max-w-2xl w-full">
        <div className="mb-7 animate-in fade-in duration-500">
          <Badge variant="outline" className="bg-card border border-border text-foreground px-3 py-1 rounded-full text-sm shadow-none flex items-center gap-1.5">
            <Zap size={14} className="text-warning fill-warning" />
            <span>NihongoRoute | Teman Belajar Bahasa Jepangmu</span>
          </Badge>
        </div>

        {/* Mobile-only logo display */}
        <div className="lg:hidden relative size-36 mb-5 mx-auto self-center rounded-lg bg-card border border-border flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
          <Image
            src="/logo-branding.svg"
            alt="NihongoRoute"
            fill
            className="object-contain p-2"
          />
        </div>

        <h1 className="text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5.95rem] tracking-[-0.07em] leading-[0.92] text-foreground mb-7 font-bold">
          Kuasai <br />
          <span className="text-primary inline-block">
            Bahasa Jepang.
          </span>
        </h1>

        <p className="text-muted-foreground text-base md:text-lg max-w-xl mb-10 leading-relaxed font-normal text-balance">
          Mulai dari kana, kosakata, tata bahasa, sampai simulasi ujian JLPT
          — semuanya ada di NihongoRoute. Cepat, nyaman, dan bisa kamu pakai tiap
          hari.
        </p>

        {/* Call-to-action buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-2">
          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/92 h-14 pl-8 pr-6 text-xs group rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
          >
            <Link href="/dashboard" className="flex items-center gap-3">
              <span>Ayo Mulai Belajar</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 dark:bg-white/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[0.5px]">
                <ArrowRight size={14} className="stroke-[1.5]" />
              </span>
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="bg-transparent text-muted-foreground hover:bg-muted hover:text-primary border border-border h-14 pl-6 pr-8 text-xs group rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
          >
            <Link href="/courses" className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110">
                <BookOpen size={16} className="text-primary stroke-[1.5]" />
              </span>
              <span>Lihat Semua Materi</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Desktop-only graphic container */}
      <div className="hidden lg:flex flex-1 justify-end relative pointer-events-none animate-in fade-in slide-in-from-right duration-700">
        <div className="relative size-[490px]">
          {/* Layered background shapes and borders */}
          <div className="absolute -inset-8 rounded-[52px] bg-[radial-gradient(circle_at_35%_30%,hsl(var(--primary)/_/_0.22),transparent_35%),radial-gradient(circle_at_72%_70%,hsl(var(--primary)/_/_0.16),transparent_38%)] blur-3xl" />
          <div className="absolute inset-7 rounded-3xl border border-border/70 bg-card/32 rotate-3 shadow-[0_30px_90px_hsl(var(--foreground)/0.08)] dark:shadow-[0_30px_90px_hsl(var(--foreground)/0.45)]" />
          <div className="absolute inset-13 rounded-3xl border border-dashed border-primary/35 -rotate-6" />

          {/* Central branding card */}
          <div className="bg-card border border-border absolute top-1/2 left-1/2 size-[316px] -translate-x-1/2 -translate-y-1/2 rotate-6 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_24%,hsl(var(--primary)/_/_0.2),transparent_34%),linear-gradient(135deg,hsl(var(--primary)/_/_0.1),transparent_45%,hsl(var(--primary)/_/_0.12))]" />
            <div className="absolute top-7 left-7 flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary shadow-[0_0_16px_hsl(var(--primary)/0.55)]" />
              <span className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                Jalur Belajar
              </span>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative size-32 drop-shadow-[0_18px_42px_hsl(var(--primary)/0.28)] dark:drop-shadow-[0_0_42px_hsl(var(--primary)/0.24)]">
                <Image
                  src="/logo-branding.svg"
                  alt="NihongoRoute"
                  fill
                  priority
                  sizes="128px"
                  className="object-contain"
                />
              </div>
            </div>

            <div className="absolute bottom-7 right-7 text-right">
              <div
                className="text-primary/80 font-black text-5xl select-none tracking-wider font-japanese dark:text-primary/75"
                style={{ fontFamily: "var(--font-noto-serif-jp)" }}
              >
                日本語
              </div>
              <div className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground mt-1">
                READ. REPEAT. REMEMBER.
              </div>
            </div>
          </div>

          {/* Decorative badge: Zap / Lightning */}
          <div className="absolute -top-4 right-8 p-4 bg-card border border-border rounded-xl flex items-center justify-center hover:border-primary/40 transition-colors pointer-events-auto">
            <Zap className="text-warning fill-warning" size={24} />
          </div>

          {/* Decorative badge: Cloud Sync */}
          <div className="absolute bottom-8 -left-8 p-5 bg-card border border-border rounded-xl flex items-center justify-center hover:border-primary/40 transition-colors pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="size-3 bg-primary rounded-full animate-pulse shadow-[0_0_14px_hsl(var(--primary)/0.65)]" />
              <span className="text-xs font-black text-foreground uppercase tracking-widest">
                DATA TERSINKRON KE CLOUD
              </span>
            </div>
          </div>

          {/* Static badge: JLPT Ready */}
          <div className="absolute bottom-20 right-0 p-4 bg-card border border-border rounded-xl flex items-center gap-3">
            <GraduationCap size={20} className="text-primary" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-foreground">
                JLPT READY
              </span>
              <span className="text-[9px] font-bold text-muted-foreground">
                N5 sampai N1
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}