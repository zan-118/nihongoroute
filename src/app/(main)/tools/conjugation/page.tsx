import type { Metadata } from "next";
import ConjugationTrainerClient from "@/components/features/tools/conjugation-trainer/ConjugationTrainerClient";
import type { VerbFormId, VerbGroup } from "@/lib/verb-conjugation";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Verb Conjugation Trainer Jepang | NihongoRoute",
    description: "Latihan konjugasi verba Jepang untuk bentuk masu, te, nai, ta, potensial, pasif, kausatif, dan lainnya.",
    path: "/tools/conjugation",
    keywords: ["konjugasi verba Jepang", "verb conjugation Japanese", "latihan te form", "masu form"],
  }),
};

type ToolSearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeGroup(value: string | undefined): VerbGroup {
  const normalized = String(value || "").toLowerCase();
  return ["godan", "ichidan", "irregular"].includes(normalized)
    ? (normalized as VerbGroup)
    : "godan";
}

function normalizeForm(value: string | undefined): VerbFormId {
  const normalized = String(value || "").toLowerCase();
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

export default async function ConjugationTrainerPage({
  searchParams,
}: {
  searchParams?: Promise<ToolSearchParams>;
}) {
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
