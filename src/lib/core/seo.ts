import type { Metadata } from "next";

/** Brand name. */
export const SITE_NAME = "NihongoRoute";

/** Fallback site URL. */
export const DEFAULT_SITE_URL = "https://nihongoroute.my.id";

/** Fallback OpenGraph image path. */
export const DEFAULT_OG_IMAGE = "/opengraph-image.png";

/** Fallback page title. */
export const DEFAULT_TITLE = "NihongoRoute | Belajar Bahasa Jepang Gratis";

/** Fallback page description. */
export const DEFAULT_DESCRIPTION =
 "Platform belajar bahasa Jepang gratis dengan kurikulum JLPT, kosakata, kanji, tata bahasa, SRS, dan latihan interaktif.";

/** Valid JSON-LD values. */
export type JsonLdValue =
 | string
 | number
 | boolean
 | null
 | JsonLdObject
 | JsonLdValue[];

/** JSON-LD object structure. */
export type JsonLdObject = {
 [key: string]: JsonLdValue | undefined;
};

/** Input for page metadata generator. */
type PageMetadataInput = {
 title: string;
 description: string;
 path?: string;
 image?: string;
 type?: "website" | "article";
 keywords?: string[];
 noIndex?: boolean;
};

/** Breadcrumb node data. */
type BreadcrumbItem = {
 name: string;
 path: string;
};

/** Input for learning resource schema. */
type LearningResourceInput = {
 name: string;
 description: string;
 path: string;
 educationalLevel?: string | null;
 teaches?: string | string[] | null;
 timeRequired?: string | null;
 dateModified?: string | null;
 image?: string | null;
};

/** Input for defined term schema. */
type DefinedTermInput = {
 name: string;
 description: string;
 path: string;
 termCode?: string | null;
 termSetName: string;
 termSetPath: string;
 inLanguage?: string;
};

/** Input for article schema. */
type ArticleInput = {
 headline: string;
 description: string;
 path: string;
 image?: string | null;
 datePublished?: string | null;
 dateModified?: string | null;
 educationalLevel?: string | null;
};

/** Robots config to block indexing. */
export const noIndexRobots = {
 follow: false,
 googleBot: {
 follow: false,
 index: false,
 },
 index: false,
};

/** Get base site URL. Use env var or fallback. Strip trailing slash. */
export function getSiteUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) {
    try {
      const parsed = new URL(envUrl);
      return parsed.origin.replace(/\/+$/, "");
    } catch {
      // Fallback if envUrl is relative (e.g. "/") or invalid URL
    }
  }
  return DEFAULT_SITE_URL.replace(/\/+$/, "");
}

