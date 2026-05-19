/**
 * @file database.ts
 * @description Definisi tipe data TypeScript untuk skema basis data PostgreSQL (Supabase).
 * Mencakup interface untuk kolom JSONB guna menjamin integritas data library.
 */

export interface ExampleSentence {
  jp: string;
  id: string;
  furigana?: string;
  romaji?: string;
}

export interface SEOMetadata {
  title?: string;
  description?: string;
  keywords?: string;
}

export type ContentStatus = "draft" | "review" | "approved" | "published" | "rejected";

export type GenerationMode =
  | "full"
  | "summary"
  | "quiz"
  | "quizzes"
  | "seo"
  | "content_block"
  | "content_blocks"
  | "examples"
  | "outline";

export type WarningTargetType =
  | "lesson"
  | "summary"
  | "quiz"
  | "content_block"
  | "seo"
  | "reference";

export interface GenerationContext {
  mode: GenerationMode;
  retry_count: number;
}

export interface EditorialWarning {
  key: string; // v1:${category}:${severity}:${target_id}:${target_path}
  category: "reference" | "validation" | "normalization" | "retry";
  severity: "high" | "medium" | "low";
  severity_weight: number; // 3: high, 2: medium, 1: low
  message: string;
  editor_action: "required" | "recommended" | "informational";
  target?: {
    type: WarningTargetType;
    id: string;
    path?: string;
  };
  context?: GenerationContext;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  event: "generation" | "regeneration" | "status_change" | "repair";
  actor: "ai" | "system" | "editor";
  message: string;
  metadata?: {
    mode?: string;
    retry_count?: number;
    warning_count?: number;
    from_status?: string;
    to_status?: string;
  };
}

export interface EditorialConfidence {
  level: "high" | "medium" | "low";
  confidence_rank: number; // 3: high, 2: medium, 1: low
  reasons: string[];
}

export interface AdjectiveConjugations {
  negative?: string;
  past?: string;
  pastNegative?: string;
  teForm?: string;
  adverbial?: string;
}

export interface VerbConjugations {
  te?: string;
  nai?: string;
  ta?: string;
  tai?: string;
  kanou?: string;
  shieki?: string;
  ukemi?: string;
  katei?: string;
  ikou?: string;
  meirei?: string;
}

export interface MnemonicBlock {
  _type: string;
  children: Array<{ _type: string; text: string }>;
  [key: string]: any;
}

export interface LibraryContentAIResponse {
  id?: string;
  // Core Identifiers (per table)
  word?: string;
  character?: string;
  title?: string;
  slug?: string;

  meaning?: string;
  meaning_id?: string;
  furigana?: string;
  romaji?: string;
  mnemonic?: string;
  examples?: ExampleSentence[];
  conjugations?: VerbConjugations | AdjectiveConjugations;
  adjective_conjugations?: AdjectiveConjugations;
  pitch_accent?: string;
  verb_group?: string;
  onyomi?: string;
  kunyomi?: string;
  formation?: string;
  formation_furigana?: string;
  formation_romaji?: string;
  notes?: string;
  body?: string;
  hiragana?: string;
  translation?: string;
  audio_url?: string;
  image_url?: string;
  video_url?: string;
  difficulty?: string;
  
  // New strict columns
  jlpt_level?: string;
  grade_level?: string;
  stroke_order_svg?: string;
  radicals?: string[];
  mnemonics?: string[];
  hinshi?: string[];
  usage_notes?: string;
  related_kanji?: string[];
  synonyms?: string[];
  antonyms?: string[];
  transitivity?: string;
  pair_verb_id?: string;
  show_in_flashcard?: boolean;
  is_common?: boolean;

  // Lesson Fields
  category_id?: string;
  summary?: string;
  vocab_terms?: string[];
  kanji_characters?: string[];
  grammar_titles?: string[];
  vocab_list?: string[];
  kanji_list?: string[];
  grammar_list?: string[];
  reading_list?: string[];
  listening_list?: string[];
  content_blocks?: ContentBlock[];
  quizzes?: Quiz[];
  estimated_minutes?: number;
  is_premium?: boolean;
  is_published?: boolean;
  status?: ContentStatus;
  seo?: SEOMetadata;
  resolution_metadata?: any;
  warnings?: EditorialWarning[];
  generation_context?: GenerationContext;
  audit_log?: AuditEntry[];
  confidence?: EditorialConfidence;
  
