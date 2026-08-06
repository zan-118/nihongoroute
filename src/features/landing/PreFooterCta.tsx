/**
 * @file PreFooterCta.tsx
 * @description Pre-footer conversion call-to-action banner component for landing page.
 * Designed following Kanso minimalist principles: clean typography, zero icon clutter.
 */

import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function PreFooterCta() {
  return (
    <section className="relative my-16 md:my-24">
      <Card className="p-8 sm:p-12 md:p-14 bg-card border border-border/80 rounded-3xl relative overflow-hidden text-center shadow-none">
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <Badge variant="outline" className="bg-card border border-border/80 text-muted-foreground px-3.5 py-1 rounded-full text-xs font-medium tracking-wide">
            Mulai Hari Ini • 100% Gratis & Tanpa Iklan
          </Badge>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.12]">
            Siap Memulai Perjalanan Bahasa Jepangmu?
          </h2>

          <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl mx-auto font-normal">
            Kuasai Kana, kosakata, tata bahasa, dan simulasi JLPT dalam satu tempat. Bebas biaya, offline-first, dan siap dipakai kapan saja.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
            <Button
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-13 px-8 text-xs font-semibold rounded-full transition-all duration-300 active:scale-[0.98]"
            >
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <span>Ayo Mulai Belajar</span>
                <ArrowRight size={14} />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="bg-card border-border/80 hover:bg-muted text-foreground h-13 px-8 text-xs font-semibold rounded-full transition-all duration-300 active:scale-[0.98]"
            >
              <Link href="/courses" className="flex items-center gap-2.5">
                <BookOpen size={15} className="text-muted-foreground" />
                <span>Lihat Semua Kursus</span>
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}
