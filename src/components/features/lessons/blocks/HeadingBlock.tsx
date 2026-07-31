"use client";

import React from "react";
import { ContentBlock } from "@/types/database";
import { renderWithMarkdown } from "@/lib/utils/markdown-parser";

/**
 * Renders heading blocks (H1, H2, H3) with markdown support.
 */
export function HeadingBlock({ block }: { block: ContentBlock }) {
  const level = block.level || 2;
  const Tag = level === 3 ? "h3" : level === 1 ? "h1" : "h2";
  const className = level === 3
    ? "text-xl uppercase tracking-tight text-foreground mt-6 mb-3 font-japanese"
    : level === 1
    ? "text-3xl uppercase tracking-tight text-foreground mt-10 mb-5 font-japanese"
    : "text-2xl uppercase tracking-tight text-foreground mt-8 mb-4 border-b border-border pb-2 font-japanese";

  return (
    <Tag className={className}>
      {renderWithMarkdown(block.content || "")}
    </Tag>
  );
}
