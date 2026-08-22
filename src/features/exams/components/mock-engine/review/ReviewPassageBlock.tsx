"use client";

/**
 * @file ReviewPassageBlock.tsx
 * @description Render konten passage (bacaan/listening): visual, konten HTML,
 * dan transkrip listening yang dapat dilipat.
 */

import Image from "next/image";
import { ExamPassage } from "../types";
import { sanitizeHtml } from "@/lib/sanitize";

interface ReviewPassageBlockProps {
  /** Reading passage or listening context data. */
  passage?: ExamPassage | null;
}

/**
 * Render passage content, image, or transcript.
 */
export function ReviewPassageBlock({ passage }: ReviewPassageBlockProps) {
 if (!passage) return null;

 const hasContent = Boolean(
   passage.contentHtml ||
   passage.visualUrl ||
   passage.transcriptHtml
 );

 if (!hasContent) return null;

 return (
   <div className="mb-8 rounded-lg border border-border bg-muted/25 p-5 dark:bg-background/12">
     {passage.visualUrl && (
       <div className="mb-5 overflow-hidden rounded-lg border border-border bg-background/60">
         <Image
           src={passage.visualUrl}
           alt="Visual bacaan"
           width={900}
           height={500}
           sizes="(max-width: 1024px) 100vw, 900px"
           className="max-h-[420px] w-full object-contain"
         />
       </div>
     )}

     {passage.contentHtml && (
       <div
         className="prose-custom font-japanese text-base leading-relaxed text-foreground md:text-lg"
         dangerouslySetInnerHTML={{ __html: sanitizeHtml(passage.contentHtml) }}
       />
     )}

     {passage.transcriptHtml && (
       <details className="mt-5 rounded-xl border border-border bg-background/60 p-4">
         <summary className="cursor-pointer text-[10px] font-black uppercase tracking-widest text-muted-foreground">
           Transkrip Listening
         </summary>
         <div
           className="prose-custom mt-4 font-japanese text-sm leading-relaxed text-foreground"
           dangerouslySetInnerHTML={{
             __html: sanitizeHtml(passage.transcriptHtml),
           }}
         />
       </details>
     )}
   </div>
 );
}
