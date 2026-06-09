import type { Metadata } from "next";
import ConjugationTrainerClient from "@/components/features/tools/conjugation-trainer/ConjugationTrainerClient";
import type { VerbGroup } from "@/lib/verb-conjugation";

export const metadata: Metadata = {
  title: "Verb Conjugation Trainer | NihongoRoute",
  description: "Latihan konjugasi verba Jepang untuk bentuk masu, te, nai, ta, dan lainnya.",
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

export default async function ConjugationTrainerPage({
  searchParams,
}: {
  searchParams?: Promise<ToolSearchParams>;
}) {
  const params = searchParams ? await searchParams : {};
  const verb = firstParam(params.verb);
  const group = firstParam(params.group);
  const sourceTitle = firstParam(params.sourceTitle);
  const sourceHref = firstParam(params.sourceHref);

  return (
    <ConjugationTrainerClient
      initialVerb={verb}
      initialGroup={normalizeGroup(group)}
      sourceTitle={sourceTitle}
      sourceHref={sourceHref}
    />
  );
}
