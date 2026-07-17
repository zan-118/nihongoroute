/**
 * @file ExamQuestionText.tsx
 * @description Komponen parser teks pertanyaan ujian yang mendukung string HTML murni maupun format PortableText dari Sanity CMS.
 */

// ======================
// IMPOR
// ======================
import React from "react";
import { sanitizeHtml } from "@/lib/sanitize";

// ======================
// ANTARMUKA & TIPE
// ======================

/**
 * Represents a single block in Sanity PortableText format.
 */
export interface ExamPortableTextBlock {
  _type: string;
  _key?: string;
  [key: string]: unknown;
}

/**
 * Props for ExamQuestionText component.
 */
interface ExamQuestionTextProps {
  /** Raw HTML string or PortableText block array containing the question content */
  questionText?: string | ExamPortableTextBlock[];
  /** Optional CSS class names for styling the wrapper container */
  className?: string;
}

// ======================
// SIMPLE PORTABLE TEXT COMPONENT (CUSTOM RENDERER)
// ======================
function SimplePortableText({ value }: { value: ExamPortableTextBlock[] }) {
  return (
    <>
      {value.map((block, i) => {
        if (block._type === "block") {
          const children = (block.children as Array<{ text: string }> || []);
          const text = children.map((c) => c.text).join("");
          return (
            <span key={block._key || i} className="block font-japanese leading-relaxed">
              {text}
            </span>
          );
        }
        return null;
      })}
    </>
  );
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Renders exam question text.
 * Supports raw HTML strings (sanitized) and Sanity PortableText arrays.
 */
export function ExamQuestionText({ questionText, className }: ExamQuestionTextProps) {
  // Return null if no content provided
  if (!questionText) return null;

  // Render sanitized HTML string
  if (typeof questionText === "string") {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(questionText) }}
      />
    );
  }

  // Render PortableText array structure
  return (
    <div className={className}>
      <SimplePortableText value={questionText} />
    </div>
  );
}