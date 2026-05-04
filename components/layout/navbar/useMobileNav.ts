import { usePathname } from "next/navigation";
import { Home, BookOpen, BrainCircuit, Library, LogIn, User } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { useAuthStore } from "@/store/useAuthStore";

export function useMobileNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const { name: userFullName } = useUserStore();

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Beranda" },
    { href: "/courses", icon: BookOpen, label: "Materi" },
    { href: "/review", icon: BrainCircuit, label: "Hafalan" },
    { href: "/library", icon: Library, label: "Pustaka" },
    { 
      href: isAuthenticated ? "/dashboard" : "/login", 
      icon: isAuthenticated ? User : LogIn, 
      label: isAuthenticated ? (userFullName ? userFullName.split(' ')[0].substring(0, 7) : "Profil") : "Masuk" 
    },
  ];

  return { pathname, navItems };
}
