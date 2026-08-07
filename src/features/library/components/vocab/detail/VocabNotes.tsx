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
import { Information } from "@/components/ui/icons";
import { MnemonicEditor } from "@/features/srs/mnemonic/MnemonicEditor";

// ==========================================
// ANTARMUKA & TIPE DATA
// ==========================================
/**
 * Properties for VocabNotes component.
 */
interface VocabNotesProps {
 /** Unique identifier of vocabulary word. */
 wordId: string;
 /** Official mnemonic text from server. */
 mnemonic?: string;
 /** Additional usage or grammar notes. */
 usageNotes?: string;
}

// ==========================================
// KOMKOMPONEN UTAMA: VocabNotes
// ==========================================
/**
 * Renders official mnemonics, usage notes, and custom mnemonic editor.
 * 
 * @param props - Component properties.
 * @returns React element.
 */
export function VocabNotes({ wordId, mnemonic, usageNotes }: VocabNotesProps) {
 return (
 <Card className="p-6 bg-warning/5 border-warning/20 rounded-2xl md:rounded-3xl hover:border-warning/40 transition-all group overflow-hidden relative flex flex-col gap-4 font-sans glass shadow-[0_0_20px_hsl(var(--warning)/0.02)]">
 {/* Decorative background icon */}
 <div className="absolute -top-4 -right-4 p-8 opacity-[0.05] group-hover:scale-110 transition-transform duration-700 text-warning">
 
 </div>

 {/* Tampilan Jembatan Keledai / Mnemonik Resmi */}
 {mnemonic && (
 <div>
 <div className="flex items-center gap-2 mb-2">
 
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
 <Information size={14} aria-hidden="true" className="text-warning" />
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