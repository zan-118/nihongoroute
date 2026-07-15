/**
 * Verb group classification.
 */
export type VerbGroup = "godan" | "ichidan" | "irregular";

/**
 * Supported verb conjugation form identifiers.
 */
export type VerbFormId =
  | "masu"
  | "nai"
  | "te"
  | "ta"
  | "potential"
  | "passive"
  | "causative"
  | "volitional"
  | "conditional"
  | "imperative";

/**
 * Metadata definition for verb form.
 */
export interface VerbFormDefinition {
  id: VerbFormId;
  label: string;
  description: string;
}

/**
 * Result structure containing all conjugated forms.
 */
export interface VerbConjugationResult {
  dictionary: string;
  group: VerbGroup;
  forms: Record<VerbFormId, string>;
}

/**
 * List of verb forms with Indonesian descriptions.
 */
export const VERB_FORMS: VerbFormDefinition[] = [
  { id: "masu", label: "ます", description: "bentuk sopan" },
  { id: "nai", label: "ない", description: "negatif kasual" },
  { id: "te", label: "て", description: "sambung / permintaan" },
  { id: "ta", label: "た", description: "lampau kasual" },
  { id: "potential", label: "可能", description: "bisa melakukan" },
  { id: "passive", label: "受身", description: "pasif" },
  { id: "causative", label: "使役", description: "membuat/menyuruh" },
  { id: "volitional", label: "意向", description: "ayo / niat" },
  { id: "conditional", label: "条件", description: "kalau" },
  { id: "imperative", label: "命令", description: "perintah" },
];

/**
 * Mapping of godan verb endings to their respective kana shifts.
 */
const GODAN_ENDINGS: Record<
  string,
  {
    a: string;
    i: string;
    e: string;
    o: string;
    te: string;
    ta: string;
  }
> = {
  う: { a: "わ", e: "え", i: "い", o: "お", ta: "った", te: "って" },
  く: { a: "か", e: "け", i: "き", o: "こ", ta: "いた", te: "いて" },
  ぐ: { a: "が", e: "げ", i: "ぎ", o: "ご", ta: "いだ", te: "いで" },
  す: { a: "さ", e: "せ", i: "し", o: "そ", ta: "した", te: "して" },
  つ: { a: "た", e: "て", i: "ち", o: "と", ta: "った", te: "って" },
  ぬ: { a: "な", e: "ね", i: "に", o: "の", ta: "んだ", te: "んで" },
  ぶ: { a: "ば", e: "べ", i: "び", o: "ぼ", ta: "んだ", te: "んで" },
  む: { a: "ま", e: "め", i: "み", o: "も", ta: "んだ", te: "んで" },
  る: { a: "ら", e: "れ", i: "り", o: "ろ", ta: "った", te: "って" },
};

/**
 * Remove last character from verb string.
 */
function stripLastKana(verb: string) {
  return verb.slice(0, -1);
}

/**
 * Check if verb is kuru (to come).
 */
function isKuru(verb: string) {
  return verb === "来る" || verb === "くる";
}

/**
 * Check if verb is suru (to do) or ends with suru.
 */
function isSuru(verb: string) {
  return verb === "する" || verb.endsWith("する");
}

/**
 * Conjugate suru irregular verbs.
 */
function conjugateSuru(verb: string): Record<VerbFormId, string> {
  // Strip する ending
  const stem = verb.slice(0, -2);
  return {
    masu: `${stem}します`,
    nai: `${stem}しない`,
    te: `${stem}して`,
    ta: `${stem}した`,
    potential: `${stem}できる`,
    passive: `${stem}される`,
    causative: `${stem}させる`,
    volitional: `${stem}しよう`,
    conditional: `${stem}すれば`,
    imperative: `${stem}しろ`,
  };
}

/**
 * Conjugate kuru irregular verb.
 */
