import type { Metadata } from "next";
import ConjugationTrainerClient from "@/features/tools/conjugation-trainer/ConjugationTrainerClient";
import type { VerbFormId, VerbGroup } from "@/lib/verb-conjugation";
import { createPageMetadata } from "@/lib/seo";

import { ROUTES } from "@/lib/core/routes";
/** Page metadata. Define SEO tags for conjugation trainer. */
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Verb Conjugation Trainer Jepang | NihongoRoute",
    description: "Latihan konjugasi verba Jepang untuk bentuk masu, te, nai, ta, potensial, pasif, kausatif, dan lainnya.",
    path:ROUTES.TOOLS.CONJUGATION,
    keywords: ["konjugasi verba Jepang", "verb conjugation Japanese", "latihan te form", "masu form"],
  }),
};

/** Search parameters for conjugation tool. */
type ToolSearchParams = Record<string, string | string[] | undefined>;

/** Extract first string value from parameter. */
function firstParam(value: string | string[] | undefined) {
  // Return first element if array, else return value.
  return Array.isArray(value) ? value[0] : value;
}

/** Validate and normalize verb group string. */
function normalizeGroup(value: string | undefined): VerbGroup {
  const normalized = String(value || "").toLowerCase();
  // Fallback to godan if invalid group.
  return ["godan", "ichidan", "irregular"].includes(normalized)
    ? (normalized as VerbGroup)
    : "godan";
}

/** Validate and normalize verb form ID. */
function normalizeForm(value: string | undefined): VerbFormId {
  const normalized = String(value || "").toLowerCase();
  // Fallback to te form if invalid form.
  return [
    "masu",
    "nai",
    "te",
    "ta",
    "potential",
    "passive",
    "causative",
    "volitional",
    "conditional",
    "imperative",
  ].includes(normalized)
    ? (normalized as VerbFormId)
    : "te";
}

/** Page component for Japanese verb conjugation trainer. */
export default async function ConjugationTrainerPage({
  searchParams,
}: {
  searchParams?: Promise<ToolSearchParams>;
}) {
  // Resolve search params from Next.js page props.
  const params = searchParams ? await searchParams : {};
  const verb = firstParam(params.verb);
  const group = firstParam(params.group);
  const form = firstParam(params.form);
  const sourceTitle = firstParam(params.sourceTitle);
  const sourceHref = firstParam(params.sourceHref);

  return (
    <ConjugationTrainerClient
      initialVerb={verb}
      initialGroup={normalizeGroup(group)}
      initialForm={normalizeForm(form)}
      sourceTitle={sourceTitle}
      sourceHref={sourceHref}
    />
  );
}