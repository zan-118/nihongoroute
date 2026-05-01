export interface CardData {
  _id: string;
  word: string;
  meaning: string;
  romaji: string;
  furigana?: string;
  category?: string;
}

export type SurvivalGameState = "idle" | "playing" | "gameover" | "victory";
