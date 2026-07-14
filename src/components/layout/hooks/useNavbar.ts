/**
 * @file useNavbar.ts
 * @description Hook kustom untuk mengelola data menu dan fungsi navigasi panel samping/navigasi utama.
 */

// ======================
// IMPOR
// ======================
import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  CustomDashboardIcon,
  CustomHubIcon,
  CustomCoursesIcon,
  CustomToolsIcon,
  CustomExamsIcon,
  CustomSRSIcon,
  CustomLibraryIcon,
  CustomCommunityIcon,
  CustomSettingsIcon,
  CustomShareIcon,
  CustomHelpIcon
} from "@/components/ui/CustomIcons";
import { useUserStore } from "@/store/useUserStore";
import { useAuthStore } from "@/store/useAuthStore";
import { ROUTES } from "@/lib/routes";

// ======================
// ANTARMUKA / TIPE DATA
// ======================
/**
 * Navigation link item structure.
 */
interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

/**
 * Grouped navigation links.
 */
interface NavLinks {
  main: NavLink[];
  learn: NavLink[];
  system: NavLink[];
}

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * Hook manage navbar state, links, user session, logout action.
 * @returns Navbar state and handlers.
 */
export function useNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const userFullName = useUserStore(s => s.name);
  const isGuest = useUserStore(s => s.isGuest);
  
  // Initialize Supabase client for auth actions.
  const supabase = createClient();

  /**
   * Sign out user and refresh page.
   */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  // Memoize links to prevent unnecessary re-renders.
  const links: NavLinks = useMemo(() => ({
    main: [
      { href: ROUTES.DASHBOARD, label: "Dasbor", icon: CustomDashboardIcon },
      { href: ROUTES.LEARNING_HUB, label: "Learning Hub", icon: CustomHubIcon },
      { href: ROUTES.COURSES.ROOT, label: "Materi", icon: CustomCoursesIcon },
      { href: "/tools", label: "Peralatan", icon: CustomToolsIcon },
      { href: ROUTES.EXAMS.ROOT, label: "Ujian", icon: CustomExamsIcon },
    ],
    learn: [
      { href: "/review", label: "Hafalan (SRS)", icon: CustomSRSIcon },
      { href: ROUTES.LIBRARY.ROOT, label: "Pustaka", icon: CustomLibraryIcon },
      { href: "/social", label: "Komunitas", icon: CustomCommunityIcon },
    ],
    system: [
      { href: "/settings", label: "Pengaturan", icon: CustomSettingsIcon },
      { href: "/share", label: "Bagikan", icon: CustomShareIcon },
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