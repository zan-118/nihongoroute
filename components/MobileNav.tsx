"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Layers, User, BrainCircuit } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: Home, label: "Beranda" },
    { href: "/courses", icon: BookOpen, label: "Belajar" },
    { href: "/review", icon: BrainCircuit, label: "Hafalan" }, // Ubah ikon dan teks
    { href: "/library", icon: Layers, label: "Koleksi" },
    { href: "/dashboard", icon: User, label: "Profil" },
  ];

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
      <nav className="bg-[#0f1115]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        <ul className="flex justify-between items-center px-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <li key={item.href} className="w-[18%]">
                <Link
                  href={item.href}
                  className="flex flex-col items-center justify-center p-2 rounded-xl transition-all"
                >
                  <div
                    className={`p-2 rounded-xl mb-1 transition-all ${
                      isActive
                        ? "bg-cyber-neon/10 text-cyber-neon shadow-[0_0_15px_rgba(0,255,239,0.2)]"
                        : "text-white/40"
                    }`}
                  >
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span
                    className={`text-[8px] font-black uppercase tracking-wider ${
                      isActive ? "text-cyber-neon" : "text-white/40"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
