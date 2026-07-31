/**
 * @file CertificatePdfTemplate.tsx
 * @description Templat dokumen PDF untuk sertifikat kelulusan ujian simulasi NihongoRoute.
 * Menggunakan registrasi font lokal NotoSansJP untuk stabilitas rendering karakter multibahasa (Jepang & Latin).
 *
 * @package components/features/pdf/templates
 * @project NihongoRoute
 */

// ==========================================
// IMPOR
// ==========================================
import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// ==========================================
// REGISTRASI FONT
// ==========================================
// Register Japanese font. Prevent character corruption.
Font.register({
  family: "NotoSansJP",
  fonts: [
    { src: "/fonts/NotoSansJP-Regular.ttf" },
    { src: "/fonts/NotoSansJP-Bold.ttf", fontWeight: "bold" },
  ],
});

// ==========================================
// GAYA VISUAL (STYLESHEET)
// ==========================================
/**
 * Stylesheet for certificate PDF layout.
 * Define colors, borders, typography, and absolute positioning.
 */
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#0b1329",
    padding: 40,
    fontFamily: "NotoSansJP",
    color: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  border: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    border: "2pt solid #c5a880",
    borderRadius: 8,
  },
  innerBorder: {
    position: "absolute",
    top: 28,
    left: 28,
    right: 28,
    bottom: 28,
    border: "1pt dashed rgba(197, 168, 128, 0.35)",
    borderRadius: 6,
  },
  cornerTL: {
    position: "absolute",
    top: 34,
    left: 34,
    width: 25,
    height: 25,
    borderTopWidth: 2,
    borderTopColor: "#c5a880",
    borderLeftWidth: 2,
    borderLeftColor: "#c5a880",
  },
  cornerTR: {
    position: "absolute",
    top: 34,
    right: 34,
    width: 25,
    height: 25,
    borderTopWidth: 2,
    borderTopColor: "#c5a880",
    borderRightWidth: 2,
    borderRightColor: "#c5a880",
  },
  cornerBL: {
    position: "absolute",
    bottom: 34,
    left: 34,
    width: 25,
    height: 25,
    borderBottomWidth: 2,
    borderBottomColor: "#c5a880",
    borderLeftWidth: 2,
    borderLeftColor: "#c5a880",
  },
  cornerBR: {
    position: "absolute",
    bottom: 34,
    right: 34,
    width: 25,
    height: 25,
    borderBottomWidth: 2,
    borderBottomColor: "#c5a880",
    borderRightWidth: 2,
    borderRightColor: "#c5a880",
  },
  header: {
    marginBottom: 30,
    textAlign: "center",
  },
  title: {
    fontSize: 44,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 2,
    color: "#c5a880",
  },
  subtitle: {
    fontSize: 11,
    color: "#e2e8f0",
    marginTop: 8,
    letterSpacing: 6,
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  content: {
    textAlign: "center",
    marginTop: 20,
    alignItems: "center",
  },
  presentLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 12,
    fontStyle: "italic",
  },
  userName: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#c5a880",
    paddingBottom: 8,
    minWidth: 320,
    textAlign: "center",
  },
  examInfo: {
    fontSize: 13,
    color: "#e2e8f0",
    lineHeight: 1.6,
  },
  scoreContainer: {
    marginTop: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: "rgba(197, 168, 128, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(197, 168, 128, 0.2)",
    borderRadius: 8,
    display: "flex",
    flexDirection: "row",
    gap: 30,
  },
  scoreItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 7,
    color: "#c5a880",
    textTransform: "uppercase",
    marginBottom: 4,
    letterSpacing: 1,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  footer: {
    position: "absolute",
    bottom: 50,
    left: 60,
    right: 60,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  signatureBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: 160,
  },
  signatureLine: {
    width: 150,
    height: 1,
    backgroundColor: "rgba(197, 168, 128, 0.3)",
    marginBottom: 6,
  },
  signatureLabel: {
    fontSize: 7,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  goldSeal: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    borderColor: "#c5a880",
    backgroundColor: "#0f172a",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
  goldSealText: {
    fontSize: 5,
    fontWeight: "bold",
    color: "#c5a880",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  goldSealBadge: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  watermark: {
    position: "absolute",
    bottom: 30,
    right: 40,
    fontSize: 100,
    fontWeight: "bold",
    color: "rgba(197, 168, 128, 0.015)",
  }
});

// ==========================================
// ANTARMUKA & DATA
// ==========================================
/**
 * Data structure for certificate template.
 */
interface CertificateData {
  /** Candidate full name */
  userName: string;
  /** Exam title name */
  examTitle: string;
  /** Final score achieved */
  score: number;
  /** Date of issue formatted */
  date: string;
  /** JLPT level if applicable */
  level?: string;
}

// ==========================================
// KOMPONEN UTAMA (TEMPLAT EKSPOR)
// ==========================================
/**
 * PDF template component. Render landscape A4 certificate.
 * 
 * @param props - Component properties.
 * @param props.data - Certificate data.
 */
export const CertificatePdfTemplate = ({ data }: { data: CertificateData }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      {/* Outer and inner borders */}
      <View style={styles.border} />
      <View style={styles.innerBorder} />
      
      {/* Corner Ornaments */}
      <View style={styles.cornerTL} />
      <View style={styles.cornerTR} />
      <View style={styles.cornerBL} />
      <View style={styles.cornerBR} />
      
      {/* Background Japanese watermark */}
      <Text style={styles.watermark}>合格</Text>

      {/* Header section */}
      <View style={styles.header}>
        <Text style={styles.title}>CERTIFICATE</Text>
        <Text style={styles.subtitle}>OF ACHIEVEMENT</Text>
      </View>

      {/* Main content section */}
      <View style={styles.content}>
        <Text style={styles.presentLabel}>This certificate is proudly presented to</Text>
        <Text style={styles.userName}>{data.userName}</Text>
        <Text style={styles.examInfo}>
          For successfully passing the {data.examTitle} {data.level ? `(${data.level})` : ""}
        </Text>
        
        {/* Score and status box */}
        <View style={styles.scoreContainer}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Final Score</Text>
            <Text style={styles.scoreValue}>{data.score} / 180</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Status</Text>
            <Text style={[styles.scoreValue, { color: "#10b981" }]}>PASSED</Text>
          </View>
        </View>
      </View>

      {/* Footer section with date, seal, and issuer */}
      <View style={styles.footer}>
        <View style={styles.signatureBox}>
          <Text style={{ fontSize: 10, fontWeight: "bold", marginBottom: 5, color: "#ffffff" }}>{data.date}</Text>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>Date of Issue</Text>
        </View>

        <View style={styles.goldSeal}>
          <Text style={styles.goldSealText}>NihongoRoute</Text>
          <Text style={styles.goldSealBadge}>PASSED</Text>
        </View>
        
        <View style={styles.signatureBox}>
          <Text style={{ fontSize: 10, fontWeight: "bold", marginBottom: 5, color: "#c5a880" }}>NIHONGO ROUTE</Text>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>Learning Platform</Text>
        </View>
      </View>
    </Page>
  </Document>
);