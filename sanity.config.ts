// file: sanity.config.ts

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schema } from "./sanity/schemaTypes";
import { assist } from "@sanity/assist";
import { apiVersion, dataset, projectId } from "./sanity/env";

export default defineConfig({
  basePath: "/studio", // URL untuk mengakses CMS Sanity
  projectId,
  dataset,

  // Mendaftarkan schema yang kita buat sebelumnya
  schema,

  plugins: [
    structureTool(),
    // Vision tool berguna untuk testing query GROQ langsung di dalam Studio
    visionTool({ defaultApiVersion: apiVersion }),
    assist(),
  ],
});
