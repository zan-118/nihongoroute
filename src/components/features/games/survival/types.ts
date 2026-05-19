export interface CardData {
  id: string;
  word: string;
  /** Shorthand meaning dari meanings_jmdict[0].glosses[0] */
  meaning: string;
  romaji?: string | null;
  furigana?: string | null;
  jlpt_level?: string | null;
  hinshi?: string[] | null;
  type?: string;
}

export type SurvivalGameState = "idle" | "playing" | "gameover" | "victory";
