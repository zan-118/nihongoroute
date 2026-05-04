import { usePathname } from "next/navigation";
import { Home, BookOpen, BrainCircuit, Library, LogIn, User } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";

export function useMobileNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
    const { name, xp, level, streak, todayReviewCount, lastStudyDate, studyDays, inventory } = useUserStore();
    const { srs } = useSRSStore();
    const { notifications, settings } = useUIStore();
    const progress = { name, xp, level, streak, todayReviewCount, lastStudyDate, studyDays, inventory, srs, notifications, settings };
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
