"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Layers, User, BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: Home, label: "Beranda" },
    { href: "/courses", icon: BookOpen, label: "Materi" },
    { href: "/review", icon: BrainCircuit, label: "Hafalan" },
    { href: "/library", icon: Layers, label: "Koleksi" },
    { href: "/dashboard", icon: User, label: "Profil" },
  ];

  return (
    // DIUBAH: Pindah dari bottom-4 ke bottom-6 untuk margin yang lebih lega
    <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
      {/* DIUBAH: Penyesuaian shadow dan efek glassmorphism agar lebih halus */}
      <nav className="bg-[#0f1115]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-[0_15px_35px_rgba(0,0,0,0.6)]">
        <ul className="flex justify-between items-center px-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <li key={item.href} className="w-[18%] relative">
                <Link
                  href={item.href}
                  className="flex flex-col items-center justify-center p-2 rounded-xl transition-all relative z-10"
                >
                  <div
                    className={`p-2 rounded-xl mb-1 transition-all duration-300 ${
                      isActive
                        ? "text-cyan-400"
                        : "text-slate-200 hover:text-white"
                    }`}
                  >
                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider transition-colors mt-0.5 ${
                      isActive
                        ? "text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]"
                        : "text-slate-300"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>

                {/* Indikator Latar Belakang Aktif */}
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute inset-1 bg-cyan-400/10 border border-cyan-400/20 rounded-xl z-0 shadow-[0_0_15px_rgba(34,211,238,0.1)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
