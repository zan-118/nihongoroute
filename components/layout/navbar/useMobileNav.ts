import { usePathname } from "next/navigation";
import { Home, BookOpen, BrainCircuit, Library, LogIn, User } from "lucide-react";
import { useProgressStore } from "@/store/useProgressStore";
import { useShallow } from "zustand/react/shallow";

export function useMobileNav() {
  const pathname = usePathname();
  const { isAuthenticated, progress } = useProgressStore(
    useShallow((state) => ({ 
      isAuthenticated: state.isAuthenticated, 
      progress: state.progress 
    }))
  );
  const userFullName = progress.name;

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
