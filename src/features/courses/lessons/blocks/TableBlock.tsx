import React from "react";
import { ContentBlock } from "@/types/database";
import { renderWithMarkdown } from "@/lib/utils/markdown-parser";

interface TableBlockProps {
 block: ContentBlock;
}

export function TableBlock({ block }: TableBlockProps) {
 const headers = block.headers || [];
 const rows = block.rows || [];
 const hasHeaders = headers.some(h => h.trim() !== "");

 return (
 <div className="my-4 overflow-x-auto rounded-lg border border-border bg-card/5 shadow-sm select-text">
 <table className="w-full text-left border-collapse text-[13px] md:text-sm">
 {hasHeaders && (
 <thead>
 <tr className="border-b border-border bg-primary/5">
 {headers.map((col: string, idx: number) => (
 <th key={`th-${idx}`} className="px-4 py-2.5 font-black text-primary uppercase tracking-wider select-none">
 {renderWithMarkdown(col)}
 </th>
 ))}
 </tr>
 </thead>
 )}
 <tbody className="divide-y divide-border/40">
 {rows.map((row: string[], rowIdx: number) => (
 <tr key={`tr-${rowIdx}`} className="hover:bg-card/10 transition-colors">
 {row.map((col: string, colIdx: number) => (
 <td key={`td-${colIdx}`} className="px-4 py-3 font-semibold text-muted-foreground leading-relaxed">
 {renderWithMarkdown(col)}
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 );
}
