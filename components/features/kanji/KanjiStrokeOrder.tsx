"use client";

import { useState, useEffect } from "react";
import { RotateCcw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface KanjiStrokeOrderProps {
  kanji: string;
  minimal?: boolean;
}

export default function KanjiStrokeOrder({ kanji, minimal = false }: KanjiStrokeOrderProps) {
  const [svgUrl, setSvgUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!kanji) return;

    // Convert kanji to hex string (KanjiVG format: 04e00.svg)
    const codePoint = kanji.charCodeAt(0).toString(16).padStart(5, '0');
    const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${codePoint}.svg`;
    
    setSvgUrl(url);
    setLoading(true);
    setError(false);
  }, [kanji]);

  return (
    <div className={`flex flex-col ${minimal ? 'gap-2' : 'gap-4'}`}>
      <div className={`relative aspect-square w-full mx-auto bg-white dark:bg-white/5 rounded-2xl border border-border ${minimal ? 'p-2' : 'p-4'} flex items-center justify-center group overflow-hidden`}>
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center animate-pulse text-primary/20">
            <span className="text-4xl font-black">{kanji}</span>
          </div>
        )}
        
        {error ? (
          <div className="text-xs text-muted-foreground text-center px-4 leading-tight">
            <Info size={minimal ? 14 : 20} className="mx-auto mb-1 opacity-50" />
            {!minimal && "Urutan goresan tidak tersedia."}
          </div>
        ) : (
          svgUrl && (
            <Image 
              src={svgUrl} 
              alt={`Stroke order for ${kanji}`}
              width={200}
              height={200}
              unoptimized
              className={`w-full h-full object-contain transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100 dark:invert'}`}
              onLoadingComplete={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError(true);
              }}
            />
          )
        )}
      </div>

      {!minimal && (
        <>
          <div className="flex justify-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-3 rounded-lg text-xs font-bold uppercase tracking-widest gap-2"
              onClick={() => {
                const currentUrl = svgUrl;
                setSvgUrl("");
                setTimeout(() => setSvgUrl(currentUrl), 10);
              }}
            >
              <RotateCcw size={12} /> Ulangi
            </Button>
            <Button 
              asChild
              variant="ghost" 
              size="sm" 
              className="h-8 px-3 rounded-lg text-xs font-bold uppercase tracking-widest gap-2 text-muted-foreground"
            >
              <a href={`https://jisho.org/search/${kanji}%20%23kanji`} target="_blank" rel="noopener noreferrer">
                Jisho.org
              </a>
            </Button>
          </div>
          
          <p className="text-xs text-center text-muted-foreground font-medium italic">
            Sumber: KanjiVG Project
          </p>
        </>
      )}
    </div>
  );
}
