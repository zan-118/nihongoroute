/**
 * @file ExamQuestionText.tsx
 * @description Komponen parser teks pertanyaan ujian yang mendukung string HTML murni maupun format PortableText dari Sanity CMS.
 */

// ======================
// IMPOR
// ======================
import React from "react";
import { PortableText } from "next-sanity";
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
// KONSTANTA & ATURAN
// ======================

/**
 * Custom renderers for PortableText nodes.
 * Formats Japanese text blocks and standard inline marks.
 */
const examPortableTextComponents = {
  block: {
    normal: ({ children }: { children?: React.ReactNode }) => (
      <span className="block font-japanese leading-relaxed">
        {children}
      </span>
    ),
  },
  marks: {
    strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }: { children?: React.ReactNode }) => <em className="italic">{children}</em>,
    underline: ({ children }: { children?: React.ReactNode }) => <span className="underline">{children}</span>,
  }
};

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
      <PortableText value={questionText} components={examPortableTextComponents} />
    </div>
  );
}