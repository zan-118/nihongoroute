import { type SchemaTypeDefinition } from "sanity";

import quiz from "./quiz";
import lesson from "./lesson";
import callout from "./callout";
import exampleSentence from "./exampleSentence";
import vocab from "./vocab";
import verbDictionary from "./verbDictionary";
import cheatsheet from "./cheatsheet";
import grammarArticle from "./grammarArticle";
import courseCategory from "./courseCategory";
import mockExam from "./mockExam";
import examResult from "./examResult";
import kanji from "./kanji";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    quiz,
    lesson,
    callout,
    exampleSentence,
    examResult,
    vocab,
    verbDictionary,
    cheatsheet,
    grammarArticle,
    mockExam,
    courseCategory,
    kanji,
  ],
};
