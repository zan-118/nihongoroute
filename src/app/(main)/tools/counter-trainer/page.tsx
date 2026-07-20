import type { Metadata } from "next";
import { getIntegratedCounterQuestions } from "@/actions/tools-integration.actions";
import CounterTrainerClient from "@/components/features/tools/counter-trainer/CounterTrainerClient";
import { createPageMetadata } from "@/lib/seo";

import { ROUTES } from "@/lib/core/routes";
/** Page metadata for SEO. */
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Counter Trainer Jepang | NihongoRoute",
    description: "Latihan memilih counter bahasa Jepang untuk orang, benda, umur, lantai, waktu, dan kategori umum lainnya.",
    path:ROUTES.TOOLS.COUNTER_TRAINER,
    keywords: ["counter bahasa Jepang", "josuushi", "latihan counter Jepang", "angka Jepang"],
  }),
};

/** Force dynamic rendering. Prevent static build caching. */
export const dynamic = "force-dynamic";

/** Search parameters for tool page. */
type ToolSearchParams = Record<string, string | string[] | undefined>;

/** Extract first string from query parameter value. */
function firstParam(value: string | string[] | undefined) {
  // Return first element if array, else return value.
  return Array.isArray(value) ? value[0] : value;
}

/** Build label showing source context of questions. */
function buildContextLabel(source?: string, slug?: string) {
  if (!source && !slug) return undefined;
  // Capitalize source name or default to Library.
  const sourceLabel = source ? source.charAt(0).toUpperCase() + source.slice(1) : "Library";
  return slug ? `Konteks dari ${sourceLabel}: ${decodeURIComponent(slug)}` : `Konteks dari ${sourceLabel}`;
}

/** Counter trainer page component. Fetch questions and render client trainer. */
export default async function CounterTrainerPage({
  searchParams,
}: {
  searchParams?: Promise<ToolSearchParams>;
}) {
  // Await search params for dynamic query resolution.
  const params = searchParams ? await searchParams : {};
  const source = firstParam(params.source);
  const slug = firstParam(params.slug);
  const level = firstParam(params.level);
  
  // Fetch questions filtered by source, slug, and level.
  const questions = await getIntegratedCounterQuestions({ source, slug, level });

  return (
    <CounterTrainerClient
      initialQuestions={questions}
      databaseQuestionCount={questions.length}
      contextLabel={buildContextLabel(source, slug)}
    />
  );
}