/**
 * @file VocabPdfTemplate.tsx
 * @description Template dokumen PDF untuk daftar kosakata (Vocabulary).
 * @module VocabPdfTemplate
 */

import React from "react";
import {
 Page,
 Text,
 View,
 Document,
 StyleSheet,
 Link,
 Image,
 Font,
} from "@react-pdf/renderer";

// CONFIG / FONTS

// Register Japanese font family to support Kanji and Kana characters in PDF.
Font.register({
 family: "NotoSansJP",
 fonts: [
 { src: "/fonts/NotoSansJP-Regular.ttf" },
 { src: "/fonts/NotoSansJP-Bold.ttf", fontWeight: "bold" },
 ],
});

// TYPES

import { PdfVocabItem } from "./LessonPdfTemplate";

/**
 * Props for the VocabPdfTemplate component.
 */
interface VocabTemplateProps {
 /** Array of vocabulary items to display in the PDF table */
 data: PdfVocabItem[];
 /** JLPT level or lesson level identifier */
 level: string;
}

// STYLES

/**
 * Stylesheet definitions for the PDF layout.
 */
const styles = StyleSheet.create({
 page: {
 padding: 50,
 paddingBottom: 70,
 fontFamily: "NotoSansJP",
 backgroundColor: "#ffffff",
 fontSize: 9,
 color: "#334155",
 },
 // HEADER BRANDING
 header: {
 flexDirection: "row",
 justifyContent: "space-between",
 alignItems: "center",
 marginBottom: 30,
 borderBottomWidth: 1.5,
 borderBottomColor: "#0f172a",
 paddingBottom: 15,
 },
 logoSection: {
 flexDirection: "row",
 alignItems: "center",
 gap: 10,
 },
 logoImage: {
 width: 26,
 height: 26,
 },
 brandText: {
 flexDirection: "column",
 },
 brandName: {
 fontSize: 14,
 fontWeight: "bold",
 color: "#0f172a",
 letterSpacing: 2,
 },
 brandTagline: {
 fontSize: 6,
 color: "#94a3b8",
 textTransform: "uppercase",
 letterSpacing: 1,
 marginTop: 1,
 },
 levelBadge: {
 backgroundColor: "rgba(2, 132, 199, 0.05)",
 borderWidth: 1,
 borderColor: "rgba(2, 132, 199, 0.2)",
 paddingHorizontal: 10,
 paddingVertical: 5,
 borderRadius: 4,
 color: "#0284c7",
 fontSize: 7.5,
 fontWeight: "bold",
 textTransform: "uppercase",
 },

 // TITLE & SUMMARY
 titleSection: {
 marginBottom: 25,
 },
 docTitle: {
 fontSize: 20,
 fontWeight: "bold",
 color: "#0f172a",
 marginBottom: 6,
 },
 docDesc: {
 fontSize: 8.5,
 color: "#64748b",
 lineHeight: 1.5,
 },

 // TABLE STYLING
 table: {
 width: "100%",
 marginTop: 10,
 borderRadius: 6,
 overflow: "hidden",
 borderWidth: 1,
 borderColor: "#e2e8f0",
 },
 tableHeader: {
 flexDirection: "row",
 backgroundColor: "#0f172a",
 paddingVertical: 12,
 paddingHorizontal: 15,
 },
 tableHeaderLabel: {
 fontSize: 7.5,
 fontWeight: "bold",
 color: "#ffffff",
 textTransform: "uppercase",
 letterSpacing: 1,
 },
 tableRow: {
 flexDirection: "row",
 paddingVertical: 10,
 paddingHorizontal: 15,
 borderBottomWidth: 1,
 borderBottomColor: "#f5f5f4",
 alignItems: "center",
 },
 tableRowZebra: {
 backgroundColor: "#fafaf9",
 },
 
 // CELLS
 cellNo: { width: "5%", paddingRight: 5 },
 cellWord: { width: "23%", paddingRight: 10 },
 cellReading: { width: "23%", paddingRight: 10 },
 cellRomaji: { width: "17%", paddingRight: 10 },
 cellMeaning: { width: "32%" },
 
 kanjiText: {
 fontSize: 10.5,
 fontWeight: "bold",
 color: "#0f172a",
 },
 kanaText: {
 fontSize: 8.5,
 color: "#0284c7",
 fontWeight: "bold",
 },
 romajiText: {
 fontSize: 7.5,
 color: "#94a3b8",
 },
 meaningText: {
 fontSize: 8.5,
 color: "#334155",
 lineHeight: 1.4,
 },

 // FOOTER
 footer: {
 position: "absolute",
 bottom: 25,
 left: 50,
 right: 50,
 borderTopWidth: 1,
 borderTopColor: "#f1f5f9",
 paddingTop: 12,
 flexDirection: "row",
 justifyContent: "space-between",
 alignItems: "center",
 },
 footerText: {
 fontSize: 7.5,
 color: "#94a3b8",
 },
 footerLink: {
 fontSize: 7.5,
 color: "#0284c7",
 fontWeight: "bold",
 textDecoration: "none",
 },
});

