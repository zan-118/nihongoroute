/**
 * @file index.ts
 * @description Deklarasi sentral skema-skema Sanity Studio. Mendaftarkan skema editorial statis (materi bacaan, menyimak, simulasi ujian, dan pelajaran) NihongoRoute.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import readingMaterial from './readingMaterial';
import listeningMaterial from './listeningMaterial';
import mockExam from './mockExam';
import lesson from './lesson';

// ==========================================
// DAFTAR EKSPOR SKEMA SANITY CMS
// ==========================================
export const schemaTypes = [
  readingMaterial,
  listeningMaterial,
  mockExam,
  lesson
];
