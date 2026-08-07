"use client";

/**
 * @file useMobileNav.ts
 * @description Hook kustom untuk navigasi bawah pada perangkat seluler.
 */

import { usePathname } from "next/navigation";
import { 
  Dashboard, 
  GraduationCap, 
  Brain, 
  BookOpen, 
  User, 
  LoginBox 
} from "@/components/ui/icons";
import { useUserStore } from "@/store/useUserStore";
import { useAuthStore } from "@/store/useAuthStore";
import { ROUTES } from "@/lib/core/routes";

export function useMobileNav() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userFullName = useUserStore((state) => state.name);

  const navItems = [
    { href: "/dashboard", icon: Dashboard, label: "Beranda" },
    { href: "/courses", icon: GraduationCap, label: "Materi" },
    { href: ROUTES.REVIEW, icon: Brain, label: "Hafalan" },
    { href: "/library", icon: BookOpen, label: "Pustaka" },
    { 
      href: isAuthenticated ? ROUTES.SETTINGS : "/login", 
      icon: isAuthenticated ? User : LoginBox, 
      label: isAuthenticated ? (userFullName ? userFullName.split(' ')[0].substring(0, 7) : "Profil") : "Masuk" 
    },
  ];

 return { pathname, navItems };
}
