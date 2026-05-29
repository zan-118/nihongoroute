/**
 * @file sanity.cli.ts
 * @description Berkas konfigurasi antarmuka baris perintah (CLI) untuk Sanity Studio. Mendaftarkan Project ID dan Dataset untuk keperluan deployment luring/daring.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { defineCliConfig } from 'sanity/cli';

// ==========================================
// KONFIGURASI CLI SANITY CMS
// ==========================================
export default defineCliConfig({
  api: {
    projectId: 'qoczxvvo',
    dataset: 'production'
  },
  deployment: {
    appId: 'e96nbtnveo2jia44kw6tr911',
  },
});
