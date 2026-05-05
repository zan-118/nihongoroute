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
import { usePathname } from "next/navigation";

/**
 * NavWrapper: Komponen pembungkus navigasi sisi client.
 * Menangani state menu mobile agar layout utama bisa menjadi Server Component.
 */
export default function NavWrapper({ children }: NavWrapperProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isExamPage = pathname?.includes("/exams/");

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
            initial={{ opacity: 0, y: 12, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(10px)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`flex-1 w-full flex flex-col ${!isExamPage ? 'pb-40 md:pb-12' : 'pb-12'} outline-none`}
          >
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
