"use client";

import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { ArrowRight, BookOpen, PlayCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="min-h-[560px] md:min-h-[600px] lg:min-h-[620px] flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16 mb-12 md:mb-16 py-8 md:py-10">
      <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-2xl">
        <m.div
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-7"
        >
          <Badge
            variant="outline"
            className="bg-primary/[0.08] border-primary/20 px-4 py-2 rounded-full flex items-center gap-2 shadow-none"
          >
            <Sparkles size={12} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">
              NihongoRoute | Platform Belajar Bahasa Jepang
            </span>
          </Badge>
        </m.div>

        <m.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.14, duration: 0.5 }}
          className="lg:hidden relative size-16 mb-5 rounded-2xl premium-surface flex items-center justify-center"
        >
          <Image
            src="/logo-branding.svg"
            alt="NihongoRoute"
            fill
            priority
            className="object-contain p-3"
          />
        </m.div>

        <m.h1
          initial={{ y: 28, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="text-[3.25rem] sm:text-6xl md:text-7xl lg:text-[5.8rem] font-black tracking-tight leading-[0.95] text-foreground mb-7"
        >
          Kuasai <br />
          <m.span
            initial={{ filter: "blur(14px)", opacity: 0 }}
            animate={{ filter: "blur(0px)", opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.8 }}
            className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-success to-secondary dark:drop-shadow-[0_0_26px_rgba(var(--primary-rgb),0.22)]"
          >
            Bahasa Jepang.
          </m.span>
        </m.h1>

        <m.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="text-muted-foreground text-base md:text-lg max-w-xl mb-10 leading-relaxed font-medium text-balance"
        >
          Belajar bahasa Jepang dengan jalur yang rapi: kana, kosakata, tata bahasa,
          SRS, dan simulasi ujian dalam satu pengalaman yang cepat, nyaman, dan siap
          dipakai harian.
        </m.p>

        <m.div
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.58 }}
          className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto"
        >
          <Button
            asChild
            className="h-14 px-7 sm:px-9 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.14em] text-xs rounded-xl shadow-[0_18px_34px_rgba(var(--primary-rgb),0.2)] hover:shadow-[0_22px_44px_rgba(var(--primary-rgb),0.26)] transition-all duration-500 group border-none"
          >
            <Link href="/dashboard">
              Mulai Belajar Sekarang
              <ArrowRight
                size={16}
                className="ml-2 group-hover:translate-x-1 transition-transform duration-300"
              />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="h-14 px-7 sm:px-9 premium-surface hover:bg-card transition-all text-foreground font-black uppercase tracking-[0.14em] text-xs rounded-xl"
          >
            <Link href="/courses">
              <PlayCircle size={18} className="mr-2 text-primary" />
              Jelajahi Materi
            </Link>
          </Button>
        </m.div>
      </div>

      <m.div
        initial={{ opacity: 0, scale: 0.94, rotate: -4 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.35, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex flex-1 justify-end relative pointer-events-none"
      >
        <div className="relative size-[470px]">
          <div className="absolute inset-8 rounded-[36px] border border-border/70 bg-card/35 rotate-3" />
          <div className="absolute inset-14 rounded-[28px] border border-dashed border-primary/30 -rotate-6" />

          <div className="premium-surface absolute top-1/2 left-1/2 size-[300px] -translate-x-1/2 -translate-y-1/2 rotate-6 rounded-[28px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
            <div className="absolute top-7 left-7 flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                Learning Route
              </span>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative size-32 drop-shadow-[0_18px_40px_rgba(var(--primary-rgb),0.22)]">
                <Image
                  src="/logo-branding.svg"
                  alt="NihongoRoute"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
            </div>

            <div className="absolute bottom-7 right-7 text-right">
              <div
                className="text-primary/75 font-black text-5xl select-none tracking-wider font-japanese"
                style={{ fontFamily: "var(--font-noto-serif-jp)" }}
              >
                日本語
              </div>
              <div className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground mt-1">
                Read. Repeat. Remember.
              </div>
            </div>
          </div>

          <m.div
            animate={{ y: [0, -12, 0], x: [0, 4, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 right-8 p-4 premium-surface rounded-xl flex items-center justify-center hover:border-primary/40 transition-colors pointer-events-auto"
          >
            <Sparkles className="text-primary" size={24} />
          </m.div>

          <m.div
            animate={{ y: [0, 16, 0], x: [0, -6, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-8 -left-8 p-5 premium-surface rounded-xl flex items-center justify-center hover:border-success/40 transition-colors pointer-events-auto"
          >
            <div className="flex items-center gap-3">
              <div className="size-3 bg-success rounded-full animate-pulse" />
              <span className="text-xs font-black text-foreground uppercase tracking-widest">
                Sinkronisasi Cloud Aktif
              </span>
            </div>
          </m.div>

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