// MAIN EXECUTION

/**
 * Formats the meaning string by limiting the items to a maximum of two.
 * Appends "dll." if the list exceeds two items.
 * 
 * @param text - Raw meaning string containing comma or semicolon separated values.
 * @returns Formatted meaning string.
 */
const formatMeaning = (text?: string) => {
 if (!text) return "—";
 const parts = text.split(/[,;]/).map((s: string) => s.trim()).filter(Boolean);
 return parts.length > 2 ? `${parts.slice(0, 2).join(", ")}, dll.` : text;
};

/**
 * VocabPdfTemplate Component.
 * Renders a structured PDF document containing a vocabulary list table.
 * Designed for A4 size with custom headers, footers, and Japanese font support.
 */
export const VocabPdfTemplate = ({ data, level }: VocabTemplateProps) => (
 <Document title={`Kamus Kosakata NihongoRoute - ${level}`}>
 <Page size="A4" style={styles.page}>
 {/* HEADER SECTION */}
 <View style={styles.header} fixed>
 <View style={styles.logoSection}>
 { }
 <Image src="/logo-branding.png" style={styles.logoImage} />
 <View style={styles.brandText}>
 <Text style={styles.brandName}>NIHONGO ROUTE</Text>
 <Text style={styles.brandTagline}>Your Japanese Learning Companion</Text>
 </View>
 </View>
 <Text style={styles.levelBadge}>LEVEL {level.toUpperCase()}</Text>
 </View>

 {/* TITLE SECTION */}
 <View style={styles.titleSection}>
 <Text style={styles.docTitle}>Kamus Kosakata</Text>
 <Text style={styles.docDesc}>
 Daftar perbendaharaan kata bahasa Jepang yang telah dikurasi untuk menunjang proses belajar Anda.
 Dokumen ini berisi {data.length} entri kata beserta cara baca dan artinya.
 </Text>
 </View>

 {/* VOCABULARY TABLE */}
 <View style={styles.table}>
 <View style={styles.tableHeader} fixed>
 <View style={styles.cellNo}>
 <Text style={styles.tableHeaderLabel}>No</Text>
 </View>
 <View style={styles.cellWord}>
 <Text style={styles.tableHeaderLabel}>Kosakata</Text>
 </View>
 <View style={styles.cellReading}>
 <Text style={styles.tableHeaderLabel}>Furigana</Text>
 </View>
 <View style={styles.cellRomaji}>
 <Text style={styles.tableHeaderLabel}>Romaji</Text>
 </View>
 <View style={styles.cellMeaning}>
 <Text style={styles.tableHeaderLabel}>Arti / Makna</Text>
 </View>
 </View>

 {data.map((item, pos) => (
 <View
 key={`vocab-${pos}`}
 style={[
 styles.tableRow,
 // Apply zebra striping to alternate rows
 pos % 2 === 1 ? styles.tableRowZebra : {},
 ]}
 wrap={false}
 >
 <View style={styles.cellNo}>
 <Text style={styles.romajiText}>{pos + 1}</Text>
 </View>
 <View style={styles.cellWord}>
 <Text style={styles.kanjiText}>{item.word}</Text>
 </View>
 <View style={styles.cellReading}>
 <Text style={styles.kanaText}>{item.furigana || "—"}</Text>
 </View>
 <View style={styles.cellRomaji}>
 <Text style={styles.romajiText}>{item.romaji}</Text>
 </View>
 <View style={styles.cellMeaning}>
 <Text style={styles.meaningText}>{formatMeaning(item.meaning)}</Text>
 </View>
 </View>
 ))}
 </View>

 {/* FOOTER SECTION */}
 <View style={styles.footer} fixed>
 {/* @ts-expect-error - suppressHydrationWarning is standard in React but not defined in react-pdf types */}
 <Text style={styles.footerText} suppressHydrationWarning={true}>
 © {new Date().getFullYear()} NihongoRoute. Dicetak pada {new Date().toLocaleDateString('id-ID')}.
 </Text>
 <Link src="https://nihongoroute.my.id" style={styles.footerLink}>
 nihongoroute.my.id
 </Link>
 {/* Dynamic page number rendering */}
 <Text
 style={styles.footerText}
 render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} dari ${totalPages}`}
 />
 </View>
 </Page>
 </Document>
);