/**
 * @file SanityMedia.tsx
 * @description Komponen pemutar/penampil media universal (SanityMedia) untuk merender gambar, video, dan lampiran dokumen dari Sanity CMS.
 */

"use client";

// ======================
// IMPOR
// ======================
import React from "react";
import Image from "next/image";
import { Play, FileIcon } from "lucide-react";

// ======================
// ANTARMUKA / TIPE DATA
// ======================
/**
 * Props for SanityMedia component.
 */
interface SanityMediaProps {
  /** Source URL of media asset. */
  url: string;
  /** Alternative text for images. */
  alt?: string;
  /** Media type. Auto-detects if set to auto. */
  type?: "image" | "video" | "auto" | "raw";
  /** Custom CSS classes. */
  className?: string;
  /** Image width in pixels. */
  width?: number;
  /** Image height in pixels. */
  height?: number;
}

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * Render media asset from Sanity CMS. Handle image, video, document.
 * 
 * @param props - Component properties.
 * @returns Media element or null.
 */
export default function SanityMedia({
  url,
  alt = "NihongoRoute Asset",
  type = "auto",
  className = "",
  width = 800,
  height = 450,
}: SanityMediaProps) {
  // Exit early if URL empty.
  if (!url) return null;

  // Check video type by prop or file extension.
  const isVideo = type === "video" || url.match(/\.(mp4|webm|ogg|mov)$/i);
  // Check image type by prop or file extension.
  const isImage = type === "image" || url.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i);

  if (isVideo) {
    return (
      <div className={`relative overflow-hidden border border-border bg-background/20 glass group ${className}`}>
        <video
          src={url}
          controls
          className="w-full aspect-video object-cover"
          poster={`${url.replace(/\.[^/.]+$/, ".jpg")}`} // Guess thumbnail path by swap extension to jpg.
        >
          Browser Anda tidak mendukung tag video.
        </video>
        <div className="absolute top-4 left-4 p-2 rounded-lg bg-background/40  border border-border opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="size-4 text-foreground" />
        </div>
      </div>
    );
  }

  if (isImage) {
    return (
      <div className={`relative overflow-hidden border border-border shadow-2xl group ${className}`}>
        <Image
          src={url}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    );
  }

  // Fallback untuk file mentah/dokumen
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-4 p-6 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-all ${className}`}
    >
      <div className="p-3 rounded-xl bg-primary/10 text-primary">
        <FileIcon className="size-6" />
      </div>
      <div className="flex-1">
        {/* Get filename from URL end. */}
        <p className="text-sm font-bold text-foreground truncate">{url.split("/").pop()}</p>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unduh Lampiran</p>
      </div>
    </a>
  );
}