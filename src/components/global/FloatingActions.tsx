"use client";

/**
 * @file FloatingActions.tsx
 * @description Komponen tombol aksi melayang (Unified Floating Action Button / FAB) global untuk akses cepat donasi/support dan pengiriman feedback.
 * Sembunyi di halaman reading/listening — kontrol audio, mode teks, dan terjemahan sudah disediakan oleh halaman itu sendiri (mis. ReadingControlBar).
 */

// IMPORT & DEPENDENSI

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Add, Message, Cup, X } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import FeedbackWidget from "@/features/support/feedback/FeedbackWidget";

// KOMPONEN UTAMA

/**
 * Global Floating Action Button (FAB) component.
 * Shows feedback and donation actions with an animated expandable menu.
 *
 * @returns React element representing the floating action menu.
 */
export default function FloatingActions() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  // Exit early on reading/listening pages. Controls are already provided by those pages.
  if (pathname?.includes("/library/reading/") || pathname?.includes("/library/listening/")) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-32 right-6 md:bottom-10 md:right-10 z-40 flex flex-col items-end gap-4">
        <AnimatePresence mode="wait">
          {isOpen && (
            <m.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              className="flex flex-col gap-3 mb-2"
            >
              <m.div whileHover={{ x: -5 }}>
                <Button
                  onClick={() => {
                    setShowFeedbackDialog(true);
                    setIsOpen(false);
                  }}
                  className="button-outline-premium rounded-xl px-4 py-3 min-h-[44px] flex items-center gap-3 h-auto group shadow-md"
                >
                  <span className="text-xs font-bold uppercase tracking-wider">Feedback</span>
                  <Message size={18} className="text-primary group-hover:text-current" />
                </Button>
              </m.div>

              <m.div whileHover={{ x: -5 }}>
                <Button
                  asChild
                  className="rounded-xl px-4 py-3 min-h-[44px] flex items-center gap-3 h-auto group border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground shadow-md"
                >
                  <Link href="/support">
                    <span className="text-xs font-bold uppercase tracking-wider">Donasi</span>
                    <Cup size={18} className="text-destructive group-hover:text-current" />
                  </Link>
                </Button>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>

        {/* Main Toggle Button */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Tutup menu tindakan cepat" : "Buka menu tindakan cepat"}
          className={`w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl transition-all duration-500 border-none flex items-center justify-center p-0 ${
            isOpen
              ? "bg-foreground text-background rotate-0"
              : "bg-primary text-primary-foreground hover:bg-primary/92 hover:scale-110"
          }`}
        >
          {isOpen ? <X size={28} /> : <Add size={28} className="animate-pulse" />}
        </Button>
      </div>

      <FeedbackWidget forceOpen={showFeedbackDialog} onOpenChange={setShowFeedbackDialog} />
    </>
  );
}
