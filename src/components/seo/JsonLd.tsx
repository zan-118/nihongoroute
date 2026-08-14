import type { JsonLdObject } from "@/lib/seo";

/**
 * Props for JsonLd.
 */
type JsonLdProps = {
 /** Schema.org structured data object or array. */
 data: JsonLdObject | JsonLdObject[];
};

/**
 * Inject JSON-LD structured data. Render script tag.
 */
export function JsonLd({ data }: JsonLdProps) {
 // Array use @graph wrapper. Single object merge context.
 const payload = Array.isArray(data)
 ? {
 "@context": "https://schema.org",
 "@graph": data,
 }
 : {
 "@context": "https://schema.org",
 ...data,
 };

 return (
 <script
 type="application/ld+json"
 // Guarded no-danger: JSON-LD payload is serialized with JSON.stringify, not HTML.
 dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
 />
 );
}
