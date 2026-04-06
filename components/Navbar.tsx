"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* ============================= */
/* CONSTANTS */
/* ============================= */

const JLPT_LEVELS = ["n5", "n4", "n3", "n2", "n1"];

/* ============================= */
/* HELPERS */
/* ============================= */

function formatSegment(segment: string): string {
  if (segment === "jlpt") return "JLPT";

  if (JLPT_LEVELS.includes(segment)) return segment.toUpperCase();

  return segment
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

/* ============================= */
/* COMPONENT */
/* ============================= */

export default function Navbar() {
  const pathname = usePathname() ?? "";
  const segments = pathname.split("/").filter(Boolean);

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1f242d]/80 backdrop-blur-xl border-b border-white/5 h-16">
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-full flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-6">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-8 h-8 bg-[#1e2024] rounded-xl flex items-center justify-center border border-white/5 group-hover:border-[#0ef]/50 transition-all">
              <span className="text-[#0ef] font-black italic text-lg">N</span>
            </div>

            <span className="hidden md:inline text-lg font-black italic text-white tracking-tight uppercase">
              Nihongo
              <span className="text-[#0ef]">Path</span>
            </span>
          </Link>

          {/* BREADCRUMB */}
          {segments.length > 0 && (
            <div className="hidden md:flex items-center gap-2 text-xs uppercase tracking-wider text-[#c4cfde]/50">
              {segments.map((segment, index) => {
                const href = "/" + segments.slice(0, index + 1).join("/");

                const isLast = index === segments.length - 1;

                return (
                  <div key={href} className="flex items-center gap-2">
                    <span>/</span>

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
        <div className="hidden md:flex items-center gap-6 text-sm">
          {JLPT_LEVELS.map((level) => (
            <Link
              key={level}
              href={`/jlpt/${level}`}
              className={`transition-colors ${
                isActive(`/jlpt/${level}`) ? "text-[#0ef]" : "hover:text-[#0ef]"
              }`}
            >
              {level.toUpperCase()}
            </Link>
          ))}

          <Link
            href="/dashboard"
            className={`transition-colors ${
              isActive("/dashboard") ? "text-[#0ef]" : "hover:text-[#0ef]"
            }`}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}
