import { usePathname, useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  Layers, 
  BrainCircuit, 
  Heart, 
  Settings,
  Share2
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";

export function useNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
    const { name, xp, level, streak, todayReviewCount, lastStudyDate, studyDays, inventory } = useUserStore();
    const { srs } = useSRSStore();
    const { notifications, settings } = useUIStore();
    const progress = { name, xp, level, streak, todayReviewCount, lastStudyDate, studyDays, inventory, srs, notifications, settings };
  const userFullName = progress.name;
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const links = {
    main: [
      { href: "/dashboard", label: "Dasbor", icon: LayoutDashboard },
      { href: "/courses", label: "Materi", icon: BookOpen },
      { href: "/exams", label: "Ujian", icon: Trophy },
    ],
    learn: [
      { href: "/library", label: "Pustaka", icon: Layers },
      { href: "/review", label: "Hafalan", icon: BrainCircuit },
      { href: "/social", label: "Sosial", icon: Trophy },
    ],
    system: [
      { href: "/support", label: "Dukungan", icon: Heart },
      { href: "/settings", label: "Pengaturan", icon: Settings },
      { href: "/share", label: "Bagikan", icon: Share2 },
    ]
  };

  return { pathname, isAuthenticated, userFullName, handleLogout, links, progress };
}
