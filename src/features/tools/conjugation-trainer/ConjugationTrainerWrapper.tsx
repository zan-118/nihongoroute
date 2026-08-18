"use client";

import { useSearchParams } from "next/navigation";
import ConjugationTrainerClient from "./ConjugationTrainerClient";
import type { VerbFormId, VerbGroup } from "@/lib/verb-conjugation";

function normalizeGroup(value: string | null): VerbGroup {
  const normalized = String(value || "").toLowerCase();
  return ["godan", "ichidan", "irregular"].includes(normalized)
    ? (normalized as VerbGroup)
    : "godan";
}

function normalizeForm(value: string | null): VerbFormId {
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

export default function ConjugationTrainerWrapper() {
  const searchParams = useSearchParams();
  
  return (
    <ConjugationTrainerClient
      initialVerb={searchParams.get("verb") || undefined}
      initialGroup={normalizeGroup(searchParams.get("group"))}
      initialForm={normalizeForm(searchParams.get("form"))}
      sourceTitle={searchParams.get("sourceTitle") || undefined}
      sourceHref={searchParams.get("sourceHref") || undefined}
    />
  );
}
