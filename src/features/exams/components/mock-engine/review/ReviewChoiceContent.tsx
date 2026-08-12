"use client";

/**
 * @file ReviewChoiceContent.tsx
 * @description Render teks pilihan jawaban atau gambar (untuk soal bergambar).
 */

import Image from "next/image";
import { ExamChoice } from "../types";
import { sanitizeHtml } from "@/lib/sanitize";

interface ReviewChoiceContentProps {
  /** Rich choice data. */
  choice?: ExamChoice;
  /** Fallback text (legacy string option). */
  text: string;
}

/**
 * Render choice text or image.
 */
export function ReviewChoiceContent({ choice, text }: ReviewChoiceContentProps) {
 if (choice?.type !== "image") {
   return (
     <span
       className="min-w-0 flex-1 text-base font-medium leading-tight md:text-xl font-japanese [&_rt]:text-[0.55em] [&_rt]:leading-none"
       dangerouslySetInnerHTML={{ __html: sanitizeHtml(choice?.type === "text" ? choice.value : text) }}
     />
   );
 }

 return (
   <span className="flex min-w-0 flex-1 flex-col gap-3">
     <span className="relative block aspect-[16/9] w-full overflow-hidden rounded-xl border border-border bg-muted/30">
       <Image
         src={choice.value}
         alt={choice.alt || text}
         fill
         sizes="(max-width: 768px) 72vw, 560px"
         className="object-contain"
       />
     </span>
     <span className="text-sm font-medium leading-tight text-muted-foreground md:text-base font-japanese">
       {choice.alt || text}
     </span>
   </span>
 );
}
