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
} from "@react-pdf/renderer";

// ======================
// TYPES
// ======================
interface VocabTemplateProps {
  data: any[];
  level: string;
}

// ======================
// STYLES
// ======================
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "NotoSansJP",
    backgroundColor: "#ffffff",
  },
  // HEADER MODERN
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 30,
    borderBottomWidth: 3,
    borderBottomColor: "#ef4444",
    paddingBottom: 15,
  },
  logoBox: {
    flexDirection: "column",
  },
  brandName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#b91c1c",
    letterSpacing: 1.5,
  },
  tagline: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  infoBox: {
    alignItems: "flex-end",
  },
  levelLabel: {
    fontSize: 8,
    color: "#94a3b8",
    marginBottom: 2,
    textAlign: "right",
  },
  levelValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#b91c1c",
    backgroundColor: "#fef2f2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
  },
  // TABLE STYLING
  table: {
    display: "flex",
    width: "auto",
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0f172a", // Dark header
    borderRadius: 6,
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  tableRowZebra: {
    backgroundColor: "#f8fafc",
  },
  // COLUMN WIDTHS
  col1: { width: "25%" }, // Kata
  col2: { width: "25%" }, // Furigana
  col3: { width: "35%" }, // Arti
  col4: { width: "15%" }, // Jenis

  headerText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#ffffff",
    padding: 8,
    textTransform: "uppercase",
  },
  cellKanji: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0f172a",
  },
  cellText: {
    fontSize: 10,
    color: "#334155",
  },
  cellBadge: {
    fontSize: 8,
    color: "#b91c1c",
    fontWeight: "bold",
    textAlign: "center",
  },
  // FOOTER WITH URL
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: "#94a3b8",
  },
  footerUrl: {
    fontSize: 9,
    color: "#b91c1c",
    fontWeight: "bold",
    textDecoration: "none",
  },
});

// ======================
// MAIN EXECUTION
// ======================

/**
 * Komponen VocabPdfTemplate: Menyusun struktur visual PDF untuk daftar kosakata.
 * 
 * @param {VocabTemplateProps} props - Data kosakata dan level.
 * @returns {JSX.Element} Dokumen PDF.
 */
export const VocabPdfTemplate = ({ data, level }: VocabTemplateProps) => (
  <Document title={`Vocab_NihongoRoute_${level}`}>
    <Page size="A4" style={styles.page}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View style={styles.logoBox}>
          <Text style={styles.brandName}>NIHONGO ROUTE</Text>
          <Text style={styles.tagline}>Japanese Self-Learning Platform</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.levelLabel}>Current Database</Text>
          <Text style={styles.levelValue}>
            LEVEL {level?.toUpperCase() || "N5"}
          </Text>
        </View>
      </View>

      {/* TABLE SECTION */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <View style={styles.col1}>
            <Text style={styles.headerText}>Word</Text>
          </View>
          <View style={styles.col2}>
            <Text style={styles.headerText}>Furigana</Text>
          </View>
          <View style={styles.col3}>
            <Text style={styles.headerText}>Meaning</Text>
          </View>
          <View style={styles.col4}>
            <Text style={styles.headerText}>Type</Text>
          </View>
        </View>

        {data.map((item, idx) => (
          <View
            key={idx}
            style={[styles.tableRow, idx % 2 !== 0 ? styles.tableRowZebra : {}]}
            wrap={false}
          >
            <View style={styles.col1}>
              <Text style={styles.cellKanji}>{item.word}</Text>
            </View>
            <View style={styles.col2}>
              <Text style={styles.cellText}>{item.furigana}</Text>
            </View>
            <View style={styles.col3}>
              <Text style={styles.cellText}>{item.meaning}</Text>
            </View>
            <View style={styles.col4}>
              <Text style={styles.cellBadge}>
                {item.hinshi || item.category || "-"}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* FOOTER SECTION */}
      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>
          © {new Date().getFullYear()} NihongoRoute.my.id
        </Text>
        <Link style={styles.footerUrl} src="https://www.nihongoroute.my.id">
          www.nihongoroute.my.id
        </Link>
        <Text
          style={styles.footerText}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
        />
      </View>
    </Page>
  </Document>
);
