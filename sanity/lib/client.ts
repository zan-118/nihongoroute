import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Disetel ke false agar ISR/SSG selalu mendapatkan data terbaru dari API (bukan cache CDN)
})
