import React from "react";
import { BookOpen } from "lucide-react";
import { SmartJapanese } from "@/components/ui/SmartJapanese";
import SanityMedia from "@/components/ui/SanityMedia";

interface ReadingSectionProps {
  readingList: any[];
}

export const ReadingSection: React.FC<ReadingSectionProps> = ({ readingList }) => {
  if (!readingList || readingList.length === 0) return null;

  return (
    <section id="reading">
      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-xl font-black uppercase tracking-tight text-foreground flex items-center gap-3">
          <BookOpen size={24} className="text-primary" /> Materi Bacaan
        </h2>
        <div className="h-[1px] flex-1 bg-border" />
      </div>
      <div className="space-y-16">
        {readingList.map((r: any) => (
          <div key={r._id || r.id} className="relative">
            <div className="flex items-center justify-between mb-8">
               <div>
                 <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-3 py-1 rounded-full mb-3 inline-block">
                   {r.difficulty || r.level || "N/A"} Reading
                 </span>
                 <h3 className="text-3xl font-black tracking-tighter uppercase">{r.title}</h3>
               </div>
               {(r.audioUrl || r.audio_url) && (
                 <div className="flex items-center gap-4">
                   <audio controls className="h-10 filter brightness-90 contrast-125">
                     <source src={r.audioUrl || r.audio_url} type="audio/mpeg" />
                   </audio>
                 </div>
               )}
            </div>

            {/* HERO MEDIA FOR READING (SANITY) */}
            {(r.imageUrl || r.videoUrl) && (
              <div className="mb-10">
                <SanityMedia 
                  url={r.videoUrl || r.imageUrl} 
                  type={r.videoUrl ? "video" : "image"}
                  className="shadow-2xl rounded-[2.5rem] overflow-hidden"
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              <div className="prose-custom text-lg md:text-xl leading-[2] md:leading-[2.2] font-japanese bg-card/30 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-border/50">
                {typeof r.body === "string"
                  ? r.body.split("\n").filter(Boolean).map((line: string, i: number) => (
                      <div key={i} className="mb-4">
                        <SmartJapanese word={line} furigana={r.hiragana?.split("\n")[i] || ""} />
                      </div>
                    ))
                  : null}
              </div>
              <div className="prose-custom opacity-70 italic text-sm md:text-base bg-muted/20 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-border/30">
                 <h4 className="text-[10px] not-italic font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 md:mb-6">Terjemahan</h4>
                 {typeof r.translation === "string"
                   ? r.translation.split("\n").filter(Boolean).map((line: string, i: number) => (
                       <p key={i} className="mb-2">{line}</p>
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
