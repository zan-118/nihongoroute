"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useProgress } from "@/context/UserProgressContext";
import { useMemo } from "react";

export default function MobileNav() {
  const pathname = usePathname() || "";
  const { progress } = useProgress();

  if (pathname.startsWith("/studio")) return null;

  // ✨ FIX: Logika pengecekan kartu yang jatuh tempo ✨
  const hasDueCards = useMemo(() => {
    const now = Date.now();
    // Mencari apakah ada minimal satu kartu yang waktu review-nya sudah lewat/saat ini
    return Object.values(progress.srs).some(
      (card: any) => card.nextReview <= now,
    );
  }, [progress.srs]);

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] bg-[#1f242d]/80 backdrop-blur-2xl border-t border-white/5 px-4 pb-8 pt-3 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
      <div className="flex justify-between items-center max-w-md mx-auto relative">
        <NavItem href="/" icon="🏠" label="Home" active={isActive("/")} />

        <NavItem
          href="/jlpt"
          icon="📚"
          label="Learn"
          active={isActive("/jlpt")}
        />

        {/* SRS REVIEW BUTTON (Pusat Navigasi) */}
        <Link href="/dashboard/review" className="relative -mt-12 group">
          <motion.div
            whileTap={{ scale: 0.9 }}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-2xl border-2 transition-all ${
              pathname.includes("/review")
                ? "bg-[#0ef] border-[#0ef] text-[#1f242d]"
                : "bg-[#1e2024] border-white/10 text-white/60"
            }`}
          >
            🧠
            {/* ✨ RED NOTIFICATION DOT ✨ */}
            {hasDueCards && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-[#1f242d]"></span>
              </span>
            )}
          </motion.div>

          <span
            className={`text-[8px] font-black uppercase tracking-tighter text-center block mt-2 ${
              pathname.includes("/review") ? "text-[#0ef]" : "text-white/20"
            }`}
          >
            Review
          </span>
        </Link>

        <NavItem
          href="/library"
          icon="🏛️"
          label="Library"
          active={isActive("/library")}
        />

        <NavItem
          href="/dashboard"
          icon="📊"
          label="Stats"
          active={isActive("/dashboard") && !pathname.includes("/review")}
        />
      </div>
    </nav>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${
        active ? "text-[#0ef]" : "text-white/40"
      }`}
    >
      <span
        className={`text-xl transition-transform ${
          active ? "scale-110 drop-shadow-[0_0_8px_#0ef]" : ""
        }`}
      >
        {icon}
      </span>
      <span className="text-[9px] font-black uppercase tracking-tighter">
        {label}
      </span>
    </Link>
  );
}
