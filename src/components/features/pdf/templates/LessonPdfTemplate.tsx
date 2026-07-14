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

// Register Noto Sans JP font to support Japanese characters in PDF generation
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

/**
 * Stylesheet definitions for the PDF document layout and typography.
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

  // TYPOGRAPHY
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 15,
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: "bold",
    color: "#0284c7",
    marginTop: 25,
    marginBottom: 15,
    textTransform: "uppercase",
    letterSpacing: 1,
    borderLeftWidth: 3,
    borderLeftColor: "#0284c7",
    paddingLeft: 8,
  },
  contentH2: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 12,
    marginBottom: 8,
  },
  contentParagraph: {
    fontSize: 9.5,
    lineHeight: 1.6,
    marginBottom: 12,
    color: "#475569",
  },

  // EXAMPLE BOX
  exampleBox: {
    backgroundColor: "#fafaf9",
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#0284c7",
    borderRadius: 4,
    display: "flex",
    flexDirection: "column",
  },
  exampleFurigana: { 
    fontSize: 7.5, 
    color: "#0284c7", 
    marginBottom: 2,
    fontWeight: "bold"
  },
  exampleJp: { 
    fontSize: 12.5, 
    fontWeight: "bold", 
    color: "#0f172a",
  },
  exampleId: { 
    fontSize: 8.5, 
    color: "#64748b", 
    marginTop: 4,
  },

  // CALLOUT BOX
  calloutBox: {
    backgroundColor: "rgba(2, 132, 199, 0.03)",
    padding: 12,
    marginTop: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#0284c7",
    borderRadius: 4,
  },
  calloutTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#0284c7",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  calloutText: { 
    fontSize: 9, 
    color: "#334155", 
    lineHeight: 1.5 
  },

  // QUIZ BOX
  quizBox: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#fafaf9",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  quizQuestion: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 10,
    lineHeight: 1.4,
  },
  quizOption: {
    fontSize: 9,
    color: "#475569",
    marginLeft: 8,
    marginBottom: 5,
    padding: 3,
  },
  quizCorrect: {
    fontSize: 9,
    color: "#10b981",
    marginLeft: 8,
    marginBottom: 5,
    padding: 3,
    fontWeight: "bold",
    backgroundColor: "#f0fdf4",
    borderRadius: 4,
  },
  quizExplanation: {
    fontSize: 8.5,
    color: "#64748b",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },

  // VOCAB TABLE
  table: {
    marginTop: 12,
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    padding: 12,
  },
  headerText: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f4",
    padding: 10,
    alignItems: "flex-start",
    minHeight: 35,
  },
  tableRowZebra: { backgroundColor: "#fafaf9" },
  // CELLS
  cellNo: { width: "5%", paddingRight: 5 },
  cellWord: { width: "23%", paddingRight: 10, flexWrap: "wrap" },
  cellReading: { width: "23%", paddingRight: 10, flexWrap: "wrap" },
  cellRomaji: { width: "17%", paddingRight: 10, flexWrap: "wrap" },
  cellMeaning: { width: "32%", flexWrap: "wrap" },
  
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
    color: "#64748b",
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
    color: "#94a3b8" 
  },
  footerLink: {
    fontSize: 7.5,
    color: "#0284c7",
    fontWeight: "bold",
    textDecoration: "none",
  },
});

// ======================
// MAIN EXECUTION
// ======================

/**
 * Represents a vocabulary item in the PDF template.
 */
export interface PdfVocabItem {
  word?: string;
  furigana?: string;
  romaji?: string;
  meaning?: string;
}

/**
 * Represents a quiz item in the PDF template.
 */
export interface PdfQuizItem {
  question?: string;
  options?: string[];
  answer?: string;
  explanation?: string;
}

/**
 * Represents a rich text content block in the PDF template.
 */
export interface PdfContentBlock {
  _type?: string;
  type?: string;
  style?: string;
  children?: { text?: string }[];
  jp?: string;
  romaji?: string;
  id?: string;
  title?: string;
  text?: string;
  content?: string;
  translation?: string;
  furigana?: string;
  examples?: { jp?: string; romaji?: string; id?: string }[];
}

