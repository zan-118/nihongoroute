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
interface SheetItem {
  label: string;
  jp: string;
  romaji: string;
}

interface CheatsheetTemplateProps {
  data: SheetItem[];
  title: string;
  category: string;
}

// ======================
// STYLES
// ======================
const styles = StyleSheet.create({
  page: {
    padding: 60,
    paddingBottom: 80,
    fontFamily: "NotoSansJP",
    backgroundColor: "#ffffff",
    fontSize: 10,
    color: "#334155",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 20,
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoImage: {
    width: 30,
    height: 30,
  },
  brandText: {
    flexDirection: "column",
  },
  brandName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
    letterSpacing: 1,
  },
  brandTagline: {
    fontSize: 7,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 1,
  },
  categoryBadge: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    color: "#991b1b",
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  titleSection: {
    marginBottom: 30,
  },
  docTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 8,
  },
  docDesc: {
    fontSize: 9,
    color: "#64748b",
    lineHeight: 1.5,
  },
  table: {
    width: "100%",
    marginTop: 10,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  tableHeaderLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    alignItems: "center",
  },
  tableRowZebra: {
    backgroundColor: "#f8fafc",
  },
  cellNo: { width: "8%", paddingRight: 10 },
  cellLabel: { width: "42%", paddingRight: 15 },
  cellJP: { width: "50%" },
  
  labelTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  jpText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0f172a",
  },
  romajiText: {
    fontSize: 8,
    color: "#ef4444",
    fontWeight: "bold",
    textTransform: "uppercase",
    marginTop: 2,
  },
  subText: {
    fontSize: 7,
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 60,
    right: 60,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#94a3b8",
  },
  footerLink: {
    fontSize: 8,
    color: "#ef4444",
    fontWeight: "bold",
    textDecoration: "none",
  },
});

export const CheatsheetPdfTemplate = ({ data, title, category }: CheatsheetTemplateProps) => (
  <Document title={`Cheatsheet NihongoRoute - ${title}`}>
    <Page size="A4" style={styles.page}>
      <View style={styles.header} fixed>
        <View style={styles.logoSection}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
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

        {data.map((item, index) => (
          <View
            key={index}
            style={[
              styles.tableRow,
              index % 2 === 1 ? styles.tableRowZebra : {},
            ]}
            wrap={false}
          >
            <View style={styles.cellNo}>
              <Text style={{ fontSize: 9, color: "#cbd5e1" }}>{String(index + 1).padStart(2, '0')}</Text>
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
        <Text style={styles.footerText}>
          © {new Date().getFullYear()} NihongoRoute. Dicetak pada {new Date().toLocaleDateString('id-ID')}.
        </Text>
        <Link src="https://www.nihongoroute.my.id" style={styles.footerLink}>
          www.nihongoroute.my.id
        </Link>
        <Text
          style={styles.footerText}
          render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} dari ${totalPages}`}
        />
      </View>
    </Page>
  </Document>
);
