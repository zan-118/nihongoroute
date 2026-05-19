"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import TTSReader from "@/components/features/tools/tts/TTSReader";
import AddToSRSButton from "@/components/features/srs/actions/AddToSRSButton";
import { createClient } from "@/lib/supabase/client";

/**
 * @file DictionaryPopup.tsx
 * @description Pop-up kamus pintar yang muncul saat pengguna menyorot (select) teks Jepang.
 * Mendukung pencarian otomatis di database internal (Supabase/Sanity).
 */

interface DictionaryResult {
  word: string;
  furigana?: string;
  meaning: string;
  romaji?: string;
  id?: string;
}

export default function DictionaryPopup() {
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);
  const [result, setResult] = useState<DictionaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const lookupWord = async (text: string) => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // 1. Cari kecocokan eksak pada word atau furigana
      let { data, error } = await supabase
        .from("vocab")
        .select("id, word, furigana, romaji, meaning_id")
        .or(`word.eq.${text},furigana.eq.${text}`)
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      // 2. Jika tidak ditemukan, coba cari substring (ilike)
      if (!data) {
        const { data: list, error: listError } = await supabase
          .from("vocab")
          .select("id, word, furigana, romaji, meaning_id")
          .or(`word.ilike.%${text}%,furigana.ilike.%${text}%`)
          .limit(1);
          
        if (listError) throw listError;
        if (list && list.length > 0) {
          data = list[0];
        }
      }

      if (data) {
        setResult({
          id: data.id,
          word: data.word,
          furigana: data.furigana || undefined,
          meaning: data.meaning_id || "",
          romaji: data.romaji || undefined,
        });
      } else {
        setResult({
          word: text,
          meaning: "Kosakata belum tersedia di database kami.",
          furigana: "???"
        });
      }
    } catch (err) {
      console.error("Lookup error:", err);
      setResult({
        word: text,
        meaning: "Gagal memuat arti kata.",
        furigana: "???"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => {
      const selected = window.getSelection();
      const text = selected?.toString().trim();

      if (text && text.length < 15 && /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(text)) {
        const range = selected?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();

        if (rect) {
          setSelection({
            text,
            x: rect.left + window.scrollX + rect.width / 2,
            y: rect.top + window.scrollY - 10,
          });
          lookupWord(text);
        }
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setSelection(null);
        setResult(null);
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return (
    <AnimatePresence>
      {selection && (
        <motion.div
          ref={popupRef}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          style={{
            position: "fixed", // Changed to fixed for easier boundary clamping
            left: Math.max(140, Math.min(selection.x - window.scrollX, typeof window !== 'undefined' ? window.innerWidth - 140 : 1000)),
            top: Math.max(200, selection.y - window.scrollY),
            transform: "translateX(-50%) translateY(-100%)",
            zIndex: 1000,
          }}
          className="pointer-events-auto"
        >
          <Card className="w-64 bg-card/98 backdrop-blur-md border border-border p-4 rounded-2xl shadow-xl">
            <div className="flex justify-between items-start mb-3">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[8px] uppercase tracking-widest px-2 py-0.5">
                Smart Jisho
              </Badge>
              <button onClick={() => setSelection(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={14} />
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col gap-2 animate-pulse">
                <div className="h-6 w-20 bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
              </div>
            ) : result ? (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-2xl font-black text-foreground">{result.word}</h4>
                    <span className="text-xs font-bold text-primary/70">{result.furigana}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono tracking-widest uppercase">{result.romaji}</p>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-2 rounded-lg border border-border">
                  {result.meaning}
                </p>

                <div className="flex items-center gap-2 pt-2">
                  <div className="flex-1">
                     <TTSReader text={result.word} minimal={true} />
                  </div>
                  {result.id && (
                    <div className="flex-1 flex justify-end">
                       <AddToSRSButton wordId={result.id} />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Kosakata belum tersedia</p>
              </div>
            )}
            
            {/* Arrow */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card border-r border-b border-border rotate-45" />
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
