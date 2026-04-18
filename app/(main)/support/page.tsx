"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  Coffee,
  Heart,
  ShieldCheck,
  Zap,
  Globe,
} from "lucide-react";

export default function SupportPage() {
  const router = useRouter();

  return (
    <div className="w-full flex-1  selection:bg-cyan-400/30 flex flex-col overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-cyan-400/5 rounded-full blur-[80px] sm:blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-blue-600/5 rounded-full blur-[60px] sm:blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      </div>

      <nav className="p-4 sm:p-6 sticky top-0 bg-cyber-bg/80 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-white/40 hover:text-cyan-400 transition-all group bg-white/5 px-4 py-2 rounded-xl border border-white/10"
          >
            <ChevronLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Kembali
          </button>

          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 shrink-0 drop-shadow-[0_0_8px_rgba(34,211,238,0.2)]">
              <Image
                src="/logo-branding.svg"
                alt="Logo NihongoRoute"
                fill
                className="object-contain rounded-md"
              />
            </div>
            <div className="font-black italic text-lg sm:text-xl tracking-tighter text-white hidden sm:block">
              Nihongo<span className="text-cyan-400">Route</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full flex-1">
        <section className="text-center mb-16 sm:mb-20">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-cyber-surface border border-white/10 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-[10px_10px_20px_rgba(0,0,0,0.3)] relative"
          >
            <Heart
              className="text-red-500 fill-red-500 animate-pulse"
              size={28}
            />
            <div className="absolute inset-0 bg-red-500 blur-xl opacity-20" />
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tight text-white leading-tight mb-4 sm:mb-6 uppercase"
          >
            Misi Akses <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              Pendidikan Gratis.
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[#c4cfde]/60 text-xs sm:text-sm md:text-base max-w-lg mx-auto leading-relaxed italic px-2 sm:px-0"
          >
            Dukungan Anda adalah bahan bakar utama agar{" "}
            <span className="text-white font-bold">NihongoRoute</span> tetap
            hidup, gratis, terus berkembang, dan tanpa iklan yang mengganggu
            bagi para pejuang bahasa Jepang.
          </motion.p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-16 sm:mb-24">
          <DonationCard
            href="https://trakteer.id/Zan118/tip"
            title="Trakteer"
            desc="Dukungan via E-Wallet (Gopay/OVO/ShopeePay)"
            icon="☕"
            accent="hover:border-red-500/40"
            label="Traktir Kami Kopi"
            shadowColor="hover:shadow-[0_10px_30px_rgba(239,68,68,0.15)]"
          />
          <DonationCard
            href="https://saweria.co/Zan118"
            title="Saweria"
            desc="Dukungan via QRIS / Dana / LinkAja"
            icon="💸"
            accent="hover:border-yellow-500/40"
            label="Kirim Dukungan"
            shadowColor="hover:shadow-[0_10px_30px_rgba(234,179,8,0.15)]"
          />
        </div>

        <section className="bg-cyber-surface/80 border border-white/5 rounded-[2rem] sm:rounded-[3.5rem] p-8 sm:p-10 md:p-16 shadow-2xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-6xl sm:text-8xl font-black italic select-none uppercase tracking-tighter pointer-events-none">
            TRANSPARANSI
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 sm:gap-4 mb-10 sm:mb-12 relative z-10 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center shadow-inner">
              <ShieldCheck className="text-cyan-400" size={24} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-widest leading-none pt-1">
              Alokasi Dana
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 relative z-10">
            <StatItem
              icon={<Zap className="text-yellow-400" size={20} />}
              title="Infrastruktur"
              desc="Biaya server database (Sanity), hosting (Vercel), dan domain agar aplikasi tetap ngebut dan stabil."
              color="bg-yellow-400/10 border-yellow-400/30"
            />
            <StatItem
              icon={<Globe className="text-blue-400" size={20} />}
              title="Konten Baru"
              desc="Pengembangan silabus, rekaman audio, dan ekspansi materi JLPT dari level N4 hingga N1 secara bertahap."
              color="bg-blue-400/10 border-blue-400/30"
            />
            <StatItem
              icon={<Coffee className="text-cyan-400" size={20} />}
              title="Pengembangan"
              desc="Menjaga saya (Developer) tetap terjaga untuk coding fitur-fitur baru dan membasmi bug di malam hari."
              color="bg-cyan-400/10 border-cyan-400/30"
            />
          </div>
        </section>

        {/* DIUBAH: Menambahkan margin-bottom ekstra agar tidak terhalang MobileNav */}
        <footer className="mt-16 sm:mt-24 mb-20 text-center pb-8 sm:pb-12">
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400/50 mb-3 sm:mb-4 bg-cyan-400/5 w-max mx-auto px-4 py-1.5 rounded-full border border-cyan-400/10">
            Kontribusi Langsung
          </p>
          <p className="text-xs sm:text-sm text-white/40 italic max-w-md mx-auto leading-relaxed">
            "Satu cangkir kopi darimu, satu langkah lebih dekat untuk kita semua
            menguasai bahasa Jepang."
          </p>
        </footer>
      </main>
    </div>
  );
}

// ... komponen DonationCard dan StatItem tetap sama
function DonationCard({
  href,
  title,
  desc,
  icon,
  accent,
  label,
  shadowColor,
}: any) {
  return (
    <motion.a
      href={href}
      target="_blank"
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] bg-cyber-surface border border-white/5 ${accent} ${shadowColor} transition-all duration-500 shadow-xl overflow-hidden flex flex-col h-full`}
    >
      <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-[0.02] text-5xl sm:text-7xl font-black italic group-hover:opacity-[0.05] transition-opacity pointer-events-none">
        {title}
      </div>
      <div className="text-4xl sm:text-5xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform origin-left drop-shadow-lg">
        {icon}
      </div>
      <h3 className="text-2xl sm:text-3xl font-black text-white italic mb-2 uppercase tracking-tighter">
        {title}
      </h3>
      <p className="text-[10px] sm:text-xs text-white/50 font-medium uppercase tracking-widest mb-6 sm:mb-8 leading-relaxed">
        {desc}
      </p>
      <div className="mt-auto flex items-center gap-3 text-cyan-400 font-black uppercase text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em]">
        <div className="h-[2px] w-6 sm:w-8 bg-cyan-400 group-hover:w-10 sm:group-hover:w-12 transition-all shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
        {label}
      </div>
    </motion.a>
  );
}

function StatItem({ icon, title, desc, color }: any) {
  return (
    <div className="group text-center sm:text-left flex flex-col items-center sm:items-start">
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-4 sm:mb-6 border transition-colors shadow-inner ${color}`}
      >
        {icon}
      </div>
      <h4 className="text-white font-black uppercase italic tracking-widest mb-2 sm:mb-3 text-sm sm:text-base">
        {title}
      </h4>
      <p className="text-xs sm:text-sm text-[#c4cfde]/50 leading-relaxed italic">
        {desc}
      </p>
    </div>
  );
}