/** Convert relative path to absolute URL. Return exact if already absolute. */
export function absoluteUrl(path = "/") {
 // Return path if already absolute URL
 if (/^https?:\/\//i.test(path)) return path;
 const normalizedPath = path.startsWith("/") ? path : `/${path}`;
 return `${getSiteUrl()}${normalizedPath}`;
}

/** Encode URL path segment. */
export function encodeRouteSegment(value: string) {
 return encodeURIComponent(value);
}

/** Generate Next.js Metadata object. Set canonical, OG, Twitter tags. */
export function createPageMetadata({
 title,
 description,
 path = "/",
 image = DEFAULT_OG_IMAGE,
 type = "website",
 keywords,
 noIndex = false,
}: PageMetadataInput): Metadata {
 const url = absoluteUrl(path);
 const imageUrl = absoluteUrl(image);

 return {
 // Disable canonical link if page not indexed
 alternates: noIndex
 ? undefined
 : {
 canonical: url,
 },
 description,
 keywords,
 openGraph: {
 description,
 images: [
 {
 alt: `${SITE_NAME} preview`,
 height: 630,
 url: imageUrl,
 width: 1200,
 },
 ],
 locale: "id_ID",
 siteName: SITE_NAME,
 title,
 type,
 url,
 },
 robots: noIndex ? noIndexRobots : undefined,
 title,
 twitter: {
 card: "summary_large_image",
 description,
 images: [imageUrl],
 title,
 },
 };
}

/** Input for WebApplication schema. */
type WebApplicationInput = {
  name: string;
  description: string;
  path: string;
  applicationCategory?: string;
  operatingSystem?: string;
};

/** Generate Organization schema. */
export function organizationJsonLd(): JsonLdObject {
  return {
    "@id": `${getSiteUrl()}/#organization`,
    "@type": "Organization",
    description: DEFAULT_DESCRIPTION,
    logo: absoluteUrl("/logo-branding.png"),
    name: SITE_NAME,
    sameAs: ["https://github.com/zan-118/nihongoroute"],
    url: getSiteUrl(),
    knowsAbout: [
      "Bahasa Jepang",
      "Japanese Language Proficiency Test (JLPT)",
      "JLPT N5",
      "JLPT N4",
      "JLPT N3",
      "JLPT N2",
      "JLPT N1",
      "Kanji",
      "Hiragana",
      "Katakana",
      "Tata Bahasa Jepang",
      "Spaced Repetition System (SRS)",
    ],
  };
}

/** Generate WebSite schema. */
export function websiteJsonLd(): JsonLdObject {
  return {
    "@id": `${getSiteUrl()}/#website`,
    "@type": "WebSite",
    description: DEFAULT_DESCRIPTION,
    inLanguage: "id-ID",
    name: SITE_NAME,
    publisher: {
      "@id": `${getSiteUrl()}/#organization`,
    },
    url: getSiteUrl(),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${getSiteUrl()}/tools/dictionary?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Generate WebApplication / SoftwareApplication schema. */
export function webApplicationJsonLd({
  name,
  description,
  path,
  applicationCategory = "EducationalApplication",
  operatingSystem = "All",
}: WebApplicationInput): JsonLdObject {
  return {
    "@type": "WebApplication",
    "@id": `${absoluteUrl(path)}#webapp`,
    name,
    description,
    url: absoluteUrl(path),
    applicationCategory,
    operatingSystem,
    inLanguage: "id-ID",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "IDR",
    },
    provider: {
      "@id": `${getSiteUrl()}/#organization`,
    },
  };
}

/** Generate WebPage schema. */
export function webPageJsonLd({
 name,
 description,
 path,
}: {
 name: string;
 description: string;
 path: string;
}): JsonLdObject {
 const url = absoluteUrl(path);
 return {
 "@id": `${url}#webpage`,
 "@type": "WebPage",
 description,
 inLanguage: "id-ID",
 isPartOf: {
 "@id": `${getSiteUrl()}/#website`,
 },
 name,
 url,
 };
}

/** Generate BreadcrumbList schema. */
export function breadcrumbJsonLd(items: BreadcrumbItem[]): JsonLdObject {
 return {
 "@type": "BreadcrumbList",
 itemListElement: items.map((item, index) => ({
 "@type": "ListItem",
 item: absoluteUrl(item.path),
 name: item.name,
 position: index + 1,
 })),
 };
}

/** Generate Course schema. */
export function courseJsonLd({
 name,
 description,
 path,
 educationalLevel,
}: LearningResourceInput): JsonLdObject {
 return {
 "@type": "Course",
 description,
 educationalLevel: educationalLevel || undefined,
 inLanguage: "id-ID",
 name,
 provider: {
 "@id": `${getSiteUrl()}/#organization`,
 },
 url: absoluteUrl(path),
 };
}

/** Generate LearningResource schema. */
export function learningResourceJsonLd({
 name,
 description,
 path,
 educationalLevel,
 teaches,
 timeRequired,
 dateModified,
 image,
}: LearningResourceInput): JsonLdObject {
 return {
 "@type": "LearningResource",
 dateModified: dateModified || undefined,
 description,
 educationalLevel: educationalLevel || undefined,
 image: image ? absoluteUrl(image) : undefined,
 inLanguage: "id-ID",
 isAccessibleForFree: true,
 name,
 provider: {
 "@id": `${getSiteUrl()}/#organization`,
 },
 teaches: teaches || undefined,
 timeRequired: timeRequired || undefined,
 url: absoluteUrl(path),
 };
}

/** Generate DefinedTerm schema. */
export function definedTermJsonLd({
 name,
 description,
 path,
 termCode,
 termSetName,
 termSetPath,
 inLanguage = "ja",
}: DefinedTermInput): JsonLdObject {
 return {
 "@type": "DefinedTerm",
 description,
 inDefinedTermSet: {
 "@type": "DefinedTermSet",
 name: termSetName,
 url: absoluteUrl(termSetPath),
 },
 inLanguage,
 name,
 termCode: termCode || undefined,
 url: absoluteUrl(path),
 };
}

/** Generate Article schema. */
export function articleJsonLd({
 headline,
 description,
 path,
 image = DEFAULT_OG_IMAGE,
 datePublished,
 dateModified,
 educationalLevel,
}: ArticleInput): JsonLdObject {
 return {
 "@type": "Article",
 about: educationalLevel
 ? {
 "@type": "Thing",
 name: educationalLevel,
 }
 : undefined,
 dateModified: dateModified || datePublished || undefined,
 datePublished: datePublished || undefined,
 description,
 headline,
 image: image ? absoluteUrl(image) : undefined,
 inLanguage: "id-ID",
 isAccessibleForFree: true,
 mainEntityOfPage: absoluteUrl(path),
 publisher: {
 "@id": `${getSiteUrl()}/#organization`,
 },
 url: absoluteUrl(path),
 };
}

/** Input for FAQ schema. */
type FaqItemInput = {
 question: string;
 answer: string;
};

/** Generate FAQPage schema. */
export function faqPageJsonLd(items: FaqItemInput[] = []): JsonLdObject {
  return {
    "@type": "FAQPage",
    mainEntity: (items ?? []).map((item) => ({
      "@type": "Question",
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
      name: item.question,
    })),
  };
}