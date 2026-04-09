"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const JLPT_LEVELS = ["n5", "n4", "n3", "n2", "n1"];

function formatSegment(segment: string): string {
  if (segment === "jlpt") return "JLPT";
  if (JLPT_LEVELS.includes(segment)) return segment.toUpperCase();
  return segment
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export default function Navbar() {
  const pathname = usePathname() ?? "";

  // Sembunyikan Navbar Desktop jika sedang buka CMS
  if (pathname.startsWith("/studio")) return null;

  const segments = pathname.split("/").filter(Boolean);
  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1f242d]/90 backdrop-blur-2xl border-b border-white/5 h-16 md:h-20 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">
        {/* LEFT: LOGO & BREADCRUMB */}
        <div className="flex items-center gap-4 md:gap-6">
          <Link
            href="/"
            className="flex items-center gap-3 group shrink-0 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#1e2024] to-[#23272b] rounded-[14px] flex items-center justify-center border border-white/10 group-hover:border-[#0ef]/50 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all">
              <span className="text-[#0ef] font-black italic text-xl">N</span>
            </div>
            <span className="hidden md:inline text-xl font-black italic text-white tracking-tight uppercase">
              Nihongo<span className="text-[#0ef]">Path</span>
            </span>
          </Link>

          {/* BREADCRUMB */}
          {segments.length > 0 && (
            <div className="hidden md:flex items-center gap-2 text-xs uppercase tracking-widest text-[#c4cfde]/50 font-bold">
              {segments.map((segment, index) => {
                const href = "/" + segments.slice(0, index + 1).join("/");
                const isLast = index === segments.length - 1;

                return (
                  <div key={href} className="flex items-center gap-2">
                    <span className="opacity-50">/</span>
                    {isLast ? (
                      <span className="text-[#0ef]">
                        {formatSegment(segment)}
                      </span>
                    ) : (
                      <Link
                        href={href}
                        className="hover:text-[#0ef] transition-colors"
                      >
                        {formatSegment(segment)}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT NAV */}
        <div className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-widest">
          <div className="flex gap-6 border-r border-white/10 pr-6">
            {JLPT_LEVELS.map((level) => (
              <Link
                key={level}
                href={`/jlpt/${level}`}
                className={`transition-colors relative group py-2 ${
                  isActive(`/jlpt/${level}`)
                    ? "text-[#0ef]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {level.toUpperCase()}
                {isActive(`/jlpt/${level}`) && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#0ef] shadow-[0_0_10px_#0ef]"></span>
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className={`px-5 py-2.5 rounded-xl transition-all ${
                isActive("/dashboard")
                  ? "bg-[#0ef]/10 text-[#0ef] border border-[#0ef]/30"
                  : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              Dashboard
            </Link>

            <Link
              href="/support"
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                isActive("/support")
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                  : "bg-gradient-to-br from-[#1e2024] to-[#23272b] text-white hover:border-blue-500/50 border border-white/10"
              }`}
            >
              <span className="text-sm">💙</span>
              <span className="hidden lg:inline italic tracking-wider">
                Support
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