function conjugateKuru(verb: string): Record<VerbFormId, string> {
  // Check if kanji form is used
  const kanji = verb === "来る";
  return {
    masu: kanji ? "来ます" : "きます",
    nai: kanji ? "来ない" : "こない",
    te: kanji ? "来て" : "きて",
    ta: kanji ? "来た" : "きた",
    potential: kanji ? "来られる" : "こられる",
    passive: kanji ? "来られる" : "こられる",
    causative: kanji ? "来させる" : "こさせる",
    volitional: kanji ? "来よう" : "こよう",
    conditional: kanji ? "来れば" : "くれば",
    imperative: kanji ? "来い" : "こい",
  };
}

/**
 * Conjugate ichidan verbs.
 */
function conjugateIchidan(verb: string): Record<VerbFormId, string> {
  const stem = stripLastKana(verb);
  return {
    masu: `${stem}ます`,
    nai: `${stem}ない`,
    te: `${stem}て`,
    ta: `${stem}た`,
    potential: `${stem}られる`,
    passive: `${stem}られる`,
    causative: `${stem}させる`,
    volitional: `${stem}よう`,
    conditional: `${stem}れば`,
    imperative: `${stem}ろ`,
  };
}

/**
 * Conjugate godan verbs.
 */
function conjugateGodan(verb: string): Record<VerbFormId, string> {
  // Special case for iku (to go)
  if (verb === "行く" || verb === "いく" || verb.endsWith("行く") || verb.endsWith("いく")) {
    const stem = stripLastKana(verb);
    return {
      masu: `${stem}きます`,
      nai: `${stem}かない`,
      te: `${stem}って`,
      ta: `${stem}った`,
      potential: `${stem}ける`,
      passive: `${stem}かれる`,
      causative: `${stem}かせる`,
      volitional: `${stem}こう`,
      conditional: `${stem}けば`,
      imperative: `${stem}け`,
    };
  }

  const ending = verb.slice(-1);
  const rule = GODAN_ENDINGS[ending];
  if (!rule) {
    throw new Error(`Akhiran verba godan tidak dikenali: ${ending}`);
  }

  const stem = stripLastKana(verb);
  return {
    masu: `${stem}${rule.i}ます`,
    nai: `${stem}${rule.a}ない`,
    te: `${stem}${rule.te}`,
    ta: `${stem}${rule.ta}`,
    potential: `${stem}${rule.e}る`,
    passive: `${stem}${rule.a}れる`,
    causative: `${stem}${rule.a}せる`,
    volitional: `${stem}${rule.o}う`,
    conditional: `${stem}${rule.e}ば`,
    imperative: `${stem}${rule.e}`,
  };
}

/**
 * Conjugate verb based on dictionary form and group.
 */
export function conjugateVerb(dictionary: string, group: VerbGroup): VerbConjugationResult {
  const verb = dictionary.trim();
  if (!verb) {
    throw new Error("Verba belum diisi.");
  }

  // Route to irregular kuru
  if (isKuru(verb)) {
    return { dictionary: verb, forms: conjugateKuru(verb), group: "irregular" };
  }

  // Route to irregular suru
  if (isSuru(verb)) {
    return { dictionary: verb, forms: conjugateSuru(verb), group: "irregular" };
  }

  // Validate ichidan ending
  if (!verb.endsWith("る") && group === "ichidan") {
    throw new Error("Ichidan biasanya berakhiran る.");
  }

  if (group === "ichidan") {
    return { dictionary: verb, forms: conjugateIchidan(verb), group };
  }

  return { dictionary: verb, forms: conjugateGodan(verb), group: "godan" };
}

/**
 * Normalize input string for comparison.
 */
export function normalizeConjugationAnswer(value: string) {
  return value.normalize("NFKC").replace(/\s/g, "").trim();
}

/**
 * Compare expected conjugation with user answer.
 */
export function isConjugationAnswerCorrect(expected: string, answer: string) {
  return normalizeConjugationAnswer(expected) === normalizeConjugationAnswer(answer);
}