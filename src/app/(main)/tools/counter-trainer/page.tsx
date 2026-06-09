import type { Metadata } from "next";
import { getIntegratedCounterQuestions } from "@/actions/tools-integration.actions";
import CounterTrainerClient from "@/components/features/tools/counter-trainer/CounterTrainerClient";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Counter Trainer Jepang | NihongoRoute",
    description: "Latihan memilih counter bahasa Jepang untuk orang, benda, umur, lantai, waktu, dan kategori umum lainnya.",
    path: "/tools/counter-trainer",
    keywords: ["counter bahasa Jepang", "josuushi", "latihan counter Jepang", "angka Jepang"],
  }),
};

export const dynamic = "force-dynamic";

type ToolSearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildContextLabel(source?: string, slug?: string) {
  if (!source && !slug) return undefined;
  const sourceLabel = source ? source.charAt(0).toUpperCase() + source.slice(1) : "Library";
  return slug ? `Konteks dari ${sourceLabel}: ${decodeURIComponent(slug)}` : `Konteks dari ${sourceLabel}`;
}

export default async function CounterTrainerPage({
  searchParams,
}: {
  searchParams?: Promise<ToolSearchParams>;
}) {
  const params = searchParams ? await searchParams : {};
  const source = firstParam(params.source);
  const slug = firstParam(params.slug);
  const level = firstParam(params.level);
  const questions = await getIntegratedCounterQuestions({ source, slug, level });

  return (
    <CounterTrainerClient
      initialQuestions={questions}
      databaseQuestionCount={questions.length}
      contextLabel={buildContextLabel(source, slug)}
    />
  );
}
