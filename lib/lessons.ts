/**
 * @file lessons.ts
 * @description Modul penarikan data materi pembelajaran (Lessons) dari Sanity CMS.
 * @module lib/lessons
 */

// ======================
// IMPORTS
// ======================
import { client } from "@/sanity/lib/client";

// ======================
// DATABASE OPERATIONS
// ======================

/**
 * Mengambil daftar materi berdasarkan level JLPT.
 * 
 * @param {string} levelCode - Kode level (contoh: 'n5', 'n4').
 * @returns {Promise<any[]>} Array dokumen materi.
 */
export async function getLessonsByLevel(levelCode: string) {
  const query = `*[_type == "lesson" && level->code == $levelCode] | order(orderNumber asc)`;
  return await client.fetch(query, { levelCode });
}

/**
 * Mengambil detail materi tunggal berdasarkan level dan slug.
 * 
 * @param {string} levelCode - Kode level.
 * @param {string} slug - Slug unik materi.
 * @returns {Promise<any>} Dokumen materi tunggal.
 */
export async function getLesson(levelCode: string, slug: string) {
  const query = `*[_type == "lesson" && level->code == $levelCode && slug.current == $slug][0]`;
  return await client.fetch(query, { levelCode, slug });
}
