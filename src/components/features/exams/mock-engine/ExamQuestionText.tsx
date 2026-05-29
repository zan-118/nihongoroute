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
export interface ExamPortableTextBlock {
  _type: string;
  _key?: string;
  [key: string]: unknown;
}

interface ExamQuestionTextProps {
  questionText?: string | ExamPortableTextBlock[];
  className?: string;
}

// ======================
// KONSTANTA & ATURAN
// ======================
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
export function ExamQuestionText({ questionText, className }: ExamQuestionTextProps) {
  if (!questionText) return null;

  if (typeof questionText === "string") {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(questionText) }}
      />
    );
  }

  return (
    <div className={className}>
      <PortableText value={questionText} components={examPortableTextComponents} />
    </div>
  );
}
