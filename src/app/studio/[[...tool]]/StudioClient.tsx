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
export default function StudioClient() {
  return <NextStudio config={config} />;
}
