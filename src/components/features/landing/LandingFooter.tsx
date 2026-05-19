"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

/**
 * Komponen LandingFooter yang telah dirombak total menjadi 
 * footer multi-kolom premium dengan integrasi tautan media sosial resmi.
 */
export function LandingFooter() {
  return (
    <footer className="mt-[120px] pt-[80px] border-t border-border/80 pb-[55px] relative z-10 w-full">
      {/* Decorative Blur Background behind Footer */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-[55px] mb-[80px]">
        {/* COLUMN 1: BRANDING & SOSIAL MEDIA */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="flex items-center gap-[13px]">
            <div className="relative w-10 h-10 dark:drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
              <Image
                src="/logo-branding.svg"
                alt="NihongoRoute Logo"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-foreground text-xl font-bold tracking-tight">
                Nihongo<span className="text-primary">Route</span>
              </span>
              <span className="text-[8px] text-muted-foreground font-extrabold uppercase tracking-widest opacity-60">
                Platform Belajar Modern
              </span>
            </div>
          </div>
          
          <p className="text-muted-foreground text-xs font-semibold leading-relaxed max-w-sm">
            Platform modern bebas biaya yang didesain khusus untuk membantu Anda menguasai bahasa Jepang secara mandiri, interaktif, dan tanpa hambatan offline.
          </p>

          {/* SOCIAL MEDIA LINKS */}
          <div className="flex items-center gap-3.5 pt-2">
            {/* Facebook */}
            <a
              href="https://www.facebook.com/nihongoroute"
              target="_blank"
              rel="noreferrer"
              aria-label="Kunjungi Facebook NihongoRoute"
              className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 shadow-sm"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/nihongoroute"
              target="_blank"
              rel="noreferrer"
              aria-label="Kunjungi Instagram NihongoRoute"
              className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 shadow-sm"
            >
              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>

            {/* Threads */}
            <a
              href="https://www.threads.com/nihongoroute"
              target="_blank"
              rel="noreferrer"
              aria-label="Kunjungi Threads NihongoRoute"
              className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 shadow-sm"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 24c-6.617 0-12-5.383-12-12s5.383-12 12-12 12 5.383 12 12-5.383 12-12 12zm0-22c-5.514 0-10 4.486-10 10s4.486 10 10 10 10-4.486 10-10-4.486-10-10-10zm.116 12.78c-.287.69-.97 1.155-1.748 1.155-1.02 0-1.848-.828-1.848-1.848 0-1.02.828-1.848 1.848-1.848.74 0 1.394.428 1.706 1.054h2.247c-.432-1.79-2.036-3.12-3.953-3.12-2.253 0-4.088 1.835-4.088 4.088s1.835 4.088 4.088 4.088c1.884 0 3.473-1.275 3.93-3.003h-2.402zm3.884-2.888h-2.18c.038.35.059.71.059 1.08 0 2.22-1.776 4.02-3.985 4.02-2.209 0-3.985-1.8-3.985-4.02s1.776-4.02 3.985-4.02c1.785 0 3.3 1.17 3.81 2.76h2.24c-.54-2.73-2.95-4.81-5.85-4.81-3.3 0-5.98 2.68-5.98 5.98s2.68 5.98 5.98 5.98c2.94 0 5.34-2.05 5.86-4.75-.02-.4-.05-.8-.09-1.2z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* COLUMN 2: BELAJAR */}
        <div className="lg:col-span-2 lg:col-start-6 flex flex-col gap-5">
          <span className="text-xs font-black uppercase tracking-widest text-foreground">
            Belajar
          </span>
          <div className="flex flex-col gap-3.5 text-xs font-semibold text-muted-foreground">
            <Link href="/library/kana" className="hover:text-primary transition-colors">
              Hiragana & Katakana
            </Link>
            <Link href="/library/vocab" className="hover:text-primary transition-colors">
              Kosakata Utama
            </Link>
            <Link href="/library/kanji" className="hover:text-primary transition-colors">
              Kamus Kanji
            </Link>
            <Link href="/library/grammar" className="hover:text-primary transition-colors">
              Tata Bahasa
            </Link>
            <Link href="/exams" className="hover:text-primary transition-colors">
              Simulasi JLPT
            </Link>
          </div>
        </div>

        {/* COLUMN 3: EKOSISTEM */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <span className="text-xs font-black uppercase tracking-widest text-foreground">
            Fitur Utama
          </span>
          <div className="flex flex-col gap-3.5 text-xs font-semibold text-muted-foreground">
            <Link href="/review" className="hover:text-primary transition-colors">
              Flashcard SRS
            </Link>
            <Link href="/dashboard" className="hover:text-primary transition-colors">
              Papan Kemajuan
            </Link>
            <span className="text-muted-foreground/60 flex items-center gap-1.5 cursor-not-allowed">
              Modul Offline PWA
            </span>
            <a 
              href="https://github.com/zan-118/nihongoroute" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-primary transition-colors"
            >
              Kontribusi GitHub
            </a>
          </div>
        </div>

        {/* COLUMN 4: DUKUNGAN */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <span className="text-xs font-black uppercase tracking-widest text-foreground">
            Dukungan & Legal
          </span>
          <div className="flex flex-col gap-3.5 text-xs font-semibold text-muted-foreground">
            <Link href="/support" className="hover:text-primary transition-colors">
              Dukung Kami
            </Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: COPYRIGHT */}
      <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
        <span>
          © {new Date().getFullYear()} NihongoRoute. All Rights Reserved.
        </span>
        <span className="text-muted-foreground/60 font-semibold normal-case tracking-normal">
          Dibuat dengan 💖 untuk seluruh pembelajar bahasa Jepang di Indonesia.
        </span>
      </div>
    </footer>
  );
}
