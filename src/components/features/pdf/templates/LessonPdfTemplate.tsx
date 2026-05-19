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
import { formatQuizzes } from "@/lib/utils/lesson-utils";

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
    borderBottomWidth: 2,
    borderBottomColor: "#0891b2",
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
    fontSize: 11,
    lineHeight: 1.6,
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
    alignItems: "flex-start",
    minHeight: 40,
  },
  tableRowZebra: { backgroundColor: "#f8fafc" },
  // CELLS
  cellNo: { width: "5%", paddingRight: 5 },
  cellWord: { width: "22%", paddingRight: 10, flexWrap: "wrap" },
  cellReading: { width: "22%", paddingRight: 10, flexWrap: "wrap" },
  cellRomaji: { width: "18%", paddingRight: 10, flexWrap: "wrap" },
  cellMeaning: { width: "33%", flexWrap: "wrap" },
  
  kanjiText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
  },
  kanaText: {
    fontSize: 9,
    color: "#0891b2",
    fontWeight: "bold",
  },
  romajiText: {
    fontSize: 7,
    color: "#64748b",
  },
  meaningText: {
    fontSize: 9,
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
 
export const LessonPdfTemplate = ({ lessonData }: { lessonData: any }) => {
  const combinedVocabList = lessonData.vocabList || lessonData.vocab_list || [];
  const contentBlocks = lessonData.articles || lessonData.content_blocks || [];
  const grammarBlocks = lessonData.grammar || [];
  const quizzesList = formatQuizzes(lessonData.quizzes || lessonData.questions || []);

  // ======================
  // HELPER FUNCTIONS
  // ======================

  const stripEmojisOnly = (text?: string): string => {
    if (!text) return "";
    return text
      .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "")
      .replace(/[\u2600-\u27BF]/g, "")
      .trim();
  };

  const stripEmojisAndPrefixes = (text?: string): string => {
    if (!text) return "";
    let cleaned = text
      .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "")
      .replace(/[\u2600-\u27BF]/g, "")
      .trim();
    // Menghapus prefix list seperti "1. ", "A. ", "a) "
    cleaned = cleaned.replace(/^[0-9a-zA-Z\u2160-\u217F\u2460-\u249B]+[\.\)\:\-\/ー\uFF0E\uFF09\uFF1A]+\s*/, "").trim();
    return cleaned;
  };

  const formatMeaning = (text?: string) => {
    if (!text) return "—";
    const parts = text.split(/[,;]/).map((s: string) => s.trim()).filter(Boolean);
    return parts.length > 2 ? `${parts.slice(0, 2).join(", ")}, dll.` : text;
  };

  const renderRichText = (blocks: any[]) => {
    if (!blocks || !Array.isArray(blocks)) return null;
    let h2Counter = 0;
     
    return blocks.map((block: any, index: number) => {
      const type = block._type || block.type || "text";

      if (type === "block") {
        const textContent = block.children?.map((c: any) => c.text).join("") || "";
        if (block.style === "h2") {
          h2Counter++;
          const sanitizedText = stripEmojisAndPrefixes(textContent);
          return <Text key={index} style={styles.contentH2}>{h2Counter}. {sanitizedText}</Text>;
        }
        return <Text key={index} style={styles.contentParagraph}>{stripEmojisOnly(textContent)}</Text>;
      }

      if (type === "exampleSentence") {
        return (
          <View key={index} style={styles.exampleBox} wrap={false}>
            <Text style={styles.exampleJp}>{block.jp}</Text>
            <Text style={[styles.exampleFurigana, { marginTop: 4, color: "#64748b" }]}>
              {block.romaji}
            </Text>
            <Text style={styles.exampleId}>{stripEmojisOnly(block.id)}</Text>
          </View>
        );
      }

      if (type === "callout" || type === "calloutBlock") {
        return (
          <View key={index} style={styles.calloutBox} wrap={false}>
            <Text style={styles.calloutTitle}>{stripEmojisOnly(block.title) || "Note"}</Text>
            <Text style={styles.calloutText}>{stripEmojisOnly(block.text || block.content)}</Text>
            {block.translation && (
              <Text style={[styles.calloutText, { color: "#64748b", marginTop: 4 }]}>
                {stripEmojisOnly(block.translation)}
              </Text>
            )}
          </View>
        );
      }

      if (type === "grammar" || type === "grammarBlock") {
        return (
          <View key={index} style={{ marginBottom: 20, padding: 10, borderLeftWidth: 3, borderLeftColor: "#0891b2" }} wrap={false}>
            <Text style={{ fontSize: 9, fontWeight: "bold", color: "#64748b", textTransform: "uppercase" }}>Grammar Point</Text>
            {block.title && <Text style={styles.contentH2}>{stripEmojisOnly(block.title)}</Text>}
            {block.content && <Text style={{ fontSize: 14, fontWeight: "bold", color: "#0f172a", marginBottom: 4 }}>{block.content}</Text>}
            {block.furigana && <Text style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>{block.furigana}</Text>}
            {block.translation && <Text style={{ fontSize: 10, color: "#64748b", marginBottom: 8 }}>{stripEmojisOnly(block.translation)}</Text>}
            
            {block.examples?.map((ex: any, exIdx: number) => (
              <View key={`ex-${exIdx}`} style={styles.exampleBox} wrap={false}>
                <Text style={styles.exampleJp}>{ex.jp}</Text>
                {ex.romaji && <Text style={[styles.exampleFurigana, { marginTop: 4, color: "#64748b" }]}>{ex.romaji}</Text>}
                <Text style={styles.exampleId}>{stripEmojisOnly(ex.id)}</Text>
              </View>
            ))}
          </View>
        );
      }

      if (type === "dialogue" || type === "dialogueBlock") {
        const lines = block.content ? block.content.split("\n").filter(Boolean) : [];
        return (
          <View key={index} style={{ marginBottom: 15, padding: 15, backgroundColor: "#f8fafc", borderRadius: 8, borderWidth: 1, borderColor: "#e2e8f0" }} wrap={false}>
            {block.title && <Text style={[styles.contentH2, { marginTop: 0 }]}>{stripEmojisOnly(block.title)}</Text>}
            {lines.map((line: string, lIdx: number) => {
              const parts = line.split(/[：:]/);
              const speaker = parts.length > 1 ? parts[0].trim() : `Person ${lIdx + 1}`;
              const text = parts.length > 1 ? parts.slice(1).join("：").trim() : line.trim();
              return (
                <View key={`line-${lIdx}`} style={{ flexDirection: "row", marginBottom: 8 }}>
                  <Text style={{ width: "20%", fontSize: 9, fontWeight: "bold", color: "#0891b2" }}>{speaker}</Text>
                  <Text style={{ width: "80%", fontSize: 10, color: "#0f172a", lineHeight: 1.5 }}>{text}</Text>
                </View>
              );
            })}
            {block.translation && (
              <Text style={{ fontSize: 9, color: "#64748b", marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#e2e8f0" }}>
                {stripEmojisOnly(block.translation)}
              </Text>
            )}
          </View>
        );
      }

      if (type === "text" || type === "article") {
        return (
          <View key={index} style={{ marginBottom: 15 }} wrap={false}>
            {block.title && <Text style={styles.contentH2}>{stripEmojisOnly(block.title)}</Text>}
            {block.content && block.content.split("\n").filter(Boolean).map((line: string, lIdx: number) => (
              <Text key={`line-${lIdx}`} style={styles.contentParagraph}>{stripEmojisOnly(line)}</Text>
            ))}
            {block.translation && (
              <Text style={[styles.contentParagraph, { color: "#64748b", borderLeftWidth: 2, borderLeftColor: "#e2e8f0", paddingLeft: 8 }]}>
                {stripEmojisOnly(block.translation)}
              </Text>
            )}
            {block.examples?.map((ex: any, exIdx: number) => (
              <View key={`ex-${exIdx}`} style={styles.exampleBox} wrap={false}>
                <Text style={styles.exampleJp}>{ex.jp}</Text>
                {ex.romaji && <Text style={[styles.exampleFurigana, { marginTop: 4, color: "#64748b" }]}>{ex.romaji}</Text>}
                <Text style={styles.exampleId}>{stripEmojisOnly(ex.id)}</Text>
              </View>
            ))}
          </View>
        );
      }

      return null;
    });
  };

  return (
    <Document title={stripEmojisOnly(lessonData.title)}>
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
          <Text style={styles.levelBadge}>{lessonData.levelTitle || "N5"}</Text>
        </View>

        <Text style={styles.title}>{stripEmojisOnly(lessonData.title)}</Text>

        {/* ARTICLES & CONTENT BLOCKS SECTION */}
        {contentBlocks.length > 0 && (
          <View style={{ marginBottom: 30 }}>{renderRichText(contentBlocks)}</View>
        )}

        {/* LEGACY GRAMMAR SECTION */}
        {grammarBlocks.length > 0 && (
          <View style={{ marginBottom: 40 }}>
            <Text style={styles.sectionTitle}>Materi Inti (文法)</Text>
            <View style={{ display: "flex", flexDirection: "column" }}>
              {renderRichText(grammarBlocks)}
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
                      {formatMeaning(item.meaning)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* QUIZ SECTION */}
        {quizzesList.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Latihan Pemahaman</Text>
            {quizzesList.map((quiz: any, qIdx: number) => {
              const alphabet = ["A", "B", "C", "D"];
              return (
                <View key={qIdx} style={styles.quizBox} wrap={false}>
                  <Text style={styles.quizQuestion}>
                    {qIdx + 1}. {stripEmojisOnly(quiz.question)}
                  </Text>
                  {quiz.options?.map((opt: string, oIdx: number) => {
                    const isCorrect = opt === quiz.answer;
                    return (
                      <Text
                        key={oIdx}
                        style={
                          isCorrect ? styles.quizCorrect : styles.quizOption
                        }
                      >
                        {alphabet[oIdx]}. {opt}
                        {isCorrect ? " (✓ Correct Answer)" : ""}
                      </Text>
                    );
                  })}
                  {quiz.explanation && (
                    <Text style={styles.quizExplanation}>
                      Note: {stripEmojisOnly(quiz.explanation)}
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
