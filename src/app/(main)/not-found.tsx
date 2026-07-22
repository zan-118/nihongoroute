/**
 * @file not-found.tsx
 * @description Halaman penanganan kesalahan 404 (Rute Tidak Ditemukan) khusus untuk grup rute utama (main group).
 * Terintegrasi dengan layout shell utama agar navigasi tetap utuh dan siber-premium khas NihongoRoute.
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPinOff, ArrowLeft, LayoutDashboard } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";

/**
 * MainNotFound component.
 * Renders 404 error page for main route group.
 * Provides navigation links back to dashboard or library.
 */
export default function MainNotFound() {
  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 text-center relative overflow-hidden transition-colors duration-300">
      {/* Kisi Neural & Pendar Latar Belakang */}
      <div className="neural-grid" />
      {/* Background glow effects. Enhance visual depth. */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="size-[500px] bg-destructive/10 rounded-full blur-[120px] opacity-35 absolute -top-12 -left-12" />
        <div className="size-[400px] bg-primary/10 rounded-full blur-[100px] opacity-25 absolute -bottom-10 -right-10" />
      </div>

      {/* Angka Estetika Latar Belakang */}
      {/* Large decorative 404 text. Absolute positioned. */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.015] z-0">
        <span className="text-[25vw] font-black text-foreground tracking-tighter">
          404
        </span>
      </div>

      {/* Main content card. Glassmorphism style. */}
      <Card className="p-8 md:p-12 border border-border max-w-lg w-full relative z-10 rounded-[2.5rem] bg-card/40  shadow-[0_20px_50px_rgba(var(--foreground-rgb),0.3)] hover:shadow-[0_25px_60px_rgb(var(--primary-rgb)/0.1)] transition-all duration-500 glass">
        {/* Kilau Pojok Siber */}
        <div className="absolute top-0 right-0 size-24 bg-gradient-to-br from-primary/10 to-transparent blur-md rounded-tr-[2.5rem] pointer-events-none" />

        {/* Elemen Tematik Jepang */}
        {/* Japanese localization header. Adds thematic flavor. */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-center mb-4">
            <div className="size-20 bg-destructive/10 rounded-lg flex items-center justify-center border border-destructive/20 shadow-[0_0_20px_rgb(var(--destructive-rgb)/0.15)] animate-premium-bounce">
              <MapPinOff className="text-destructive animate-pulse" size={36} />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl tracking-tight text-foreground font-japanese">
            道に迷いましたか？
          </h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
            (Michi ni mayoimashita ka?)
          </p>
        </div>

        <div className="space-y-3 mb-8">
          <h2 className="text-xl text-foreground uppercase tracking-tight">
            Materi Nggak Ketemu
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-medium">
            Kayaknya materi ini udah dihapus, dipindah, atau memang belum ada.
          </p>
        </div>

        {/* Tombol Aksi */}
        {/* Navigation buttons. Redirect user to valid routes. */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          <Button asChild size="lg" className="w-full sm:w-auto font-black uppercase tracking-widest text-xs h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgb(var(--primary-rgb)/0.15)] hover:shadow-[0_0_20px_rgb(var(--primary-rgb)/0.3)] duration-300">
            <Link href="/dashboard" className="flex items-center justify-center gap-2">
              <LayoutDashboard size={14} />
              Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto font-black uppercase tracking-widest text-xs h-12 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground duration-300">
            <Link href="/library" className="flex items-center justify-center gap-2">
              <ArrowLeft size={14} />
              Ke Pustaka
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}