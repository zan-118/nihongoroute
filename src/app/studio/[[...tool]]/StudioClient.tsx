/**
 * @file StudioClient.tsx
 * @description Komponen klien pembungkus NextStudio untuk merender antarmuka Sanity Studio.
 */

'use client';

// ======================
// IMPOR
// ======================
import { NextStudio } from 'next-sanity/studio';
import config from '../../../../sanity.config';

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * Render Sanity Studio interface.
 * Use NextStudio wrapper client-side.
 * 
 * @returns React element rendering Sanity Studio.
 */
export default function StudioClient() {
  // Render studio with imported configuration.
  return <NextStudio config={config} />;
}