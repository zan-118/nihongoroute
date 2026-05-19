import React from "react";
import { MessageSquare } from "lucide-react";
import { SmartJapanese } from "@/components/ui/SmartJapanese";
import TTSReader from "@/components/features/tools/tts/TTSReader";
import SanityMedia from "@/components/ui/SanityMedia";

interface DialogueSectionProps {
  listeningList: any[];
}

export const DialogueSection: React.FC<DialogueSectionProps> = ({ listeningList }) => {
  if (!listeningList || listeningList.length === 0) return null;

  return (
    <section id="scenario">
      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-xl font-black uppercase italic tracking-tighter text-foreground flex items-center gap-3">
          <span className="text-2xl not-italic">場面</span> Skenario Percakapan
        </h2>
        <div className="h-[1px] flex-1 bg-border" />
      </div>
      
      <div className="space-y-10">
        {listeningList.map((l: any) => (
          <div key={l._id || l.id} className="neo-card p-5 md:p-10 border-l-4 border-l-secondary">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-border/50 pb-8">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-2">{l.title}</h3>
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                   <MessageSquare size={12} className="text-secondary" /> Dengarkan dan pelajari percakapan di bawah ini
                </p>
              </div>
              {(l.audioUrl || l.audio_url) && (
                <audio controls className="w-full md:w-64 h-10 filter brightness-90 contrast-125">
                  <source src={l.audioUrl || l.audio_url} type="audio/mpeg" />
                </audio>
              )}
            </div>

            {/* HERO MEDIA FOR LISTENING (SANITY) */}
            {(l.imageUrl || l.videoUrl) && (
              <div className="mb-10 max-w-2xl mx-auto">
                <SanityMedia 
                  url={l.videoUrl || l.imageUrl} 
                  type={l.videoUrl ? "video" : "image"}
                  className="shadow-2xl rounded-[2.5rem] overflow-hidden"
                />
              </div>
            )}
            
            {(l.transcript || l.body) && (
              <div className="space-y-8">
                {(l.transcript || l.body).map((item: any, idx: number) => (
                  <div key={idx} className="flex flex-col gap-2 group/dialogue">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] bg-secondary/10 px-2 py-0.5 rounded">
                        {item.speaker || item.speakerName}
                      </span>
                    </div>
                    <div className="p-4 md:p-6 rounded-2xl bg-secondary/5 border border-secondary/10 group-hover/dialogue:bg-secondary/10 transition-all relative overflow-hidden">
                       <div className="text-lg font-japanese font-bold text-foreground mb-2 leading-relaxed">
                         <SmartJapanese 
                             word={item.jp || item.text} 
                             furigana={item.furigana} 
                           />
                       </div>
                       <p className="text-sm text-muted-foreground font-medium italic border-t border-border/20 pt-3">
                         &quot;{item.translation || item.id}&quot;
                       </p>
                       <div className="absolute top-2 right-2 opacity-0 group-hover/dialogue:opacity-100 transition-opacity">
                         <TTSReader text={item.jp || item.text} minimal={true} />
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
