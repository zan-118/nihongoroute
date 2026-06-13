/**
 * @file useMobileNav.ts
 * @description Hook kustom untuk navigasi bawah pada perangkat seluler.
 */

// ======================
// IMPOR
// ======================
import { usePathname } from "next/navigation";
import { Compass, Home, BrainCircuit, Library, LogIn, User } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { useAuthStore } from "@/store/useAuthStore";

// ======================
// EKSEKUSI UTAMA
// ======================
export function useMobileNav() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userFullName = useUserStore((state) => state.name);

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Beranda" },
    { href: "/learning-hub", icon: Compass, label: "Hub" },
    { href: "/review", icon: BrainCircuit, label: "Hafalan" },
    { href: "/library", icon: Library, label: "Pustaka" },
    { 
      href: isAuthenticated ? "/settings" : "/login", 
      icon: isAuthenticated ? User : LogIn, 
      label: isAuthenticated ? (userFullName ? userFullName.split(' ')[0].substring(0, 7) : "Profil") : "Masuk" 
    },
  ];

  return { pathname, navItems };
}
