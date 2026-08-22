/**
 * @file page.tsx
 * @description Halaman katalog latihan menyimak (Listening Lab) untuk memuat daftar audio interaktif secara dinamis.
 */


// IMPOR

import { getPaginatedListening } from "@/actions/library.actions";
import ListeningListView from "@/features/library/listening/ListeningListView";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import {
 breadcrumbJsonLd,
 createPageMetadata,
 learningResourceJsonLd,
} from "@/lib/seo";


// METADATA SEO


/**
 * SEO metadata configuration for listening library page.
 */
export const metadata: Metadata = {
 ...createPageMetadata({
 title: "Latihan Listening Bahasa Jepang | NihongoRoute",
 description:
 "Pertajam pendengaran bahasa Jepang dengan latihan audio interaktif, transkrip, kuis pemahaman, dan materi choukai sesuai level JLPT.",
 path: "/library/listening",
 keywords: ["listening bahasa Jepang", "choukai JLPT", "latihan menyimak Jepang"],
 }),
};


// EKSEKUSI UTAMA


/**
 * Halaman utama Latihan Menyimak (Listening Lab) (RSC).
 * Melakukan pra-ambil data halaman pertama daftar latihan menyimak sebelum merender ListeningListClient.
 * 
 * @returns {Promise<JSX.Element>} Halaman direktori pustaka latihan menyimak.
 */
export default async function ListeningListPage() {
 // Fetch first page of listening exercises. Default page size 10.
 const initialData = await getPaginatedListening(1, 10, "");

 return (
 <div className="w-full min-h-screen bg-transparent relative overflow-hidden pt-12 pb-24 px-4 md:px-8">
 {/* Inject structured data for SEO. */}
 <JsonLd
 data={[
 breadcrumbJsonLd([
 { name: "Beranda", path: "/" },
 { name: "Pustaka", path: "/library" },
 { name: "Listening", path: "/library/listening" },
 ]),
 learningResourceJsonLd({
 name: "Latihan Listening Bahasa Jepang",
 description: metadata.description as string,
 path: "/library/listening",
 educationalLevel: "JLPT N5-N1",
 teaches: "Menyimak bahasa Jepang",
 }),
 ]}
 />
 {/* Efek Latar Belakang */}
 {/* Background visual effects. */}
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-primary/10 blur-[65px] rounded-[100%] pointer-events-none opacity-50 ambient-glow will-change-transform" />
 <div className="grid-overlay" />

 <div className="max-w-5xl mx-auto relative z-10">
 {/* Render interactive client list. */}
 <ListeningListView initialData={initialData} />
 </div>
 </div>
 );
}