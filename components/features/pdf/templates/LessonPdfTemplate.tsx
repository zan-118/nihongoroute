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
  Image,
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

  // TYPOGRAPHY
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0891b2",
    marginTop: 35,
    marginBottom: 20,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    borderLeftWidth: 3,
    borderLeftColor: "#0891b2",
    paddingLeft: 10,
  },
  contentH2: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 15,
    marginBottom: 10,
  },
  contentParagraph: {
    fontSize: 10,
    lineHeight: 1.8,
    marginBottom: 15,
    color: "#475569",
  },

  // EXAMPLE BOX
  exampleBox: {
    backgroundColor: "#f8fafc",
    padding: 15,
    marginTop: 15,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: "#0f172a",
    display: "flex",
    flexDirection: "column",
  },
  exampleFurigana: { 
    fontSize: 8, 
    color: "#0891b2", 
    marginBottom: 2,
    fontWeight: "bold"
  },
  exampleJp: { 
    fontSize: 13, 
    fontWeight: "bold", 
    color: "#0f172a",
  },
  exampleId: { 
    fontSize: 9, 
    color: "#64748b", 
    marginTop: 4,
  },

  // CALLOUT BOX
  calloutBox: {
    backgroundColor: "#f0f9ff",
    padding: 15,
    marginTop: 15,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: "#0369a1",
  },
  calloutTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0369a1",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  calloutText: { 
    fontSize: 10, 
    color: "#334155", 
    lineHeight: 1.5 
  },

  // QUIZ BOX
  quizBox: {
    marginBottom: 25,
    padding: 20,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  quizQuestion: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 12,
    lineHeight: 1.4,
  },
  quizOption: {
    fontSize: 10,
    color: "#475569",
    marginLeft: 10,
    marginBottom: 6,
    padding: 4,
  },
  quizCorrect: {
    fontSize: 10,
    color: "#059669",
    marginLeft: 10,
    marginBottom: 6,
    padding: 4,
    fontWeight: "bold",
    backgroundColor: "#f0fdf4",
    borderRadius: 4,
  },
  quizExplanation: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },

  // VOCAB TABLE
  table: {
    marginTop: 15,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    padding: 15,
  },
  headerText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    padding: 12,
    alignItems: "center",
  },
  tableRowZebra: { backgroundColor: "#f8fafc" },
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
    color: "#64748b",
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
    color: "#94a3b8" 
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
 * Komponen LessonPdfTemplate: Menyusun struktur visual PDF untuk satu materi pelajaran.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LessonPdfTemplate = ({ lessonData }: { lessonData: any }) => {
  const combinedVocabList = lessonData.vocabList || [];

  // ======================
  // HELPER FUNCTIONS
  // ======================

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderRichText = (blocks: any[]) => {
    if (!blocks || !Array.isArray(blocks)) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return blocks.map((block: any, index: number) => {
      if (block._type === "block") {
        const textContent =
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            {/* Jepang Paling Atas */}
            <Text style={styles.exampleJp}>{block.jp}</Text>
            {/* Romaji di Tengah */}
            <Text style={[styles.exampleFurigana, { marginTop: 4, color: "#64748b" }]}>
              {block.romaji}
            </Text>
            {/* Arti di Bawah */}
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

  return (
    <Document title={lessonData.title}>
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
          <Text style={styles.levelBadge}>{lessonData.levelTitle || "N5"}</Text>
        </View>

        <Text style={styles.title}>{lessonData.title}</Text>

        {/* ARTICLES SECTION */}
        {lessonData.articles && (
          <View style={{ marginBottom: 30 }}>{renderRichText(lessonData.articles)}</View>
        )}

        {/* GRAMMAR SECTION */}
        {lessonData.grammar && (
          <View style={{ marginBottom: 40 }}>
            <Text style={styles.sectionTitle}>Materi Inti (文法)</Text>
            <View style={{ display: "flex", flexDirection: "column" }}>
              {renderRichText(lessonData.grammar)}
            </View>
          </View>
        )}

        {/* VOCAB TABLE SECTION */}
        {combinedVocabList.length > 0 && (
          <View style={{ marginTop: 20, marginBottom: 40 }}>
            <Text style={styles.sectionTitle}>Target Kosakata</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader} fixed>
                <View style={styles.cellNo}>
                  <Text style={styles.headerText}>No</Text>
                </View>
                <View style={styles.cellWord}>
                  <Text style={styles.headerText}>Kosakata</Text>
                </View>
                <View style={styles.cellReading}>
                  <Text style={styles.headerText}>Furigana</Text>
                </View>
                <View style={styles.cellRomaji}>
                  <Text style={styles.headerText}>Romaji</Text>
                </View>
                <View style={styles.cellMeaning}>
                  <Text style={styles.headerText}>Arti / Makna</Text>
                </View>
              </View>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {combinedVocabList.map((item: any, idx: number) => (
                <View
                  key={idx}
                  style={[
                    styles.tableRow,
                    idx % 2 !== 0 ? styles.tableRowZebra : {},
                  ]}
                >
                  <View style={styles.cellNo}>
                    <Text style={styles.romajiText}>{idx + 1}</Text>
                  </View>
                  <View style={styles.cellWord}>
                    <Text style={styles.kanjiText}>{item.word}</Text>
                  </View>
                  <View style={styles.cellReading}>
                    <Text style={styles.kanaText}>
                      {item.furigana || "—"}
                    </Text>
                  </View>
                  <View style={styles.cellRomaji}>
                    <Text style={styles.romajiText}>
                      {item.romaji}
                    </Text>
                  </View>
                  <View style={styles.cellMeaning}>
                    <Text style={styles.meaningText}>
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
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {lessonData.quizzes.map((quiz: any, qIdx: number) => {
              const alphabet = ["A", "B", "C", "D"];
              return (
                <View key={qIdx} style={styles.quizBox} wrap={false}>
                  <Text style={styles.quizQuestion}>
                    {qIdx + 1}. {quiz.question}
                  </Text>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {quiz.options?.map((opt: any, oIdx: number) => (
                    <Text
                      key={oIdx}
                      style={
                        opt.isCorrect ? styles.quizCorrect : styles.quizOption
                      }
                    >
                      {alphabet[oIdx]}. {opt.text}{" "}
                      {opt.isCorrect ? " (✓ Correct Answer)" : ""}
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
            © {new Date().getFullYear()} NihongoRoute. Dicetak pada {new Date().toLocaleDateString('id-ID')}.
          </Text>
          <Link style={styles.footerLink} src="https://www.nihongoroute.my.id">
            www.nihongoroute.my.id
          </Link>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Halaman ${pageNumber} dari ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};
