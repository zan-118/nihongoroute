"use client";

/**
 * @file VocabConjugation.tsx
 * @description Komponen tabel konjugasi kata kerja atau kata sifat Jepang (Verb/Adjective Conjugation).
 * Mendeteksi struktur dinamis JSONB conjugations dari database Supabase dan memetakan label Bahasa Indonesia premium.
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import { Card } from "@/components/ui/card";
import { ArrowRightLeft } from "lucide-react";

/**
 * Map database conjugation keys to Indonesian/English labels.
 */
const CONJUGATION_LABELS: Record<string, string> = {
  // Kata Kerja (Verb) / Umum
  te: "Bentuk-Te / Te-Form",
  ta: "Bentuk-Ta / Past",
  nai: "Bentuk-Nai / Negatif",
  nakatta: "Bentuk-Nakatta / Past Negatif",
  masu: "Sopan (~Masu)",
  masen: "Sopan Negatif (~Masen)",
  mashita: "Sopan Lampau (~Mashita)",
  masendeshita: "Sopan Lampau Negatif (~Masendeshita)",
  ba: "Kondisional (~Ba)",
  volitional: "Bentuk Ajakan / Volitional",
  potential: "Bentuk Potensial (~Kanou)",
  passive: "Bentuk Pasif (~Ukemi)",
  causative: "Bentuk Kausatif (~Shieki)",
  causativePassive: "Kausatif Pasif",
  imperative: "Bentuk Perintah (~Meirei)",

  // Kata Sifat (Adjective)
  present: "Bentuk Biasa / Present",
  negative: "Negatif",
  past: "Lampau",
  pastNegative: "Lampau Negatif",
  adverb: "Adverbial",
  adverbial: "Adverbial",
  teForm: "Bentuk-Te / Te-Form",
  politePresent: "Sopan / Polite Present",
  politeNegative: "Sopan Negatif / Polite Negative",
  politePast: "Sopan Lampau / Polite Past",
  politePastNegative: "Sopan Lampau Negatif",

  // Kunci Database Khusus Kata Kerja
  te_form: "Bentuk-Te / Te-Form",
  ta_form: "Bentuk-Ta / Past",
  nai_form: "Bentuk-Nai / Negatif",
  nakatta_form: "Bentuk-Nakatta / Past Negatif",
  conditional_ba: "Kondisional (~Ba)",
  conditional_tara: "Kondisional (~Tara)",
  polite_nonpast: "Sopan Biasa / Non-Past",
  polite_negative: "Sopan Negatif / Polite Negative",
  polite_past: "Sopan Lampau / Polite Past",
  polite_past_negative: "Sopan Lampau Negatif",
  dictionary: "Bentuk Kamus / Dictionary"
};

/**
 * Props for VocabConjugation component.
 */
interface VocabConjugationProps {
  /** Whether vocabulary is adjective. */
  isAdjective: boolean;
  /** Whether vocabulary is verb. */
  isVerb?: boolean;
  /** Raw conjugation data from database. */
  conjugations?: Record<string, string> | null;
}

// ==========================================
// KOMPONEN UTAMA: VocabConjugation
// ==========================================
/**
 * Render conjugation table for Japanese verbs or adjectives.
 * 
 * @param props Component properties.
 * @returns Conjugation card element or null.
 */
export function VocabConjugation({ 
  isAdjective, 
  isVerb = false,
  conjugations
}: VocabConjugationProps) {
  // Exit early if word type has no conjugations.
  if (!isAdjective && !isVerb) return null;

  let rawConjugations = typeof conjugations === "object" && conjugations !== null ? conjugations : {};
  
  // Extract nested conjugation data from known database structures.
  if (rawConjugations.display_forms && typeof rawConjugations.display_forms === "object") {
    rawConjugations = rawConjugations.display_forms as Record<string, string>;
  } else if (rawConjugations.forms && typeof rawConjugations.forms === "object") {
    rawConjugations = rawConjugations.forms as Record<string, string>;
  } else if (rawConjugations.conjugations && typeof rawConjugations.conjugations === "object") {
    rawConjugations = rawConjugations.conjugations as Record<string, string>;
  }
  
  // Define display order for logical learning flow.
  const orderedKeys = [
    "dictionary", "present", "politePresent", "polite_nonpast", "masu",
    "negative", "politeNegative", "polite_negative", "masen", "nai", "nai_form",
    "past", "politePast", "polite_past", "mashita", "ta", "ta_form",
    "pastNegative", "politePastNegative", "polite_past_negative", "masendeshita", "nakatta", "nakatta_form",
    "te", "te_form", "teForm", "adverb", "adverbial", "ba", "conditional_ba", "conditional_tara",
    "potential", "passive", "causative", "causativePassive", "volitional", "imperative"
  ];

  // Map raw keys to labels and filter out empty values.
  const renderedConjugations = orderedKeys
    .map(key => ({
      key,
      label: CONJUGATION_LABELS[key] || key,
      value: rawConjugations[key]
    }))
    .filter(item => item.value && typeof item.value === "string");

  // Append unmapped database keys to end of list.
  Object.entries(rawConjugations).forEach(([key, val]) => {
    if (val && typeof val === "string" && !orderedKeys.includes(key)) {
      renderedConjugations.push({
        key,
        label: CONJUGATION_LABELS[key] || key.replace(/_/g, " "),
        value: val
      });
    }
  });

  // Hide component if no valid conjugations exist.
  if (renderedConjugations.length === 0) return null;

  return (
    <Card className="p-6 md:p-8 bg-card/20  border-border rounded-2xl md:rounded-3xl hover:border-primary/40 transition-all group overflow-hidden relative font-sans glass shadow-[0_0_20px_rgba(var(--primary-rgb),0.02)]">
      <div className="flex items-center gap-3 mb-6">
        <ArrowRightLeft size={18} aria-hidden="true" className="text-primary" />
        <h2 className="text-sm uppercase tracking-[0.2em] text-foreground">
          {isAdjective ? "Konjugasi Kata Sifat" : "Konjugasi Kata Kerja"}
        </h2>
      </div>
      
      {/* Grid Item Konjugasi */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4">
        {renderedConjugations.map((conj) => (
          <div key={conj.key} className="p-4 bg-[rgb(var(--muted-rgb)/0.2)] border border-border rounded-xl">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block mb-1">{conj.label}</span>
            <span className="text-base font-bold text-foreground font-japanese">{conj.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}