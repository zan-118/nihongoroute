/**
 * @file not-found.tsx
 * @description 404 Route Not Found error page component featuring NihongoRoute cyber theme layout.
 */

// ==========================================
// Import & Dependencies
// ==========================================
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowLeft, Home } from "@/components/ui/icons";

// ==========================================
// Main Component
// ==========================================

/**
 * Render 404 error page.
 * Show Japanese theme layout with navigation buttons.
 * @returns React element.
 */
export default function NotFound() {
 return (
 <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-6 relative overflow-hidden transition-colors duration-300">
 {/* Dekorasi Latar Belakang & Kisi Neural */}
 <div className="grid-overlay" />
 {/* Background glow effects for visual depth */}
 <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
 <div className="size-[500px] bg-destructive/10 rounded-full blur-[120px] opacity-30 absolute -top-12 -left-12" />
 <div className="size-[450px] bg-primary/10 rounded-full blur-[100px] opacity-25 absolute -bottom-10 -right-10" />
 </div>
 
 {/* Angka Estetika Latar Belakang */}
 <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.02] z-0">
 <span className="text-[30vw] font-black text-foreground tracking-tighter">
 404
 </span>
 </div>

 <div className="z-10 flex flex-col items-center text-center max-w-md w-full glass border border-border rounded-[2rem] p-8 md:p-12 shadow-[0_20px_50px_hsl(var(--foreground)/0.3)]">
 {/* Elemen Tematik Jepang */}
 <div className="space-y-3 mb-6">
 <div className="flex justify-center mb-4">
 <div className="size-20 bg-destructive/10 rounded-lg flex items-center justify-center border border-destructive/20 shadow-[0_0_20px_hsl(var(--destructive)/0.15)] animate-premium-bounce">
 <MapPin className="text-destructive animate-pulse" size={36} />
 </div>
 </div>
 {/* Japanese text asks "Are you lost?" */}
 <h1 className="text-3xl tracking-tight text-foreground font-japanese">
 道に迷いましたか？
 </h1>
 <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
 (Michi ni mayoimashita ka?)
 </p>
 </div>

 <div className="space-y-3 mb-8">
 <h2 className="text-xl text-foreground uppercase tracking-tight">
 Halaman Nggak Ketemu
 </h2>
 <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-medium">
 Kayaknya kamu nyasar nih. Halaman ini mungkin udah dipindah atau belum tersedia.
 </p>
 </div>

 {/* Tombol Tindakan (Call to Actions) */}
 {/* Navigation links to dashboard or home */}
 <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
 <Button asChild size="lg" className="w-full font-black uppercase tracking-widest text-xs h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.15)] hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)] duration-300">
 <Link href="/dashboard" className="flex items-center justify-center gap-2">
 <Home size={16} />
 Dashboard
 </Link>
 </Button>
 <Button asChild variant="outline" size="lg" className="w-full font-black uppercase tracking-widest text-xs h-12 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground duration-300">
 <Link href="/" className="flex items-center justify-center gap-2">
 <ArrowLeft size={16} />
 Beranda
 </Link>
 </Button>
 </div>
 </div>
 </div>
 );
}