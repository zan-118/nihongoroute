/**
 * @file SupportView.tsx
 * @description Main client component for NihongoRoute Support & Sponsorship page.
 * Integrates real supporter data from Supabase `supporters` table.
 * @module SupportView
 */

"use client";

// ==========================================
// Import & Dependencies
// ==========================================
import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getSupporters, FormattedSupporter } from "@/actions/support.actions";
import {
 Heart,
 Coffee,
 Shield,
 Zap,
 Globe,
 ChevronDown,
 Trophy,
 Users,
 HelpCircle,
 ArrowUpRight,
 Server,
 Sparkles,
 Check,
} from "@/components/ui/icons";

// ======================
// TIPE DATA & ANKOR
// ======================

interface TransparencyItem {
 label: string;
 allocated: string;
 percentage: number;
 description: string;
 icon: React.ComponentType<{ className?: string }>;
}

interface FAQItem {
 id: string;
 question: string;
 answer: string;
}

// Transparansi Biaya Operasional Platform
const TRANSPARENCY_METRICS: TransparencyItem[] = [
 {
 label: "Server & Hosting Awan",
 allocated: "45%",
 percentage: 45,
 description: "Infrastruktur cloud server Next.js & Supabase untuk menjaga respon di bawah 100ms.",
 icon: Server,
 },
 {
 label: "Sintesis TTS & Cache Audio",
 allocated: "30%",
 percentage: 30,
 description: "Biaya pemrosesan audio MsEdgeTTS dan CDN storage audio kosakata Jepang.",
 icon: Zap,
 },
 {
 label: "Domain & SSL Keamanan",
 allocated: "15%",
 percentage: 15,
 description: "Perpanjangan domain nihongoroute.com dan enkripsi sertifikat keamanan.",
 icon: Globe,
 },
 {
 label: "Pengembangan Konten Murni",
 allocated: "10%",
 percentage: 10,
 description: "Penyusunan modul latihan JLPT N5–N1 baru dari tim kurasi editorial.",
 icon: Sparkles,
 },
];

// Pertanyaan Umum (FAQ)
const FAQS: FAQItem[] = [
 {
 id: "faq-1",
 question: "Apakah NihongoRoute akan selalu gratis dan bebas iklan?",
 answer:
 "Pasti! NihongoRoute berkomitmen memberikan akses belajar bahasa Jepang yang setara, modern, dan 100% bebas dari iklan banner atau popup yang mengganggu fokus.",
 },
 {
 id: "faq-2",
 question: "Ke mana seluruh dana dukungan saya disalurkan?",
 answer:
 "100% dana dukungan Anda digunakan secara transparan untuk membiayai infrastruktur cloud server, CDN audio TTS, domain, serta pengayaan materi latihan JLPT.",
 },
 {
 id: "faq-3",
 question: "Apakah ada batas minimum untuk memberikan dukungan?",
 answer:
 "Tidak ada batas minimum. Sekecil apa pun dukungan Anda sangat berarti untuk memastikan server latihan harian tetap aktif tanpa kendala.",
 },
 {
 id: "faq-4",
 question: "Bagaimana jika saya ingin berkontribusi kode atau materi?",
 answer:
 "Kami sangat terbuka untuk kolaborasi! Anda dapat mengunjungi repositori GitHub terbuka kami atau menghubungi pengembang untuk berkontribusi.",
 },
];

interface SupportViewProps {
 initialSupporters?: FormattedSupporter[];
}

