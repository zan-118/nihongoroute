/**
 * @file CheatsheetPdfTemplate.tsx
 * @description Template dokumen PDF untuk Cheatsheet.
 * @module CheatsheetPdfTemplate
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

// ======================
// CONFIG / FONTS
// ======================

// Register Japanese font. Support kanji/kana rendering.
Font.register({
  family: "NotoSansJP",
  fonts: [
    { src: "/fonts/NotoSansJP-Regular.ttf" },
    { src: "/fonts/NotoSansJP-Bold.ttf", fontWeight: "bold" },
  ],
});

// ======================
// TYPES
// ======================

/**
 * Data structure for single cheatsheet item.
 */
interface SheetItem {
  label: string;
  jp: string;
  romaji: string;
}

/**
 * Props for CheatsheetPdfTemplate component.
 */
interface CheatsheetTemplateProps {
  data: SheetItem[];
  title: string;
  category: string;
}

// ======================
// STYLES
// ======================

/**
 * Stylesheet for PDF layout.
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
  categoryBadge: {
    backgroundColor: "rgba(188, 44, 61, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(188, 44, 61, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    color: "#bc2c3d",
    fontSize: 7,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
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
  cellNo: { width: "8%", paddingRight: 10 },
  cellLabel: { width: "42%", paddingRight: 15 },
  cellJP: { width: "50%" },
  
  labelTitle: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  jpText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0f172a",
  },
  romajiText: {
    fontSize: 7.5,
    color: "#bc2c3d",
    fontWeight: "bold",
    textTransform: "uppercase",
    marginTop: 2,
  },
  subText: {
    fontSize: 6.5,
    color: "#94a3b8",
    textTransform: "uppercase",
  },
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
    color: "#bc2c3d",
    fontWeight: "bold",
    textDecoration: "none",
  },
});

/**
 * PDF template component for cheatsheets.
 * Render A4 document with header, table of items, and footer.
 */
export const CheatsheetPdfTemplate = ({ data, title, category }: CheatsheetTemplateProps) => (
  <Document title={`Cheatsheet NihongoRoute - ${title}`}>
    <Page size="A4" style={styles.page}>
      <View style={styles.header} fixed>
        <View style={styles.logoSection}>
          { }
          <Image src="/logo-branding.png" style={styles.logoImage} />
          <View style={styles.brandText}>
            <Text style={styles.brandName}>NIHONGO ROUTE</Text>
            <Text style={styles.brandTagline}>Your Japanese Learning Companion</Text>
          </View>
        </View>
        <Text style={styles.categoryBadge}>{category}</Text>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.docTitle}>{title}</Text>
        <Text style={styles.docDesc}>
          Panduan referensi cepat untuk membantu Anda menguasai materi {title}.
          Dokumen ini berisi {data.length} poin referensi penting.
        </Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader} fixed>
          <View style={styles.cellNo}>
            <Text style={styles.tableHeaderLabel}>No</Text>
          </View>
          <View style={styles.cellLabel}>
            <Text style={styles.tableHeaderLabel}>Konteks / Label</Text>
          </View>
          <View style={styles.cellJP}>
            <Text style={styles.tableHeaderLabel}>Ekspresi (JP)</Text>
          </View>
        </View>

        {data.map((item, pos) => (
          <View
            key={`sheet-${pos}`}
            style={[
              styles.tableRow,
              // Apply zebra striping. Improve readability.
              pos % 2 === 1 ? styles.tableRowZebra : {},
            ]}
            // Prevent row break across pages.
            wrap={false}
          >
            <View style={styles.cellNo}>
              <Text style={{ fontSize: 9, color: "#cbd5e1" }}>{String(pos + 1).padStart(2, '0')}</Text>
            </View>
            <View style={styles.cellLabel}>
              <Text style={styles.labelTitle}>{item.label}</Text>
              <Text style={styles.subText}>Meaning & Context</Text>
            </View>
            <View style={styles.cellJP}>
              <Text style={styles.jpText}>{item.jp}</Text>
              <Text style={styles.romajiText}>{item.romaji}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.footer} fixed>
        {/* Avoid SSR mismatch. Date generated on client/server. */}
        {/* @ts-expect-error - suppressHydrationWarning is standard in React but not defined in react-pdf types */}
        <Text style={styles.footerText} suppressHydrationWarning={true}>
          © {new Date().getFullYear()} NihongoRoute. Dicetak pada {new Date().toLocaleDateString('id-ID')}.
        </Text>
        <Link src="https://nihongoroute.my.id" style={styles.footerLink}>
          nihongoroute.my.id
        </Link>
        {/* Dynamic page numbering. Calculated during PDF generation. */}
        <Text
          style={styles.footerText}
          render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} dari ${totalPages}`}
        />
      </View>
    </Page>
  </Document>
);