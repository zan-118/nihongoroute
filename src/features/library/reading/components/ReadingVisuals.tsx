"use client";

/**
 * @file ReadingVisuals.tsx
 * @description Section ilustrasi cerita (AI Generated) yang dapat dilipat/dibuka.
 */

import { AnimatePresence, m } from "framer-motion";
import { Button } from "@/components/ui/button";
import { IllustrationGallery } from "@/components/ui/IllustrationGallery";

interface ReadingVisualsProps {
  /** Daftar ilustrasi cerita. */
  illustrations?: { title?: string; content: string }[];
  /** URL cover artikel sebagai fallback. */
  imageUrl?: string | { _type: string; asset: { _type: string; _ref: string } };
  /** Judul artikel. */
  title: string;
  /** Status terbuka/tutup section ilustrasi. */
  showVisuals: boolean;
  /** Callback toggle buka/tutup. */
  onToggleVisuals: () => void;
}

/**
 * Ilustrasi pendukung (collapsible) dengan animasi height.
 */
export function ReadingVisuals({
  illustrations,
  imageUrl,
  title,
  showVisuals,
  onToggleVisuals,
}: ReadingVisualsProps) {
  return (
    <div className="w-full mb-6">
      <Button
        variant="outline"
        onClick={onToggleVisuals}
        className="w-full py-4 rounded-lg border-dashed border-primary/20 hover:border-primary/50 bg-primary/5 hover:bg-primary/10 transition-all flex items-center justify-center gap-2 group"
      >
        <span className="text-xs font-black uppercase tracking-wider">
          {showVisuals ? "Sembunyikan Ilustrasi Cerita" : "Lihat Ilustrasi Cerita (AI Generated)"}
        </span>
      </Button>

      <AnimatePresence>
        {showVisuals && (
          <m.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 16 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <IllustrationGallery
              illustrations={illustrations}
              fallbackImage={typeof imageUrl === "string" ? imageUrl : undefined}
              title={title}
            />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
