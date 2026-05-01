import { usePathname } from "next/navigation";
import { Home, BookOpen, Layers, BrainCircuit, User, LogIn } from "lucide-react";
import { useProgressStore } from "@/store/useProgressStore";
import { useShallow } from "zustand/react/shallow";

export function useMobileNav() {
  const pathname = usePathname();
  const { isAuthenticated, userFullName } = useProgressStore(
    useShallow((state) => ({ isAuthenticated: state.isAuthenticated, userFullName: state.userFullName }))
  );

  const navItems = isAuthenticated
    ? [
        { href: "/", icon: Home, label: "Beranda" },
        { href: "/courses", icon: BookOpen, label: "Materi" },
        { href: "/library", icon: Layers, label: "Pustaka" },
        { href: "/review", icon: BrainCircuit, label: "Hafalan" },
        { 
          href: "/dashboard", 
          icon: User, 
          label: userFullName ? userFullName.split(' ')[0].substring(0, 7) : "Dasbor" 
        },
      ]
    : [
        { href: "/", icon: Home, label: "Beranda" },
        { href: "/courses", icon: BookOpen, label: "Materi" },
        { href: "/library", icon: Layers, label: "Pustaka" },
        { href: "/review", icon: BrainCircuit, label: "Hafalan" },
        { href: "/login", icon: LogIn, label: "Masuk" },
      ];

  return { pathname, navItems };
}
