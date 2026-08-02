import React from "react";
import Link from "next/link";
import { AlertTriangle } from "@/components/ui/icons";

/**
 * Parses basic markdown syntax (bold, italic, code, links) into React nodes.
 * @param text - Raw string containing markdown syntax.
 * @returns Array of React nodes with applied styles.
 */
export function parseInlineStyles(text: string): React.ReactNode[] {
 if (!text || typeof text !== "string") return [];
 // Split text by markdown tokens to isolate styled segments
 const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*|\[.*?\]\(.*?\))/g);
 return parts.map((part, index) => {
 if (part.startsWith("**") && part.endsWith("**")) {
 return (
 <strong key={index} className="text-foreground font-black">
 {part.slice(2, -2)}
 </strong>
 );
 }
 if (part.startsWith("`") && part.endsWith("`")) {
 return (
 <code 
 key={index} 
 className="px-1.5 py-0.5 rounded text-primary font-mono text-xs md:text-sm font-bold mx-0.5"
 style={{ backgroundColor: "hsl(var(--primary)/0.05)", borderColor: "hsl(var(--primary)/0.1)", borderWidth: "1px" }}
 >
 {part.slice(1, -1)}
 </code>
 );
 }
 if (part.startsWith("*") && part.endsWith("*")) {
 return (
 <em key={index} className="italic text-muted-foreground/90 font-medium">
 {part.slice(1, -1)}
 </em>
 );
 }
 if (part.startsWith("[") && part.includes("](")) {
 const match = part.match(/\[(.*?)\]\((.*?)\)/);
 if (match) {
 const [, linkText, url] = match;
 const isExternal = url.startsWith("http");
 if (isExternal) {
 return (
 <a
 key={index}
 href={url}
 target="_blank"
 rel="noopener noreferrer"
 className="text-primary hover:underline font-bold transition-all"
 >
 {linkText}
 </a>
 );
 } else {
 return (
 <Link
 key={index}
 href={url}
 className="text-primary hover:underline font-bold transition-all"
 >
 {linkText}
 </Link>
 );
 }
 }
 }
 return part;
 });
}

/**
 * Recursively traverses React nodes to parse inline markdown styles.
 * @param children - React nodes to process.
 * @returns Processed React nodes with parsed markdown.
 */
export function renderWithMarkdown(children: React.ReactNode): React.ReactNode {
 if (!children) return children;

 if (typeof children === "string") {
 return parseInlineStyles(children);
 }

 if (Array.isArray(children)) {
 return children.map((child, i) => {
 const parsed = renderWithMarkdown(child);
 if (React.isValidElement(parsed)) {
 return React.cloneElement(parsed, { key: parsed.key ?? i });
 }
 return parsed;
 });
 }

 if (React.isValidElement(children)) {
 const props = children.props as { children?: React.ReactNode; [key: string]: unknown };
 if (props && "children" in props) {
 return React.cloneElement(
 children,
 { key: children.key },
 renderWithMarkdown(props.children)
 );
 }
 }

 return children;
}

/**
 * Parses a notes text block with list items, tables, and warnings into JSX nodes.
 * @param notes - Raw text block containing custom list/table formatting.
 * @returns JSX wrapper containing formatted elements.
 */
export function parseNotesToJSX(notes: string): React.ReactNode {
 const lines = notes.split("\n");
 const elements: React.ReactNode[] = [];
 let currentList: { type: "ul" | "ol"; items: string[] } | null = null;
 let currentTable: string[] | null = null;

 const flushList = (key: string) => {
 if (!currentList) return;
 const ListTag = currentList.type;
 elements.push(
 <ListTag 
 key={key} 
 className={
 currentList.type === "ul" 
 ? "list-disc pl-6 my-3 space-y-1.5 select-text text-sm md:text-base text-foreground" 
 : "list-decimal pl-6 my-3 space-y-1.5 select-text text-sm md:text-base text-foreground"
 }
 >
 {currentList.items.map((item, idx) => (
 <li key={idx} className="leading-relaxed">
 {parseInlineStyles(item)}
 </li>
 ))}
 </ListTag>
 );
 currentList = null;
 };

 const flushTable = (key: string) => {
 if (!currentTable || currentTable.length < 2) return;
 
 const headerLine = currentTable[0];
 const headerCols = headerLine.split("|").slice(1, -1).map(c => c.trim());
 
 const rowLines = currentTable.slice(2);
 const rows = rowLines.map(line => line.split("|").slice(1, -1).map(c => c.trim()));

 elements.push(
 <div key={key} className="my-4 overflow-x-auto rounded-lg border border-border bg-card shadow-[0_0_20px_hsl(var(--primary)/0.02)] select-text">
 <table className="w-full text-left border-collapse text-[11px] md:text-xs">
 <thead>
 <tr className="border-b border-border bg-muted/40">
 {headerCols.map((col, idx) => (
 <th key={`th-${idx}`} className="px-3 py-2 font-black text-foreground uppercase tracking-wider select-none">
 {parseInlineStyles(col)}
 </th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-border/40">
 {rows.map((row, rowIdx) => (
 <tr key={`tr-${rowIdx}`} className="hover:bg-muted/30 transition-colors">
 {row.map((col, colIdx) => (
 <td key={`td-${colIdx}`} className="px-3 py-2.5 font-medium text-foreground leading-relaxed">
 {parseInlineStyles(col)}
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 );
 currentTable = null;
 };

 const flushAll = (key: string) => {
 flushList(`${key}-list`);
 flushTable(`${key}-table`);
 };

 lines.forEach((line, index) => {
 const trimmed = line.trim();
 if (!trimmed) {
 flushAll(`flush-${index}`);
 return;
 }

 if (trimmed.startsWith("|")) {
 flushList(`table-interrupt-list-${index}`);
 if (!currentTable) {
 currentTable = [trimmed];
 } else {
 currentTable.push(trimmed);
 }
 return;
 }

 flushTable(`table-interrupt-other-${index}`);

 if ((trimmed.startsWith("*") && !trimmed.startsWith("**")) || trimmed.startsWith("-")) {
 const itemText = trimmed.substring(1).trim();
 if (!currentList || currentList.type !== "ul") {
 flushList(`list-interrupt-other-${index}`);
 currentList = { type: "ul", items: [itemText] };
 } else {
 currentList.items.push(itemText);
 }
 return;
 }

 const matchOrdered = trimmed.match(/^(\d+)\.\s(.*)/);
 if (matchOrdered) {
 const itemText = matchOrdered[2].trim();
 if (!currentList || currentList.type !== "ol") {
 flushList(`list-interrupt-other-${index}`);
 currentList = { type: "ol", items: [itemText] };
 } else {
 currentList.items.push(itemText);
 }
 return;
 }

 flushList(`list-flush-${index}`);

 if (trimmed.startsWith("⚠️")) {
 elements.push(
 <div 
 key={`warning-${index}`} 
 className="p-3 md:p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-foreground font-semibold my-4 text-xs md:text-sm flex gap-2.5 items-start select-text"
 >
 <AlertTriangle size={16} className="text-destructive shrink-0 mt-0.5" />
 <div className="flex-1 leading-relaxed">
 {parseInlineStyles(trimmed.substring(2).trim())}
 </div>
 </div>
 );
 return;
 }

 elements.push(
 <p key={`para-${index}`} className="font-normal text-foreground leading-relaxed text-sm md:text-base">
 {parseInlineStyles(trimmed)}
 </p>
 );
 });

 flushAll("final");
 return <div className="space-y-3">{elements}</div>;
}

