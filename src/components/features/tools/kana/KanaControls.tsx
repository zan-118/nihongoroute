/**
 * @file KanaControls.tsx
 * @description Komponen panel kontrol untuk memilih jenis huruf Jepang (Hiragana/Katakana), kategori karakter (Utama/Turunan/Gabungan), dan memulai latihan kuis kana.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { Button } from "@/components/ui/button";
import { Swords } from "lucide-react";
import { KanaType, KanaCategory } from "./kana-data";

// ==========================================
// TIPE DATA / INTERFACE
// ==========================================
/**
 * Props for KanaControls component.
 */
interface KanaControlsProps {
  /** Selected kana type (hiragana or katakana) */
  type: KanaType;
  /** Callback to change kana type */
  setType: (type: KanaType) => void;
  /** Selected kana category (seion, dakuon, yoon) */
  category: KanaCategory;
  /** Callback to change kana category */
  setCategory: (cat: KanaCategory) => void;
  /** Callback to start quiz */
  startQuiz: () => void;
  /** Tailwind text color class for active category */
  themeColor: string;
  /** Tailwind border color class for active category */
  themeBorder: string;
  /** Tailwind background color class for quiz button */
  themeAccent: string;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * Control panel component. User select kana type and category. Start quiz.
 */
export function KanaControls({
  type,
  setType,
  category,
  setCategory,
  startQuiz,
  themeColor,
  themeBorder,
  themeAccent,
}: KanaControlsProps) {
  // Check if Hiragana selected. Toggle styles.
  const isHira = type === "hiragana";

  // ==========================================
  // RENDER KOMPONEN
  // ==========================================
  return (
    <div className="mb-6 md:mb-8 space-y-4 md:space-y-6">
      {/* Kana type selector (Hiragana / Katakana) */}
      <div className="bg-muted p-1 rounded-lg border border-border flex gap-1 shadow-inner relative max-w-sm">
        <Button
          variant={isHira ? "default" : "ghost"}
          onClick={() => setType("hiragana")}
          className={`relative z-10 flex-1 py-6 rounded-xl font-bold uppercase tracking-widest text-xs md:text-xs transition-all duration-500 h-10 ${isHira ? "bg-primary text-foreground hover:bg-primary shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
        >
          Hiragana
        </Button>
        <Button
          variant={!isHira ? "default" : "ghost"}
          onClick={() => setType("katakana")}
          className={`relative z-10 flex-1 py-6 rounded-xl font-bold uppercase tracking-widest text-xs md:text-xs transition-all duration-500 h-10 ${!isHira ? "bg-secondary text-foreground hover:bg-secondary/90 shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
        >
          Katakana
        </Button>
      </div>

      {/* Category selector and start quiz button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Map categories to buttons */}
        <div className="flex flex-wrap gap-2 md:gap-3">
          {[
            { id: "seion", label: "Utama" },
            { id: "dakuon", label: "Turunan" },
            { id: "yoon", label: "Gabungan" },
          ].map((cat) => (
            <Button
              key={cat.id}
              variant={category === cat.id ? "default" : "outline"}
              onClick={() => setCategory(cat.id as KanaCategory)}
              className={`px-3 md:px-5 py-2 md:py-2.5 h-auto rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                category === cat.id
                  ? `bg-muted ${themeColor} ${themeBorder} border-opacity-50`
                  : "bg-transparent text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Start quiz button */}
        <Button 
          onClick={startQuiz}
          className={`w-full md:w-auto px-6 py-3 h-auto rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 ${themeAccent} text-foreground shadow-lg hover:opacity-90 border-none`}
        >
          <Swords size={16} className="mr-2" /> Latihan
        </Button>
      </div>
    </div>
  );
}