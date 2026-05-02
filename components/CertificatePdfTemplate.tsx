/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

/**
 * @file CertificatePdfTemplate.tsx
 * @description Template PDF untuk sertifikat kelulusan ujian simulasi NihongoRoute.
 */

// Registrasi Font (Menggunakan font sistem sebagai fallback atau URL jika perlu)
Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2", fontWeight: 900 },
    { src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff2", fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#0a0c10",
    padding: 40,
    fontFamily: "Inter",
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
    border: "2pt solid #22d3ee",
    borderRadius: 20,
  },
  innerBorder: {
    position: "absolute",
    top: 30,
    left: 30,
    right: 30,
    bottom: 30,
    border: "1pt solid rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
  },
  header: {
    marginBottom: 40,
    textAlign: "center",
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 20,
    alignSelf: "center",
  },
  title: {
    fontSize: 42,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: -2,
    color: "#22d3ee",
  },
  subtitle: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 10,
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  content: {
    textAlign: "center",
    marginTop: 40,
  },
  presentLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 10,
  },
  userName: {
    fontSize: 32,
    fontWeight: 700,
    color: "#ffffff",
    marginBottom: 20,
    borderBottom: "1pt solid #22d3ee",
    paddingBottom: 5,
    minWidth: 300,
  },
  examInfo: {
    fontSize: 14,
    color: "#94a3b8",
    lineHeight: 1.6,
  },
  scoreContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: "rgba(34, 211, 238, 0.1)",
    borderRadius: 10,
    display: "flex",
    flexDirection: "row",
    gap: 20,
  },
  scoreItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 8,
    color: "#22d3ee",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 900,
  },
  footer: {
    position: "absolute",
    bottom: 60,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  signatureBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  signatureLine: {
    width: 150,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 8,
    color: "#64748b",
    textTransform: "uppercase",
  },
  watermark: {
    position: "absolute",
    bottom: -50,
    right: -50,
    fontSize: 150,
    fontWeight: 900,
    color: "rgba(34, 211, 238, 0.03)",
    transform: "rotate(-30deg)",
  }
});

interface CertificateData {
  userName: string;
  examTitle: string;
  score: number;
  date: string;
  level?: string;
}

export const CertificatePdfTemplate = ({ data }: { data: CertificateData }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.border} />
      <View style={styles.innerBorder} />
      
      <Text style={styles.watermark}>NIHONGOROUTE</Text>

      <View style={styles.header}>
        <Text style={styles.title}>CERTIFICATE</Text>
        <Text style={styles.subtitle}>OF ACHIEVEMENT</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.presentLabel}>This certificate is proudly presented to</Text>
        <Text style={styles.userName}>{data.userName}</Text>
        <Text style={styles.examInfo}>
          For successfully passing the {data.examTitle} {data.level ? `(${data.level})` : ""}
        </Text>
        
        <View style={styles.scoreContainer}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Final Score</Text>
            <Text style={styles.scoreValue}>{data.score} / 180</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Status</Text>
            <Text style={[styles.scoreValue, { color: "#34d399" }]}>PASSED</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.signatureBox}>
          <Text style={{ fontSize: 12, fontWeight: 700, marginBottom: 5 }}>{data.date}</Text>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>Date of Issue</Text>
        </View>
        
        <View style={styles.signatureBox}>
          <Text style={{ fontSize: 12, fontWeight: 700, marginBottom: 5, color: "#22d3ee" }}>NIHONGO ROUTE</Text>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>Official Learning Platform</Text>
        </View>
      </View>
    </Page>
  </Document>
);
