import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPinOff, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-6 relative overflow-hidden transition-colors duration-300">
      {/* Background Decor & Neural Grid */}
      <div className="neural-grid" />
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] bg-destructive/10 rounded-full blur-[120px] opacity-30 absolute -top-12 -left-12" />
        <div className="w-[450px] h-[450px] bg-primary/10 rounded-full blur-[100px] opacity-25 absolute -bottom-10 -right-10" />
      </div>
      
      {/* Background Aesthetic Number */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.02] z-0">
        <span className="text-[30vw] font-black text-foreground tracking-tighter">
          404
        </span>
      </div>

      <div className="z-10 flex flex-col items-center text-center max-w-md w-full glass border border-border/80 rounded-[2rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        {/* Japanese Thematic Element */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-destructive/10 rounded-2xl flex items-center justify-center border border-destructive/20 shadow-[0_0_20px_rgba(var(--destructive-rgb),0.15)] animate-bounce">
              <MapPinOff className="text-destructive animate-pulse" size={36} />
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground font-japanese">
            道に迷いましたか？
          </h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
            (Michi ni mayoimashita ka?)
          </p>
        </div>

        <div className="space-y-3 mb-8">
          <h2 className="text-xl font-black text-foreground uppercase tracking-tight">
            Rute Tidak Ditemukan
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-medium">
            Sepertinya Anda keluar dari jalur pembelajaran utama. Halaman ini mungkin telah dipindahkan atau belum tersedia saat ini.
          </p>
        </div>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <Button asChild size="lg" className="w-full font-black uppercase tracking-widest text-xs h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)] hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] duration-300">
            <Link href="/dashboard" className="flex items-center justify-center gap-2">
              <Home size={16} />
              Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full font-black uppercase tracking-widest text-xs h-12 rounded-xl border border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground duration-300">
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
