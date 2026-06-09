import type { Metadata } from "next";

export const SITE_NAME = "NihongoRoute";
export const DEFAULT_SITE_URL = "https://www.nihongoroute.my.id";
export const DEFAULT_OG_IMAGE = "/opengraph-image.png";
export const DEFAULT_TITLE = "NihongoRoute | Belajar Bahasa Jepang Gratis";
export const DEFAULT_DESCRIPTION =
  "Platform belajar bahasa Jepang gratis dengan kurikulum JLPT, kosakata, kanji, tata bahasa, SRS, dan latihan interaktif.";

export type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | JsonLdObject
  | JsonLdValue[];

export type JsonLdObject = {
  [key: string]: JsonLdValue | undefined;
};

type PageMetadataInput = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  keywords?: string[];
  noIndex?: boolean;
};

type BreadcrumbItem = {
  name: string;
  path: string;
};

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

type DefinedTermInput = {
  name: string;
  description: string;
  path: string;
  termCode?: string | null;
  termSetName: string;
  termSetPath: string;
  inLanguage?: string;
};

type ArticleInput = {
  headline: string;
  description: string;
  path: string;
  image?: string | null;
  datePublished?: string | null;
  dateModified?: string | null;
  educationalLevel?: string | null;
};

export const noIndexRobots = {
  follow: false,
  googleBot: {
    follow: false,
    index: false,
  },
  index: false,
};

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");
}

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

export function encodeRouteSegment(value: string) {
  return encodeURIComponent(value);
}

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

export function organizationJsonLd(): JsonLdObject {
  return {
    "@id": `${getSiteUrl()}/#organization`,
    "@type": "Organization",
    description: DEFAULT_DESCRIPTION,
    logo: absoluteUrl("/logo-branding.png"),
    name: SITE_NAME,
    sameAs: ["https://github.com/zan-118/nihongoroute"],
    url: getSiteUrl(),
  };
}

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
  };
}

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
