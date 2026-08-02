/**
 * @file exam-catalog-engine.ts
 * @description Domain module for JLPT exam catalog classification, section type detection, and filtering logic.
 * @module features/exams
 */

export interface ExamData {
 id?: string;
 _id?: string;
 title: string;
 description?: string | null;
 levelCode?: string;
 slug?: string | null;
 timeLimit: number;
 passingScore: number;
}

export type ExamSectionType = "moji-goi" | "bunpou" | "reading" | "listening" | "simulasi";
export type ExamModeFilter = "all" | "simulasi" | "latihan";
export type ExamSubFilter = "all" | "moji-goi" | "bunpou" | "reading" | "listening";

/**
 * Determine exam section type based on slug and title keywords.
 *
 * @param {ExamData} exam Exam data object.
 * @returns {ExamSectionType} Exam section category.
 */
export function getExamSectionType(exam: ExamData): ExamSectionType {
 const slug = (exam.slug || "").toLowerCase();
 const title = (exam.title || "").toLowerCase();

 if (
 slug.includes("moji-goi") ||
 title.includes("moji/goi") ||
 title.includes("moji-goi") ||
 title.includes("kosakata")
 ) {
 return "moji-goi";
 }

 if (
 slug.includes("bunpou") ||
 title.includes("bunpou") ||
 title.includes("tata bahasa")
 ) {
 return "bunpou";
 }

 if (
 slug.includes("reading") ||
 title.includes("reading") ||
 title.includes("membaca") ||
 slug.includes("dokkai") ||
 title.includes("dokkai")
 ) {
 return "reading";
 }

 if (
 slug.includes("listening") ||
 title.includes("listening") ||
 title.includes("mendengar") ||
 slug.includes("choukai") ||
 title.includes("choukai")
 ) {
 return "listening";
 }

 return "simulasi";
}

/**
 * Check if exam item is a single section practice test instead of a full mock exam.
 *
 * @param {ExamData} exam Exam data object.
 * @returns {boolean} True if practice section test.
 */
export function isPracticeExam(exam: ExamData): boolean {
 return getExamSectionType(exam) !== "simulasi";
}

/**
 * Filter exam catalog by level, mode (mock/practice), and section sub-filter.
 *
 * @param {ExamData[]} exams Raw exam data array.
 * @param {string} levelFilter Level filter ('all', 'n5'..'n1', 'general').
 * @param {ExamModeFilter} modeFilter Mode filter ('all', 'simulasi', 'latihan').
 * @param {ExamSubFilter} subFilter Section filter ('all', 'moji-goi', etc.).
 * @returns {ExamData[]} Filtered exam array.
 */
export function filterExams(
 exams: ExamData[],
 levelFilter: string,
 modeFilter: ExamModeFilter,
 subFilter: ExamSubFilter
): ExamData[] {
 return exams.filter((exam) => {
 const level = (exam.levelCode || "").toLowerCase().trim();
 let matchLevel = true;

 if (levelFilter !== "all") {
 if (levelFilter === "general") {
 matchLevel = !["n1", "n2", "n3", "n4", "n5"].includes(level);
 } else {
 matchLevel = level === levelFilter;
 }
 }

 let matchMode = true;
 const sectionType = getExamSectionType(exam);
 const isPractice = sectionType !== "simulasi";

 if (modeFilter !== "all") {
 const mode = isPractice ? "latihan" : "simulasi";
 matchMode = mode === modeFilter;
 }

 let matchSubFilter = true;
 if (modeFilter === "latihan" && subFilter !== "all") {
 matchSubFilter = sectionType === subFilter;
 }

 return matchLevel && matchMode && matchSubFilter;
 });
}
