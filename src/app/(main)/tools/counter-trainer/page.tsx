import type { Metadata } from "next";
import { getIntegratedCounterQuestions } from "@/actions/tools-integration.actions";
import CounterTrainerClient from "@/features/tools/counter-trainer/CounterTrainerClient";
import { createPageMetadata } from "@/lib/seo";
import { buildContextLabel, firstParam, type ToolSearchParams } from "@/lib/core/utils";

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