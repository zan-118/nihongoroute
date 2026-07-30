/**
 * @file lexical-content-engine.ts
 * @description Modul dalam (Deep Module) yang menyatukan seluruh logika pencarian,
 * penyaringan, dan pengurutan entitas leksikal (Vocab, Kanji, Grammar, Expression, Sentence).
 * Menyediakan antarmuka domain tunggal (queryLexicalDomain) untuk menyembunyikan detail skema DB.
 */

import { getPaginatedContent, getContentBySlugOrId, PaginatedResponse } from "./content-repository";

export type LexicalCategory = "vocab" | "verb" | "adjective" | "phrase" | "kanji" | "grammar" | "expression" | "sentence";

export interface LexicalQueryFilters {
  search?: string;
  level?: string;
  hinshi?: string;
}

export interface LexicalPaginationOptions {
  page: number;
  limit: number;
}

export interface QueryLexicalDomainParams {
  type: LexicalCategory;
  filters?: LexicalQueryFilters;
  pagination?: LexicalPaginationOptions;
}

/**
 * Mapping part-of-speech (hinshi) string to database category strings.
 */
function getHinshiFilterValues(hinshi: string): string[] {
  const lower = hinshi.toLowerCase();
  if (lower === "noun" || lower === "n") {
    return ["Noun"];
  }
  if (lower === "verb" || lower === "v") {
    return ["Verb", "Verb (Group 1)", "Verb (Group 2)", "Verb (Group 3)"];
  }
  if (lower === "i-adjective" || lower === "adj-i") {
    return ["I-Adjective"];
  }
  if (lower === "na-adjective" || lower === "adj-na") {
    return ["Na-Adjective"];
  }
  if (lower === "adverb" || lower === "adv") {
    return ["Adverb"];
  }
  if (lower === "particle") {
    return ["Particle"];
  }
  if (lower === "conjunction" || lower === "conj") {
    return ["Conjunction"];
  }
  if (lower === "pronoun" || lower === "pn") {
    return ["Pronoun"];
  }
  if (lower === "expression" || lower === "exp") {
    return ["Expression"];
  }
  return [hinshi];
}

/**
 * Configuration mapping for each lexical domain type.
 * Encapsulates table name, default search columns, and ordering defaults.
 */
const LEXICAL_CONFIGS: Record<
  LexicalCategory,
  {
    table: string;
    searchColumns: string[];
    orderBy: { column: string; ascending?: boolean; nullsFirst?: boolean }[];
  }
> = {
  vocab: {
    table: "vocab",
    searchColumns: ["word", "meaning_id", "furigana", "romaji"],
    orderBy: [{ column: "word", ascending: true }],
  },
  verb: {
    table: "vocab",
    searchColumns: ["word", "meaning_id", "furigana", "romaji"],
    orderBy: [{ column: "word", ascending: true }],
  },
  adjective: {
    table: "vocab",
    searchColumns: ["word", "meaning_id", "furigana", "romaji"],
    orderBy: [{ column: "word", ascending: true }],
  },
  phrase: {
    table: "vocab",
    searchColumns: ["word", "meaning_id", "furigana", "romaji"],
    orderBy: [{ column: "word", ascending: true }],
  },
  kanji: {
    table: "kanji",
    searchColumns: ["character", "meaning", "onyomi", "kunyomi", "romaji"],
    orderBy: [{ column: "character", ascending: true }],
  },
  grammar: {
    table: "grammar",
    searchColumns: ["title", "meaning_id", "pattern", "romaji"],
    orderBy: [
      { column: "order_number", ascending: true, nullsFirst: false },
      { column: "created_at", ascending: false },
    ],
  },
  expression: {
    table: "expressions",
    searchColumns: ["expression", "meaning", "romaji"],
    orderBy: [{ column: "expression", ascending: true }],
  },
  sentence: {
    table: "sentences",
    searchColumns: ["japanese", "indonesian", "romaji"],
    orderBy: [{ column: "id", ascending: true }],
  },
};

/**
 * Single entry point for querying lexical content with domain encapsulation.
 *
 * @param params Query parameters containing type, filters, and pagination.
 * @returns Paginated domain response.
 */
export async function queryLexicalDomain<T>(
  params: QueryLexicalDomainParams
): Promise<PaginatedResponse<T>> {
  const { type, filters = {}, pagination = { page: 1, limit: 20 } } = params;
  const config = LEXICAL_CONFIGS[type];

  if (!config) {
    throw new Error(`Lexical type '${type}' is not supported by LexicalContentEngine.`);
  }

  const search = filters.search || "";
  const level = filters.level || "";
  const hinshi = filters.hinshi || "";

  return getPaginatedContent<T>(config.table, {
    page: pagination.page,
    limit: pagination.limit,
    search,
    searchColumns: config.searchColumns,
    orderBy: config.orderBy,
    filters: (query) => {
      // Apply level filtering
      if (level && level !== "all") {
        if (
          level.toLowerCase() === "umum" ||
          level.toLowerCase() === "other" ||
          level.toLowerCase() === "non-jlpt"
        ) {
          query = query.or("jlpt_level.is.null,jlpt_level.eq.UMUM,jlpt_level.eq.OTHER");
        } else {
          query = query.eq("jlpt_level", level.toUpperCase());
        }
      }

      // Apply hinshi filtering for vocab categories
      if (hinshi && (type === "vocab" || type === "verb" || type === "adjective" || type === "phrase")) {
        const matchingCategories = getHinshiFilterValues(hinshi);
        if (matchingCategories.length === 1) {
          query = query.cs("hinshi", JSON.stringify([matchingCategories[0]]));
        } else if (matchingCategories.length > 1) {
          const orFilter = matchingCategories
            .map((cat) => `hinshi.cs.${JSON.stringify([cat])}`)
            .join(",");
          query = query.or(orFilter);
        }
      }

      // Route type specific constraints for vocab variants
      if (type === "verb") {
        query = query.or(
          'hinshi.cs.["Verb"],hinshi.cs.["Verb (Group 1)"],hinshi.cs.["Verb (Group 2)"],hinshi.cs.["Verb (Group 3)"]'
        );
      } else if (type === "adjective") {
        query = query.or('hinshi.cs.["I-Adjective"],hinshi.cs.["Na-Adjective"]');
      } else if (type === "phrase") {
        query = query.cs("hinshi", JSON.stringify(["Expression"]));
      }

      return query;
    },
  });
}

/**
 * Fetch a single lexical entity by slug, ID, or unique key.
 *
 * @param type Lexical category.
 * @param slugOrId Identifier key.
 */
export async function getLexicalDetail<T>(
  type: LexicalCategory,
  slugOrId: string
): Promise<T | null> {
  const config = LEXICAL_CONFIGS[type];
  if (!config) return null;
  return getContentBySlugOrId<T>(config.table, slugOrId);
}
