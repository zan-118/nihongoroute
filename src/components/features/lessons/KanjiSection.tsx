import React from "react";
import Link from "next/link";

interface KanjiSectionProps {
  kanjiList: any[];
}

export const KanjiSection: React.FC<KanjiSectionProps> = ({ kanjiList }) => {
  if (!kanjiList || kanjiList.length === 0) return null;

  return (
    <section id="kanji">
      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-xl font-black uppercase italic tracking-tighter text-foreground flex items-center gap-3">
          <span className="text-2xl not-italic">漢字</span> Kanji Pelajaran
        </h2>
        <div className="h-[1px] flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {kanjiList.map((k: any) => (
          <Link
            key={k._id || k.id}
            href={`/library/kanji/${k.character}`}
            className="neo-card p-6 flex flex-col items-center justify-center group hover:border-primary/40 transition-all duration-300"
          >
            <span className="text-4xl font-black mb-3 group-hover:scale-110 transition-transform">
              {k.character}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">
              {k.meaning}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};
