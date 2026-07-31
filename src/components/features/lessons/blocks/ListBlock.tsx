"use client";

import React from "react";
import { ContentBlock } from "@/types/database";
import { renderWithMarkdown } from "@/lib/utils/markdown-parser";

/**
 * Renders ordered or unordered list blocks.
 */
export function ListBlock({ block }: { block: ContentBlock }) {
  const items = block.items || [];
  const listType = block.listType || "bullet";
  const Tag = listType === "number" ? "ol" : "ul";
  const className = listType === "number"
    ? "list-decimal pl-6 mb-4 space-y-2 text-lg text-foreground/90 font-japanese"
    : "list-disc pl-6 mb-4 space-y-2 text-lg text-foreground/90 font-japanese";

  return (
    <Tag className={className}>
      {items.map((item: string, pos: number) => (
        <li key={pos} className="leading-relaxed">
          {renderWithMarkdown(item)}
        </li>
      ))}
    </Tag>
  );
}
