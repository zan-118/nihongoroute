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
interface VocabTemplateProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  level: string;
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
  // HEADER BRANDING
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
  levelBadge: {
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bae6fd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    color: "#0369a1",
    fontSize: 10,
    fontWeight: "bold",
  },

  // TITLE & SUMMARY
  titleSection: {
    marginBottom: 40,
  },
  docTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 8,
  },
  docDesc: {
    fontSize: 9,
    color: "#64748b",
    lineHeight: 1.5,
  },

  // TABLE STYLING
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
  
  // CELLS
  cellNo: { width: "4%", paddingRight: 10 },
  cellWord: { width: "22%", paddingRight: 10 },
  cellReading: { width: "22%", paddingRight: 10 },
  cellRomaji: { width: "18%", paddingRight: 10 },
  cellMeaning: { width: "34%" },
  
  kanjiText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
  },
  kanaText: {
    fontSize: 8,
    color: "#0891b2",
    fontWeight: "bold",
  },
  romajiText: {
    fontSize: 7,
    color: "#94a3b8",
  },
  meaningText: {
    fontSize: 8,
    color: "#334155",
    lineHeight: 1.4,
  },

  // FOOTER
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
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
    color: "#0891b2",
    fontWeight: "bold",
    textDecoration: "none",
  },
});

// ======================
// MAIN EXECUTION
// ======================

/**
 * Komponen VocabPdfTemplate: Menyusun layout PDF untuk daftar kosakata.
 */
export const VocabPdfTemplate = ({ data, level }: VocabTemplateProps) => (
  <Document title={`Kamus Kosakata NihongoRoute - ${level}`}>
    <Page size="A4" style={styles.page}>
      {/* HEADER SECTION */}
      <View style={styles.header} fixed>
        <View style={styles.logoSection}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
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

        {data.map((item, index) => (
          <View
            key={item._id || index}
            style={[
              styles.tableRow,
              index % 2 === 1 ? styles.tableRowZebra : {},
            ]}
            wrap={false}
          >
            <View style={styles.cellNo}>
              <Text style={styles.romajiText}>{index + 1}</Text>
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
              <Text style={styles.meaningText}>{item.meaning}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* FOOTER SECTION */}
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
