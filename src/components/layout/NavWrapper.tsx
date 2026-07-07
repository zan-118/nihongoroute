/**
 * @file NavWrapper.tsx
 * @description Komponen pembungkus navigasi utama di sisi klien (Desktop Sidebar, Topbar, MobileNav, breadcrumbs).
 */

"use client";

// ======================
// IMPOR
// ======================
import { ReactNode, useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileNav from "./MobileNav";
import dynamic from "next/dynamic";

const FloatingActions = dynamic(() => import("@/components/features/global/FloatingActions"), { ssr: false });
const AchievementToast = dynamic(() => import("./AchievementToast"), { ssr: false });
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBreadcrumbItems } from "@/lib/routes";
import AppBreadcrumbs from "./AppBreadcrumbs";

// ======================
// ANTARMUKA / TIPE DATA
// ======================
interface NavWrapperProps {
  children: ReactNode;
}

// ======================
// EKSEKUSI UTAMA
// ======================
export default function NavWrapper({ children }: NavWrapperProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isExamPage = pathname?.includes("/exams/");
  const hideMobileNav = isExamPage || pathname?.includes("/library/reading/");
  const breadcrumbItems = useMemo(() => getBreadcrumbItems(pathname), [pathname]);

  return (
    <div className="premium-shell relative min-h-dvh text-foreground flex flex-col md:flex-row overflow-x-hidden w-full transition-colors duration-300">
      {/* Aksesibilitas: Skip to Content */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-6 focus:left-6 focus:z-[100] focus:px-6 focus:py-3 focus:bg-primary focus:text-primary-foreground focus:font-black focus:rounded-xl focus:shadow-xl outline-none transition-all"
      >
        Skip to Content
      </a>

      {/* Sidebar Desktop & Mobile Drawer */}
      {!isExamPage && <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />}

      {/* Area Konten Utama */}
      <div className={`flex-1 flex flex-col min-w-0 ${!isExamPage ? 'md:pl-72' : ''} transition-all duration-500`}>
        {!isExamPage && <Topbar onMenuClick={() => setIsMobileMenuOpen(true)} />}
        <main
          id="main-content" 
          data-tour="main-content"
          className={`app-main-frame flex-1 w-full flex flex-col ${!isExamPage ? (hideMobileNav ? 'pb-12' : 'pb-[7.5rem] md:pb-12') : 'pb-12'} outline-none relative`}
        >
          {!isExamPage && (
            <div className="relative z-20 flex w-full animate-in items-center gap-2 px-4 pt-4 duration-500 fade-in slide-in-from-top-4 sm:px-6 md:px-8 md:pt-6 lg:px-10 xl:px-12">
              <Button 
                onClick={() => router.back()}
                variant="ghost" 
                className="action-icon hidden size-10 shrink-0 p-0 md:inline-flex"
                aria-label="Kembali"
              >
                <ChevronLeft size={16} />
              </Button>

              <AppBreadcrumbs items={breadcrumbItems} className="min-w-0 flex-1" />
            </div>
          )}
          {children}
        </main>
      </div>

      {!isExamPage && <FloatingActions />}

      {/* Navigasi Khusus Seluler */}
      {!hideMobileNav && <MobileNav />}

      <AchievementToast />
    </div>
  );
}
