import type { Metadata } from "next";
import { getIntegratedMiniDrillQuestions } from "@/actions/tools-integration.actions";
import JlptMiniDrillClient from "@/features/tools/jlpt-mini-drill/JlptMiniDrillClient";
import type { DrillKind, DrillLevel } from "@/lib/jlpt-mini-drill";
import { createPageMetadata } from "@/lib/seo";

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

/** Search parameters from URL query. */
type ToolSearchParams = Record<string, string | string[] | undefined>;

/** Extract first string value from query parameter. */
function firstParam(value: string | string[] | undefined) {
 // Return first element if array, else return value
 return Array.isArray(value) ? value[0] : value;
}

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

/** Create human-readable label for drill context source. */
function buildContextLabel(source?: string, slug?: string) {
 if (!source && !slug) return undefined;
 // Capitalize source name or default to Library
 const sourceLabel = source ? source.charAt(0).toUpperCase() + source.slice(1) : "Library";
 return slug ? `Konteks dari ${sourceLabel}: ${decodeURIComponent(slug)}` : `Konteks dari ${sourceLabel}`;
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