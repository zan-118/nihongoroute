import { type SchemaTypeDefinition } from "sanity";
import level from "./level";
import quiz from "./quiz";
import lesson from "./lesson";

import callout from "./callout";
import exampleSentence from "./exampleSentence";

import kosakata from "./kosakata";
import verbDictionary from "./verbDictionary";
import cheatsheet from "./cheatsheet";
import grammarArticle from "./grammarArticle";
import courseCategory from "./courseCategory"; // <-- 1. Import skema baru

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    level,
    quiz,
    lesson,

    callout,
    exampleSentence,

    kosakata,
    verbDictionary,
    cheatsheet,
    grammarArticle,

    courseCategory, // <-- 2. Daftarkan di sini
  ],
};
