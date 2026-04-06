"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* ============================= */
/* COMPONENT */
/* ============================= */

export default function MobileNav() {
  const pathname = usePathname() ?? "";

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

  const linkClass = (path: string) =>
    `flex-1 text-center py-3 transition-colors ${
      isActive(path) ? "text-[#0ef]" : "text-white/60"
    }`;

  /* ----------------------------- */
  /* RENDER */
  /* ----------------------------- */

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1e2024] border-t border-white/10 md:hidden z-50">
      <div className="flex text-xs uppercase tracking-wider">
        {/* Learn */}
        <Link href="/jlpt" className={linkClass("/jlpt")}>
          📚 Learn
        </Link>

        {/* Practice */}
        <Link
          href={currentLevel ? `/jlpt/${currentLevel}/flashcards` : "/jlpt"}
          className={linkClass("/flashcards")}
        >
          🧠 Practice
        </Link>

        {/* Dashboard */}
        <Link href="/dashboard" className={linkClass("/dashboard")}>
          📊 Progress
        </Link>
      </div>
    </div>
  );
}
