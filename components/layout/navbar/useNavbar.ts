import { usePathname, useRouter } from "next/navigation";
import { useProgressStore } from "@/store/useProgressStore";
import { useShallow } from "zustand/react/shallow";
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

export function useNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, progress } = useProgressStore(
    useShallow((state) => ({ 
      isAuthenticated: state.isAuthenticated, 
      progress: state.progress
    }))
  );
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
