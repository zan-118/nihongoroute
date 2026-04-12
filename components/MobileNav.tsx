"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useProgress } from "@/context/UserProgressContext";
import { useMemo } from "react";
import { SRSState } from "@/lib/srs";

export default function MobileNav() {
  const pathname = usePathname() || "";
  const { progress } = useProgress();

  if (pathname.startsWith("/studio")) return null;

  const hasDueCards = useMemo(() => {
    const now = Date.now();
    const srsValues = Object.values(progress.srs) as SRSState[];
    return srsValues.some((card) => card.nextReview <= now);
  }, [progress.srs]);

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] bg-cyber-bg/80 backdrop-blur-2xl border-t border-white/5 px-4 pb-8 pt-3 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
      <div className="flex justify-between items-center max-w-md mx-auto relative">
        <NavItem href="/" icon="🏠" label="Home" active={isActive("/")} />
        <NavItem
          href="/courses"
          icon="📚"
          label="Learn"
          active={isActive("/courses")}
        />

        <Link
          href="/dashboard/review"
          className="relative -mt-12 group"
          aria-label="Review Cards"
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-2xl border-2 transition-all ${
              pathname.includes("/review")
                ? "bg-cyber-neon border-cyber-neon text-cyber-bg"
                : "bg-cyber-surface border-white/10 text-white/60"
            }`}
          >
            🧠
            {hasDueCards && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-cyber-bg"></span>
              </span>
            )}
          </motion.div>

          <span
            className={`text-[8px] font-black uppercase tracking-tighter text-center block mt-2 ${
              pathname.includes("/review") ? "text-cyber-neon" : "text-white/20"
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
        active ? "text-cyber-neon" : "text-white/40"
      }`}
    >
      <span
        className={`text-xl transition-transform ${
          active ? "scale-110 drop-shadow-[0_0_8px_rgba(0,255,239,0.8)]" : ""
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
