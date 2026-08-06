/**
 * @file page.tsx
 * @description Pure server component route wrapper for public Contact page.
 */

import type { Metadata } from "next";
import ContactView from "@/features/contact/ContactView";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Hubungi Kami | NihongoRoute",
    description:
      "Kirim pesan, saran, masukan fitur, atau laporan kendala teknis kepada tim pengembang NihongoRoute.",
    path: "/contact",
    keywords: [
      "hubungi NihongoRoute",
      "kontak NihongoRoute",
      "saran belajar jepang",
      "lapor bug nihongoroute",
    ],
  }),
};

/**
 * ContactPage component.
 * Pure route wrapper delegating visual UI rendering to ContactView within PublicLayout.
 */
export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Hubungi Kami", path: "/contact" },
          ]),
        ]}
      />
      <ContactView />
    </>
  );
}
