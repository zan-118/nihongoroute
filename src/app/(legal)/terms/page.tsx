/**
 * @file terms/page.tsx
 * @description Terms of Service page route component for the NihongoRoute platform.
 */

// ==========================================
// Import & Dependencies
// ==========================================
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Compass, Shield } from "@/components/ui/icons";
import AppBreadcrumbs from "@/components/layout/AppBreadcrumbs";
import { createPageMetadata } from "@/lib/seo";
import { getBreadcrumbItems } from "@/lib/routes";

// ==========================================
// Metadata Configuration
// ==========================================
/**
 * Metadata configuration for the Terms of Service page.
 * Sets SEO titles, descriptions, and canonical path.
 */
export const metadata = {
 ...createPageMetadata({
 title: "Syarat & Ketentuan | NihongoRoute",
 description:
 "Syarat dan Ketentuan penggunaan platform belajar bahasa Jepang NihongoRoute.",
 path: "/terms",
 }),
};

/**
 * TermsPage component.
 * Renders the NihongoRoute Terms of Service page with localized Indonesian content.
 * Includes layout elements, breadcrumbs, and legal sections.
 * 
 * @returns {React.JSX.Element} The rendered Terms of Service page.
 */
export default function TermsPage() {
 return (
 <main className="min-h-screen bg-background text-foreground py-24 px-4 sm:px-6 md:px-12 relative overflow-hidden flex flex-col items-center justify-start transition-colors duration-300">
 {/* Hamparan Neural Latar Belakang */}
 <div className="grid-overlay" />
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--secondary)/0.07)_0%,transparent_70%)] pointer-events-none z-0" />
 <div className="absolute top-1/4 left-0 size-75 bg-[hsl(var(--secondary)/0.03)] rounded-full blur-[60px] pointer-events-none z-0 ambient-glow will-change-transform" />
 <div className="absolute bottom-1/4 right-0 size-62.5 bg-[hsl(var(--primary)/0.02)] rounded-full blur-[80px] pointer-events-none z-0 ambient-glow will-change-transform" />

 <div className="max-w-4xl w-full relative z-10 flex flex-col">
 {/* Breadcrumb / Navigasi Atas */}
 <div className="mb-8 animate-fade-in">
 <AppBreadcrumbs
 items={getBreadcrumbItems("/terms")}
 className="w-fit max-w-full"
 />
 </div>

 {/* Kartu Cyber-glass Premium Luar */}
 <div className="glass border border-border/60 rounded-xl p-6 sm:p-10 md:p-14 shadow-[0_0_50px_hsl(var(--secondary)/0.05)] relative overflow-hidden">
 {/* Aksen Sudut Halus */}
 <div className="absolute top-0 right-0 w-8 h-0.5 bg-linear- " />
 <div className="absolute top-0 right-0 w-0.5 h-8 bg-linear- " />
 <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-linear- " />
 <div className="absolute bottom-0 left-0 w-0.5 h-8 bg-linear- " />

 {/* Header Jepang */}
 <header className="mb-12 border-b border-border/60 pb-8 relative">
 <div className="flex items-center gap-3 mb-4">
 <div className="size-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shadow-[0_0_15px_hsl(var(--secondary)/0.2)]">
 <BookOpen size={20} />
 </div>
 <span className="text-xs font-black tracking-widest text-secondary uppercase bg-secondary/5 border border-secondary/10 px-3 py-1 rounded-full">
 Platform Terms
 </span>
 </div>
 
 <h1 className="text-4xl md:text-5xl font-black text-foreground font-japanese tracking-tight mb-3 select-none">
 利用規約
 </h1>
 <p className="text-sm md:text-base font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
 Terms of Service <span className="text-secondary/60">•</span> Syarat & Ketentuan
 </p>
 </header>

 {/* Konten Tipografi Minimalis & Modern */}
 <article className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground space-y-8">
 <div className="flex items-center gap-2 text-xs font-semibold text-secondary/80 bg-secondary/5 border border-secondary/10 w-fit px-4 py-2 rounded-xl">
 <span className="size-2 rounded-full bg-secondary animate-pulse" />
 {/* suppressHydrationWarning used because server and client render times may differ slightly */}
 <span suppressHydrationWarning={true}>Terakhir diperbarui: {new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</span>
 </div>

 <p className="lead text-base md:text-lg text-foreground/80 leading-relaxed font-medium border-l-2 border-secondary/30 pl-4">
 Dengan mengakses dan menggunakan platform <strong className="text-foreground font-semibold">NihongoRoute</strong>, Anda secara sadar menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak menyetujui sebagian atau seluruh ketentuan ini, Anda dilarang menggunakan platform kami.
 </p>

 {/* Seksi 1 */}
 <div className="space-y-4 pt-4 border-t border-border/20">
 <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
 <span className="text-sm font-bold bg-secondary/10 text-secondary border border-secondary/20 size-8 rounded-lg flex items-center justify-center shadow-[0_0_10px_hsl(var(--secondary)/0.1)]">1</span>
 Platform Edukasi Non-Komersial
 </h2>
 <p className="leading-relaxed">
 NihongoRoute dibangun secara independen sebagai sarana pembelajaran bahasa Jepang berbasis non-komersial. Seluruh materi kosakata, kanji, penjelasan tata bahasa (grammar), materi membaca/mendengar, dan sistem kuis disediakan secara <strong className="text-foreground font-semibold">100% gratis</strong> untuk membantu seluruh pelajar Indonesia menguasai JLPT secara mandiri.
 </p>
 </div>

 {/* Seksi 2 */}
 <div className="space-y-4 pt-4 border-t border-border/20">
 <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
 <span className="text-sm font-bold bg-secondary/10 text-secondary border border-secondary/20 size-8 rounded-lg flex items-center justify-center shadow-[0_0_10px_hsl(var(--secondary)/0.1)]">2</span>
 Penggunaan yang Diizinkan
 </h2>
 <p className="leading-relaxed">
 Anda diberikan lisensi terbatas, non-eksklusif, dan tidak dapat dialihkan untuk menggunakan platform ini murni untuk kepentingan belajar mandiri Anda. Anda setuju untuk <strong className="font-semibold text-destructive">tidak melakukan tindakan terlarang berikut</strong>:
 </p>
 
 <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 list-none! pl-0!">
 <li className="glass border border-border/60 hover:border-secondary/30 rounded-2xl p-5 transition-all duration-300 group flex items-start gap-4 shadow-sm hover:shadow-[0_0_20px_hsl(var(--secondary)/0.02)]">
 <div className="size-8 rounded-lg bg-secondary/5 border border-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform duration-300">
 <Compass size={16} />
 </div>
 <div>
 <h3 className="font-bold text-foreground mb-1 text-sm">Eksploitasi Konten</h3>
 <p className="text-xs leading-relaxed text-muted-foreground">Menyalin, mengekstrak, memodifikasi, atau mendistribusikan konten NihongoRoute untuk kepentingan komersial.</p>
 </div>
 </li>
 <li className="glass border border-border/60 hover:border-secondary/30 rounded-2xl p-5 transition-all duration-300 group flex items-start gap-4 shadow-sm hover:shadow-[0_0_20px_hsl(var(--secondary)/0.02)]">
 <div className="size-8 rounded-lg bg-secondary/5 border border-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform duration-300">
 <Shield size={16} />
 </div>
 <div>
 <h3 className="font-bold text-foreground mb-1 text-sm">Automasi & Scraping</h3>
 <p className="text-xs leading-relaxed text-muted-foreground">Menggunakan program otomatis (bot atau scraper) yang berpotensi membebani server kami secara tidak wajar.</p>
 </div>
 </li>
 </ul>
 </div>

 {/* Seksi 3 */}
 <div className="space-y-4 pt-4 border-t border-border/20">
 <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
 <span className="text-sm font-bold bg-secondary/10 text-secondary border border-secondary/20 size-8 rounded-lg flex items-center justify-center shadow-[0_0_10px_hsl(var(--secondary)/0.1)]">3</span>
 Ketersediaan Layanan (&quot;As-Is&quot; Basis)
 </h2>
 <p className="leading-relaxed">
 Aplikasi dan fitur-fiturnya (termasuk algoritma SRS, Kuis, generator PDF, audio TTS, dsb.) disediakan secara &quot;Seadanya&quot; (<em>As-Is</em>) tanpa jaminan ketersediaan mutlak atau performa tanpa cacat. Namun, arsitektur <strong className="text-foreground font-semibold">Offline-First</strong> kami menjamin Anda tetap dapat belajar dan menyimpan progres secara lokal walaupun terjadi gangguan koneksi jaringan.
 </p>
 </div>

 {/* Seksi 4 */}
 <div className="space-y-4 pt-4 border-t border-border/20">
 <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
 <span className="text-sm font-bold bg-secondary/10 text-secondary border border-secondary/20 size-8 rounded-lg flex items-center justify-center shadow-[0_0_10px_hsl(var(--secondary)/0.1)]">4</span>
 Penghentian & Modifikasi Layanan
 </h2>
 <p className="leading-relaxed">
 Kami memegang hak prerogatif untuk mengubah, menangguhkan, atau menghentikan operasional platform sebagian atau seluruhnya kapan saja untuk penyesuaian infrastruktur. Meskipun demikian, kami akan berupaya keras mengomunikasikan pembaruan atau pemadaman besar kepada seluruh pengguna aktif demi meminimalisir gangguan.
 </p>
 </div>

 {/* Seksi 5 */}
 <div className="space-y-4 pt-4 border-t border-border/20">
 <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
 <span className="text-sm font-bold bg-secondary/10 text-secondary border border-secondary/20 size-8 rounded-lg flex items-center justify-center shadow-[0_0_10px_hsl(var(--secondary)/0.1)]">5</span>
 Perubahan Syarat & Ketentuan
 </h2>
 <p className="leading-relaxed">
 Syarat dan Ketentuan ini dapat diperbarui secara berkala menyesuaikan dengan arah pengembangan platform. Tanggal pembaruan terbaru akan selalu dicantumkan. Lanjutan penggunaan platform oleh Anda menandakan penerimaan penuh atas revisi syarat yang baru.
 </p>
 </div>
 </article>

 {/* Tombol Kembali Kaki Halaman */}
 <div className="pt-10 mt-14 border-t border-border/60 flex justify-start">
 <Link href="/dashboard">
 <Button variant="outline" className="rounded-2xl px-6 h-12 shadow-sm font-bold tracking-widest uppercase text-xs flex items-center gap-2 hover:bg-muted border border-border hover:border-secondary/30 transition-all duration-300">
 <ArrowLeft size={16} />
 <span>Kembali ke Dashboard</span>
 </Button>
 </Link>
 </div>
 </div>
 </div>
 </main>
 );
}