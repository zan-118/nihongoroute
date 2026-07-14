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
/**
 * Primary Sanity client. Connects to CMS dataset.
 */
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'qoczxvvo',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-05-17',
  useCdn: true,
});

/**
 * Cache lifetime. One hour in seconds.
 */
export const SANITY_PUBLIC_REVALIDATE_SECONDS = 60 * 60;

/**
 * Next.js fetch configuration. Sets revalidation interval.
 */
export const sanityPublicFetchOptions = {
  next: {
    revalidate: SANITY_PUBLIC_REVALIDATE_SECONDS,
  },
} as const;

/**
 * Get client instance. Returns preview client if draft mode active. Returns CDN client otherwise.
 * @returns Sanity client.
 */
export async function getSanityClient() {
  let isDraft = false;
  try {
    // Read draft mode state.
    const draft = await draftMode();
    isDraft = draft.isEnabled;
  } catch {
    // Fail silent. Draft mode API fails during static build.
  }

  if (isDraft) {
    // Bypass CDN. Use read token for draft content.
    return sanityClient.withConfig({
      useCdn: false,
      token: process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN,
    });
  }

  return sanityClient;
}

// Image builder helper.
const builder = imageUrlBuilder(sanityClient);

/**
 * Convert Sanity image source to builder object.
 * @param source Sanity image asset.
 * @returns Image builder.
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}