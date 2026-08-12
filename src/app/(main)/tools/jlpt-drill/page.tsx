import type { Metadata } from "next";
import { getIntegratedMiniDrillQuestions } from "@/actions/tools-integration.actions";
import JlptMiniDrillClient from "@/features/tools/jlpt-mini-drill/JlptMiniDrillClient";
import type { DrillKind, DrillLevel } from "@/lib/jlpt-mini-drill";
import { createPageMetadata } from "@/lib/seo";
import { buildContextLabel, firstParam, type ToolSearchParams } from "@/lib/core/utils";

import { ROUTES } from "@/lib/core/routes";
/** Page metadata for SEO. */
export const metadata: Metadata = {
 ...createPageMetadata({
 title: "JLPT Mini Drill | NihongoRoute",
 description: "Generator latihan cepat JLPT untuk kosakata, kanji, dan grammar dari level N5 sampai N1.",
 path:ROUTES.TOOLS.JLPT_DRILL,
 keywords: ["JLPT drill", "latihan JLPT", "quiz JLPT", "vocab kanji grammar JLPT"],
 }),
};

export const dynamic = "force-dynamic";

/** Validate and cast level parameter to DrillLevel or "all". */
function normalizeLevel(value: string | undefined): DrillLevel | "all" {
 const upper = String(value || "all").toUpperCase();
 // Check if value matches valid JLPT levels
 return ["N5", "N4", "N3", "N2", "N1"].includes(upper) ? (upper as DrillLevel) : "all";
}

/** Validate and cast kind parameter to DrillKind or "mixed". */
function normalizeKind(value: string | undefined): DrillKind | "mixed" {
 const normalized = String(value || "mixed").toLowerCase();
 // Check if value matches valid drill categories
 return ["vocab", "kanji", "grammar"].includes(normalized)
 ? (normalized as DrillKind)
 : "mixed";
}

/** JLPT Mini Drill page component. Fetches questions and renders client drill interface. */
export default async function JlptMiniDrillPage({
 searchParams,
}: {
 searchParams?: Promise<ToolSearchParams>;
}) {
 // Resolve search params promise
 const params = searchParams ? await searchParams : {};
 // Extract query parameters
 const source = firstParam(params.source);
 const slug = firstParam(params.slug);
 const level = firstParam(params.level);
 const kind = firstParam(params.kind) || source;
 // Fetch questions based on filters
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