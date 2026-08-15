import React from "react";
import Link from "next/link";
import { Alert, Information, Lightbulb } from "@/components/ui/icons";

/**
 * Replaces common HTML entities into native Unicode characters.
 * @param text - Input string possibly containing HTML entities.
 * @returns Clean string with entities converted to Unicode.
 */
export function decodeHtmlEntities(text: string): string {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/&rarr;/g, "→")
    .replace(/&larr;/g, "←")
    .replace(/&uarr;/g, "↑")
    .replace(/&darr;/g, "↓")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&hellip;/g, "…")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rsquo;/g, "’")
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

/**
 * Recursively parses basic markdown syntax (bold, italic, code, links) into React nodes.
 * Handles nested tokens seamlessly (e.g. `code` inside **bold** text) and prevents false link matching on bracketed text.
 * @param text - Raw string containing markdown syntax.
 * @returns Array of React nodes with applied styles.
 */
export function parseInlineStyles(text: string): React.ReactNode[] {
  if (!text || typeof text !== "string") return [];
  const cleanText = decodeHtmlEntities(text);

  // Split text by precise markdown tokens:
  // 1. Bold: **text** or __text__
  // 2. Inline Code: `code`
  // 3. Strikethrough: ~~text~~
  // 4. Genuine Markdown Link only: [text](https://... or /...)
  // 5. Italic: *text* or _text_
  const parts = cleanText.split(/(\*\*[\s\S]*?\*\*|__[\s\S]*?__|`[^`]+`|~~[\s\S]*?~~|\[[^\]]+\]\((?:https?:\/\/|\/|#|mailto:)[^)]+\)|\*[^*\n]+?\*|_[^_\n]+?_)/g);

  return parts.map((part, index) => {
    if (!part) return null;

    // 1. Inline Code: `code`
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code 
          key={`code-${index}`} 
          className="px-2 py-0.5 rounded-md text-primary font-mono text-xs md:text-sm font-semibold bg-primary/10 border border-primary/20 mx-0.5 inline-block select-text"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // 2. Bold: **text** or __text__ (parse children recursively)
    if ((part.startsWith("**") && part.endsWith("**") && part.length >= 4) || 
        (part.startsWith("__") && part.endsWith("__") && part.length >= 4)) {
      const innerText = part.slice(2, -2);
      return (
        <strong key={`bold-${index}`} className="text-foreground font-bold">
          {parseInlineStyles(innerText)}
        </strong>
      );
    }

    // 3. Strikethrough: ~~text~~
    if (part.startsWith("~~") && part.endsWith("~~") && part.length >= 4) {
      const innerText = part.slice(2, -2);
      return (
        <del key={`del-${index}`} className="text-muted-foreground/70 line-through">
          {parseInlineStyles(innerText)}
        </del>
      );
    }

    // 4. Strict Link: [text](url) - only if URL has valid protocol/path
    if (part.startsWith("[") && part.includes("](")) {
      const match = part.match(/^\[(.*?)\]\(((?:https?:\/\/|\/|#|mailto:)[^)]+)\)$/);
      if (match) {
        const [, linkText, url] = match;
        const isExternal = url.startsWith("http");
        if (isExternal) {
          return (
            <a
              key={`link-${index}`}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline underline-offset-4 hover:text-accent/80 font-medium transition-colors"
            >
              {parseInlineStyles(linkText)}
            </a>
          );
        } else {
          return (
            <Link
              key={`link-${index}`}
              href={url}
              className="text-accent underline underline-offset-4 hover:text-accent/80 font-medium transition-colors"
            >
              {parseInlineStyles(linkText)}
            </Link>
          );
        }
      }
    }

    // 5. Italic: *text* or _text_
    if ((part.startsWith("*") && part.endsWith("*") && part.length >= 2 && !part.startsWith("**")) || 
        (part.startsWith("_") && part.endsWith("_") && part.length >= 2 && !part.startsWith("__"))) {
      const innerText = part.slice(1, -1);
      return (
        <em key={`em-${index}`} className="italic text-muted-foreground font-medium">
          {parseInlineStyles(innerText)}
        </em>
      );
    }

    return part;
  }).filter(Boolean);
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
 * Parses a notes text block with section headings, callouts, tables, lists, and dialogues into JSX nodes.
 * @param notes - Raw text block containing custom list/table formatting.
 * @returns JSX wrapper containing structured formatted elements.
 */
export function parseNotesToJSX(notes: string): React.ReactNode {
  if (!notes || typeof notes !== "string") return null;

  const lines = notes.split("\n");
  const elements: React.ReactNode[] = [];
  
  let currentList: { type: "ul" | "ol"; items: string[] } | null = null;
  let currentTable: string[] | null = null;
  let currentCallout: { type: "caution" | "note" | "tip"; lines: string[] } | null = null;

  const flushList = (key: string) => {
    if (!currentList) return;
    const ListTag = currentList.type;
    elements.push(
      <ListTag 
        key={key} 
        className={
          currentList.type === "ul" 
            ? "list-disc pl-6 my-4 space-y-2.5 select-text text-sm md:text-base text-foreground/90 leading-relaxed" 
            : "list-decimal pl-6 my-4 space-y-2.5 select-text text-sm md:text-base text-foreground/90 leading-relaxed"
        }
      >
        {currentList.items.map((item, idx) => (
          <li key={idx} className="leading-relaxed pl-1">
            {parseInlineStyles(item)}
          </li>
        ))}
      </ListTag>
    );
    currentList = null;
  };

  const flushTable = (key: string) => {
    if (!currentTable || currentTable.length < 2) {
      currentTable = null;
      return;
    }
    
    const headerLine = currentTable[0];
    const headerCols = headerLine.split("|").slice(1, -1).map(c => c.trim());
    
    const rowLines = currentTable.slice(1).filter(l => !l.startsWith("|--") && !l.startsWith("| ---"));
    const rows = rowLines.map(line => line.split("|").slice(1, -1).map(c => c.trim()));

    elements.push(
      <div key={key} className="my-6 overflow-x-auto rounded-2xl border border-border/80 bg-card/90 shadow-sm select-text">
        <table className="w-full text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr className="border-b border-border/80 bg-muted/60">
              {headerCols.map((col, idx) => (
                <th key={`th-${idx}`} className="px-4 py-3.5 font-bold text-foreground tracking-wide select-none">
                  {parseInlineStyles(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {rows.map((row, rowIdx) => (
              <tr key={`tr-${rowIdx}`} className="hover:bg-muted/30 transition-colors">
                {row.map((col, colIdx) => (
                  <td key={`td-${colIdx}`} className="px-4 py-3.5 text-foreground/90 leading-relaxed align-top">
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

  const flushCallout = (key: string) => {
    if (!currentCallout || currentCallout.lines.length === 0) {
      currentCallout = null;
      return;
    }

    const { type, lines: calloutLines } = currentCallout;
    const isCaution = type === "caution";
    const isTip = type === "tip";

    const borderColor = isCaution ? "border-destructive/40" : isTip ? "border-accent/40" : "border-primary/40";
    const bgColor = isCaution ? "bg-destructive/10" : isTip ? "bg-accent/10" : "bg-primary/5";
    const IconComponent = isCaution ? Alert : isTip ? Lightbulb : Information;
    const iconColor = isCaution ? "text-destructive" : isTip ? "text-accent" : "text-primary";
    const labelTitle = isCaution ? "Peringatan Jebakan & Kesalahan Fatal" : isTip ? "Tips & Panduan Praktis" : "Catatan Penting";

    elements.push(
      <div 
        key={key} 
        className={`p-5 sm:p-6 rounded-2xl border ${borderColor} ${bgColor} my-6 space-y-3 select-text shadow-xs`}
      >
        <div className="flex items-center gap-2.5 font-bold tracking-wide text-xs md:text-sm">
          <IconComponent size={18} className={`${iconColor} shrink-0`} />
          <span className={`${iconColor} uppercase tracking-wider font-extrabold`}>{labelTitle}</span>
        </div>
        <div className="space-y-2 pt-1 leading-relaxed text-xs md:text-sm text-foreground/90 font-normal">
          {calloutLines.map((l, lIdx) => {
            const isErrorExample = l.includes("❌");
            return (
              <div 
                key={lIdx} 
                className={isErrorExample ? "pl-3 py-1 border-l-2 border-destructive/40 my-1.5" : "leading-relaxed"}
              >
                {parseInlineStyles(l)}
              </div>
            );
          })}
        </div>
      </div>
    );
    currentCallout = null;
  };

  const flushAll = (key: string) => {
    flushList(`${key}-list`);
    flushTable(`${key}-table`);
    flushCallout(`${key}-callout`);
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushAll(`flush-${index}`);
      return;
    }

    // 1. GitHub Callout Block: `> [!CAUTION]`, `> [!WARNING]`, `> [!NOTE]`, `> [!TIP]`
    if (trimmed.startsWith(">")) {
      flushList(`callout-list-${index}`);
      flushTable(`callout-table-${index}`);

      const calloutContent = trimmed.replace(/^>\s?/, "").trim();
      
      if (calloutContent.startsWith("[!CAUTION]") || calloutContent.startsWith("[!WARNING]")) {
        flushCallout(`callout-switch-${index}`);
        currentCallout = { type: "caution", lines: [] };
        return;
      }
      if (calloutContent.startsWith("[!TIP]")) {
        flushCallout(`callout-switch-${index}`);
        currentCallout = { type: "tip", lines: [] };
        return;
      }
      if (calloutContent.startsWith("[!NOTE]") || calloutContent.startsWith("[!IMPORTANT]")) {
        flushCallout(`callout-switch-${index}`);
        currentCallout = { type: "note", lines: [] };
        return;
      }

      if (currentCallout) {
        currentCallout.lines.push(calloutContent);
        return;
      } else {
        // Fallback generic callout
        currentCallout = { type: "note", lines: [calloutContent] };
        return;
      }
    }

    // Non-callout line: flush ongoing callout
    flushCallout(`callout-end-${index}`);

    // 2. Table row
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

    // 3. Section Pillar Title (e.g. `**Fungsi & Konteks**`, `**Cara Pakai & Aturan**`, `**Kesalahan Fatal ⚠️**`, `**Perbandingan...**`)
    const isPillarLine = trimmed.startsWith("**") && trimmed.endsWith("**") && (
      trimmed.includes("Fungsi") || 
      trimmed.includes("Cara Pakai") || 
      trimmed.includes("Variasi") || 
      trimmed.includes("Konteks") || 
      trimmed.includes("Perbandingan") || 
      trimmed.includes("Kesalahan")
    );

    if (isPillarLine) {
      flushList(`pillar-list-${index}`);
      const rawTitle = trimmed.slice(2, -2).trim();
      const isCautionPillar = rawTitle.toLowerCase().includes("kesalahan");
      
      elements.push(
        <div key={`pillar-${index}`} className="pt-8 pb-3 border-b border-border/50 flex items-center gap-3 mb-4 mt-2">
          <span className={`w-1.5 h-5 rounded-full ${isCautionPillar ? "bg-destructive" : "bg-primary"}`} />
          <h3 className="text-base md:text-lg font-bold tracking-tight text-foreground">
            {decodeHtmlEntities(rawTitle)}
          </h3>
        </div>
      );
      return;
    }

    // 4. Horizontal Separator `---`
    if (trimmed === "---") {
      flushList(`hr-list-${index}`);
      elements.push(
        <hr key={`hr-${index}`} className="my-8 border-border/40" />
      );
      return;
    }

    // 5. Dialogue format lines (`🗣️` and `💬`)
    if (trimmed.includes("🗣️") || trimmed.includes("💬")) {
      flushList(`dialogue-list-${index}`);
      const isSpeakerA = trimmed.includes("🗣️");
      const iconEmoji = isSpeakerA ? "🗣️" : "💬";
      const cleanContent = trimmed.replace(/^[*\-\s]*[🗣️💬]\s*/, "");

      elements.push(
        <div 
          key={`dialogue-${index}`} 
          className={`p-3.5 sm:p-4 rounded-xl border ${isSpeakerA ? "border-primary/25 bg-primary/5" : "border-border/60 bg-card/60"} my-2.5 text-sm md:text-base leading-relaxed select-text flex items-start gap-3 transition-colors`}
        >
          <span className="text-base md:text-lg shrink-0 select-none mt-0.5">{iconEmoji}</span>
          <div className="flex-1 font-medium text-foreground/95 leading-relaxed">
            {parseInlineStyles(cleanContent)}
          </div>
        </div>
      );
      return;
    }

    // 6. Sub-example lines (e.g. `*Contoh*: ...` or `* Contoh: ...`)
    const isExampleSubLine = /^\*?\s*\*?Contoh\*?:\s*/i.test(trimmed);
    if (isExampleSubLine) {
      flushList(`example-list-flush-${index}`);
      elements.push(
        <div 
          key={`example-sub-${index}`} 
          className="my-3 pl-4 pr-3 py-2.5 rounded-xl border border-primary/20 bg-primary/5 text-sm md:text-base leading-relaxed select-text flex items-start gap-2.5"
        >
          <span className="text-primary font-bold shrink-0 select-none text-xs md:text-sm uppercase tracking-wider mt-0.5">
            Contoh:
          </span>
          <div className="flex-1 font-normal text-foreground/95 leading-relaxed">
            {parseInlineStyles(trimmed.replace(/^\*?\s*\*?Contoh\*?:\s*/i, ""))}
          </div>
        </div>
      );
      return;
    }

    // 7. Unordered List Items (`* ` or `- `)
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

    // 8. Ordered List Items (`1. `, `2. `)
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

    // 9. Warning fallback line starting with ⚠️
    if (trimmed.startsWith("⚠️")) {
      elements.push(
        <div 
          key={`warning-${index}`} 
          className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-foreground font-medium my-4 text-xs md:text-sm flex gap-3 items-start select-text"
        >
          <Alert size={18} className="text-destructive shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            {parseInlineStyles(trimmed.substring(2).trim())}
          </div>
        </div>
      );
      return;
    }

    // 10. Standard Paragraph
    elements.push(
      <p key={`para-${index}`} className="font-normal text-foreground/90 leading-relaxed text-sm md:text-base my-2">
        {parseInlineStyles(trimmed)}
      </p>
    );
  });

  flushAll("final");
  return <div className="space-y-2">{elements}</div>;
}
