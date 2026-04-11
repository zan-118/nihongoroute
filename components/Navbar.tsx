"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const JLPT_LEVELS = ["n5", "n4", "n3", "n2", "n1"];

function formatSegment(segment: string): string {
  if (segment === "jlpt") return "Curriculum";
  if (segment === "library") return "Library"; // Penanda folder utama baru
  if (JLPT_LEVELS.includes(segment.toLowerCase())) return segment.toUpperCase();
  return segment
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export default function Navbar() {
  const pathname = usePathname() ?? "";

  if (pathname.startsWith("/studio")) return null;

  const segments = pathname.split("/").filter(Boolean);
  const isActive = (path: string) =>
    pathname === path || (path !== "/" && pathname.startsWith(path));

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1f242d]/80 backdrop-blur-xl border-b border-white/5 h-20 hidden md:block">
      <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
        {/* LEFT: LOGO & BREADCRUMB */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#0ef] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,255,239,0.3)] group-hover:scale-110 transition-transform">
              <span className="text-[#1f242d] font-black italic text-xl">
                N
              </span>
            </div>
            <span className="text-xl font-black italic text-white tracking-tighter uppercase group-hover:text-[#0ef] transition-colors">
              NIHONGO<span className="text-[#0ef]">ROUTE</span>
            </span>
          </Link>

          {/* BREADCRUMB - Sekarang akan otomatis menampilkan /Library/Verbs dll */}
          {segments.length > 0 && (
            <div className="hidden lg:flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
              <span className="text-lg font-thin">/</span>
              {segments.map((segment, index) => {
                const href = "/" + segments.slice(0, index + 1).join("/");
                const isLast = index === segments.length - 1;

                return (
                  <div key={href} className="flex items-center gap-3">
                    <Link
                      href={href}
                      className={`hover:text-[#0ef] transition-colors ${isLast ? "text-[#0ef]" : ""}`}
                    >
                      {formatSegment(segment)}
                    </Link>
                    {!isLast && <span className="text-lg font-thin">/</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: NAVIGATION LINKS */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-6 border-r border-white/10 pr-8">
            <NavLink href="/jlpt" label="Learn" active={isActive("/jlpt")} />

            {/* Navigasi Library Baru (Menggantikan 3 menu lama) */}
            <NavLink
              href="/library"
              label="Library"
              active={isActive("/library")}
            />

            {/* Kamu bisa tetap menaruh shortcut spesifik jika ingin, 
                tapi /library sudah mencakup semuanya */}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/support"
              className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all"
            >
              <span className="text-red-500 group-hover:scale-110 transition-transform text-sm">
                💙
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-red-400/80 group-hover:text-red-400">
                Support
              </span>
            </Link>
            <Link
              href="/dashboard"
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                isActive("/dashboard")
                  ? "bg-[#0ef] text-[#1f242d] shadow-[0_0_15px_rgba(0,255,239,0.4)]"
                  : "text-white/60 hover:text-white bg-white/5 border border-white/5 hover:border-white/10"
              }`}
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`relative py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${
        active ? "text-[#0ef]" : "text-white/40 hover:text-white"
      }`}
    >
      {label}
      {active && (
        <motion.div
          layoutId="nav-underline"
          className="absolute bottom-0 left-0 w-full h-[2px] bg-[#0ef] shadow-[0_0_10px_#0ef]"
        />
      )}
    </Link>
  );
}
