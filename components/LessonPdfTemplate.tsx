import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";

Font.register({
  family: "NotoSansJP",
  fonts: [
    { src: "/fonts/NotoSansJP-Regular.ttf" },
    { src: "/fonts/NotoSansJP-Bold.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 45,
    fontFamily: "NotoSansJP",
    backgroundColor: "#ffffff",
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: "#22d3ee",
    paddingBottom: 15,
  },
  logoContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoImage: { width: 30, height: 30 },
  brandName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0891b2",
    letterSpacing: 1,
  },
  levelBadge: {
    backgroundColor: "#ecfeff",
    border: 1,
    borderColor: "#22d3ee",
    padding: "3 10",
    borderRadius: 6,
    fontSize: 10,
    color: "#0891b2",
    fontWeight: "bold",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 12,
  },

  // Box Contoh Kalimat (Sesuai Skema)
  exampleBox: {
    backgroundColor: "#f8fafc",
    border: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderLeft: 4,
    borderLeftColor: "#22d3ee",
  },
  exampleJp: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  exampleFurigana: { fontSize: 8, color: "#0891b2", marginBottom: 4 },
  exampleId: { fontSize: 9, color: "#64748b" },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0891b2",
    marginTop: 25,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    borderLeft: 3,
    borderLeftColor: "#22d3ee",
    paddingLeft: 8,
  },
  contentH2: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: 15,
    marginBottom: 8,
  },
  contentParagraph: {
    fontSize: 10.5,
    lineHeight: 1.6,
    marginBottom: 10,
    color: "#334155",
  },

  table: {
    marginTop: 5,
    borderRadius: 4,
    overflow: "hidden",
    border: 1,
    borderColor: "#e2e8f0",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    padding: 10,
    borderBottom: 1,
    borderBottomColor: "#e2e8f0",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: 1,
    borderBottomColor: "#f1f5f9",
    padding: 10,
    alignItems: "center",
  },
  tableRowZebra: { backgroundColor: "#f8fafc" },
  cellHeader: {
    fontSize: 9,
    color: "#64748b",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  cellKanji: { fontSize: 12, fontWeight: "bold", color: "#0f172a" },

  footer: {
    position: "absolute",
    bottom: 30,
    left: 45,
    right: 45,
    borderTop: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
    color: "#94a3b8",
  },
});

export const LessonPdfTemplate = ({ lessonData }: { lessonData: any }) => {
  const vocabList =
    lessonData.vocabList?.filter((i: any) => i._type === "kosakata") || [];
  const verbList =
    lessonData.vocabList?.filter((i: any) => i._type === "verb_dictionary") ||
    [];

  const renderRichText = (blocks: any[]) => {
    if (!blocks || !Array.isArray(blocks)) return null;
    return blocks.map((block: any, index: number) => {
      // 1. Handle Teks Biasa (H2, H3, Paragraph)
      if (block._type === "block") {
        const textContent =
          block.children?.map((c: any) => c.text).join("") || "";
        if (block.style === "h2")
          return (
            <Text key={index} style={styles.contentH2}>
              {textContent}
            </Text>
          );
        return (
          <Text key={index} style={styles.contentParagraph}>
            {textContent}
          </Text>
        );
      }

      // 2. Handle Custom Type: exampleSentence (Sesuai Skema Sanity)
      if (block._type === "exampleSentence") {
        return (
          <View key={index} style={styles.exampleBox} wrap={false}>
            <Text style={styles.exampleFurigana}>{block.furigana}</Text>
            <Text style={styles.exampleJp}>{block.jp}</Text>
            <Text style={styles.exampleId}>{block.id}</Text>
          </View>
        );
      }
      return null;
    });
  };

  return (
    <Document title={lessonData.title}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image src="/logo-branding.png" style={styles.logoImage} />
            <Text style={styles.brandName}>NIHONGO ROUTE</Text>
          </View>
          <Text style={styles.levelBadge}>{lessonData.levelTitle || "N5"}</Text>
        </View>

        <Text style={styles.title}>{lessonData.title}</Text>

        {/* Render Articles & Grammar (Termasuk Contoh Kalimat di dalamnya) */}
        {lessonData.articles && (
          <View>{renderRichText(lessonData.articles)}</View>
        )}

        {lessonData.grammar && (
          <View>
            <Text style={styles.sectionTitle}>Materi Inti (文法)</Text>
            {renderRichText(lessonData.grammar)}
          </View>
        )}

        {/* Tabel Kosakata */}
        {vocabList.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Target Kosakata</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <View style={{ width: "25%" }}>
                  <Text style={styles.cellHeader}>Kata</Text>
                </View>
                <View style={{ width: "25%" }}>
                  <Text style={styles.cellHeader}>Furigana</Text>
                </View>
                <View style={{ width: "50%" }}>
                  <Text style={styles.cellHeader}>Arti</Text>
                </View>
              </View>
              {vocabList.map((item: any, idx: number) => (
                <View
                  key={idx}
                  style={[
                    styles.tableRow,
                    idx % 2 !== 0 ? styles.tableRowZebra : {},
                  ]}
                  wrap={false}
                >
                  <View style={{ width: "25%" }}>
                    <Text style={styles.cellKanji}>{item.word}</Text>
                  </View>
                  <View style={{ width: "25%" }}>
                    <Text style={{ fontSize: 10 }}>{item.furigana}</Text>
                  </View>
                  <View style={{ width: "50%" }}>
                    <Text style={{ fontSize: 10 }}>{item.meaning}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text>www.nihongoroute.my.id</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Halaman ${pageNumber} dari ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};
