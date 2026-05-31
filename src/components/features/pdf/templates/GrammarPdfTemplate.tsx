/**
 * @file GrammarPdfTemplate.tsx
 * @description Template dokumen PDF untuk materi tata bahasa (Grammar).
 * @module GrammarPdfTemplate
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
export interface PdfGrammarItem {
  title: string;
  meaning?: string;
  formation?: string;
  notes?: string;
  jlptLevel?: string;
  jlpt_level?: string;
  examples?: { jp: string; furigana?: string; romaji?: string; id: string }[];
}

interface GrammarTemplateProps {
  data: PdfGrammarItem;
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
    marginBottom: 35,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 15,
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
    backgroundColor: "#ecfeff",
    borderWidth: 1,
    borderColor: "#22d3ee",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    color: "#0891b2",
    fontSize: 10,
    fontWeight: "bold",
  },

  // TITLE & MEANING
  titleSection: {
    marginBottom: 25,
  },
  docTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 6,
  },
  meaningText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0891b2",
    marginBottom: 10,
  },

  // SECTION STYLES
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0891b2",
    marginTop: 20,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // BOXES
  formationBox: {
    backgroundColor: "#f8fafc",
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: "#0891b2",
    borderRadius: 4,
  },
  formationText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0f172a",
    lineHeight: 1.4,
  },
  notesBox: {
    backgroundColor: "#ffffff",
    paddingVertical: 5,
    marginBottom: 20,
  },
  notesText: {
    fontSize: 10,
    color: "#475569",
    lineHeight: 1.6,
  },

  // EXAMPLES
  exampleBox: {
    backgroundColor: "#f8fafc",
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#0891b2",
    borderRadius: 4,
    display: "flex",
    flexDirection: "column",
  },
  exampleJp: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0f172a",
  },
  exampleRomaji: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 3,
  },
  exampleId: {
    fontSize: 9,
    color: "#475569",
    marginTop: 5,
    fontWeight: "bold",
  },

  // TABLE STYLING FOR NOTES
  table: {
    width: "100%",
    marginTop: 10,
    marginBottom: 15,
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableHeaderLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    alignItems: "center",
  },
  tableRowZebra: {
    backgroundColor: "#f8fafc",
  },
  cellText: {
    fontSize: 8.5,
    color: "#334155",
    lineHeight: 1.4,
  },

  // LIST STYLING
  listItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    paddingLeft: 10,
  },
  bulletPoint: {
    width: 10,
    fontSize: 10,
    color: "#0891b2",
    fontWeight: "bold",
  },
  listText: {
    flex: 1,
    fontSize: 9.5,
    color: "#475569",
    lineHeight: 1.5,
  },

  // WARNING BOX
  warningBox: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
    marginVertical: 10,
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  warningText: {
    fontSize: 9,
    color: "#991b1b",
    lineHeight: 1.5,
    flex: 1,
    fontWeight: "bold",
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
// PARSER & HELPERS
// ======================
const stripEmojisOnly = (text?: string): string => {
  if (!text) return "";
  return text
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "")
    .replace(/[\u2600-\u27BF]/g, "")
    .trim();
};

const parseInlineStylesPdf = (
  text: string,
  baseStyle: React.ComponentProps<typeof View>["style"] = {},
  key?: string
) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
  return (
    <Text key={key} style={baseStyle}>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <Text key={index} style={{ fontWeight: "bold", color: "#0f172a" }}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <Text key={index} style={{ backgroundColor: "#f1f5f9", color: "#0891b2" }}>
              {part.slice(1, -1)}
            </Text>
          );
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return (
            <Text key={index} style={{ color: "#64748b" }}>
              {part.slice(1, -1)}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
};

// Parser untuk membedah Notes (catatan grammar) ke dalam List, Tabel, Warning Box, atau Paragraf di PDF.
const parseNotesToPdfJSX = (notes: string) => {
  if (!notes) return null;
  const lines = notes.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: { type: "ul" | "ol"; items: string[] } | null = null;
  let currentTable: string[][] | null = null;

  const flushList = (key: string) => {
    if (!currentList) return;
    elements.push(
      <View key={key} style={{ marginVertical: 8 }}>
        {currentList.items.map((item, idx) => (
          <View key={idx} style={styles.listItemRow} wrap={false}>
            <Text style={styles.bulletPoint}>
              {currentList!.type === "ul" ? "•" : `${idx + 1}.`}
            </Text>
            {parseInlineStylesPdf(item, styles.listText)}
          </View>
        ))}
      </View>
    );
    currentList = null;
  };

  const flushTable = (key: string) => {
    if (!currentTable || currentTable.length < 2) return;
    const headerCols = currentTable[0];
    const rows = currentTable.slice(2);

    const colCount = headerCols.length;
    const cellWidthPercent = `${Math.floor(100 / colCount)}%`;

    elements.push(
      <View key={key} style={styles.table} wrap={false}>
        {/* Header */}
        <View style={styles.tableHeader}>
          {headerCols.map((col, idx) => (
            <View key={`th-${idx}`} style={{ width: cellWidthPercent }}>
              <Text style={styles.tableHeaderLabel}>{col}</Text>
            </View>
          ))}
        </View>
        {/* Rows */}
        {rows.map((row, rowIdx) => (
          <View
            key={`tr-${rowIdx}`}
            style={[
              styles.tableRow,
              rowIdx % 2 === 1 ? styles.tableRowZebra : {},
            ]}
          >
            {row.map((col, colIdx) => (
              <View key={`td-${colIdx}`} style={{ width: cellWidthPercent }}>
                {parseInlineStylesPdf(col, styles.cellText)}
              </View>
            ))}
          </View>
        ))}
      </View>
    );
    currentTable = null;
  };

  const flushAll = (key: string) => {
    flushList(`${key}-list`);
    flushTable(`${key}-table`);
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushAll(`flush-${index}`);
      return;
    }

    // Pendeteksian Tabel Markdown
    if (trimmed.startsWith("|")) {
      flushList(`table-interrupt-list-${index}`);
      const cols = trimmed
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
      if (!currentTable) {
        currentTable = [cols];
      } else {
        currentTable.push(cols);
      }
      return;
    }

    // Jika bukan baris tabel, flush tabel aktif
    flushTable(`table-interrupt-other-${index}`);

    // Item daftar tidak berurutan
    if ((trimmed.startsWith("*") && !trimmed.startsWith("**")) || trimmed.startsWith("-")) {
      const itemText = trimmed.substring(1).trim();
      if (!currentList || currentList.type !== "ul") {
        flushList(`list-interrupt-other-${index}`);
        currentList = { type: "ul", items: [itemText] };
      } else {
        currentList.items.push(itemText);
      }
      return;
    }

    // Item daftar berurutan
    const matchOrdered = trimmed.match(/^(\d+)\.\s(.*)/);
    if (matchOrdered) {
      const itemText = matchOrdered[2].trim();
      if (!currentList || currentList.type !== "ol") {
        flushList(`list-interrupt-other-${index}`);
        currentList = { type: "ol", items: [itemText] };
      } else {
        currentList.items.push(itemText);
      }
      return;
    }

    // Bersihkan daftar aktif jika bukan item list
    flushList(`list-flush-${index}`);

    // Warning Box
    if (trimmed.startsWith("⚠️")) {
      elements.push(
        <View key={`warning-${index}`} style={styles.warningBox} wrap={false}>
          <Text style={{ fontSize: 10 }}>⚠️</Text>
          <Text style={styles.warningText}>
            {stripEmojisOnly(trimmed.substring(2).trim())}
          </Text>
        </View>
      );
      return;
    }

    // Paragraf biasa
    elements.push(
      <View key={`para-${index}`} style={{ marginVertical: 6 }}>
        {parseInlineStylesPdf(trimmed, styles.notesText)}
      </View>
    );
  });

  flushAll("final");
  return <View style={styles.notesBox}>{elements}</View>;
};

