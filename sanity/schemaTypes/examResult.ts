// schemas/examResult.ts
export default {
  name: "examResult",
  title: "Exam Result",
  type: "document",
  fields: [
    {
      name: "guestId", // Pastikan namanya guestId, bukan userEmail
      title: "Guest ID",
      type: "string",
    },
    {
      name: "examTitle",
      title: "Exam Title",
      type: "string",
    },
    {
      name: "score",
      title: "Total Score",
      type: "number",
    },
    {
      name: "totalQuestions",
      title: "Total Questions",
      type: "number",
    },
    {
      name: "passed",
      title: "Passed",
      type: "boolean",
    },
    {
      name: "completedAt",
      title: "Completed At",
      type: "datetime",
    },
    // INI FIELD BARU UNTUK MENYIMPAN SKOR PER SESI
    {
      name: "sectionScores",
      title: "Section Scores",
      type: "object",
      fields: [
        { name: "vocabulary", title: "Vocabulary Score", type: "number" },
        { name: "grammar", title: "Grammar Score", type: "number" },
        { name: "reading", title: "Reading Score", type: "number" },
        { name: "listening", title: "Listening Score", type: "number" },
      ],
    },
  ],
};