  // Curriculum Planner Outline Fields
  lesson_goal?: string;
  learning_objectives?: string[];
  required_vocab?: string[];
  required_grammar?: string[];
  block_sequence?: string[];

  // Exam & Category Fields
  description?: string;
  type?: string;
  order_number?: number;
  time_limit?: number;
  passing_score?: number;
  questions?: ExamQuestion[];

  // Cheatsheet Fields
  category?: string;
  items?: any[];
}

export interface ContentBlock {
  id: string;
  type: "text" | "article" | "dialogue" | "image" | "quiz" | "callout" | "grammar";
  title?: string;
  content: string;
  furigana?: string;
  romaji?: string;
  translation?: string;
  examples?: ExampleSentence[];
  order: number;
  pedagogical_role?: "core_explanation" | "practical_scenario" | "pitfall_alert" | "cultural_note";
  difficulty_stage?: "introducing" | "guided" | "autonomous";
  estimated_reading_time?: number;
}

export interface Quiz {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  audio_url?: string;
  image_url?: string;
  type: "multiple-choice" | "true-false" | "fill-in-the-blank";
}

export interface KanjiTable {
  id: string;
  character: string;
  meaning: string;
  onyomi?: string;
  kunyomi?: string;
  romaji?: string;
  jlpt_level?: string;
  grade_level?: string;
  stroke_order_svg?: string;
  radicals: string[];
  mnemonics: MnemonicBlock[];
  examples: ExampleSentence[];
  show_in_flashcard: boolean;
  created_at: string;
}

export interface VocabTable {
  id: string;
  word: string;
  meaning_id: string;
  furigana?: string;
  romaji?: string;
  hinshi: string[];
  jlpt_level?: string;
  slug: string;
  pitch_accent?: string;
  audio_url?: string;
  usage_notes?: string;
  mnemonic?: string;
  related_kanji: string[];
  synonyms: string[];
  antonyms: string[];
  examples: ExampleSentence[];
  conjugations: VerbConjugations | AdjectiveConjugations;
  transitivity?: string;
  is_common: boolean;
  show_in_flashcard: boolean;
  created_at: string;
}

export interface GrammarTable {
  id: string;
  title: string;
  meaning: string;
  formation?: string;
  formation_furigana?: string;
  formation_romaji?: string;
  notes?: string;
  jlpt_level?: string;
  slug: string;
  examples: ExampleSentence[];
  created_at: string;
}

export interface ReadingMaterialTable {
  id: string;
  title: string;
  slug: string;
  difficulty?: string;
  estimated_minutes: number;
  body: string;
  hiragana?: string;
  translation?: string;
  audio_url?: string;
  image_url?: string;
  video_url?: string;
  seo?: any;
  jlpt_level?: string;
  created_at: string;
}

export interface ListeningMaterialTable {
  id: string;
  title: string;
  slug: string;
  difficulty?: string;
  audio_url?: string;
  image_url?: string;
  video_url?: string;
  body: string;
  hiragana?: string;
  translation?: string;
  seo?: any;
  jlpt_level?: string;
  created_at: string;
}

export interface LessonTable {
  id: string;
  category_id?: string;
  title: string;
  slug: string;
  order_number: number;
  summary?: string;
  content_blocks: ContentBlock[];
  vocab_list: string[]; // array of word slugs/ids
  kanji_list: string[]; // array of kanji characters/ids
  grammar_list: string[]; // array of grammar slugs/ids
  reading_list: string[];
  listening_list: string[];
  quizzes: any[];
  estimated_minutes: number;
  is_premium: boolean;
  is_published: boolean;
  status: ContentStatus;
  seo: any;
  warnings?: EditorialWarning[];
  audit_log?: AuditEntry[];
  confidence?: EditorialConfidence;
  created_at: string;
}

export interface ExamQuestion {
  questionText: string;
  options: string[];
  correctAnswer: number;
  section: "vocabulary" | "grammar" | "reading" | "listening";
  audioUrl?: string | null;
  imageUrl?: string | null;
}

export interface ExamTable {
  id: string;
  category_id?: string;
  title: string;
  slug: string;
  time_limit: number;
  passing_score: number;
  questions: ExamQuestion[];
  is_published: boolean;
  created_at: string;
}
