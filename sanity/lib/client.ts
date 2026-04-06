// file: sanity/lib/client.ts

import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, useCdn } from "../env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  perspective: "published", // Hanya mengambil data yang sudah di-publish
});
