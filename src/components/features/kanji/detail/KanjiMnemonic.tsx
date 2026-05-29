/**
 * @file KanjiMnemonic.tsx
 * @description Komponen untuk menampilkan jembatan keledai (mnemonic) memori Kanji bawaan dan menyediakan editor mnemonic kustom offline-first.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { MnemonicEditor } from "@/components/features/srs/mnemonic/MnemonicEditor";

// ==========================================
// TIPE DATA / INTERFACE
// ==========================================
interface KanjiMnemonicProps {
  mnemonics?: string | unknown[];
  wordId: string;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * Komponen panel mnemonic pembelajaran kanji.
 */
export function KanjiMnemonic({ mnemonics, wordId }: KanjiMnemonicProps) {
  // ==========================================
  // RENDER KOMPONEN
  // ==========================================
  return (
    <Card className="p-8 md:p-10 bg-card/20 backdrop-blur-xl border-border rounded-[2.5rem] hover:border-primary/40 transition-all md:col-span-full lg:col-span-2 relative overflow-hidden group">
      {mnemonics && (
        <div className="mb-6 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles size={20} className="text-warning" aria-hidden="true" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Memory Mnemonic</h2>
          </div>
          <div className="prose dark:prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-p:text-warning italic font-medium">
            {typeof mnemonics === "string"
              ? mnemonics.split("\n").filter(Boolean).map((line: string, pos: number) => (
                  <p key={`mnemonic-${pos}`} className="text-warning italic">{line}</p>
                ))
              : Array.isArray(mnemonics)
                ? mnemonics.map((m: unknown, pos: number) => {
                    const item = m as string | { text?: string; children?: { text?: string }[] };
                    return (
                      <p key={`mnemonic-${pos}`} className="text-warning italic">
                        {typeof item === "string" ? item : item?.text || item?.children?.[0]?.text || ""}
                      </p>
                    );
                  })
                : null}
          </div>
        </div>
      )}

      {/* Jembatan Keledai Kustom - Offline-first custom mnemonic editor */}
      <div className={mnemonics ? "pt-6 border-t border-border/40 relative z-10" : "relative z-10"}>
        <MnemonicEditor wordId={wordId} />
      </div>
    </Card>
  );
}
