"use client";

import React from "react";
import Image from "next/image";
import { ContentBlock } from "@/types/database";

/**
 * Renders image blocks with optional captions.
 */
export function ImageBlock({ block }: { block: ContentBlock }) {
  if (!block.content) return null;
  return (
    <figure className="w-full mb-10">
      <div className="relative w-full rounded-2xl overflow-hidden border border-border/50 dark:border-white/10 shadow-[0_4px_25px_rgba(0,0,0,0.015)] bg-card group">
        <Image
          src={block.content}
          alt={block.title || "Gambar pelajaran"}
          width={1200}
          height={1200}
          className="w-full h-auto max-h-[60vh] object-contain transition-transform duration-700 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
        />
      </div>
      {block.title && (
        <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-center mt-6">
          {block.title}
        </figcaption>
      )}
    </figure>
  );
}
