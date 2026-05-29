"use client";

/**
 * @file VocabNotes.tsx
 * @description Komponen penampil catatan tambahan dan jembatan keledai (Mnemonic) kosakata (Vocab Notes).
 * Menampilkan mnemonik resmi dari server, catatan penggunaan tata bahasa/konteks, serta editor kustom luring (MnemonicEditor).
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import { Card } from "@/components/ui/card";
import { Sparkles, Info } from "lucide-react";
import { MnemonicEditor } from "@/components/features/srs/mnemonic/MnemonicEditor";

// ==========================================
// ANTARMUKA & TIPE DATA
// ==========================================
interface VocabNotesProps {
  wordId: string;
  mnemonic?: string;
  usageNotes?: string;
}

// ==========================================
// KOMPONEN UTAMA: VocabNotes
// ==========================================
/**
 * Komponen penampil catatan & editor mnemonik kustom.
 * 
 * @param {VocabNotesProps} props Properti komponen catatan kosakata.
 */
export function VocabNotes({ wordId, mnemonic, usageNotes }: VocabNotesProps) {
  return (
    <Card className="p-6 bg-warning/5 backdrop-blur-xl border-warning/20 rounded-[2rem] hover:border-warning/40 transition-all group overflow-hidden relative col-span-1 md:col-span-1 lg:col-span-1 flex flex-col gap-4 font-sans">
      <div className="absolute -top-4 -right-4 p-8 opacity-[0.05] group-hover:scale-110 transition-transform duration-700 text-warning">
        <Sparkles size={80} />
      </div>

      {/* Tampilan Jembatan Keledai / Mnemonik Resmi */}
      {mnemonic && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} aria-hidden="true" className="text-warning" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-warning">Mnemonic Resmi</span>
          </div>
          <p className="text-sm font-semibold text-warning leading-relaxed italic">
            &quot;{mnemonic}&quot;
          </p>
        </div>
      )}

      {/* Tampilan Catatan Penggunaan Tambahan */}
      {usageNotes && (
        <div className={mnemonic ? "pt-4 border-t border-warning/10" : ""}>
          <div className="flex items-center gap-2 mb-2">
            <Info size={14} aria-hidden="true" className="text-warning" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-warning">Catatan</span>
          </div>
          <p className="text-sm font-semibold text-warning/90 leading-relaxed">
            {usageNotes}
          </p>
        </div>
      )}

      {/* Jembatan Keledai Kustom - Offline-first custom mnemonic editor */}
      <div className="pt-4 border-t border-warning/10">
        <MnemonicEditor wordId={wordId} />
      </div>
    </Card>
  );
}

