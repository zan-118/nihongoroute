/**
 * @file page.tsx
 * @description Halaman khusus donasi dan transparansi pengembangan aplikasi. 
 * Menghubungkan pengguna dengan pintu dukungan eksternal (Trakteer/Saweria).
 * @module SupportPage
 */

"use client";

// ======================
// IMPORTS
// ======================
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Coffee,
  Heart,
  ShieldCheck,
  Zap,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// ======================
// MAIN EXECUTION
// ======================

export default function SupportPage() {
  const router = useRouter();

  return (
    <div className="w-full flex-1 flex flex-col overflow-x-hidden bg-background text-foreground transition-colors duration-300 min-h-screen relative">
      {/* Dynamic Galactic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 neural-grid opacity-[0.15] mix-blend-overlay" />
        <div className="absolute top-[-10%] right-[-5%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-primary/10 rounded-full blur-[100px] sm:blur-[140px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-secondary/5 rounded-full blur-[90px] sm:blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-destructive/5 rounded-full blur-[100px] pointer-events-none" />
      </div>

      <nav className="p-4 sm:p-6 sticky top-0 bg-background/60 backdrop-blur-2xl z-50 border-b border-border/80 transition-all">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-all group bg-background/25 glass h-auto px-4 py-2.5 rounded-xl border border-border/80"
          >
            <ChevronLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Kembali
          </Button>

          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 shrink-0 drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]">
              <Image
                src="/logo-branding.svg"
                alt="Logo NihongoRoute"
                fill
                className="object-contain rounded-md"
              />
            </div>
            <div className="font-black italic text-lg sm:text-xl tracking-tighter text-foreground hidden sm:block">
              Nihongo<span className="text-primary">Route</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 w-full flex-1">
        <section className="text-center mb-16 sm:mb-24">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
            className="w-20 h-20 bg-card border border-border/80 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-[0_20px_40px_rgba(0,0,0,0.3)] relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent opacity-60" />
            <Heart
              className="text-destructive fill-red-500 animate-pulse relative z-10 drop-shadow-[0_0_12px_rgba(var(--destructive-rgb),0.6)]"
              size={32}
            />
            <div className="absolute inset-0 bg-destructive blur-2xl opacity-30" />
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tight text-foreground leading-none mb-6 sm:mb-8 uppercase select-none"
          >
            Wujudkan Akses <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-emerald-400 drop-shadow-md">
              Belajar Gratis.
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground/80 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-semibold italic px-2 sm:px-0"
          >
            Dukungan Anda sangat berarti agar{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500 font-black not-italic">NihongoRoute</span> tetap
            berjalan, gratis, terus berkembang, dan tanpa iklan yang mengganggu
            bagi para pejuang bahasa Jepang.
          </motion.p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 sm:mb-28">
          <DonationCard
            href="https://trakteer.id/Zan118/tip"
            title="Trakteer"
            desc="Dukungan via Dompet Digital (Gopay/OVO/ShopeePay)"
            icon="☕"
            accent="border-destructive/30 hover:border-destructive/80"
            label="Traktir Kami Kopi"
            shadowColor="hover:shadow-[0_0_35px_rgba(var(--destructive-rgb),0.15)] hover:bg-destructive/[0.02]"
            glowColor="bg-destructive/5"
          />
          <DonationCard
            href="https://saweria.co/Zan118"
            title="Saweria"
            desc="Dukungan via QRIS / Dana / LinkAja"
            icon="💸"
            accent="border-warning/30 hover:border-warning/80"
            label="Kirim Dukungan"
            shadowColor="hover:shadow-[0_0_35px_rgba(var(--warning-rgb),0.15)] hover:bg-warning/[0.02]"
            glowColor="bg-warning/5"
          />
        </div>

        <Card className="glass border border-border/80 rounded-[3rem] p-8 sm:p-12 md:p-16 shadow-[0_30px_70px_rgba(0,0,0,0.4)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-6xl sm:text-8xl font-black italic select-none uppercase tracking-tighter pointer-events-none text-foreground font-japanese">
            TRANSPARANSI
          </div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 mb-12 relative z-10 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center shadow-inner relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/10 animate-pulse" />
              <ShieldCheck className="text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)] relative z-10" size={26} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground uppercase italic tracking-widest leading-none pt-1">
              Alokasi Dana
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 relative z-10">
            <StatItem
              icon={<Zap className="text-warning drop-shadow-[0_0_8px_rgba(var(--warning-rgb),0.4)]" size={22} />}
              title="Infrastruktur"
              desc="Biaya server database (Supabase), hosting (Vercel), dan domain agar aplikasi tetap ngebut dan stabil."
              color="bg-warning/10 border-warning/30"
            />
            <StatItem
              icon={<Globe className="text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]" size={22} />}
              title="Konten Baru"
              desc="Pengembangan silabus, rekaman audio, dan ekspansi materi JLPT dari level N4 hingga N1 secara bertahap."
              color="bg-primary/10 border-primary/30"
            />
            <StatItem
              icon={<Coffee className="text-secondary drop-shadow-[0_0_8px_rgba(var(--secondary-rgb),0.4)]" size={22} />}
              title="Pengembangan"
              desc="Menjaga saya (Developer) tetap terjaga untuk mengembangkan fitur baru dan memperbaiki masalah teknis di malam hari."
              color="bg-secondary/10 border-secondary/30"
            />
          </div>
        </Card>

        <footer className="mt-20 sm:mt-28 mb-16 text-center pb-8 sm:pb-12">
          <div className="mb-16 flex flex-col items-center">
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-muted-foreground/50 mb-6">
              Butuh Panduan Awal?
            </p>
            <Button 
              onClick={() => router.push("/onboarding")}
              variant="outline" 
              className="rounded-2xl h-14 px-8 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-black uppercase tracking-widest text-xs transition-all duration-300 group shadow-lg"
            >
              Mulai Ulang Tutorial <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.5em] text-primary/70 mb-4 bg-primary/10 w-max mx-auto px-5 py-2 rounded-full border border-primary/30 shadow-[0_0_15px_rgba(var(--primary-rgb),0.08)]">
            Kontribusi Langsung
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground/70 italic max-w-md mx-auto leading-relaxed font-semibold">
            &quot;Satu cangkir kopi darimu, satu langkah lebih dekat untuk kita semua
            menguasai bahasa Jepang.&quot;
          </p>
        </footer>
      </main>
    </div>
  );
}

// ======================
// HELPER COMPONENTS
// ======================

interface DonationCardProps {
  href: string;
  title: string;
  desc: string;
  icon: string;
  accent: string;
  label: string;
  shadowColor: string;
  glowColor: string;
}

function DonationCard({
  href,
  title,
  desc,
  icon,
  accent,
  label,
  shadowColor,
  glowColor,
}: DonationCardProps) {
  return (
    <motion.a
      href={href}
      target="_blank"
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      className="block h-full cursor-pointer"
    >
      <Card
        className={`group relative p-8 sm:p-12 rounded-[2.5rem] bg-card border border-border/80 ${accent} ${shadowColor} transition-all duration-500 shadow-[0_15px_40px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col h-full`}
      >
        <div className={`absolute top-0 right-0 w-48 h-48 ${glowColor} blur-[70px] rounded-full pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity`} />
        
        <div className="absolute top-0 right-0 p-6 sm:p-8 opacity-[0.03] text-5xl sm:text-7xl font-black italic group-hover:opacity-[0.06] transition-opacity pointer-events-none uppercase text-foreground font-japanese select-none">
          {title}
        </div>
        <div className="text-5xl sm:text-6xl mb-6 sm:mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform origin-left duration-300 drop-shadow-xl select-none">
          {icon}
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-foreground italic mb-2 uppercase tracking-tighter">
          {title}
        </h3>
        <p className="text-xs sm:text-xs text-muted-foreground/80 font-bold uppercase tracking-widest mb-8 sm:mb-10 leading-relaxed">
          {desc}
        </p>
        <div className="mt-auto flex items-center gap-3 text-primary font-black uppercase text-xs tracking-[0.2em] group-hover:text-primary/90 transition-colors">
          <div className="h-[2px] w-8 bg-primary group-hover:w-14 transition-all shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
          {label}
        </div>
      </Card>
    </motion.a>
  );
}

interface StatItemProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
}

function StatItem({ icon, title, desc, color }: StatItemProps) {
  return (
    <div className="group text-center sm:text-left flex flex-col items-center sm:items-start">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border transition-all duration-500 shadow-xl ${color} group-hover:scale-110`}
      >
        {icon}
      </div>
      <h4 className="text-foreground font-black uppercase italic tracking-widest mb-3 text-sm sm:text-base">
        {title}
      </h4>
      <p className="text-xs sm:text-sm text-muted-foreground/70 leading-relaxed italic font-semibold">
        {desc}
      </p>
    </div>
  );
}
