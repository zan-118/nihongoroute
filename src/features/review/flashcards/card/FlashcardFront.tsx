/**
 * @file FlashcardFront.tsx
 * @description Front face component of flashcards (question side), displaying main Kanji/Kana visualization and spelling challenge inputs in challenge modes.
 */

// Import & Dependencies

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cursor, Check, X, Plant, Fire, Award } from "@/components/ui/icons";
import { FlashcardThemeContext } from "./types";
import { Input } from "@/components/ui/input";
import { toHiragana } from "wanakana";

// Component Props Interface

/**
 * Props for the FlashcardFront component.
 */
interface FlashcardFrontProps {
 /** The Japanese word or character to display. */
 word: string;
 /** Theme configuration context for styling. */
 themeContext: FlashcardThemeContext;
 /** Current study mode. */
 studyMode?: "latihan" | "ujian" | "tantangan";
 /** Current text input by the user. */
 userInput?: string;
 /** Callback triggered when user input changes. */
 onUserInputChange?: (val: string) => void;
 /** Flag indicating if the answer has been checked. */
 isAnswerChecked?: boolean;
 /** Result of the user's input validation. */
 inputResult?: "correct" | "wrong" | null;
 /** Spaced Repetition System (SRS) state data. */
 srsState?: {
 interval: number;
 repetition: number;
 easeFactor: number;
 nextReview: number;
 } | null;
}

// UTAMA

export function FlashcardFront({
 word,
 themeContext,
 studyMode = "latihan",
 userInput = "",
 onUserInputChange,
 isAnswerChecked,
 inputResult = null,
 srsState,
}: FlashcardFrontProps) {

 // METODE PENGENDALI & HELPERS

 const { isKanji, themeColor, themeBorder, themeShadow } = themeContext;

 const isChallenge = studyMode === "tantangan";

 /**
 * Determines mastery level icon and label based on SRS interval.
 * @param interval - Days until next review.
 */
 const getMastery = (interval: number = 0) => {
 if (interval <= 1) return { icon: Plant, label: "Belajar" };
 if (interval <= 5) return { icon: Plant, label: "Akrab" };
 if (interval <= 14) return { icon: Fire, label: "Kuat" };
 return { icon: Award, label: "Mahir" };
 };

 const mastery = getMastery(srsState?.interval);
 const IconComponent = mastery.icon;

 /**
 * Handles input change and converts Romaji to Hiragana automatically.
 */
 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const val = e.target.value;
 // Convert keystrokes to Hiragana in real-time.
 const converted = toHiragana(val);
 onUserInputChange?.(converted);
 };

 // RENDER KOMPONEN

 return (
 <Card
 className={`absolute inset-0 w-full h-full border rounded-lg flex flex-col items-center justify-center p-6 md:p-8 transition-all duration-200 shadow-none overflow-hidden bg-card ${
 inputResult === "correct"
 ? "border-success/50 shadow-md bg-success/[0.02]"
 : inputResult === "wrong"
 ? "border-destructive/50 shadow-md bg-destructive/[0.02]"
 : `${themeBorder} ${themeShadow}`
 }`}
 style={{
 // Prevents flickering during 3D card flip animation.
 backfaceVisibility: "hidden",
 WebkitBackfaceVisibility: "hidden",
 }}
 >
 {/* Dynamic Glow Layer */}
 <div
 className={`absolute inset-0 transition-opacity duration-300 pointer-events-none opacity-15 ${
 inputResult === "correct" ? "bg-success blur-[45px]" : inputResult === "wrong" ? "bg-destructive blur-[45px]" : "opacity-0"
 }`}
 />

 <div className={`absolute top-0 right-0 w-40 h-40 md:w-52 md:h-52 blur-[45px] md:blur-[55px] rounded-full opacity-10 pointer-events-none ambient-glow will-change-transform ${isKanji ? 'bg-secondary' : 'bg-primary'}`} />

 <Badge
 variant="outline"
 className="absolute top-6 md:top-8 left-1/2 -translate-x-1/2 text-xs md:text-xs font-bold uppercase tracking-widest text-muted-foreground border-border px-4 md:px-5 py-1.5 rounded-lg bg-muted dark:bg-background/20 h-auto whitespace-nowrap"
 >
 {isChallenge ? "Tantangan Produksi" : isKanji ? "Karakter Kanji" : "Kosakata Utama"}
 </Badge>

 <div className="absolute top-6 md:top-8 right-6 md:right-8 flex flex-col items-end gap-1 opacity-60">
 <IconComponent size={20} className="text-primary" />
 <span className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground">{mastery.label}</span>
 </div>

 <div className="flex flex-col items-center justify-center flex-1 w-full space-y-8">
 {/* Adjust font size dynamically based on word length to prevent overflow */}
 <h2
 className={`${word.length > 12 ? "text-xl sm:text-2xl md:text-3xl lg:text-4xl px-4 text-center leading-relaxed" : word.length > 6 ? "text-3xl sm:text-4xl md:text-5xl lg:text-6xl" : "text-5xl sm:text-6xl md:text-7xl lg:text-8xl"} font-black text-foreground tracking-tight font-japanese leading-tight transition-all duration-300 drop-shadow-sm dark:drop-shadow-sm`}
 >
 {word}
 </h2>

 {isChallenge && (
 <div className="w-full max-w-[280px] space-y-4 animate-in fade-in slide-in- duration-300">
 <div className="relative">
 <Input
 value={userInput}
 onChange={handleInputChange}
 disabled={isAnswerChecked && inputResult === "correct"}
 placeholder="Ketik bacaan..."
 className={`h-14 bg-muted/50 border-2 text-center text-lg font-bold rounded-xl transition-all ${
 inputResult === "correct"
 ? "border-success bg-success/10 text-success"
 : inputResult === "wrong"
 ? "border-destructive bg-destructive/10 text-destructive"
 : "border-border focus:border-primary focus:ring-primary/20"
 }`}
 autoFocus
 />
 <div className="absolute right-3 top-1/2 -translate-y-1/2">
 {inputResult === "correct" && <Check className="text-success size-6" />}
 {inputResult === "wrong" && <X className="text-destructive size-6" />}
 </div>
 </div>

 <p className="text-[10px] text-center font-bold text-muted-foreground uppercase tracking-widest opacity-60">
 {isAnswerChecked && inputResult === "wrong" ? "Coba lagi atau tekan Periksa" : "Tekan Enter untuk memeriksa"}
 </p>
 </div>
 )}
 </div>

 {!isChallenge && (
 <div className="absolute bottom-6 md:bottom-8 flex flex-col items-center gap-1.5">
 <Cursor size={16} className={`${themeColor} opacity-40 animate-premium-bounce`} />
 <p className={`${themeColor} opacity-40 text-xs font-bold uppercase tracking-widest`}>
 Ketuk untuk Melihat Arti
 </p>
 </div>
 )}
 </Card>
 );
}