/**
 * Represents the complete lesson data structure passed to the PDF template.
 */
export interface PdfLessonData {
  title?: string;
  levelTitle?: string;
  vocabList?: PdfVocabItem[];
  vocab_list?: PdfVocabItem[];
  articles?: PdfContentBlock[];
  content_blocks?: PdfContentBlock[];
  grammar?: PdfContentBlock[];
  quizzes?: PdfQuizItem[];
  questions?: PdfQuizItem[];
}

/**
 * LessonPdfTemplate component. Renders a structured PDF document for a lesson.
 * Supports vocabulary tables, grammar points, dialogue blocks, and quizzes.
 * 
 * @param props - Component properties.
 * @param props.lessonData - The lesson data to render.
 */
export const LessonPdfTemplate = ({ lessonData }: { lessonData: PdfLessonData }) => {
  const combinedVocabList = lessonData.vocabList || lessonData.vocab_list || [];
  const contentBlocks = lessonData.articles || lessonData.content_blocks || [];
  const grammarBlocks = lessonData.grammar || [];
  const quizzesList = formatQuizzes((lessonData.quizzes || lessonData.questions || []) as unknown as import("@/lib/utils/lesson-utils").RawQuizItem[]);

  // ======================
  // HELPER FUNCTIONS
  // ======================

  /**
   * Removes emojis from text to prevent rendering issues in react-pdf.
   * 
   * @param text - The input text.
   * @returns Cleaned text without emojis.
   */
  const stripEmojisOnly = (text?: string): string => {
    if (!text) return "";
    return text
      .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "")
      .replace(/[\u2600-\u27BF]/g, "")
      .trim();
  };

  /**
   * Removes emojis and list prefixes (e.g., "1. ", "A. ") from text.
   * 
   * @param text - The input text.
   * @returns Cleaned text.
   */
  const stripEmojisAndPrefixes = (text?: string): string => {
    if (!text) return "";
    let cleaned = text
      .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "")
      .replace(/[\u2600-\u27BF]/g, "")
      .trim();
    // Remove list prefixes like "1. ", "A. ", "a) "
    cleaned = cleaned.replace(/^[0-9a-zA-Z\u2160-\u217F\u2460-\u249B]+[\.\)\:\-\/ー\uFF0E\uFF09\uFF1A]+\s*/, "").trim();
    return cleaned;
  };

  /**
   * Formats vocabulary meaning text, limiting items and appending "dll." if too long.
   * 
   * @param text - The meaning text.
   * @returns Formatted meaning string.
   */
  const formatMeaning = (text?: string) => {
    if (!text) return "—";
    const parts = text.split(/[,;]/).map((s: string) => s.trim()).filter(Boolean);
    return parts.length > 2 ? `${parts.slice(0, 2).join(", ")}, dll.` : text;
  };

  /**
   * Parses markdown-like inline styles (**bold**, `code`, *italic*) into react-pdf Text components.
   * 
   * @param text - The raw text containing inline styles.
   * @param baseStyle - Base style to apply to the parent Text component.
   * @param key - Unique React key.
   * @returns React element containing styled Text components.
   */
  const parseInlineStylesPdf = (text: string, baseStyle: React.ComponentProps<typeof View>["style"] = {}, key?: string) => {
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
              <Text key={index} style={{ backgroundColor: "#f1f5f9", color: "#0284c7" }}>
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

  /**
   * Renders rich text content blocks based on block type.
   * 
   * @param blocks - Array of content blocks.
   * @returns Array of rendered React elements.
   */
  const renderRichText = (blocks: PdfContentBlock[]) => {
    if (!blocks || !Array.isArray(blocks)) return null;
    let h2Counter = 0;
     
    return blocks.map((block: PdfContentBlock, pos: number) => {
      const type = block._type || block.type || "text";

      if (type === "block") {
        const textContent = block.children?.map((c: { text?: string }) => c.text).join("") || "";
        if (block.style === "h2") {
          h2Counter++;
          const sanitizedText = stripEmojisAndPrefixes(textContent);
          return parseInlineStylesPdf(`${h2Counter}. ${sanitizedText}`, styles.contentH2, `h2-${pos}`);
        }
        return parseInlineStylesPdf(stripEmojisOnly(textContent), styles.contentParagraph, `paragraph-${pos}`);
      }

      if (type === "exampleSentence") {
        return (
          <View key={`exSentence-${pos}`} style={styles.exampleBox} wrap={false}>
            <Text style={styles.exampleJp}>{block.jp}</Text>
            <Text style={[styles.exampleFurigana, { marginTop: 3, color: "#64748b" }]}>
              {block.romaji}
            </Text>
            {parseInlineStylesPdf(stripEmojisOnly(block.id), styles.exampleId, `exSentenceId-${pos}`)}
          </View>
        );
      }

      if (type === "callout" || type === "calloutBlock") {
        return (
          <View key={`callout-${pos}`} style={styles.calloutBox} wrap={false}>
            {block.title && <Text style={styles.calloutTitle}>{stripEmojisOnly(block.title)}</Text>}
            {parseInlineStylesPdf(stripEmojisOnly(block.text || block.content), styles.calloutText, `calloutText-${pos}`)}
            {block.translation && parseInlineStylesPdf(stripEmojisOnly(block.translation), [styles.calloutText, { color: "#64748b", marginTop: 4 }], `calloutTranslation-${pos}`)}
          </View>
        );
      }

      if (type === "grammar" || type === "grammarBlock") {
        return (
          <View key={`grammar-${pos}`} style={{ marginBottom: 20, padding: 15, borderLeftWidth: 3, borderLeftColor: "#0284c7", backgroundColor: "rgba(2, 132, 199, 0.02)", borderRadius: 4 }} wrap={false}>
            <Text style={{ fontSize: 7.5, fontWeight: "bold", color: "#0284c7", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Grammar Point</Text>
            {block.title && <Text style={[styles.contentH2, { marginTop: 0, marginBottom: 6 }]}>{stripEmojisOnly(block.title)}</Text>}
            {block.content && block.content !== block.title && <Text style={{ fontSize: 13, fontWeight: "bold", color: "#0f172a", marginBottom: 4 }}>{block.content}</Text>}
            {block.furigana && block.furigana !== block.title && block.furigana !== block.content && <Text style={{ fontSize: 8.5, color: "#64748b", marginBottom: 4 }}>{block.furigana}</Text>}
            {block.translation && parseInlineStylesPdf(stripEmojisOnly(block.translation), { fontSize: 9, color: "#64748b", marginBottom: 8 }, `grammarTranslation-${pos}`)}
            
            {block.examples?.map((ex: { jp?: string; romaji?: string; id?: string }, exPos: number) => (
              <View key={`ex-${exPos}`} style={styles.exampleBox} wrap={false}>
                <Text style={styles.exampleJp}>{ex.jp}</Text>
                {ex.romaji && <Text style={[styles.exampleFurigana, { marginTop: 3, color: "#64748b" }]}>{ex.romaji}</Text>}
                {parseInlineStylesPdf(stripEmojisOnly(ex.id), styles.exampleId, `grammarExId-${exPos}`)}
              </View>
            ))}
          </View>
        );
      }

      if (type === "dialogue" || type === "dialogueBlock") {
        const lines = block.content ? block.content.split("\n").filter(Boolean) : [];
        return (
          <View key={`dialogue-${pos}`} style={{ marginBottom: 15, padding: 15, backgroundColor: "#fafaf9", borderRadius: 6, borderWidth: 1, borderColor: "#e2e8f0" }} wrap={false}>
            {block.title && <Text style={[styles.contentH2, { marginTop: 0, marginBottom: 10 }]}>{stripEmojisOnly(block.title)}</Text>}
            {lines.map((line: string, lPos: number) => {
              const parts = line.split(/[：:]/);
              const speaker = parts.length > 1 ? parts[0].trim() : `Person ${lPos + 1}`;
              const text = parts.length > 1 ? parts.slice(1).join("：").trim() : line.trim();
              return (
                <View key={`line-${lPos}`} style={{ flexDirection: "row", marginBottom: 8, alignItems: "flex-start" }}>
                  <Text style={{ width: "22%", fontSize: 8.5, fontWeight: "bold", color: "#0284c7" }}>{speaker}</Text>
                  <Text style={{ width: "78%", fontSize: 9, color: "#0f172a", lineHeight: 1.5 }}>{text}</Text>
                </View>
              );
            })}
            {block.translation && parseInlineStylesPdf(stripEmojisOnly(block.translation), { fontSize: 8.5, color: "#64748b", marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#e2e8f0" }, `dialogueTranslation-${pos}`)}
          </View>
        );
      }

      if (type === "text" || type === "article") {
        const paragraphs = block.content ? block.content.split("\n").filter(Boolean) : [];
        return (
          <View key={`textArticle-${pos}`} style={{ marginBottom: 15 }} wrap={false}>
            {block.title && <Text style={styles.contentH2}>{stripEmojisOnly(block.title)}</Text>}
            {paragraphs.map((line: string, lPos: number) => (
              <React.Fragment key={`line-${lPos}`}>
                {parseInlineStylesPdf(stripEmojisOnly(line), styles.contentParagraph, `lineText-${lPos}`)}
              </React.Fragment>
            ))}
            {block.translation && parseInlineStylesPdf(stripEmojisOnly(block.translation), [styles.contentParagraph, { color: "#64748b", borderLeftWidth: 2, borderLeftColor: "#e2e8f0", paddingLeft: 8, marginLeft: 2 }], `translationText-${pos}`)}
            {block.examples?.map((ex: { jp?: string; romaji?: string; id?: string }, exPos: number) => (
              <View key={`ex-${exPos}`} style={styles.exampleBox} wrap={false}>
                <Text style={styles.exampleJp}>{ex.jp}</Text>
                {ex.romaji && <Text style={[styles.exampleFurigana, { marginTop: 3, color: "#64748b" }]}>{ex.romaji}</Text>}
                {parseInlineStylesPdf(stripEmojisOnly(ex.id), styles.exampleId, `articleExId-${exPos}`)}
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
              {combinedVocabList.map((item: PdfVocabItem, pos: number) => (
                <View
                  key={`vocab-${pos}`}
                  style={[
                    styles.tableRow,
                    pos % 2 !== 0 ? styles.tableRowZebra : {},
                  ]}
                >
                  <View style={styles.cellNo}>
                    <Text style={styles.romajiText}>{pos + 1}</Text>
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
            {quizzesList.map((quiz: PdfQuizItem, qPos: number) => {
              const alphabet = ["A", "B", "C", "D"];
              return (
                <View key={`quiz-${qPos}`} style={styles.quizBox} wrap={false}>
                  <Text style={styles.quizQuestion}>
                    {qPos + 1}. {stripEmojisOnly(quiz.question)}
                  </Text>
                  {quiz.options?.map((opt: string, oPos: number) => {
                    const isCorrect = opt === quiz.answer;
                    return (
                      <Text
                        key={`opt-${oPos}`}
                        style={
                          isCorrect ? styles.quizCorrect : styles.quizOption
                        }
                      >
                        {alphabet[oPos]}. {opt}
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
          {/* @ts-expect-error - suppressHydrationWarning is standard in React but not defined in react-pdf types */}
          <Text style={styles.footerText} suppressHydrationWarning={true}>
            © {new Date().getFullYear()} NihongoRoute. Dicetak pada {new Date().toLocaleDateString('id-ID')}.
          </Text>
          <Link style={styles.footerLink} src="https://nihongoroute.my.id">
            nihongoroute.my.id
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