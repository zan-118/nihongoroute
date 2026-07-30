/**
 * @file useNavbar.ts
 * @description Hook kustom untuk mengelola data menu dan fungsi navigasi panel samping/navigasi utama.
 */

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  CustomDashboardIcon,
  CustomCoursesIcon,
  CustomToolsIcon,
  CustomExamsIcon,
  CustomSRSIcon,
  CustomLibraryIcon,
  CustomCommunityIcon,
  CustomSettingsIcon,
  CustomShareIcon,
  CustomHelpIcon
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
      { href: ROUTES.DASHBOARD, label: "Dasbor", icon: CustomDashboardIcon },
      { href: ROUTES.COURSES.ROOT, label: "Materi", icon: CustomCoursesIcon },
      { href: ROUTES.TOOLS.ROOT, label: "Peralatan", icon: CustomToolsIcon },
      { href: ROUTES.EXAMS.ROOT, label: "Ujian", icon: CustomExamsIcon },
    ],
    learn: [
      { href: ROUTES.REVIEW, label: "Hafalan (SRS)", icon: CustomSRSIcon },
      { href: ROUTES.LIBRARY.ROOT, label: "Pustaka", icon: CustomLibraryIcon },
      { href: ROUTES.SOCIAL, label: "Komunitas", icon: CustomCommunityIcon },
    ],
    system: [
      { href: ROUTES.SETTINGS, label: "Pengaturan", icon: CustomSettingsIcon },
      { href: ROUTES.SHARE, label: "Bagikan", icon: CustomShareIcon },
      { href: ROUTES.SUPPORT, label: "Bantuan", icon: CustomHelpIcon },
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
