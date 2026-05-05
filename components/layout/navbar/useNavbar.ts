import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  Layers, 
  BrainCircuit, 
  Settings,
  Share2,
  Users,
  HelpCircle,
  LucideIcon
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { useAuthStore } from "@/store/useAuthStore";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavLinks {
  main: NavLink[];
  learn: NavLink[];
  system: NavLink[];
}

export function useNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const userFullName = useUserStore(s => s.name);
  const isGuest = useUserStore(s => s.isGuest);
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const links: NavLinks = {
    main: [
      { href: "/dashboard", label: "Dasbor", icon: LayoutDashboard },
      { href: "/courses", label: "Materi", icon: BookOpen },
      { href: "/exams", label: "Ujian", icon: Trophy },
    ],
    learn: [
      { href: "/review", label: "Hafalan (SRS)", icon: BrainCircuit },
      { href: "/library", label: "Pustaka", icon: Layers },
      { href: "/social", label: "Komunitas", icon: Users },
    ],
    system: [
      { href: "/settings", label: "Pengaturan", icon: Settings },
      { href: "/share", label: "Bagikan", icon: Share2 },
      { href: "/support", label: "Bantuan", icon: HelpCircle },
    ]
  };

  return { 
    pathname, 
    links, 
    isAuthenticated, 
    isGuest,
    userFullName, 
    handleLogout 
  };
}