// ==========================================
// Main Component
// ==========================================
export default function SupportView({ initialSupporters = [] }: SupportViewProps) {
 const [openFaq, setOpenFaq] = useState<string | null>("faq-1");

 // Ambil data donatur asli dari Supabase via Server Action & React Query
 const { data: supporters = initialSupporters, isLoading } = useQuery<FormattedSupporter[]>({
 queryKey: ["supporters"],
 queryFn: () => getSupporters(),
 initialData: initialSupporters.length > 0 ? initialSupporters : undefined,
 staleTime: 1000 * 60 * 5, // Cache 5 menit
 });

 const toggleFaq = (id: string) => {
 setOpenFaq((prev) => (prev === id ? null : id));
 };

 return (
 <div className="relative min-h-screen pb-24 pt-8 md:pt-12">
 {/* ---------------------------------------------------- */}
 {/* 1. HERO SECTION: EYEBROW + BIG HEADLINE */}
 {/* ---------------------------------------------------- */}
 <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
 {/* Micro Eyebrow Badge */}
 <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary shadow-sm">
 <Sparkles className="size-3.5" />
 <span>Platform Belajar 100% Bebas Iklan</span>
 </div>

 {/* Headline Utama */}
 <h1 className="mt-6 text-3xl font-black tracking-tight text-foreground sm:text-5xl md:text-6xl leading-[1.1]">
 Dukung NihongoRoute <br className="hidden sm:inline" />
 <span className=" bg-clip-text text-transparent">
 Tetap Gratis & Independen
 </span>
 </h1>

 {/* Sub-deskripsi */}
 <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">
 NihongoRoute dibangun tanpa investor dan tanpa iklan yang mengganggu. Setiap dukungan kecil Anda menjaga server tetap menyala untuk ribuan pelajar bahasa Jepang di Indonesia.
 </p>

 {/* Metrik Cepat */}
 <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-muted-foreground">
 <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3.5 py-1.5">
 <Check className="size-4 text-emerald-500" />
 <span>Tanpa Paywall</span>
 </div>
 <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3.5 py-1.5">
 <Shield className="size-4 text-primary" />
 <span>Transparansi 100%</span>
 </div>
 <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3.5 py-1.5">
 <Heart className="size-4 text-rose-500" />
 <span>Ditenagai Komunitas</span>
 </div>
 </div>
 </section>

 {/* ---------------------------------------------------- */}
 {/* 2. DONATION CHANNELS: DOPPELRAND + BUTTON-IN-BUTTON */}
 {/* ---------------------------------------------------- */}
 <section className="mx-auto mt-14 max-w-5xl px-4 sm:px-6 lg:px-8">
 <div className="grid gap-6 md:grid-cols-2">
 {/* KARTU 1: SAWERIA (Double-Bezel Nested Architecture) */}
 <div className="group rounded-[2rem] border border-border/70 bg-muted/40 p-2.5 shadow-sm transition-all duration-300 hover:border-primary/40">
 <div className="rounded-[calc(2rem-0.625rem)] border border-border/50 bg-card p-6 sm:p-8">
 <div className="flex items-center justify-between">
 <div className="flex size-12 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-500">
 <Coffee className="size-6" />
 </div>
 <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
 Saweria • QRIS / E-Wallet
 </span>
 </div>

 <h2 className="mt-6 text-2xl font-black tracking-tight text-foreground">
 Dukungan via Saweria
 </h2>
 <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
 Dukung dengan mudah menggunakan GoPay, OVO, ShopeePay, Dana, atau QRIS dari semua aplikasi bank.
 </p>

 {/* Button-in-Button CTA Architecture */}
 <div className="mt-8">
 <a
 href="https://saweria.co/nihongoroute"
 target="_blank"
 rel="noopener noreferrer"
 className="group/btn flex w-full items-center justify-between gap-4 rounded-full bg-amber-500 px-6 py-3.5 font-extrabold text-amber-950 transition-all duration-300 ease-out hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20 active:scale-[0.98]"
 >
 <span>Kirim Dukungan Saweria</span>
 <div className="flex size-9 items-center justify-center rounded-full bg-amber-950/15 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5">
 <ArrowUpRight className="size-4 stroke-[2.5]" />
 </div>
 </a>
 </div>
 </div>
 </div>

 {/* KARTU 2: TRAKTEER (Double-Bezel Nested Architecture) */}
 <div className="group rounded-[2rem] border border-border/70 bg-muted/40 p-2.5 shadow-sm transition-all duration-300 hover:border-primary/40">
 <div className="rounded-[calc(2rem-0.625rem)] border border-border/50 bg-card p-6 sm:p-8">
 <div className="flex items-center justify-between">
 <div className="flex size-12 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-500">
 <Heart className="size-6" />
 </div>
 <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
 Trakteer • Karya Cendol
 </span>
 </div>

 <h2 className="mt-6 text-2xl font-black tracking-tight text-foreground">
 Traktir via Trakteer
 </h2>
 <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
 Traktir Mangkok Cendol untuk mendukung pemeliharaan server review harian dan audio kosakata.
 </p>

 {/* Button-in-Button CTA Architecture */}
 <div className="mt-8">
 <a
 href="https://trakteer.id/nihongoroute"
 target="_blank"
 rel="noopener noreferrer"
 className="group/btn flex w-full items-center justify-between gap-4 rounded-full bg-rose-500 px-6 py-3.5 font-extrabold text-white transition-all duration-300 ease-out hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-500/20 active:scale-[0.98]"
 >
 <span>Traktir di Trakteer</span>
 <div className="flex size-9 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5">
 <ArrowUpRight className="size-4 stroke-[2.5]" />
 </div>
 </a>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* ---------------------------------------------------- */}
 {/* 3. TRANSPARENCY SECTION: SERVER COST METRICS */}
 {/* ---------------------------------------------------- */}
 <section className="mx-auto mt-16 max-w-5xl px-4 sm:px-6 lg:px-8">
 <div className="rounded-[2rem] border border-border/70 bg-muted/40 p-2.5">
 <div className="rounded-[calc(2rem-0.625rem)] border border-border/50 bg-card p-6 sm:p-10">
 <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
 <div>
 <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-primary">
 <Shield className="size-3.5" />
 <span>Transparansi Penggunaan Dana</span>
 </div>
 <h2 className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
 Alokasi Dana Dukungan
 </h2>
 </div>
 <p className="max-w-md text-xs font-medium text-muted-foreground leading-relaxed">
 Setiap donasi yang masuk dialokasikan 100% secara langsung untuk mendukung kebutuhan teknis operasional platform.
 </p>
 </div>

 {/* Grid Metrik Transparansi */}
 <div className="mt-8 grid gap-6 sm:grid-cols-2">
 {TRANSPARENCY_METRICS.map((metric, idx) => {
 const IconComponent = metric.icon;
 return (
 <div
 key={idx}
 className="rounded-xl border border-border/60 bg-muted/20 p-5 transition-colors duration-150 hover:border-primary/30"
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="flex size-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
 <IconComponent className="size-4" />
 </div>
 <span className="text-sm font-bold text-foreground">
 {metric.label}
 </span>
 </div>
 <span className="text-sm font-black text-primary">
 {metric.allocated}
 </span>
 </div>

 {/* Progress Bar Progress Meter */}
 <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
 <div
 className="h-full rounded-full bg-primary transition-all duration-500"
 style={{ width: `${metric.percentage}%` }}
 />
 </div>

 <p className="mt-3 text-xs font-medium text-muted-foreground leading-relaxed">
 {metric.description}
 </p>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 </section>

 {/* ---------------------------------------------------- */}
 {/* 4. SUPPORTER HALL OF FAME (SUPABASE RIIL) */}
 {/* ---------------------------------------------------- */}
 <section className="mx-auto mt-16 max-w-5xl px-4 sm:px-6 lg:px-8">
 <div className="rounded-[2rem] border border-border/70 bg-muted/40 p-2.5">
 <div className="rounded-[calc(2rem-0.625rem)] border border-border/50 bg-card p-6 sm:p-10">
 <div className="flex items-center justify-between">
 <div>
 <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
 <Trophy className="size-3.5" />
 <span>Pendukung Setia Komunitas</span>
 </div>
 <h2 className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
 Daftar Pahlawan NihongoRoute
 </h2>
 </div>
 <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-muted-foreground">
 <Users className="size-4 text-primary" />
 <span>Terima Kasih Banyak!</span>
 </div>
 </div>

 {/* State Loading */}
 {isLoading && (
 <div className="mt-8 grid gap-4 sm:grid-cols-3">
 {[1, 2, 3].map((i) => (
 <div
 key={i}
 className="h-32 animate-pulse rounded-xl border border-border/40 bg-muted/30"
 />
 ))}
 </div>
 )}

 {/* Render Donatur Asli dari Supabase */}
 {!isLoading && supporters.length > 0 && (
 <div className="mt-8 grid gap-4 sm:grid-cols-3">
 {supporters.map((supporter) => (
 <div
 key={supporter.id}
 className="flex flex-col justify-between rounded-xl border border-border/60 bg-muted/20 p-5 transition-colors duration-150 hover:border-primary/30"
 >
 <div>
 <div className="flex items-center justify-between">
 <span className="text-sm font-black text-foreground">
 {supporter.name}
 </span>
 <span
 className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
 supporter.tier === "gold"
 ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
 : supporter.tier === "silver"
 ? "bg-slate-400/15 text-slate-700 dark:text-slate-300 border border-slate-400/30"
 : "bg-orange-600/15 text-orange-700 dark:text-orange-400 border border-orange-600/30"
 }`}
 >
 {supporter.tier}
 </span>
 </div>
 <div className="mt-2 text-xs font-black text-primary">
 {supporter.amount}
 </div>
 <p className="mt-3 text-xs font-medium text-muted-foreground leading-relaxed italic">
 "{supporter.message}"
 </p>
 </div>
 <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-[10px] font-bold text-muted-foreground">
 <span>{supporter.date}</span>
 <span className="capitalize text-primary/80">{supporter.source}</span>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Empty State bila belum ada transaksi di DB */}
 {!isLoading && supporters.length === 0 && (
 <div className="mt-8 rounded-xl border border-dashed border-border/70 p-8 text-center">
 <Heart className="mx-auto size-8 text-rose-500/70" />
 <h3 className="mt-3 text-base font-bold text-foreground">
 Belum Ada Donatur Terbaru
 </h3>
 <p className="mt-1 text-xs font-medium text-muted-foreground">
 Jadilah pahlawan pertama yang mendukung keberlangsungan platform ini!
 </p>
 </div>
 )}
 </div>
 </div>
 </section>

 {/* ---------------------------------------------------- */}
 {/* 5. FAST CSS GRID ACCORDION FAQ */}
 {/* ---------------------------------------------------- */}
 <section className="mx-auto mt-16 max-w-5xl px-4 sm:px-6 lg:px-8">
 <div className="rounded-[2rem] border border-border/70 bg-muted/40 p-2.5">
 <div className="rounded-[calc(2rem-0.625rem)] border border-border/50 bg-card p-6 sm:p-10">
 <div className="text-center sm:text-left">
 <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-primary">
 <HelpCircle className="size-3.5" />
 <span>Pertanyaan Umum</span>
 </div>
 <h2 className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
 Pertanyaan Seputar Dukungan
 </h2>
 </div>

 {/* List FAQ Accordion via CSS Grid Compositor */}
 <div className="mt-8 grid gap-3">
 {FAQS.map((faq) => {
 const isOpen = openFaq === faq.id;
 return (
 <div
 key={faq.id}
 className="overflow-hidden rounded-xl border border-border/60 bg-muted/20 transition-colors duration-150 hover:border-primary/30"
 >
 <button
 onClick={() => toggleFaq(faq.id)}
 className="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-foreground transition-colors hover:text-primary focus:outline-none"
 >
 <span>{faq.question}</span>
 <ChevronDown
 className={`size-4 text-muted-foreground transition-transform duration-200 ${
 isOpen ? "rotate-180 text-primary" : ""
 }`}
 />
 </button>

 {/* CSS Grid Animation expansion (0ms layout reflow) */}
 <div
 className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
 isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
 }`}
 >
 <div className="overflow-hidden">
 <p className="px-5 pb-5 pt-1 text-xs font-medium leading-relaxed text-muted-foreground border-t border-border/40">
 {faq.answer}
 </p>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 </section>

 {/* ---------------------------------------------------- */}
 {/* 6. FOOTER BACK LINK */}
 {/* ---------------------------------------------------- */}
 <div className="mt-12 text-center">
 <Link
 href="/"
 className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
 >
 <span>← Kembali ke Beranda</span>
 </Link>
 </div>
 </div>
 );
}