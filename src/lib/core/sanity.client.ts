/**
 * @file sanity.client.ts
 * @description Klien inisiasi dan kueri dinamis untuk Sanity CMS. Menyediakan utilitas penghubung gambar (image URL builder) serta pengalihan otomatis antara API ter-cache CDN dan API non-cache untuk draf visual editing.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { draftMode } from 'next/headers';

// ==========================================
// INISIALISASI KLIEN SANITY CMS
// ==========================================
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'qoczxvvo',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-05-17',
  useCdn: true,
});

export const SANITY_PUBLIC_REVALIDATE_SECONDS = 60 * 60;

export const sanityPublicFetchOptions = {
  next: {
    revalidate: SANITY_PUBLIC_REVALIDATE_SECONDS,
  },
} as const;

/**
 * Mengembalikan client Sanity yang dikonfigurasi secara dinamis berdasarkan status draftMode saat ini.
 * Jika draftMode diaktifkan, ia akan mengembalikan client non-CDN menggunakan token baca untuk mengambil draf.
 * Jika tidak, ia akan mengembalikan client CDN standar yang di-cache di edge untuk kinerja optimal.
 */
export async function getSanityClient() {
  let isDraft = false;
  try {
    const draft = await draftMode();
    isDraft = draft.isEnabled;
  } catch {
    // Kembali ke false ketika header tidak tersedia (misalnya saat pembuatan statis / waktu kompilasi build)
  }

  if (isDraft) {
    return sanityClient.withConfig({
      useCdn: false,
      token: process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN,
    });
  }

  return sanityClient;
}

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
