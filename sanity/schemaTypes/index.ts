import { type SchemaTypeDefinition } from "sanity";
import level from "./level";
import quiz from "./quiz";
import lesson from "./lesson";
import flashcard from "./flashcard";
import kanaCharacter from "./kanaCharacter";
import kanaRow from "./kanaRow";
import kanaTable from "./kanaTable";
import callout from "./callout";
import exampleSentence from "./exampleSentence"; // Import baru

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    level,
    quiz,
    lesson,
    flashcard,
    kanaCharacter,
    kanaRow,
    kanaTable,
    callout,
    exampleSentence, // Daftarkan di sini
  ],
};
