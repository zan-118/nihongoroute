import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { draftMode } from 'next/headers';

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'qoczxvvo',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-05-17',
  useCdn: true,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

/**
 * Returns a dynamically configured Sanity client based on the current draftMode status.
 * If draftMode is enabled, it returns a non-CDN client using the read token to fetch drafts.
 * Otherwise, it returns the standard edge-cached CDN client for optimal performance.
 */
export async function getSanityClient() {
  let isDraft = false;
  try {
    const draft = await draftMode();
    isDraft = draft.isEnabled;
  } catch {
    // Falls back to false when headers are not available (e.g. at static generation / build time)
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
