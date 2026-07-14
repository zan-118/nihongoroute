/**
 * @file useMobileNav.ts
 * @description Hook kustom untuk navigasi bawah pada perangkat seluler.
 */

// ======================
// IMPOR
// ======================
import { usePathname } from "next/navigation";
import { 
  CustomDashboardIcon, 
  CustomHubIcon, 
  CustomSRSIcon, 
  CustomLibraryIcon, 
  CustomUserIcon, 
  CustomLoginIcon 
} from "@/components/ui/CustomIcons";
import { useUserStore } from "@/store/useUserStore";
import { useAuthStore } from "@/store/useAuthStore";

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Custom hook to manage mobile bottom navigation state and items.
 * Generates navigation links dynamically based on user authentication status.
 * 
 * @returns {Object} Navigation state and items.
 * @returns {string} return.pathname - Current active URL path.
 * @returns {Array<{href: string, icon: React.ComponentType, label: string}>} return.navItems - List of navigation links.
 */
export function useMobileNav() {
  // Get current active path for highlighting active tab
  const pathname = usePathname();
  
  // Fetch authentication state and user details from global stores
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userFullName = useUserStore((state) => state.name);

  // Define navigation items. Last item changes dynamically based on auth state.
  const navItems = [
    { href: "/dashboard", icon: CustomDashboardIcon, label: "Beranda" },
    { href: "/learning-hub", icon: CustomHubIcon, label: "Hub" },
    { href: "/review", icon: CustomSRSIcon, label: "Hafalan" },
    { href: "/library", icon: CustomLibraryIcon, label: "Pustaka" },
    { 
      href: isAuthenticated ? "/settings" : "/login", 
      icon: isAuthenticated ? CustomUserIcon : CustomLoginIcon, 
      // If authenticated, show first name truncated to 7 characters. Otherwise, show "Masuk".
      label: isAuthenticated ? (userFullName ? userFullName.split(' ')[0].substring(0, 7) : "Profil") : "Masuk" 
    },
  ];

  return { pathname, navItems };
}