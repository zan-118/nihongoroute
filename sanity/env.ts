export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-04-21";

// Gunakan nilai cadangan (fallback) agar deploy tidak crash
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "qoczxvvo";

export const useCdn = false;
