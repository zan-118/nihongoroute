/**
 * @file KanjiRelatedVocab.tsx
 * @description Komponen panel untuk menampilkan daftar kosakata (vocabulary) yang berhubungan atau menggunakan karakter Kanji tersebut.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { Card } from "@/components/ui/card";
import { Link as LinkIcon, ChevronLeft } from "@/components/ui/icons";
import Link from "next/link";
import { SmartJapanese } from "@/components/ui/japanese";

// ==========================================
// TIPE DATA / INTERFACE
// ==========================================
/**
 * Vocabulary reference data structure.
 */
interface VocabRef {
  /** Unique identifier. */
  id: string;
  /** Alternative MongoDB identifier. */
  _id?: string;
  /** Vocabulary word in Japanese. */
  word: string;
  /** Furigana reading. */
  furigana: string;
  /** English or Indonesian meaning. */
  meaning: string;
  /** Romaji transliteration. */
  romaji?: string;
  /** URL slug. */
  slug?: string;
}

/**
 * Props for KanjiRelatedVocab component.
 */
interface KanjiRelatedVocabProps {
  /** Array of related vocabulary items. */
  relatedVocab?: VocabRef[];
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * Renders list of vocabulary items related to specific Kanji.
 * Displays word, furigana, meaning, and links to detail page.
 */
export function KanjiRelatedVocab({ relatedVocab }: KanjiRelatedVocabProps) {
  // ==========================================
  // RENDER KOMPONEN
  // ==========================================
  return (
    <Card className="p-6 md:p-10 bg-card/20  border-border rounded-2xl md:rounded-3xl hover:border-primary/40 transition-all glass shadow-[0_0_20px_rgba(var(--primary-rgb),0.02)]">
      <div className="flex items-center gap-3 mb-6">
        <LinkIcon size={18} className="text-primary" aria-hidden="true" />
        <h2 className="text-xs md:text-sm uppercase tracking-[0.2em] text-foreground">Kosakata Terkait</h2>
      </div>
      
      {relatedVocab && relatedVocab.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {relatedVocab.map((vocab) => (
            // Link to vocabulary detail page using slug
            <Link key={vocab.id || vocab._id} href={`/library/vocab/${vocab.slug}`}>
              <Card className="p-4 sm:p-6 pl-6 sm:pl-8 bg-card/20 border-border rounded-lg flex items-center gap-4 hover:bg-card/40 hover:border-primary/30 transition-all group cursor-pointer shadow-none relative overflow-hidden">
                {/* Left border indicator highlight on hover */}
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-all duration-300" />
                
                <div className="flex-1 min-w-0">
                  {/* Render Japanese text with furigana */}
                  <div className="text-lg md:text-xl font-bold text-foreground font-japanese group-hover:text-primary transition-colors">
                    <SmartJapanese word={vocab.word} furigana={vocab.furigana} />
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground truncate mt-1">{vocab.meaning}</p>
                </div>
                <ChevronLeft size={16} className="rotate-180 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" aria-hidden="true" />
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">Belum ada kosakata yang terhubung ke karakter ini.</p>
      )}
    </Card>
  );
}