/**
 * @file types/index.ts
 * @description Definisi tipe data untuk fitur Reading.
 */

export type ReadingMode = "kanji" | "furigana" | "hiragana" | "romaji";

export interface ReadingState {
  mode: ReadingMode;
  showTranslation: boolean;
  audioUrl?: string;
  textToSpeak?: string;
  isTTSDisabled?: boolean;
}

export interface PortableTextChild {
  _key: string;
  _type: string;
  text: string;
  marks?: string[];
}

export interface PortableTextBlock {
  _key: string;
  _type: "block";
  children: PortableTextChild[];
  style?: string;
  list?: string;
}

export type PortableTextContent = string | PortableTextBlock[];

export interface ReadingData {
  title: string;
  difficulty: string;
  audioUrl?: string;
  isTTSDisabled?: boolean;
  body: PortableTextContent;
  hiragana: PortableTextContent;
  romaji?: PortableTextContent;
  translation: PortableTextContent;
}
