"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const pathname = usePathname() ?? "";

  // BUKTIKAN KESAKTIANNYA DI SINI: Sembunyikan navigasi jika sedang buka CMS
  if (pathname.startsWith("/studio")) return null;

  /* ----------------------------- */
  /* DETECT CURRENT LEVEL */
  /* ----------------------------- */
  const levelMatch = pathname.match(/^\/jlpt\/(n[1-5])/);
  const currentLevel = levelMatch?.[1];

  /* ----------------------------- */
  /* ACTIVE CHECK */
  /* ----------------------------- */
  const isActive = (path: string) => {
    if (path === "/jlpt") {
      return pathname.startsWith("/jlpt") && !pathname.includes("/flashcards");
    }
    if (path === "/flashcards") {
      return pathname.includes("/flashcards");
    }
    return pathname.startsWith(path);
  };

  /* ----------------------------- */
  /* RENDER */
  /* ----------------------------- */
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1f242d]/90 backdrop-blur-xl border-t border-white/10 md:hidden z-50 px-2 pb-6 pt-2">
      <div className="grid grid-cols-4 items-center max-w-md mx-auto justify-items-center">
        {/* Tab 1: Learn */}
        <Link
          href="/jlpt"
          className={`flex flex-col items-center justify-center w-[64px] h-[64px] rounded-2xl active:scale-90 transition-all ${
            isActive("/jlpt")
              ? "bg-[#0ef]/10 text-[#0ef]"
              : "text-white/40 hover:text-white/80"
          }`}
        >
          <span
            className={`text-xl mb-1 transition-transform ${isActive("/jlpt") ? "scale-110 drop-shadow-[0_0_8px_rgba(0,255,239,0.5)]" : ""}`}
          >
            📚
          </span>
          <span className="text-[9px] font-black uppercase tracking-widest">
            Learn
          </span>
        </Link>

        {/* Tab 2: Practice */}
        <Link
          href={currentLevel ? `/jlpt/${currentLevel}/flashcards` : "/jlpt"}
          className={`flex flex-col items-center justify-center w-[72px] h-[72px] -mt-8 rounded-full border-4 border-[#1f242d] shadow-xl active:scale-95 transition-all ${
            isActive("/flashcards")
              ? "bg-[#0ef] text-[#1f242d] shadow-[0_0_20px_rgba(0,255,239,0.4)]"
              : "bg-gradient-to-br from-[#1e2024] to-[#23272b] text-white/60 hover:text-white"
          }`}
        >
          <span
            className={`text-2xl transition-transform ${isActive("/flashcards") ? "scale-110" : ""}`}
          >
            🧠
          </span>
          <span
            className={`text-[9px] font-black uppercase tracking-widest mt-1 ${isActive("/flashcards") ? "text-[#1f242d]" : ""}`}
          >
            Test
          </span>
        </Link>

        {/* Tab 3: Dashboard/Stats */}
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center w-[64px] h-[64px] rounded-2xl active:scale-90 transition-all ${
            isActive("/dashboard")
              ? "bg-[#0ef]/10 text-[#0ef]"
              : "text-white/40 hover:text-white/80"
          }`}
        >
          <span
            className={`text-xl mb-1 transition-transform ${isActive("/dashboard") ? "scale-110 drop-shadow-[0_0_8px_rgba(0,255,239,0.5)]" : ""}`}
          >
            📊
          </span>
          <span className="text-[9px] font-black uppercase tracking-widest">
            Stats
          </span>
        </Link>

        {/* Tab 4: Support */}
        <Link
          href="/support"
          className={`flex flex-col items-center justify-center w-[64px] h-[64px] rounded-2xl active:scale-90 transition-all ${
            isActive("/support")
              ? "bg-blue-500/10 text-blue-400"
              : "text-white/40 hover:text-white/80"
          }`}
        >
          <span
            className={`text-xl mb-1 transition-transform ${isActive("/support") ? "scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : ""}`}
          >
            💙
          </span>
          <span className="text-[9px] font-black uppercase tracking-widest">
            Support
          </span>
        </Link>
      </div>
    </div>
  );
}
