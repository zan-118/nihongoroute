import type { Metadata } from "next";
import { getIntegratedMiniDrillQuestions } from "@/actions/tools-integration.actions";
import JlptMiniDrillClient from "@/components/features/tools/jlpt-mini-drill/JlptMiniDrillClient";
import type { DrillKind, DrillLevel } from "@/lib/jlpt-mini-drill";

export const metadata: Metadata = {
  title: "JLPT Mini Drill | NihongoRoute",
  description: "Generator latihan cepat JLPT untuk vocab, kanji, dan grammar.",
};

export const dynamic = "force-dynamic";

type ToolSearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeLevel(value: string | undefined): DrillLevel | "all" {
  const upper = String(value || "all").toUpperCase();
  return ["N5", "N4", "N3", "N2", "N1"].includes(upper) ? (upper as DrillLevel) : "all";
}

function normalizeKind(value: string | undefined): DrillKind | "mixed" {
  const normalized = String(value || "mixed").toLowerCase();
  return ["vocab", "kanji", "grammar"].includes(normalized)
    ? (normalized as DrillKind)
    : "mixed";
}

function buildContextLabel(source?: string, slug?: string) {
  if (!source && !slug) return undefined;
  const sourceLabel = source ? source.charAt(0).toUpperCase() + source.slice(1) : "Library";
  return slug ? `Konteks dari ${sourceLabel}: ${decodeURIComponent(slug)}` : `Konteks dari ${sourceLabel}`;
}

export default async function JlptMiniDrillPage({
  searchParams,
}: {
  searchParams?: Promise<ToolSearchParams>;
}) {
  const params = searchParams ? await searchParams : {};
  const source = firstParam(params.source);
  const slug = firstParam(params.slug);
  const level = firstParam(params.level);
  const kind = firstParam(params.kind) || source;
  const questions = await getIntegratedMiniDrillQuestions({ source, slug, level, kind });

  return (
    <JlptMiniDrillClient
      initialQuestions={questions}
      databaseQuestionCount={questions.length}
      initialLevel={normalizeLevel(level)}
      initialKind={normalizeKind(kind)}
      contextLabel={buildContextLabel(source, slug)}
    />
  );
}
