import { type SchemaTypeDefinition } from "sanity";
import level from "./level";
import quiz from "./quiz";
import lesson from "./lesson";

import kanaCharacter from "./kanaCharacter";
import kanaRow from "./kanaRow";
import kanaTable from "./kanaTable";
import callout from "./callout";
import exampleSentence from "./exampleSentence";

import kosakata from "./kosakata";
import verbDictionary from "./verbDictionary";
import cheatsheet from "./cheatsheet";
import grammarArticle from "./grammarArticle";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    level,
    quiz,
    lesson,

    kanaCharacter,
    kanaRow,
    kanaTable,
    callout,
    exampleSentence,

    kosakata,
    verbDictionary,
    cheatsheet,
    grammarArticle,
  ],
};
