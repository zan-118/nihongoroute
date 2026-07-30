import { describe, it, expect } from "vitest";
import {
  getExamSectionType,
  isPracticeExam,
  filterExams,
  ExamData,
} from "@/features/exams/exam-catalog-engine";

describe("ExamCatalogEngine", () => {
  const sampleExams: ExamData[] = [
    {
      id: "1",
      title: "Simulasi JLPT N5 Lengkap",
      slug: "jlpt-n5-full",
      levelCode: "N5",
      timeLimit: 105,
      passingScore: 80,
    },
    {
      id: "2",
      title: "Latihan Kosakata Moji-Goi N5",
      slug: "n5-moji-goi",
      levelCode: "N5",
      timeLimit: 25,
      passingScore: 30,
    },
    {
      id: "3",
      title: "Latihan Tata Bahasa Bunpou N4",
      slug: "n4-bunpou",
      levelCode: "N4",
      timeLimit: 30,
      passingScore: 35,
    },
  ];

  it("klasifikasi tipe seksi ujian dengan benar", () => {
    expect(getExamSectionType(sampleExams[0])).toBe("simulasi");
    expect(getExamSectionType(sampleExams[1])).toBe("moji-goi");
    expect(getExamSectionType(sampleExams[2])).toBe("bunpou");
  });

  it("membedakan ujian latihan vs simulasi", () => {
    expect(isPracticeExam(sampleExams[0])).toBe(false);
    expect(isPracticeExam(sampleExams[1])).toBe(true);
    expect(isPracticeExam(sampleExams[2])).toBe(true);
  });

  it("menyaring ujian berdasarkan level dan mode", () => {
    const n5Exams = filterExams(sampleExams, "n5", "all", "all");
    expect(n5Exams).toHaveLength(2);

    const practiceOnly = filterExams(sampleExams, "all", "latihan", "all");
    expect(practiceOnly).toHaveLength(2);

    const mojiGoiOnly = filterExams(sampleExams, "all", "latihan", "moji-goi");
    expect(mojiGoiOnly).toHaveLength(1);
    expect(mojiGoiOnly[0].id).toBe("2");
  });
});
