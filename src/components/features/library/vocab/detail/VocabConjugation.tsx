"use client";

import { Card } from "@/components/ui/card";
import { ArrowRightLeft } from "lucide-react";

const CONJUGATION_LABELS: Record<string, string> = {
  // Verb / General Keys
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

  // Adjective Keys
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

  // DB-specific Verb Keys
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

interface VocabConjugationProps {
  isAdjective: boolean;
  isVerb?: boolean;
  conjugations?: Record<string, string> | null;
}

export function VocabConjugation({ 
  isAdjective, 
  isVerb = false,
  conjugations
}: VocabConjugationProps) {
  if (!isAdjective && !isVerb) return null;

  let rawConjugations = typeof conjugations === "object" && conjugations !== null ? conjugations : {};
  
  // Extract from display_forms or forms if nested (Supabase dynamic JSONB structure)
  if (rawConjugations.display_forms && typeof rawConjugations.display_forms === "object") {
    rawConjugations = rawConjugations.display_forms as Record<string, string>;
  } else if (rawConjugations.forms && typeof rawConjugations.forms === "object") {
    rawConjugations = rawConjugations.forms as Record<string, string>;
  } else if (rawConjugations.conjugations && typeof rawConjugations.conjugations === "object") {
    rawConjugations = rawConjugations.conjugations as Record<string, string>;
  }
  
  // Order keys nicely to group logical conjugations together
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

  // Append any extra keys found in database
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
    <Card className="p-6 md:p-8 bg-card/20 backdrop-blur-xl border-border rounded-[2rem] hover:border-primary/40 transition-all group overflow-hidden relative md:col-span-3 lg:col-span-2">
      <div className="flex items-center gap-3 mb-6">
        <ArrowRightLeft size={18} aria-hidden="true" className="text-primary" />
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
          {isAdjective ? "Konjugasi Kata Sifat" : "Konjugasi Kata Kerja"}
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {renderedConjugations.map((conj, i) => (
          <div key={i} className="p-4 bg-[rgba(var(--muted-rgb),0.2)] border border-border rounded-xl">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block mb-1">{conj.label}</span>
            <span className="text-base font-bold text-foreground font-japanese">{conj.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
