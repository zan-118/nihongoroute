/**
 * @file database.ts
 * @description Definisi tipe data TypeScript untuk skema tabel basis data PostgreSQL (Supabase) relasional. Menstandarkan tipe kolom JSONB untuk data kosakata, kanji, tata bahasa, materi bacaan, dan kuis mini guna menjamin type safety.
 */

// ==========================================
// DEKLARASI ANTARMUKA & TIPE DATA DATABASE
// ==========================================

export interface ExampleSentence {
  jp: string;
  id: string;
  japanese?: string;
  english?: string;
  indonesian?: string;
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
  [key: string]: unknown;
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
  resolution_metadata?: Record<string, unknown>;
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
  items?: Record<string, unknown>[];
}

export interface ContentBlock {
  id: string;
  type: "text" | "article" | "dialogue" | "image" | "quiz" | "callout" | "grammar" | "heading" | "list" | "table";
  title?: string;
  content?: string;
  furigana?: string;
  romaji?: string;
  translation?: string;
  examples?: ExampleSentence[];
  order: number;
  pedagogical_role?: "core_explanation" | "practical_scenario" | "pitfall_alert" | "cultural_note";
  difficulty_stage?: "introducing" | "guided" | "autonomous";
  estimated_reading_time?: number;
  audio_url?: string;
  audioUrl?: string;
  
  // Markdown rendering specific fields
  level?: number;
  listType?: "bullet" | "number";
  items?: string[];
  headers?: string[];
  rows?: string[][];
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
  english: string;
  meaning: string;
  slug?: string;
  onyomi?: string;
  kunyomi?: string;
  romaji?: string;
  jlpt_level?: string;
  grade_level?: string;
  stroke_order_svg?: string;
  frequency_rank?: number;
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
  order_number?: number;
  examples: ExampleSentence[];
  created_at: string;
  related_grammar?: string[] | null;
  grammar_family?: string | null;
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
  seo?: SEOMetadata;
  jlpt_level?: string;
  status: ContentStatus;
  warnings?: EditorialWarning[];
  audit_log?: AuditEntry[];
  confidence?: EditorialConfidence;
  generation_context?: GenerationContext;
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
  seo?: SEOMetadata;
  jlpt_level?: string;
  estimated_minutes?: number;
  status: ContentStatus;
  warnings?: EditorialWarning[];
  audit_log?: AuditEntry[];
  confidence?: EditorialConfidence;
  generation_context?: GenerationContext;
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
  quizzes: Quiz[];
  estimated_minutes: number;
  is_premium: boolean;
  is_published: boolean;
  status: ContentStatus;
  seo: SEOMetadata;
  warnings?: EditorialWarning[];
  audit_log?: AuditEntry[];
  confidence?: EditorialConfidence;
  generation_context?: GenerationContext;
  created_at: string;
}

export interface ArticleTable {
  id: string;
  category_id?: string;
  title: string;
  slug: string;
  order_number: number;
  summary?: string;
  content_blocks: any[];
  image_url?: string | null;
  quizzes: Quiz[];
  estimated_minutes: number;
  is_premium: boolean;
  is_published: boolean;
  seo: SEOMetadata;
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
  description?: string;
  questions: ExamQuestion[];
  is_published: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ProfileTable {
  id: string;
  xp: number;
  level: number;
  created_at: string;
  updated_at: string;
  streak: number;
  today_review_count: number;
  last_study_date?: string | null;
  study_days: Record<string, number | boolean>;
  full_name?: string | null;
  avatar_url?: string | null;
  inventory: Record<string, unknown>;
  settings: Record<string, unknown>;
}

export interface UserSRSTable {
  id: string;
  user_id: string;
  word_id: string;
  interval: number;
  repetition: number;
  ease_factor: number;
  next_review?: string | null;
  created_at: string;
  updated_at: string;
  status: "learning" | "reviewing" | "graduated" | string;
  custom_mnemonic?: string | null;
}

export interface UserLessonTable {
  user_id: string;
  lesson_id: string;
  is_completed: boolean;
  completed_at: string;
  updated_at: string;
}

export interface CourseCategoryTable {
  id: string;
  title: string;
  slug: string;
  order_number?: number;
  created_at: string;
  type?: string | null;
  description?: string | null;
}

export interface CheatsheetTable {
  id: string;
  slug: string;
  title: string;
  category?: string | null;
  items: Record<string, unknown>[];
  created_at?: string;
  updated_at?: string;
}

export interface ExpressionTable {
  id: string;
  text: string;
  reading: string;
  meanings?: string[] | Record<string, unknown>[] | null;
  common?: boolean;
  misc?: Record<string, unknown> | unknown[] | null;
  jlpt_level?: string | null;
  created_at?: string;
  indonesia?: string[] | Record<string, unknown>[] | null;
}

export interface RadicalTable {
  id: string;
  character: string;
  stroke_count?: number | null;
  kangxi_number?: number | null;
  meaning?: string | null;
  kanji_list: string[];
  created_at?: string;
}

export interface SentenceTable {
  id: string;
  japanese: string;
  english?: string | null;
  created_at?: string;
  indonesia?: string | null;
  jlpt_level?: string | null;
  furigana?: string | null;
}

export interface SupporterTable {
  id: string;
  name: string;
  amount: number;
  message?: string | null;
  tier?: "bronze" | "silver" | "gold" | string;
  source: "saweria" | "trakteer" | string;
  created_at?: string;
}

export interface TTSCacheTable {
  id: string;
  text: string;
  voice: string;
  rate: string;
  audio_url: string;
  created_at: string;
}

export interface UserFeedbackTable {
  id: string;
  user_id?: string | null;
  type: "bug" | "suggestion" | "compliment";
  message: string;
  route?: string | null;
  status: "pending" | "investigating" | "resolved" | "rejected";
  admin_reply?: string | null;
  created_at?: string;
  updated_at: string;
}

