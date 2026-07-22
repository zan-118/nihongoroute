/**
 * @file KanjiStrokeOrder.tsx
 * @description Komponen untuk menampilkan urutan goresan (stroke order) Kanji menggunakan SVG eksternal dari KanjiVG.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { useState, useEffect } from "react";
import { RotateCcw, Info } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// ==========================================
// TIPE DATA / INTERFACE
// ==========================================
/**
 * Props for KanjiStrokeOrder component.
 */
interface KanjiStrokeOrderProps {
  /** Kanji character to display. */
  kanji: string;
  /** Render minimal UI without control buttons. */
  minimal?: boolean;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * Renders stroke order diagram for kanji using KanjiVG SVG.
 */
export default function KanjiStrokeOrder({ kanji, minimal = false }: KanjiStrokeOrderProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  // Convert kanji character to 5-digit hex code point for KanjiVG URL.
  const codePoint = kanji ? kanji.charCodeAt(0).toString(16).padStart(5, '0') : "";
  // Construct KanjiVG SVG URL.
  const svgUrl = codePoint ? `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${codePoint}.svg` : "";

  // ==========================================
  // EFEK SAMPING (EFFECTS)
  // ==========================================
  // Reset loading and error states when kanji changes.
  useEffect(() => {
    if (svgUrl) {
      requestAnimationFrame(() => {
        setLoading(true);
      });
    }
    requestAnimationFrame(() => {
      setError(false);
    });
  }, [kanji, svgUrl]);

  // ==========================================
  // RENDER KOMPONEN
  // ==========================================
  return (
    <div className={`flex flex-col ${minimal ? 'gap-2' : 'gap-4'}`}>
      <div className={`relative aspect-square w-full mx-auto bg-background dark:bg-background/5 rounded-lg border border-border ${minimal ? 'p-2' : 'p-4'} flex items-center justify-center group overflow-hidden`}>
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
              // Force image reload by changing key.
              key={`${svgUrl}-${resetKey}`}
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
              onClick={() => setResetKey(prev => prev + 1)}
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