import { describe, it, expect } from 'vitest';
import { 
  calculateJlptExamSubmission, 
  buildJlptSrsUpsertRows,
  type SupabaseExamPackage
} from '@/lib/exams/jlpt-session';

const MOCK_PACKAGE: SupabaseExamPackage = {
  id: 'pkg-1',
  title: 'Test N5',
  timeLimitMinutes: 60,
  passingScore: 90,
  questions: [
    {
      id: 'q1',
      sessionType: 'vocabulary',
      choices: [{ type: 'text', value: 'A' }, { type: 'text', value: 'B' }],
      correctChoiceIndex: 0,
    },
    {
      id: 'q2',
      sessionType: 'vocabulary',
      choices: [{ type: 'text', value: 'C' }, { type: 'text', value: 'D' }],
      correctChoiceIndex: 1,
      sourceType: 'vocab',
      sourceId: 'v2'
    },
    {
      id: 'q3',
      sessionType: 'grammar',
      choices: [{ type: 'text', value: 'E' }, { type: 'text', value: 'F' }],
      correctChoiceIndex: 0,
    }
  ]
};

describe('JLPT Session Manager', () => {
  describe('calculateJlptExamSubmission', () => {
    it('harus menghitung skor dan breakdown per sesi dengan benar (Lulus)', () => {
      // 3/3 benar
      const answers = { 'q1': 0, 'q2': 1, 'q3': 0 };
      const result = calculateJlptExamSubmission(MOCK_PACKAGE, answers);

      expect(result.correctCount).toBe(3);
      expect(result.wrongCount).toBe(0);
      expect(result.unansweredCount).toBe(0);
      expect(result.totalScore).toBe(180); // 3/3 * 180 = 180
      expect(result.isPassed).toBe(true);
      expect(result.failedSection).toBe(false);
      expect(result.sectionBreakdown.vocabulary.correct).toBe(2);
      expect(result.sectionBreakdown.grammar.correct).toBe(1);
    });

    it('harus mendeteksi kegagalan section (Sectional Fail)', () => {
      // Q1 salah, Q2 salah (Vocabulary = 0/2 benar = 0%), Q3 benar (Grammar 1/1 = 100%)
      const answers = { 'q1': 1, 'q2': 0, 'q3': 0 };
      const result = calculateJlptExamSubmission(MOCK_PACKAGE, answers);

      expect(result.sectionBreakdown.vocabulary.passed).toBe(false); // < 32%
      expect(result.sectionBreakdown.grammar.passed).toBe(true);
      expect(result.failedSection).toBe(true);
      expect(result.isPassed).toBe(false); // Gagal karena section, walaupun total score = 1/3 * 180 = 60
    });

    it('harus mengumpulkan srsCandidates untuk soal yang salah', () => {
      const answers = { 'q1': 0, 'q2': 0 /* salah */, 'q3': 0 };
      const result = calculateJlptExamSubmission(MOCK_PACKAGE, answers);

      expect(result.srsCandidates.length).toBe(1);
      expect(result.srsCandidates[0].sourceId).toBe('v2');
      expect(result.srsCandidates[0].sourceType).toBe('vocab');
    });
  });

  describe('buildJlptSrsUpsertRows', () => {
    it('harus memformat kandidat SRS menjadi baris siap-insert', () => {
      const candidates = [{ questionId: 'q2', sourceType: 'vocab', sourceId: 'v2' }];
      const rows = buildJlptSrsUpsertRows({ userId: 'u1', candidates, completedAt: '2026-07-12T00:00:00Z' });
      
      expect(rows.length).toBe(1);
      expect(rows[0].word_id).toBe('v2');
      expect(rows[0].interval).toBe(1);
      expect(rows[0].status).toBe('learning');
    });
  });
});
