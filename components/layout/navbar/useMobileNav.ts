import { usePathname } from "next/navigation";
import { Home, BookOpen, BrainCircuit, Trophy, LogIn, User } from "lucide-react";
import { useProgressStore } from "@/store/useProgressStore";
import { useShallow } from "zustand/react/shallow";

export function useMobileNav() {
  const pathname = usePathname();
  const { isAuthenticated, userFullName } = useProgressStore(
    useShallow((state) => ({ isAuthenticated: state.isAuthenticated, userFullName: state.userFullName }))
  );

  const navItems = [
    { href: "/", icon: Home, label: "Beranda" },
    { href: "/courses", icon: BookOpen, label: "Materi" },
    { href: "/review", icon: BrainCircuit, label: "Hafalan" },
    { href: "/social", icon: Trophy, label: "Sosial" },
    { 
      href: isAuthenticated ? "/dashboard" : "/login", 
      icon: isAuthenticated ? User : LogIn, 
      label: isAuthenticated ? (userFullName ? userFullName.split(' ')[0].substring(0, 7) : "Profil") : "Masuk" 
    },
  ];

  return { pathname, navItems };
}
