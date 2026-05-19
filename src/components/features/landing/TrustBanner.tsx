"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  ArrowRight, 
  WifiOff, 
  Heart, 
  Github, 
  Sparkles 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Komponen TrustBanner yang telah dirombak total menjadi 
 * pusat kepercayaan pembelajar NihongoRoute (100% Gratis, Offline, Open Source).
 */
export function TrustBanner() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="w-full mb-[120px]"
    >
      <Card className="p-[55px] md:p-[65px] rounded-[42px] bg-card/15 backdrop-blur-3xl border border-border shadow-none relative overflow-hidden group transition-all duration-700 hover:border-primary/20">
        
        {/* Background Decorative Radial Glows using CSS variables */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px] group-hover:bg-primary/15 transition-all duration-700 pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] group-hover:bg-secondary/10 transition-all duration-700 pointer-events-none" />
        
        <div className="flex flex-col xl:flex-row items-center justify-between gap-[55px] relative z-10">
          {/* LEFT CONTENT AREA */}
          <div className="flex-1 space-y-6">
            <Badge className="bg-success/10 text-success border border-success/20 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest">
              Akses Edukasi Terbuka
            </Badge>
            
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground text-balance">
              Belajar Tanpa Batas, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-secondary">100% Gratis Selamanya!</span>
            </h2>
            
            <p className="text-muted-foreground text-base md:text-lg font-medium leading-relaxed max-w-2xl text-balance">
              NihongoRoute adalah platform belajar nirlaba yang didesain secara transparan untuk mempermudah siapa saja menguasai bahasa Jepang secara mandiri tanpa terhalang kendala biaya.
            </p>

            {/* THREE CORE BENEFITS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {/* BENEFIT 1 */}
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <ShieldCheck size={20} />
                </div>
                <h4 className="text-sm font-bold text-foreground">Tanpa Iklan / Biaya Tersembunyi</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tidak ada interupsi iklan mengganggu, tidak ada fitur berbayar tersembunyi, dan tidak perlu mendaftarkan kartu kredit.
                </p>
              </div>

              {/* BENEFIT 2 */}
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
                  <WifiOff size={20} />
                </div>
                <h4 className="text-sm font-bold text-foreground">Akses Luring Penuh</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Mendukung mode offline. Seluruh data kemajuan belajar tersimpan aman di perangkat Anda secara instan.
                </p>
              </div>

              {/* BENEFIT 3 */}
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center text-success">
                  <Heart size={20} />
                </div>
                <h4 className="text-sm font-bold text-foreground">Didukung Komunitas</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ekosistem pembelajaran bersifat open source. Terbuka bagi siapa saja untuk ikut berkontribusi menyempurnakan kurikulum.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT ACTION COLUMN */}
          <div className="flex flex-col sm:flex-row xl:flex-col gap-4 w-full sm:w-auto xl:w-[260px] shrink-0 justify-center">
            <Button
              asChild
              className="h-[55px] px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest text-xs rounded-2xl shadow-[0_15px_30px_rgba(var(--primary-rgb),0.15)] hover:shadow-[0_20px_40px_rgba(var(--primary-rgb),0.25)] transition-all duration-500 group border-none"
            >
              <Link href="/support">
                Dukung Kami <Heart size={14} className="ml-3 text-primary-foreground fill-primary-foreground animate-pulse" />
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              className="h-[55px] px-8 bg-foreground/5 hover:bg-foreground hover:text-background transition-all text-xs font-bold uppercase tracking-widest rounded-2xl border border-border"
            >
              <a 
                href="https://github.com/zan-118/nihongoroute" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center"
              >
                <Github size={16} className="mr-3" /> Repositori GitHub <ArrowRight size={12} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>

        </div>

      </Card>
    </motion.section>
  );
}
