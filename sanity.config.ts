/**
 * @file sanity.config.ts
 * @description Berkas konfigurasi sentral workspace Sanity Studio. Mendaftarkan plugins (structureTool, visionTool), schemaTypes untuk materi pelajaran, dan basis path '/studio'.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './sanity/schemaTypes';

// ==========================================
// KONFIGURASI WORKSPACE SANITY STUDIO
// ==========================================
export default defineConfig({
  name: 'default',
  title: 'NihongoRoute Studio',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'qoczxvvo',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',

  basePath: '/studio',

  plugins: [
    structureTool(),
    visionTool({ defaultApiVersion: '2026-05-17' })
  ],

  schema: {
    types: schemaTypes,
  },
});
