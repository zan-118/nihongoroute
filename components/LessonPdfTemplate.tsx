/**
 * @file LessonPdfTemplate.tsx
 * @description Template dokumen PDF untuk materi pelajaran (Lessons).
 * Mengatur tata letak, tipografi, dan komponen visual untuk ekspor materi.
 * @module LessonPdfTemplate
 */

import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Link,
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#b91c1c",
    letterSpacing: 1.5,
  },
  tagline: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 2,
    textTransform: "uppercase",
  },
  levelBadge: {
    backgroundColor: "#fef2f2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
    fontSize: 10,
    color: "#b91c1c",
    fontWeight: "bold",
    borderWidth: 1,
    borderColor: "#ef4444",
  },

  // TYPOGRAPHY
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#b91c1c",
    marginTop: 25,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    borderLeftWidth: 3,
    borderLeftColor: "#ef4444",
    paddingLeft: 8,
  },
  contentH2: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: 15,
    marginBottom: 10,
  },
  contentParagraph: {
    fontSize: 10,
    lineHeight: 1.6,
    marginBottom: 10,
    color: "#334155",
  },

  // PORTABLE TEXT COMPONENTS
  exampleBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  exampleFurigana: { fontSize: 8, color: "#b91c1c", marginBottom: 2 },
  exampleJp: { fontSize: 13, fontWeight: "bold", color: "#0f172a" },
  exampleId: { fontSize: 9, color: "#64748b", marginTop: 4 },

  calloutBox: {
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#fee2e2",
  },
  calloutTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#b91c1c",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  calloutText: { fontSize: 10, color: "#334155", lineHeight: 1.5 },

  // QUIZ COMPONENTS
  quizBox: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  quizQuestion: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 10,
  },
  quizOption: {
    fontSize: 10,
    color: "#475569",
    marginLeft: 10,
    marginBottom: 5,
  },
  quizCorrect: {
    fontSize: 10,
    color: "#059669",
    marginLeft: 10,
    marginBottom: 5,
    fontWeight: "bold",
  },
  quizExplanation: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },

  // VOCAB TABLE
  table: {
    marginTop: 10,
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    padding: 10,
  },
  headerText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#ffffff",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    padding: 10,
    alignItems: "center",
  },
  tableRowZebra: { backgroundColor: "#f8fafc" },
  cellKanji: { fontSize: 12, fontWeight: "bold", color: "#0f172a" },

  // FOOTER
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
    alignItems: "center",
  },
  footerText: { fontSize: 8, color: "#94a3b8" },
  footerUrl: {
    fontSize: 9,
    color: "#0891b2",
    fontWeight: "bold",
    textDecoration: "none",
  },
});

// ======================
// MAIN EXECUTION
// ======================

/**
 * Komponen LessonPdfTemplate: Menyusun struktur visual PDF untuk satu materi pelajaran.
 * 
 * @param {Object} props - Data pelajaran yang akan dirender.
 * @returns {JSX.Element} Dokumen PDF.
 */
export const LessonPdfTemplate = ({ lessonData }: { lessonData: any }) => {
  const combinedVocabList = lessonData.vocabList || [];

  // ======================
  // HELPER FUNCTIONS
  // ======================

  /**
   * Mengonversi Portable Text (Sanity) ke dalam komponen Text react-pdf.
   */
  const renderRichText = (blocks: any[]) => {
    if (!blocks || !Array.isArray(blocks)) return null;
    return blocks.map((block: any, index: number) => {
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

      if (block._type === "exampleSentence") {
        return (
          <View key={index} style={styles.exampleBox} wrap={false}>
            <Text style={styles.exampleFurigana}>{block.furigana}</Text>
            <Text style={styles.exampleJp}>{block.jp}</Text>
            <Text style={styles.exampleId}>{block.id}</Text>
          </View>
        );
      }

      if (block._type === "callout") {
        return (
          <View key={index} style={styles.calloutBox} wrap={false}>
            <Text style={styles.calloutTitle}>{block.title || "Note"}</Text>
            <Text style={styles.calloutText}>{block.text}</Text>
          </View>
        );
      }
      return null;
    });
  };

  // ======================
  // RENDER
  // ======================
  return (
    <Document title={lessonData.title}>
      <Page size="A4" style={styles.page}>
        {/* HEADER SECTION */}
        <View style={styles.header} fixed>
          <View style={styles.logoBox}>
            <Text style={styles.brandName}>NIHONGO ROUTE</Text>
            <Text style={styles.tagline}>Japanese Self-Learning Platform</Text>
          </View>
          <Text style={styles.levelBadge}>{lessonData.levelTitle || "N5"}</Text>
        </View>

        <Text style={styles.title}>{lessonData.title}</Text>

        {/* ARTICLES SECTION */}
        {lessonData.articles && (
          <View>{renderRichText(lessonData.articles)}</View>
        )}

        {/* GRAMMAR SECTION */}
        {lessonData.grammar && (
          <View>
            <Text style={styles.sectionTitle}>Materi Inti (文法)</Text>
            {renderRichText(lessonData.grammar)}
          </View>
        )}

        {/* VOCAB TABLE SECTION */}
        {combinedVocabList.length > 0 && (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>Target Kosakata</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <View style={{ width: "30%" }}>
                  <Text style={styles.headerText}>Word</Text>
                </View>
                <View style={{ width: "30%" }}>
                  <Text style={styles.headerText}>Reading</Text>
                </View>
                <View style={{ width: "40%" }}>
                  <Text style={styles.headerText}>Meaning</Text>
                </View>
              </View>
              {combinedVocabList.map((item: any, idx: number) => (
                <View
                  key={idx}
                  style={[
                    styles.tableRow,
                    idx % 2 !== 0 ? styles.tableRowZebra : {},
                  ]}
                  wrap={false}
                >
                  <View style={{ width: "30%" }}>
                    <Text style={styles.cellKanji}>{item.word}</Text>
                  </View>
                  <View style={{ width: "30%" }}>
                    <Text style={{ fontSize: 10, color: "#334155" }}>
                      {item.furigana || "-"}
                    </Text>
                    <Text style={{ fontSize: 8, color: "#94a3b8" }}>
                      {item.romaji}
                    </Text>
                  </View>
                  <View style={{ width: "40%" }}>
                    <Text style={{ fontSize: 10, color: "#334155" }}>
                      {item.meaning}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* QUIZ SECTION */}
        {lessonData.quizzes && lessonData.quizzes.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Latihan Pemahaman</Text>
            {lessonData.quizzes.map((quiz: any, qIdx: number) => {
              const alphabet = ["A", "B", "C", "D"];
              return (
                <View key={qIdx} style={styles.quizBox} wrap={false}>
                  <Text style={styles.quizQuestion}>
                    {qIdx + 1}. {quiz.question}
                  </Text>
                  {quiz.options?.map((opt: any, oIdx: number) => (
                    <Text
                      key={oIdx}
                      style={
                        opt.isCorrect ? styles.quizCorrect : styles.quizOption
                      }
                    >
                      {alphabet[oIdx]}. {opt.text}{" "}
                      {opt.isCorrect ? " (✓ Correct)" : ""}
                    </Text>
                  ))}
                  {quiz.explanation && (
                    <Text style={styles.quizExplanation}>
                      Note: {quiz.explanation}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* FOOTER SECTION */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} NihongoRoute
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
};
