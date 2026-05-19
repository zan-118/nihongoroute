"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Komponen Hero untuk Landing Page.
 */
export function Hero() {
  return (
    <section className="min-h-[85vh] flex flex-col lg:flex-row items-center justify-between gap-[89px] mb-[89px] py-[55px]">
      {/* LEFT CONTENT AREA */}
      <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-2xl">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-[34px]"
        >
          <Badge
            variant="outline"
            className="bg-primary/5 border-primary/10 px-4 py-2 rounded-full flex items-center gap-2 shadow-none backdrop-blur-xl transition-all hover:bg-primary/10"
          >
            <Sparkles size={12} className="text-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
              Platform Belajar Bahasa Jepang
            </span>
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-8xl lg:text-[100px] font-bold tracking-[-0.04em] leading-[0.95] text-foreground mb-[34px]"
        >
          Kuasai <br />
          <motion.span 
            initial={{ filter: "blur(20px)", opacity: 0 }}
            animate={{ filter: "blur(0px)", opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-secondary dark:drop-shadow-[0_0_35px_rgba(var(--primary-rgb),0.3)]"
          >
            Bahasa Jepang.
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground text-lg md:text-xl max-w-xl mb-[55px] leading-relaxed font-medium text-balance"
        >
          Belajar bahasa Jepang jadi lebih seru dan mudah. Platform modern 
          yang didesain khusus untuk membantumu mahir lebih cepat.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-[21px] w-full sm:w-auto"
        >
          <Button
            asChild
            className="h-[65px] px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest text-xs rounded-2xl shadow-[0_20px_40px_rgba(var(--primary-rgb),0.2)] hover:shadow-[0_25px_50px_rgba(var(--primary-rgb),0.3)] transition-all duration-500 group border-none"
          >
            <Link href="/dashboard">
              Mulai Belajar Sekarang{" "}
              <ArrowRight
                size={16}
                className="ml-3 group-hover:translate-x-1 transition-transform duration-300"
              />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="h-[65px] px-10 bg-card/40 border border-border backdrop-blur-md hover:bg-card transition-all text-foreground font-bold uppercase tracking-widest text-xs rounded-2xl"
          >
            <Link href="/courses">
              <PlayCircle size={18} className="mr-3 text-primary" /> Jelajahi Materi
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* RIGHT DECORATIVE AREA - ASYMMETRICAL BALANCE */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.4, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex flex-1 justify-end relative"
      >
        <div className="relative w-[500px] h-[500px]">
          {/* Abstract Cyber Shape */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-secondary/10 to-transparent rounded-[89px] blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-primary/20 rounded-[55px] rotate-12 backdrop-blur-3xl shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            <div className="absolute top-8 left-8">
              <div className="w-12 h-1 bg-primary/40 rounded-full mb-3" />
              <div className="w-20 h-1 bg-primary/20 rounded-full" />
            </div>
            <div className="absolute bottom-8 right-8 text-primary/40 font-black text-6xl select-none">
              日本語
            </div>
          </div>
          
          {/* Floating Accents */}
          <motion.div 
            animate={{ y: [0, -21, 0], x: [0, 8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-8 right-8 w-21 h-21 p-4 bg-background border border-border rounded-2xl shadow-2xl backdrop-blur-md"
          >
            <Sparkles className="text-primary" size={24} />
          </motion.div>
          
          <motion.div 
            animate={{ y: [0, 34, 0], x: [0, -13, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-8 -left-8 p-6 bg-card/60 border border-border rounded-3xl shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
              <span className="text-xs font-bold text-foreground">Sinkronisasi Cloud Aktif</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
