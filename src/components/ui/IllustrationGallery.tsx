"use client";

/**
 * @file IllustrationGallery.tsx
 * @description Komponen galeri responsif bergaya Bento Grid untuk menampilkan ilustrasi pelajaran.
 * Menggunakan Next.js Image component untuk performa maksimal dan mendukung modal Lightbox imersif.
 */

import React, { useState } from "react";
import Image from "next/image";
import { AnimatePresence, m } from "framer-motion";
import { X, Search } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/**
 * Data structure for single illustration item.
 */
interface IllustrationItem {
 /** Caption or title of illustration. */
 title?: string;
 /** Image source URL. */
 content: string;
}

/**
 * Props for IllustrationGallery component.
 */
interface IllustrationGalleryProps {
 /** List of illustrations to display. */
 illustrations?: IllustrationItem[];
 /** Fallback image URL if list empty. */
 fallbackImage?: string;
 /** Default title for fallback image. */
 title?: string;
}

/**
 * Bento-grid gallery component with lightbox modal.
 */
export function IllustrationGallery({
 illustrations = [],
 fallbackImage,
 title = "Ilustrasi Pelajaran",
}: IllustrationGalleryProps) {
 // Track selected image for lightbox modal
 const [selectedImage, setSelectedImage] = useState<IllustrationItem | null>(null);

 // Satukan ilustrasi dan fallback ke dalam satu list
 const list: IllustrationItem[] = [];
 if (illustrations && Array.isArray(illustrations)) {
 list.push(...illustrations);
 }
 if (list.length === 0 && fallbackImage) {
 list.push({ content: fallbackImage, title });
 }

 // Return early if no images to display
 if (list.length === 0) return null;

 return (
 <div className="w-full mb-12">
 {/* Grid Layout Bento-style */}
 <div
 className={cn(
 "grid gap-4 w-full auto-rows-[250px] md:auto-rows-[300px]",
 list.length === 1 && "grid-cols-1",
 list.length === 2 && "grid-cols-1 md:grid-cols-2",
 list.length >= 3 && "grid-cols-1 md:grid-cols-3"
 )}
 >
 {list.map((ill, idx) => {
 // Tentukan span layout bento
 let gridClass = "col-span-1 row-span-1";
 if (list.length === 1) {
 gridClass = "col-span-1 row-span-1 h-[250px] sm:h-[350px] md:h-[400px]";
 } else if (list.length >= 3 && idx === 0) {
 gridClass = "md:col-span-2 md:row-span-2";
 }

 return (
 <div
 key={idx}
 className={cn(
 "group relative overflow-hidden rounded-xl border border-border bg-card/30 cursor-pointer glass shadow-sm transition-all duration-500 hover:shadow-lg hover:border-primary/30",
 gridClass
 )}
 onClick={() => setSelectedImage(ill)}
 >
 {/* Image element */}
 <Image
 src={ill.content}
 alt={ill.title || `Ilustrasi ${idx + 1}`}
 fill
 unoptimized
 className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
 />

 {/* Hover Zoom overlay */}
 <div className="absolute inset-0 bg-background/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
 <div className="p-3.5 rounded-full bg-background/80 shadow-lg border border-border transform scale-90 group-hover:scale-100 transition-transform duration-300">
 <Search className="size-5 text-primary" />
 </div>
 </div>

 {/* Caption Tag */}
 {ill.title && (
 <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg bg-background/70 border border-border shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
 <p className="text-[10px] font-bold text-foreground text-center line-clamp-2 leading-relaxed">
 {ill.title}
 </p>
 </div>
 )}
 </div>
 );
 })}
 </div>

 {/* Lightbox Imersif Modal */}
 <AnimatePresence>
 {selectedImage && (
 <m.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-[150] flex flex-col items-center justify-center p-4 bg-background/80 "
 onClick={() => setSelectedImage(null)}
 >
 {/* Tombol Tutup */}
 <m.div
 initial={{ scale: 0.9, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 className="absolute top-6 right-6 z-[160]"
 >
 <button
 type="button"
 className="p-3.5 rounded-full bg-background/90 border border-border text-foreground hover:text-primary transition-colors shadow-xl"
 onClick={() => setSelectedImage(null)}
 aria-label="Tutup Detail Ilustrasi"
 >
 <X className="size-6" />
 </button>
 </m.div>

 {/* Frame Modal Konten */}
 <m.div
 initial={{ scale: 0.95, y: 20 }}
 animate={{ scale: 1, y: 0 }}
 exit={{ scale: 0.95, y: 20 }}
 transition={{ type: "spring", damping: 25, stiffness: 180 }}
 className="relative max-w-5xl w-full max-h-[85vh] rounded-xl overflow-hidden border border-border shadow-2xl bg-card glass flex flex-col"
 onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking content
 >
 <div className="relative overflow-hidden flex-1 bg-muted/50 flex items-center justify-center min-h-[50vh] md:min-h-[60vh]">
 <Image
 src={selectedImage.content}
 alt={selectedImage.title || "Detail Ilustrasi"}
 fill
 unoptimized
 className="object-contain"
 />
 </div>

 {selectedImage.title && (
 <div className="p-6 border-t border-border bg-card text-center relative z-10">
 <p className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
 Keterangan Gambar
 </p>
 <p className="text-sm font-bold text-foreground leading-relaxed">
 {selectedImage.title}
 </p>
 </div>
 )}
 </m.div>
 </m.div>
 )}
 </AnimatePresence>
 </div>
 );
}