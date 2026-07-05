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

// ==========================================
// LABEL DAN PRESET KONJUGASI JEPANG
// ==========================================
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

// ==========================================
// ANTARMUKA & TIPE DATA
// ==========================================
interface VocabConjugationProps {
  isAdjective: boolean;
  isVerb?: boolean;
  conjugations?: Record<string, string> | null;
}

// ==========================================
// KOMPONEN UTAMA: VocabConjugation
// ==========================================
/**
 * Komponen panel penampil daftar konjugasi kata kerja/sifat secara interaktif.
 * 
 * @param {VocabConjugationProps} props Properti komponen konjugasi kata.
 */
export function VocabConjugation({ 
  isAdjective, 
  isVerb = false,
  conjugations
}: VocabConjugationProps) {
  if (!isAdjective && !isVerb) return null;

  let rawConjugations = typeof conjugations === "object" && conjugations !== null ? conjugations : {};
  
  // Ekstraksi data dari nested JSONB display_forms, forms, atau conjugations jika terdeteksi
  if (rawConjugations.display_forms && typeof rawConjugations.display_forms === "object") {
    rawConjugations = rawConjugations.display_forms as Record<string, string>;
  } else if (rawConjugations.forms && typeof rawConjugations.forms === "object") {
    rawConjugations = rawConjugations.forms as Record<string, string>;
  } else if (rawConjugations.conjugations && typeof rawConjugations.conjugations === "object") {
    rawConjugations = rawConjugations.conjugations as Record<string, string>;
  }
  
  // Pengurutan urutan konjugasi secara logis demi kenyamanan belajar pembelajar
  const orderedKeys = [
    "dictionary", "present", "politePresent", "polite_nonpast", "masu",
    "negative", "politeNegative", "polite_negative", "masen", "nai", "nai_form",
    "past", "politePast", "polite_past", "mashita", "ta", "ta_form",
    "pastNegative", "politePastNegative", "polite_past_negative", "masendeshita", "nakatta", "nakatta_form",
    "te", "te_form", "teForm", "adverb", "adverbial", "ba", "conditional_ba", "conditional_tara",
    "potential", "passive", "causative", "causativePassive", "volitional", "imperative"
  ];

  const renderedConjugations = orderedKeys
    .map(key => ({
      key,
      label: CONJUGATION_LABELS[key] || key,
      value: rawConjugations[key]
    }))
    .filter(item => item.value && typeof item.value === "string");

  // Sisipkan kunci ekstra dari database jika ada yang belum terpetakan dalam orderedKeys
  Object.entries(rawConjugations).forEach(([key, val]) => {
    if (val && typeof val === "string" && !orderedKeys.includes(key)) {
      renderedConjugations.push({
        key,
        label: CONJUGATION_LABELS[key] || key.replace(/_/g, " "),
        value: val
      });
    }
  });

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

