"use client";

/**
 * @file useNavbar.ts
 * @description Hook kustom untuk mengelola data menu dan fungsi navigasi panel samping/navigasi utama.
 */

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  Dashboard,
  GraduationCap,
  Wrench,
  FileText,
  Brain,
  BookOpen,
  Team,
  Settings,
  Share,
  Question
} from "@/components/ui/icons";
import { useUserStore } from "@/store/useUserStore";
import { useAuthStore } from "@/store/useAuthStore";
import { ROUTES } from "@/lib/routes";

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
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

  const links: NavLinks = useMemo(() => ({
    main: [
      { href: ROUTES.DASHBOARD, label: "Dasbor", icon: Dashboard },
      { href: ROUTES.COURSES.ROOT, label: "Materi", icon: GraduationCap },
      { href: ROUTES.TOOLS.ROOT, label: "Peralatan", icon: Wrench },
      { href: ROUTES.EXAMS.ROOT, label: "Ujian", icon: FileText },
    ],
    learn: [
      { href: ROUTES.REVIEW, label: "Hafalan (SRS)", icon: Brain },
      { href: ROUTES.LIBRARY.ROOT, label: "Pustaka", icon: BookOpen },
      { href: ROUTES.SOCIAL, label: "Komunitas", icon: Team },
    ],
    system: [
      { href: ROUTES.SETTINGS, label: "Pengaturan", icon: Settings },
      { href: ROUTES.SHARE, label: "Bagikan", icon: Share },
      { href: ROUTES.SUPPORT, label: "Bantuan", icon: Question },
    ]
  }), []);

 return { 
 pathname, 
 links, 
 isAuthenticated, 
 isGuest,
 userFullName, 
 handleLogout 
 };
}
