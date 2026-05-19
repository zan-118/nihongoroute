"use client";

import React from "react";
import Image from "next/image";
import { Play, FileIcon } from "lucide-react";

interface SanityMediaProps {
  url: string;
  alt?: string;
  type?: "image" | "video" | "auto" | "raw";
  className?: string;
  width?: number;
  height?: number;
}

export default function SanityMedia({
  url,
  alt = "NihongoRoute Asset",
  type = "auto",
  className = "",
  width = 800,
  height = 450,
}: SanityMediaProps) {
  if (!url) return null;

  // Deteksi tipe file jika auto
  const isVideo = type === "video" || url.match(/\.(mp4|webm|ogg|mov)$/i);
  const isImage = type === "image" || url.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i);

  if (isVideo) {
    return (
      <div className={`relative overflow-hidden border border-border bg-background/20 glass group ${className}`}>
        <video
          src={url}
          controls
          className="w-full aspect-video object-cover"
          poster={`${url.replace(/\.[^/.]+$/, ".jpg")}`} // Mencoba menggunakan thumbnail
        >
          Browser Anda tidak mendukung tag video.
        </video>
        <div className="absolute top-4 left-4 p-2 rounded-lg bg-background/40 backdrop-blur-md border border-border opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-4 h-4 text-foreground" />
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
      className={`flex items-center gap-4 p-6 rounded-2xl bg-muted/30 border border-border hover:bg-muted/50 transition-all ${className}`}
    >
      <div className="p-3 rounded-xl bg-primary/10 text-primary">
        <FileIcon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-foreground truncate">{url.split("/").pop()}</p>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unduh Lampiran</p>
      </div>
    </a>
  );
}