// ======================
// MAIN COMPONENT
// ======================
export const GrammarPdfTemplate = ({ data }: GrammarTemplateProps) => {
  const jlptLevel = data.jlptLevel || data.jlpt_level || "N5";
  return (
    <Document title={`Tata Bahasa NihongoRoute - ${data.title}`}>
      <Page size="A4" style={styles.page}>
        {/* HEADER SECTION */}
        <View style={styles.header} fixed>
          <View style={styles.logoSection}>
            <Image src="/logo-branding.png" style={styles.logoImage} />
            <View style={styles.brandText}>
              <Text style={styles.brandName}>NIHONGO ROUTE</Text>
              <Text style={styles.brandTagline}>Your Japanese Learning Companion</Text>
            </View>
          </View>
          <Text style={styles.levelBadge}>JLPT {jlptLevel.toUpperCase()}</Text>
        </View>

        {/* TITLE SECTION */}
        <View style={styles.titleSection}>
          <Text style={styles.docTitle}>{data.title}</Text>
          {data.meaning && <Text style={styles.meaningText}>{data.meaning}</Text>}
        </View>

        {/* FORMATION SECTION */}
        {data.formation && (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>Struktur Kalimat (Formation)</Text>
            <View style={styles.formationBox}>
              <Text style={styles.formationText}>{data.formation}</Text>
            </View>
          </View>
        )}

        {/* NOTES SECTION */}
        {data.notes && (
          <View>
            <Text style={styles.sectionTitle}>Penjelasan & Catatan</Text>
            {parseNotesToPdfJSX(data.notes)}
          </View>
        )}

        {/* EXAMPLES SECTION */}
        {data.examples && data.examples.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Contoh Kalimat (例文)</Text>
            {data.examples.map((ex, i) => (
              <View key={i} style={styles.exampleBox} wrap={false}>
                <Text style={styles.exampleJp}>{ex.jp}</Text>
                {ex.romaji && <Text style={styles.exampleRomaji}>{ex.romaji}</Text>}
                <Text style={styles.exampleId}>{stripEmojisOnly(ex.id)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* FOOTER SECTION */}
        <View style={styles.footer} fixed>
          {/* @ts-expect-error - suppressHydrationWarning is standard in React but not defined in react-pdf types */}
          <Text style={styles.footerText} suppressHydrationWarning={true}>
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
};
