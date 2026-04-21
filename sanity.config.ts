import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schema } from "./sanity/schemaTypes"; // Hubungkan ke index.ts skema Anda

export default defineConfig({
  name: "default",
  title: "NihongoRoute CMS",

  projectId: "qoczxvvo",
  dataset: "production",

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schema.types, // Ini akan memuat Vocab, Lesson, Quiz, dll.
  },
});
