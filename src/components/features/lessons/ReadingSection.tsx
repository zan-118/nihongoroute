/**
 * @file ReadingSection.tsx
 * @description Komponen seksi membaca (ReadingSection) dalam halaman pelajaran. Menampilkan teks bacaan terformat Kanji/Furigana/Hiragana, terjemahan, dan pemutar audio offline.
 */

// ======================
// IMPOR
// ======================
import React from "react";
import { SmartJapanese } from "@/components/ui/SmartJapanese";
import SanityMedia from "@/components/ui/SanityMedia";
import { OfflineAudio } from "@/components/ui/OfflineAudio";

// ======================
// ANTARMUKA / TIPE DATA
// ======================
export interface ReadingLessonItem {
  _id?: string;
  id?: string;
  difficulty?: string;
  level?: string;
  title?: string;
  audioUrl?: string;
  audio_url?: string;
  imageUrl?: string;
  videoUrl?: string;
  body?: string;
  hiragana?: string;
  translation?: string;
}

interface ReadingSectionProps {
  readingList: ReadingLessonItem[];
}

// ======================
// EKSEKUSI UTAMA
// ======================
export const ReadingSection: React.FC<ReadingSectionProps> = ({ readingList }) => {
  if (!readingList || readingList.length === 0) return null;

  return (
    <section id="reading">
      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-xl font-black uppercase tracking-tight text-foreground flex items-center gap-3">
          <span className="text-2xl">読解</span> Materi Bacaan
        </h2>
        <div className="h-[1px] flex-1 bg-border" />
      </div>
      <div className="space-y-16">
        {readingList.map((r: ReadingLessonItem) => (
          <div key={r._id || r.id} className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
               <div>
                 <span 
                   className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-3 inline-block"
                   style={{ backgroundColor: "rgb(var(--primary-rgb)/0.1)" }}
                 >
                   {r.difficulty || r.level || "N/A"} Reading
                 </span>
                 <h3 className="text-3xl font-black tracking-tighter uppercase">{r.title}</h3>
               </div>
               {(r.audioUrl || r.audio_url) && (
                 <div className="flex items-center gap-4 w-full sm:w-auto">
                   <OfflineAudio 
                     controls 
                     src={(r.audioUrl || r.audio_url)!} 
                     className="w-full sm:w-64 h-10 filter brightness-90 contrast-125" 
                   />
                 </div>
               )}
            </div>

            {/* MEDIA HERO BACAAN (SANITY) */}
            {(r.imageUrl || r.videoUrl) && (
              <div className="mb-10">
                <SanityMedia 
                  url={r.videoUrl || r.imageUrl || ""} 
                  type={r.videoUrl ? "video" : "image"}
                  className="shadow-2xl rounded-[2.5rem] overflow-hidden"
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              <div 
                className="prose-custom text-lg md:text-xl leading-[2] md:leading-[2.2] font-japanese p-8 md:p-10 rounded-[2.5rem] border border-border/80 shadow-[0_0_30px_rgba(var(--primary-rgb),0.015)] glass"
                style={{ backgroundColor: "rgb(var(--card-rgb)/0.3)" }}
              >
                {typeof r.body === "string"
                  ? r.body.split("\n").filter(Boolean).map((line: string, pos: number) => (
                      <div key={`body-${pos}`} className="mb-4">
                        <SmartJapanese word={line} furigana={r.hiragana?.split("\n")[pos] || ""} />
                      </div>
                    ))
                  : null}
              </div>
              <div 
                className="prose-custom opacity-75 italic text-sm md:text-base p-8 md:p-10 rounded-[2.5rem] border border-border/80 shadow-[0_0_30px_rgba(var(--primary-rgb),0.01)] glass"
                style={{ backgroundColor: "rgb(var(--card-rgb)/0.15)" }}
              >
                 <h4 className="text-[10px] not-italic font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 md:mb-6">Terjemahan</h4>
                 {typeof r.translation === "string"
                   ? r.translation.split("\n").filter(Boolean).map((line: string, pos: number) => (
                       <p key={`trans-${pos}`} className="mb-2">{line}</p>
                     ))
                   : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
