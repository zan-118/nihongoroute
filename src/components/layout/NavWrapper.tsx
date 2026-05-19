"use client";

import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileNav from "./MobileNav";
import FloatingActions from "@/components/features/global/FloatingActions";

interface NavWrapperProps {
  children: ReactNode;
}

import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES, getRouteLabel } from "@/lib/routes";

/**
 * NavWrapper: Komponen pembungkus navigasi sisi client.
 * Menangani state menu mobile agar layout utama bisa menjadi Server Component.
 */
export default function NavWrapper({ children }: NavWrapperProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isExamPage = pathname?.includes("/exams/");
  const pathSegments = pathname?.split('/').filter(Boolean) || [];

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col md:flex-row overflow-x-hidden w-full transition-colors duration-300">
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
        <AnimatePresence mode="wait">
          <motion.main 
            key={pathname}
            id="main-content" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "linear" }}
            className={`flex-1 w-full flex flex-col ${!isExamPage ? 'pb-40 md:pb-12' : 'pb-12'} outline-none relative`}
          >
            {!isExamPage && (
              <div className="hidden md:flex w-full px-6 md:px-12 pt-8 items-center gap-4 z-20 relative animate-in fade-in slide-in-from-top-4 duration-500">
                <Button 
                  onClick={() => router.back()}
                  variant="ghost" 
                  className="w-10 h-10 p-0 shrink-0 rounded-xl bg-card/50 backdrop-blur-md border border-border/50 hover:bg-primary/10 hover:border-primary/30 text-muted-foreground hover:text-primary transition-all shadow-sm flex items-center justify-center"
                  aria-label="Kembali"
                >
                  <ChevronLeft size={16} />
                </Button>
                
                <nav className="flex items-center flex-wrap gap-2 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground bg-card/30 backdrop-blur-md px-5 py-2.5 rounded-xl border border-border/40 shadow-sm transition-all hover:border-border/60">
                  <Link href={ROUTES.DASHBOARD} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                    <Home size={13} className="mb-0.5" /> <span className="hidden sm:inline">Beranda</span>
                  </Link>
                  {pathSegments.map((segment, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <ChevronRight size={10} className="opacity-20" />
                      <Link 
                        href={`/${pathSegments.slice(0, idx + 1).join('/')}`}
                        className={`hover:text-primary transition-colors ${idx === pathSegments.length - 1 ? 'text-primary pointer-events-none' : ''}`}
                      >
                        {getRouteLabel(segment)}
                      </Link>
                    </div>
                  ))}
                </nav>
              </div>
            )}
            {children}
          </motion.main>
        </AnimatePresence>
      </div>

      {!isExamPage && <FloatingActions />}

      {/* Navigasi Khusus Seluler */}
      {!isExamPage && <MobileNav />}
    </div>
  );
}
