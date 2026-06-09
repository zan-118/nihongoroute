export type VerbGroup = "godan" | "ichidan" | "irregular";

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

export interface VerbFormDefinition {
  id: VerbFormId;
  label: string;
  description: string;
}

export interface VerbConjugationResult {
  dictionary: string;
  group: VerbGroup;
  forms: Record<VerbFormId, string>;
}

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

function stripLastKana(verb: string) {
  return verb.slice(0, -1);
}

function isKuru(verb: string) {
  return verb === "来る" || verb === "くる";
}

function isSuru(verb: string) {
  return verb === "する" || verb.endsWith("する");
}

function conjugateSuru(verb: string): Record<VerbFormId, string> {
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

function conjugateKuru(verb: string): Record<VerbFormId, string> {
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

function conjugateGodan(verb: string): Record<VerbFormId, string> {
  if (verb === "行く" || verb === "いく") {
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

export function conjugateVerb(dictionary: string, group: VerbGroup): VerbConjugationResult {
  const verb = dictionary.trim();
  if (!verb) {
    throw new Error("Verba belum diisi.");
  }

  if (isKuru(verb)) {
    return { dictionary: verb, forms: conjugateKuru(verb), group: "irregular" };
  }

  if (isSuru(verb)) {
    return { dictionary: verb, forms: conjugateSuru(verb), group: "irregular" };
  }

  if (!verb.endsWith("る") && group === "ichidan") {
    throw new Error("Ichidan biasanya berakhiran る.");
  }

  if (group === "ichidan") {
    return { dictionary: verb, forms: conjugateIchidan(verb), group };
  }

  return { dictionary: verb, forms: conjugateGodan(verb), group: "godan" };
}

export function normalizeConjugationAnswer(value: string) {
  return value.normalize("NFKC").replace(/\s/g, "").trim();
}

export function isConjugationAnswerCorrect(expected: string, answer: string) {
  return normalizeConjugationAnswer(expected) === normalizeConjugationAnswer(answer);
}
