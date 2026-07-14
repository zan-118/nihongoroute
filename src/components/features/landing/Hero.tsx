"use client";

import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { ArrowRight, BookOpen, PlayCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Hero component for the landing page.
 * Displays branding, value proposition, call-to-action buttons, and animated decorative elements.
 * 
 * @returns React element representing the hero section.
 */
export function Hero() {
  return (
    <section className="relative min-h-[560px] md:min-h-[600px] lg:min-h-[640px] flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16 mb-12 md:mb-16 py-8 md:py-10">
      {/* Decorative background glow effects */}
      <div className="pointer-events-none absolute -left-28 top-10 size-72 rounded-full bg-primary/20 blur-[110px] dark:bg-primary/15" />
      <div className="pointer-events-none absolute left-1/3 bottom-6 size-64 rounded-full bg-secondary/10 blur-[120px] dark:bg-secondary/12" />

      <div className="relative z-10 flex-1 flex flex-col items-start text-left max-w-2xl w-full">
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-7"
        >
          <Badge variant="outline" className="brand-pill shadow-none">
            <Sparkles size={12} className="text-primary" />
            <span>NihongoRoute | Teman Belajar Bahasa Jepangmu</span>
          </Badge>
        </m.div>

        {/* Mobile-only logo display */}
        <m.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.14, duration: 0.5 }}
          className="lg:hidden relative size-36 mb-5 mx-auto self-center rounded-lg premium-surface flex items-center justify-center"
        >
          <Image
            src="/logo-branding.svg"
            alt="NihongoRoute"
            fill
            className="object-contain p-2"
          />
        </m.div>

        <h1 className="text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5.95rem] tracking-[-0.07em] leading-[0.92] text-foreground mb-7">
          Kuasai <br />
          <span className="brand-text-gradient inline-block">
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
            className="brand-button h-14 px-7 sm:px-9 text-xs group"
          >
            <Link href="/dashboard">
              Ayo Mulai Belajar
              <ArrowRight
                size={16}
                className="ml-2 group-hover:translate-x-1 transition-transform duration-300"
              />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="brand-button-ghost h-14 px-7 sm:px-9 text-xs group"
          >
            <Link href="/courses">
              <PlayCircle size={18} className="mr-2 text-primary" />
              Lihat Semua Materi
            </Link>
          </Button>
        </div>
      </div>

      {/* Desktop-only animated graphic container */}
      <m.div
        initial={{ opacity: 0, scale: 0.94, rotate: -4 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.35, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex flex-1 justify-end relative pointer-events-none"
      >
        <div className="relative size-[490px]">
          {/* Layered background shapes and borders */}
          <div className="absolute -inset-8 rounded-[52px] bg-[radial-gradient(circle_at_35%_30%,rgb(var(--brand-cyan-rgb)_/_0.22),transparent_35%),radial-gradient(circle_at_72%_70%,rgb(var(--brand-violet-rgb)_/_0.16),transparent_38%)] blur-3xl" />
          <div className="absolute inset-7 rounded-3xl border border-border/70 bg-card/32 rotate-3 shadow-[0_30px_90px_rgba(var(--foreground-rgb),0.08)] dark:shadow-[0_30px_90px_rgba(var(--foreground-rgb),0.45)]" />
          <div className="absolute inset-13 rounded-3xl border border-dashed border-primary/35 -rotate-6" />

          {/* Central branding card */}
          <div className="premium-surface absolute top-1/2 left-1/2 size-[316px] -translate-x-1/2 -translate-y-1/2 rotate-6 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_24%,rgb(var(--brand-cyan-rgb)_/_0.2),transparent_34%),linear-gradient(135deg,rgb(var(--brand-cyan-rgb)_/_0.1),transparent_45%,rgb(var(--brand-violet-rgb)_/_0.12))]" />
            <div className="absolute top-7 left-7 flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary shadow-[0_0_16px_rgba(var(--brand-cyan-rgb),0.55)]" />
              <span className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                Jalur Belajar
              </span>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative size-32 drop-shadow-[0_18px_42px_rgba(var(--brand-cyan-rgb),0.28)] dark:drop-shadow-[0_0_42px_rgba(var(--brand-cyan-rgb),0.24)]">
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
                Read. Repeat. Remember.
              </div>
            </div>
          </div>

          {/* Floating animated badge: Sparkles */}
          <m.div
            animate={{ y: [0, -12, 0], x: [0, 4, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 right-8 p-4 premium-surface rounded-xl flex items-center justify-center hover:border-primary/40 transition-colors pointer-events-auto"
          >
            <Sparkles className="text-primary drop-shadow-[0_0_16px_rgba(var(--brand-cyan-rgb),0.45)]" size={24} />
          </m.div>

          {/* Floating animated badge: Cloud Sync */}
          <m.div
            animate={{ y: [0, 16, 0], x: [0, -6, 0] }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-8 -left-8 p-5 premium-surface rounded-xl flex items-center justify-center hover:border-primary/40 transition-colors pointer-events-auto"
          >
            <div className="flex items-center gap-3">
              <div className="size-3 bg-primary rounded-full animate-pulse shadow-[0_0_14px_rgba(var(--brand-cyan-rgb),0.65)]" />
              <span className="text-xs font-black text-foreground uppercase tracking-widest">
                Data Tersinkron ke Cloud
              </span>
            </div>
          </m.div>

          {/* Static badge: JLPT Ready */}
          <div className="absolute bottom-20 right-0 p-4 premium-surface rounded-xl flex items-center gap-3">
            <BookOpen size={18} className="text-secondary" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-foreground">
                JLPT Ready
              </span>
              <span className="text-[9px] font-bold text-muted-foreground">
                N5 sampai N1
              </span>
            </div>
          </div>
        </div>
      </m.div>
    </section>
  );
}