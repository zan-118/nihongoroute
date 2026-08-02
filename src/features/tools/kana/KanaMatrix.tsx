/**
 * @file KanaMatrix.tsx
 * @description Interactive Hiragana and Katakana grid matrix visualizer component. Allows selecting characters for stroke order details.
 */

// ==========================================
// Import & Dependencies
// ==========================================
import React from "react";
import { m, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { KANA_DATA, KanaType, KanaCategory } from "./kana-data";

// ==========================================
// Component Props Interface
// ==========================================
/**
 * Props for KanaMatrix component.
 */
interface KanaMatrixProps {
 /** Kana type: hiragana or katakana. */
 type: KanaType;
 /** Kana category: gojuon, dakuon, or yoon. */
 category: KanaCategory;
 /** Callback triggered on character selection. */
 onSelectChar: (char: string, romaji: string) => void;
 /** Tailwind hover background class. */
 themeBgHover: string;
}

// ==========================================
// Main Component
// ==========================================
/**
 * Interactive grid visualizer for Hiragana and Katakana characters.
 */
export function KanaMatrix({ type, category, onSelectChar, themeBgHover }: KanaMatrixProps) {
 // Get character data for selected category
 const currentData = KANA_DATA[category];

 // ==========================================
 // RENDER KOMPONEN
 // ==========================================
 return (
 <Card className="p-4 md:p-8 rounded-lg border border-border bg-card shadow-2xl relative flex-1 min-h-[400px] md:min-h-[450px] overflow-hidden">
 {/* Yoon category uses 3 columns, others use 5 */}
 <div
 className={`relative z-10 grid gap-2 md:gap-4 mx-auto ${category === "yoon" ? "grid-cols-3 max-w-lg" : "grid-cols-5 max-w-2xl"}`}
 >
 {/* Animate grid items during category transitions */}
 <AnimatePresence mode="wait">
 {currentData[type].map((row, rowIndex) => (
 <React.Fragment key={`${category}-${type}-${rowIndex}`}>
 {row.map((char, colIndex) =>
 char !== "" ? (
 // Render character cell if not empty
 <m.div
 key={`${category}-${type}-${rowIndex}-${colIndex}`}
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.9 }}
 onClick={() => onSelectChar(char, currentData.romaji[rowIndex][colIndex])}
 className={`relative aspect-square bg-muted/30 border border-border rounded-lg md:rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${themeBgHover} hover:border-current group active:scale-95 shadow-sm`}
 >
 <span className="text-2xl md:text-4xl font-black text-foreground group-hover:scale-105 transition-transform font-japanese drop-shadow-sm">
 {char}
 </span>
 <span className="text-[10px] md:text-xs font-bold font-mono text-muted-foreground uppercase tracking-widest mt-1 md:mt-2 group-hover:text-foreground transition-colors">
 {currentData.romaji[rowIndex][colIndex]}
 </span>
 </m.div>
 ) : (
 // Render empty spacer cell to maintain grid alignment
 <div
 key={`empty-${rowIndex}-${colIndex}`}
 className="aspect-square opacity-0 pointer-events-none"
 />
 ),
 )}
 </React.Fragment>
 ))}
 </AnimatePresence>
 </div>
 </Card>
 );
}