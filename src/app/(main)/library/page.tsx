/**
 * @file page.tsx
 * @description Main Library Hub page route component for NihongoRoute.
 * Provides high-performance, offline-friendly bento-grid navigation directory.
 */

// ==========================================
// Import & Dependencies
// ==========================================
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { Library, Sparkles } from "@/components/ui/icons";
import { buildLibraryCategories, buildLibraryStats } from "@/lib/constants/library";

// Supporting Components
import { LibraryCategoryCard } from "@/features/library/components/LibraryCategoryCard";
import { LibraryServerStatus } from "@/features/library/components/LibraryServerStatus";
import { getLibraryCounts } from "@/actions/library-counts.actions";
import {
 breadcrumbJsonLd,
 createPageMetadata,
 learningResourceJsonLd,
 webPageJsonLd,
} from "@/lib/seo";

/**
 * Metadata SEO untuk halaman Pustaka Belajar.
 */
export const metadata: Metadata = {
 ...createPageMetadata({
 title: "Pustaka Belajar | NihongoRoute",
 description:
 "Arsip komprehensif materi bahasa Jepang: Pustaka Kosakata, Kamus Kanji, Pola Kalimat, Graded Reading, Listening Lab, dan Catatan Cepat.",
 path: "/library",
 keywords: [
 "pustaka bahasa Jepang",
 "kamus kosakata Jepang",
 "kanji JLPT",
 "grammar bahasa Jepang",
 "graded reading Jepang",
 ],
 }),
};

/**
 * Halaman utama Pustaka (RSC).
 * Mengambil data statistik agregat jumlah kosakata, kanji, pola kalimat, dll.,
 * lalu menyajikan bento grid navigasi kategori berarsitektur Double-Bezel.
 * 
 * @returns {Promise<JSX.Element>} Halaman direktori pustaka materi belajar Jepang.
 */
export default async function LibraryPage() {
 // Ambil data jumlah materi dari database/API
 const counts = await getLibraryCounts();

 // Hitung total akumulasi seluruh materi belajar
 const totalMateri = counts.vocab + counts.kanji + counts.grammar + counts.reading + counts.listening + counts.exams;

 // Konfigurasi data untuk setiap kategori kartu navigasi dan stats
 const categories = buildLibraryCategories(counts);
 const stats = buildLibraryStats(counts);

 return (
 <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 relative overflow-hidden pb-36 bg-transparent text-foreground min-h-screen pt-10 md:pt-20">
 {/* Injeksi JSON-LD untuk optimasi SEO mesin pencari */}
 <JsonLd
 data={[
 breadcrumbJsonLd([
 { name: "Beranda", path: "/" },
 { name: "Pustaka", path: "/library" },
 ]),
 webPageJsonLd({
 name: "Pustaka Belajar NihongoRoute",
 description: metadata.description as string,
 path: "/library",
 }),
 learningResourceJsonLd({
 name: "Pustaka Belajar NihongoRoute",
 description: metadata.description as string,
 path: "/library",
 educationalLevel: "JLPT N5-N1",
 teaches: categories.map((category) => category.title),
 }),
 ]}
 />

 {/* Ambient Mesh Gradient Glows */}
 <div className="absolute top-[5%] left-[-10%] size-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none z-0 ambient-glow will-change-transform" />
 <div className="absolute bottom-[15%] right-[-10%] size-[45%] bg-secondary/10 blur-[120px] rounded-full pointer-events-none z-0 ambient-glow will-change-transform" />
 <div className="grid-overlay opacity-30" />

 <div className="max-w-7xl mx-auto relative z-10 space-y-16 md:space-y-24">

 {/* ── CINEMATIC VAULT HEADER ── */}
 <header className="flex flex-col gap-10">
 {/* Eyebrow & Status Pills */}
 <div className="flex flex-wrap items-center justify-between gap-4">
 <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 dark:bg-primary/10 backdrop-blur-md">
 <Library size={16} className="text-primary" />
 <span className="text-[10px] font-black uppercase tracking-[0.25em] font-mono text-primary">
 ARCHIVE // PUSTAKA BELAJAR
 </span>
 </div>

 <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md">
 <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
 <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-mono">
 SINKRONISASI LURING: AKTIF
 </span>
 </div>
 </div>

 {/* Title & Description Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
 <div className="lg:col-span-8 space-y-6">
 <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-foreground leading-[0.92] drop-shadow-sm font-sans">
 PUSTAKA<br />
 <span className="bg-linear- bg-clip-text text-transparent">
 MATERI
 </span>
 </h1>
 <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed font-medium">
 Pusat referensi pembelajaran bahasa Jepang serba luring. Jelajahi ribuan kata, modul kanji interaktif, pola kalimat, hingga bahan simakan JLPT dalam satu vault terpadu.
 </p>
 </div>

 {/* Server Status Module in Header Right */}
 <div className="lg:col-span-4 flex lg:justify-end">
 <div className="w-full sm:w-auto">
 <LibraryServerStatus />
 </div>
 </div>
 </div>

 {/* ── METRIC STATS ── */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
 {stats.map((stat) => (
 <div 
 key={stat.label}
 className="relative group p-5 sm:p-6 rounded-2xl bg-card/60 dark:bg-card/30 border border-border/60 dark:border-white/10 backdrop-blur-md shadow-sm transition-all duration-300 flex flex-col items-center justify-center text-center gap-1.5 overflow-hidden"
 >
 <div 
 className="absolute top-0 inset-x-0 h-0.5 opacity-60"
 style={{ backgroundColor: `rgb(${stat.accentRgb})` }}
 />

 <span
 className="text-3xl sm:text-4xl md:text-5xl font-black tabular-nums tracking-tighter leading-none"
 style={{ color: `rgb(${stat.accentRgb})` }}
 >
 {stat.value.toLocaleString("id-ID")}
 </span>
 <span className="text-[10px] font-black font-mono text-muted-foreground uppercase tracking-widest pt-1">
 {stat.label}
 </span>
 </div>
 ))}
 </div>

 {/* Total Accumulated Banner Strip */}
 <div className="p-1 rounded-full bg-card/30 border border-border/40 dark:border-white/5 backdrop-blur-md">
 <div className="px-6 py-2.5 rounded-full bg-muted/20 flex flex-wrap items-center justify-center gap-3 text-center">
 <Sparkles size={14} className="text-primary animate-pulse shrink-0" />
 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] font-mono">
 {totalMateri.toLocaleString("id-ID")} TOTAL MATERI BELAJAR TERSEDIA LURING
 </span>
 </div>
 </div>
 </header>

 {/* ── BENTO NAVIGATION GRID ── */}
 <section className="space-y-8">
 <div className="flex items-center justify-between border-b border-border/40 dark:border-white/5 pb-4">
 <div className="flex items-center gap-3">
 <span className="size-2 rounded-full bg-primary" />
 <h2 className="text-xs font-black uppercase tracking-[0.3em] font-mono text-foreground">
 KATALOG DIREKTORI UTAMA
 </h2>
 </div>
 <span className="text-[11px] font-mono font-bold text-muted-foreground/60">
 6 DIREKTORI TERSEDIA
 </span>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch">
 {categories.map((cat, idx) => (
 <LibraryCategoryCard
 key={cat.href}
 {...cat}
 index={idx}
 />
 ))}
 </div>
 </section>

 </div>
 </div>
 );
}