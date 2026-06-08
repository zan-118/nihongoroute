/**
 * @file SupportClient.tsx
 * @description Client component for NihongoRoute support page.
 * @module SupportClient
 */

"use client";

// ======================
// IMPOR
// ======================
import React, { useState, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Coffee,
  Heart,
  ShieldCheck,
  Zap,
  Globe,
  ChevronDown,
  Trophy,
  Users,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// ======================
// TIPE DATA
// ======================
interface Supporter {
  name: string;
  amount: number;
  tier: "gold" | "silver" | "bronze";
  message: string;
  date: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS_MOCK: FAQItem[] = [
  {
    question: "Apakah NihongoRoute akan selalu gratis dan bebas iklan?",
    answer: "Ya! Komitmen utama NihongoRoute adalah menyediakan akses belajar bahasa Jepang yang setara, modern, dan 100% bebas dari iklan banner yang merusak fokus belajar siswa.",
  },
  {
    question: "Ke mana seluruh dana dukungan saya disalurkan?",
    answer: "100% dari dukungan Anda disalurkan langsung untuk membayar tagihan server awan (database Supabase), hosting cepat CDN (Vercel), perpanjangan nama domain tahunan, serta pembiayaan aset rekaman audio asli penutur bahasa Jepang.",
  },
  {
    question: "Bagaimana jika saya ingin berkontribusi kode atau materi?",
    answer: "Kami sangat menyambut kontribusi open-source! Anda dapat mengunjungi repositori GitHub resmi kami atau mengirim pesan langsung melalui menu kontak pengembang untuk berkolaborasi.",
  },
  {
    question: "Apakah ada batas minimum untuk memberikan dukungan?",
    answer: "Tidak ada batas minimum sama sekali. Satu rupiah pun dukungan Anda sangat berharga untuk menjaga kestabilan database server ulasan harian kami agar tetap beroperasi.",
  },
];

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
    <m.a
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
          <div className="h-[2px] w-8 bg-primary group-hover:w-14 transition-all shadow-[0_0_8px_rgb(var(--primary-rgb)/0.5)]" />
          {label}
        </div>
      </Card>
    </m.a>
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

export default function SupportClient() {
  const { back, push } = useRouter();
  const [supporterFilter, setSupporterFilter] = useState<"recent" | "top">("top");
  const [expandedFAQ, setExpandedFAQ] = useState<number>(-1);

  const supabase = useMemo(() => createClient(), []);

  // Fetch data donatur secara real-time dari Supabase
  const { data: dbSupporters = [] } = useQuery<Supporter[]>({
    queryKey: ["live-supporters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supporters")
        .select("name, amount, message, tier, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Gagal memuat data donatur dari Supabase, menggunakan mock fallback:", error);
        return [];
      }

      return (data || []).map((row) => ({
        name: row.name,
        amount: Number(row.amount),
        tier: (row.tier || "bronze") as "gold" | "silver" | "bronze",
        message: row.message || "",
        date: row.created_at || new Date().toISOString(),
      }));
    },
  });

  const allSupporters = dbSupporters;

  // Hitung total donasi terkumpul dan persentase target secara dinamis
  const totalDonations = allSupporters.reduce((sum, s) => sum + s.amount, 0);
  const monthlyTarget = 450000;
  const progressPercentage = Math.min(Math.round((totalDonations / monthlyTarget) * 100), 100);

  // Mengurutkan donatur berdasarkan filter aktif
  const sortedSupporters = [...allSupporters].sort((a, b) => {
    if (supporterFilter === "top") {
      return b.amount - a.amount;
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="w-full flex-1 flex flex-col overflow-x-hidden bg-transparent text-foreground transition-colors duration-300 min-h-screen relative">
      {/* Dynamic Galactic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 neural-grid opacity-[0.15] mix-blend-overlay" />
        <div className="absolute top-[-10%] right-[-5%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-primary/10 rounded-full blur-[100px] sm:blur-[140px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-secondary/5 rounded-full blur-[90px] sm:blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: "2s" }} />
        <div className="absolute top-[40%] left-[20%] size-[300px] bg-destructive/5 rounded-full blur-[100px] pointer-events-none" />
      </div>

      <nav className="p-4 sm:p-6 sticky top-0 bg-background/60 backdrop-blur-2xl z-50 border-b border-border/80 transition-all">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Button
            onClick={() => back()}
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
            <div className="relative size-8 shrink-0 drop-shadow-[0_0_8px_rgb(var(--primary-rgb)/0.3)]">
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
        {/* Header Hero Section */}
        <section className="text-center mb-16 sm:mb-24">
          <m.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
            className="size-20 bg-card border border-border/80 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-[0_20px_40px_rgba(0,0,0,0.3)] relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent opacity-60" />
            <Heart
              className="text-destructive fill-red-500 animate-pulse relative z-10 drop-shadow-[0_0_12px_rgb(var(--destructive-rgb)/0.6)]"
              size={32}
            />
            <div className="absolute inset-0 bg-destructive blur-2xl opacity-30" />
          </m.div>

          <m.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tight text-foreground leading-none mb-6 sm:mb-8 uppercase select-none"
          >
            Wujudkan Akses <br />
            <span className="text-primary drop-shadow-md">
              Belajar Gratis.
            </span>
          </m.h1>

          <m.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground/80 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-semibold italic px-2 sm:px-0"
          >
            Dukungan Anda sangat berarti agar{" "}
            <span className="text-primary font-black not-italic">NihongoRoute</span> tetap
            berjalan, gratis, terus berkembang, dan tanpa iklan yang mengganggu
            bagi para pejuang bahasa Jepang.
          </m.p>
        </section>

        {/* Donation Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 sm:mb-16">
          <DonationCard
            href="https://trakteer.id/nihongo_route/gift"
            title="Trakteer"
            desc="Dukungan via Dompet Digital (Gopay/OVO/ShopeePay)"
            icon="☕"
            accent="border-destructive/30 hover:border-destructive/80"
            label="Traktir Kami Kopi"
            shadowColor="hover:shadow-[0_0_35px_rgb(var(--destructive-rgb)/0.15)] hover:bg-destructive/[0.02]"
            glowColor="bg-destructive/5"
          />
          <DonationCard
            href="https://saweria.co/Zan118"
            title="Saweria"
            desc="Dukungan via QRIS / Dana / LinkAja"
            icon="💸"
            accent="border-warning/30 hover:border-warning/80"
            label="Kirim Dukungan"
            shadowColor="hover:shadow-[0_0_35px_rgb(var(--warning-rgb)/0.15)] hover:bg-warning/[0.02]"
            glowColor="bg-warning/5"
          />
        </div>

        {/* 1. INTERACTIVE TARGET BAR */}
        <Card className="glass border border-border/80 rounded-[3rem] p-8 sm:p-12 mb-12 sm:mb-16 shadow-[0_30px_70px_rgba(0,0,0,0.4)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-6xl sm:text-8xl font-black italic select-none uppercase tracking-tighter pointer-events-none text-foreground font-japanese pointer-events-none text-foreground font-japanese select-none">
            TARGET
          </div>
          <div className="absolute -top-40 -right-40 size-80 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="size-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center shadow-inner relative overflow-hidden">
              <Zap className="text-primary drop-shadow-[0_0_8px_rgb(var(--primary-rgb)/0.4)] relative z-10" size={22} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-foreground uppercase italic tracking-wider leading-none">
                Bilah Target Server
              </h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">
                Kemandirian Operasional Bulanan
              </p>
            </div>
          </div>

          <div className="relative z-10 mb-8">
            <div className="flex justify-between items-end mb-3">
              <span className="text-sm font-bold text-foreground bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                Rp {totalDonations.toLocaleString("id-ID")} <span className="text-muted-foreground text-xs font-semibold">Terkumpul</span>
              </span>
              <span className="text-lg font-black text-primary animate-pulse">
                {progressPercentage}%
              </span>
              <span className="text-sm font-bold text-muted-foreground">
                Target: Rp {monthlyTarget.toLocaleString("id-ID")}
              </span>
            </div>

            {/* Glowing Breathing HSL Progress Bar */}
            <div className="w-full h-5 bg-muted/60 rounded-full overflow-hidden relative border border-border/50 p-1">
              <m.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full shadow-[0_0_20px_rgb(var(--primary-rgb)/0.5)] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:16px_16px] animate-[shimmer_2s_linear_infinite]" />
              </m.div>
            </div>
          </div>

          {/* Interactive Cost Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10 pt-4 border-t border-border/40">
            <div className="p-4 rounded-2xl border border-border/50 bg-card/30 hover:border-warning/50 hover:bg-warning/[0.02] transition-all duration-300">
              <span className="text-[10px] font-black uppercase text-warning tracking-widest block mb-1">Database Server</span>
              <span className="text-sm font-black text-foreground block">Supabase: Rp 150K/bln</span>
              <p className="text-[10px] text-muted-foreground/80 leading-relaxed font-semibold italic mt-1">
                Menyimpan kosakata, ulasan SRS, dan data kemajuan siswa secara luring.
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-border/50 bg-card/30 hover:border-primary/50 hover:bg-primary/[0.02] transition-all duration-300">
              <span className="text-[10px] font-black uppercase text-primary tracking-widest block mb-1">Hosting & CDN</span>
              <span className="text-sm font-black text-foreground block">Vercel: Rp 200K/bln</span>
              <p className="text-[10px] text-muted-foreground/80 leading-relaxed font-semibold italic mt-1">
                Menjamin loading instan dan rendering Next.js yang ngebut di seluruh dunia.
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-border/50 bg-card/30 hover:border-secondary/5 hover:bg-secondary/[0.02] transition-all duration-300">
              <span className="text-[10px] font-black uppercase text-secondary tracking-widest block mb-1">Domain & Core</span>
              <span className="text-sm font-black text-foreground block">Domain: Rp 100K/bln</span>
              <p className="text-[10px] text-muted-foreground/80 leading-relaxed font-semibold italic mt-1">
                Biaya lisensi domain resmi dan pemeliharaan alat analisis kuromoji luring.
              </p>
            </div>
          </div>
        </Card>

        {/* Alokasi Dana (Transparansi) */}
        <Card className="glass border border-border/80 rounded-[3rem] p-8 sm:p-12 md:p-16 mb-12 sm:mb-16 shadow-[0_30px_70px_rgba(0,0,0,0.4)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-6xl sm:text-8xl font-black italic select-none uppercase tracking-tighter pointer-events-none text-foreground font-japanese">
            TRANSPARANSI
          </div>
          <div className="absolute -bottom-40 -left-40 size-80 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 mb-12 relative z-10 text-center sm:text-left">
            <div className="size-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center shadow-inner relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/10 animate-pulse" />
              <ShieldCheck className="text-primary drop-shadow-[0_0_8px_rgb(var(--primary-rgb)/0.4)] relative z-10" size={26} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground uppercase italic tracking-widest leading-none pt-1">
              Alokasi Dana
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 relative z-10">
            <StatItem
              icon={<Zap className="text-warning drop-shadow-[0_0_8px_rgb(var(--warning-rgb)/0.4)]" size={22} />}
              title="Infrastruktur"
              desc="Biaya server database (Supabase), hosting (Vercel), dan domain agar aplikasi tetap ngebut dan stabil."
              color="bg-warning/10 border-warning/30"
            />
            <StatItem
              icon={<Globe className="text-primary drop-shadow-[0_0_8px_rgb(var(--primary-rgb)/0.4)]" size={22} />}
              title="Konten Baru"
              desc="Pengembangan silabus, rekaman audio, dan ekspansi materi JLPT dari level N4 hingga N1 secara bertahap."
              color="bg-primary/10 border-primary/30"
            />
            <StatItem
              icon={<Coffee className="text-secondary drop-shadow-[0_0_8px_rgb(var(--secondary-rgb)/0.4)]" size={22} />}
              title="Pengembangan"
              desc="Menjaga saya (Developer) tetap terjaga untuk mengembangkan fitur baru dan memperbaiki masalah teknis di malam hari."
              color="bg-secondary/10 border-secondary/30"
            />
          </div>
        </Card>

        {/* 2. INTERACTIVE SUPPORTER WALL */}
        <Card className="glass border border-border/80 rounded-[3rem] p-8 sm:p-12 mb-12 sm:mb-16 shadow-[0_30px_70px_rgba(0,0,0,0.4)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-6xl sm:text-8xl font-black italic select-none uppercase tracking-tighter pointer-events-none text-foreground font-japanese">
            DONATUR
          </div>
          <div className="absolute -bottom-40 -right-40 size-80 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8 relative z-10 border-b border-border/40 pb-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-secondary/10 border border-secondary/30 flex items-center justify-center shadow-inner">
                <Users className="text-secondary drop-shadow-[0_0_8px_rgb(var(--secondary-rgb)/0.4)]" size={22} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-foreground uppercase italic tracking-wider leading-none">
                  Pejuang Dukungan
                </h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">
                  Apresiasi Donatur Heroik Kami
                </p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 p-1 rounded-xl bg-card/60 border border-border/50 backdrop-blur-md">
              <button type="button"
                onClick={() => setSupporterFilter("top")}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  supporterFilter === "top"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Terbesar
              </button>
              <button type="button"
                onClick={() => setSupporterFilter("recent")}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  supporterFilter === "recent"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Terbaru
              </button>
            </div>
          </div>

          {/* Supporters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {sortedSupporters.length === 0 ? (
              <div className="col-span-1 md:col-span-2 p-10 rounded-[2rem] border border-dashed border-border/80 text-center bg-card/10 backdrop-blur-md relative overflow-hidden group shadow-inner">
                <div className="text-4xl mb-4 animate-premium-bounce">☕</div>
                <h4 className="text-base font-black text-foreground uppercase tracking-wider mb-2">
                  Belum Ada Pejuang Dukungan
                </h4>
                <p className="text-xs text-muted-foreground/80 leading-relaxed font-semibold italic max-w-sm mx-auto mb-6 px-4">
                  Jadilah pejuang pertama yang menanam kebaikan untuk menjaga kelangsungan belajar bahasa Jepang gratis tanpa iklan!
                </p>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary animate-pulse">
                  Klik tombol trakteer / saweria di atas untuk memulai
                </div>
              </div>
            ) : (
              sortedSupporters.map((s, idx) => {
                let tierStyle = "border-border/60 hover:border-primary/50 shadow-sm";
                let badgeColor = "bg-muted text-muted-foreground border-border/40";
                let glowEffect = "rgb(var(--primary-rgb)/0.05)";
                let label = "Perunggu";

                if (s.tier === "gold") {
                  tierStyle = "border-[rgba(255,215,0,0.4)] bg-[rgba(255,215,0,0.015)] hover:bg-[rgba(255,215,0,0.03)]";
                  badgeColor = "bg-[rgba(255,215,0,0.15)] text-[rgba(255,215,0,1)] border-[rgba(255,215,0,0.3)]";
                  glowEffect = "rgba(255, 215, 0, 0.15)";
                  label = "Gold";
                } else if (s.tier === "silver") {
                  tierStyle = "border-[rgba(192,192,192,0.4)] bg-[rgba(192,192,192,0.015)] hover:bg-[rgba(192,192,192,0.03)]";
                  badgeColor = "bg-[rgba(192,192,192,0.15)] text-[rgba(180,180,180,1)] border-[rgba(192,192,192,0.3)]";
                  glowEffect = "rgba(192, 192, 192, 0.12)";
                  label = "Silver";
                } else if (s.tier === "bronze") {
                  tierStyle = "border-[rgba(180,110,50,0.4)] bg-[rgba(180,110,50,0.015)] hover:bg-[rgba(180,110,50,0.03)]";
                  badgeColor = "bg-[rgba(180,110,50,0.15)] text-[rgba(190,120,60,1)] border-[rgba(180,110,50,0.3)]";
                  glowEffect = "rgba(180, 110, 50, 0.08)";
                  label = "Bronze";
                }

                return (
                  <m.div
                    key={s.name + idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-5 rounded-2xl border transition-all duration-300 flex gap-4 items-start ${tierStyle}`}
                    style={{
                      boxShadow: `0 10px 30px rgba(0,0,0,0.15), 0 0 15px ${glowEffect}`,
                    }}
                  >
                    <div className="shrink-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${badgeColor}`}>
                        <Trophy size={18} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-sm font-black text-foreground truncate">{s.name}</h4>
                        <span className="text-xs font-black text-primary whitespace-nowrap">
                          Rp {s.amount.toLocaleString("id-ID")}
                        </span>
                      </div>
                      
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border tracking-wider mt-1 inline-block ${badgeColor}`}>
                        {label}
                      </span>

                      <p className="text-xs text-muted-foreground leading-relaxed font-semibold italic mt-3 pr-2 border-l-2 border-border pl-2">
                        &quot;{s.message}&quot;
                      </p>
                    </div>
                  </m.div>
                );
              })
            )}
          </div>
        </Card>

        {/* 3. SLEEK INTERACTIVE FAQ */}
        <Card className="glass border border-border/80 rounded-[3rem] p-8 sm:p-12 mb-12 sm:mb-16 shadow-[0_30px_70px_rgba(0,0,0,0.4)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-6xl sm:text-8xl font-black italic select-none uppercase tracking-tighter pointer-events-none text-foreground font-japanese">
            TANYA JAWAB
          </div>
          <div className="absolute -top-40 -left-40 size-80 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="flex items-center gap-4 mb-8 relative z-10 border-b border-border/40 pb-6">
            <div className="size-12 rounded-2xl bg-warning/10 border border-warning/30 flex items-center justify-center shadow-inner">
              <HelpCircle className="text-warning drop-shadow-[0_0_8px_rgb(var(--warning-rgb)/0.4)]" size={22} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-foreground uppercase italic tracking-wider leading-none">
                Tanya Jawab
              </h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">
                Keterbukaan & Akuntabilitas Penuh
              </p>
            </div>
          </div>

          {/* Accordion FAQ List */}
          <div className="flex flex-col gap-4 relative z-10">
            {FAQS_MOCK.map((faq, idx) => {
              const isOpen = expandedFAQ === idx;
              return (
                <div
                  key={faq.question}
                  className="p-5 rounded-2xl border border-border/60 bg-card/20 hover:border-primary/40 hover:bg-primary/[0.01] transition-all duration-300"
                >
                  <button type="button"
                    onClick={() => setExpandedFAQ(isOpen ? -1 : idx)}
                    className="w-full flex justify-between items-center text-left gap-4 outline-none group"
                  >
                    <span className="text-xs sm:text-sm font-black text-foreground group-hover:text-primary transition-colors leading-relaxed">
                      {faq.question}
                    </span>
                    <m.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="shrink-0 text-muted-foreground"
                    >
                      <ChevronDown size={18} />
                    </m.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <m.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 pb-1 text-xs sm:text-sm text-muted-foreground/80 leading-relaxed font-semibold italic border-t border-border/30 mt-4">
                          {faq.answer}
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Footer Navigation */}
        <footer className="mt-20 sm:mt-28 mb-16 text-center pb-8 sm:pb-12">
          <div className="mb-16 flex flex-col items-center">
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-muted-foreground/50 mb-6">
              Butuh Panduan Awal?
            </p>
            <Button
              onClick={() => push("/onboarding")}
              variant="outline"
              className="rounded-2xl h-14 px-8 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-black uppercase tracking-widest text-xs transition-all duration-300 group shadow-lg"
            >
              Mulai Ulang Tutorial <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.5em] text-primary/70 mb-4 bg-primary/10 w-max mx-auto px-5 py-2 rounded-full border border-primary/30 shadow-[0_0_15px_rgb(var(--primary-rgb)/0.08)]">
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
