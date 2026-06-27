/**
 * @file useMobileNav.ts
 * @description Hook kustom untuk navigasi bawah pada perangkat seluler.
 */

// ======================
// IMPOR
// ======================
import { usePathname } from "next/navigation";
import { 
  CustomDashboardIcon, 
  CustomHubIcon, 
  CustomSRSIcon, 
  CustomLibraryIcon, 
  CustomUserIcon, 
  CustomLoginIcon 
} from "@/components/ui/CustomIcons";
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
    { href: "/dashboard", icon: CustomDashboardIcon, label: "Beranda" },
    { href: "/learning-hub", icon: CustomHubIcon, label: "Hub" },
    { href: "/review", icon: CustomSRSIcon, label: "Hafalan" },
    { href: "/library", icon: CustomLibraryIcon, label: "Pustaka" },
    { 
      href: isAuthenticated ? "/settings" : "/login", 
      icon: isAuthenticated ? CustomUserIcon : CustomLoginIcon, 
      label: isAuthenticated ? (userFullName ? userFullName.split(' ')[0].substring(0, 7) : "Profil") : "Masuk" 
    },
  ];

  return { pathname, navItems };
}
