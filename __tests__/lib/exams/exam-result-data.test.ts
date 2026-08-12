import { describe, it, expect } from 'vitest';
import {
  buildCertificateData,
  buildRegistrationNumber,
  computeJftScores,
  computeJlptScores,
  formatTestDate,
  isJftExam,
} from '@/features/exams/components/mock-engine/examResultData';

describe('examResultData (logika skor hasil ujian)', () => {
  describe('isJftExam', () => {
    it('mendeteksi JFT dari judul', () => {
      expect(isJftExam('JFT-Basic Test')).toBe(true);
      expect(isJftExam('JLPT N5 Mock')).toBe(false);
    });

    it('mendeteksi JFT dari levelCode A2', () => {
      expect(isJftExam('Test', undefined, 'A2')).toBe(true);
      expect(isJftExam('Test', undefined, 'N4')).toBe(false);
    });
  });

  describe('buildRegistrationNumber', () => {
    it('menghasilkan nomor deterministik dengan prefiks JLPT', () => {
      const a = buildRegistrationNumber('Andi', 'JLPT N5 Mock');
      const b = buildRegistrationNumber('Andi', 'JLPT N5 Mock');
      expect(a).toBe(b);
      expect(a).toMatch(/^26-1A-JLPT-\d{4}$/);
    });

    it('memakai prefiks JFT untuk ujian JFT', () => {
      expect(buildRegistrationNumber('Andi', 'JFT-Basic')).toMatch(/^26-1A-JFT-\d{4}$/);
    });
  });

  describe('formatTestDate', () => {
    it('mengembalikan format tanggal YYYY/MM/DD', () => {
      expect(formatTestDate()).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
    });
  });

  describe('computeJlptScores', () => {
    const breakdown = {
      vocabulary: { total: 10, correct: 8, passed: true },
      grammar: { total: 10, correct: 6, passed: true },
      reading: { total: 10, correct: 5, passed: false },
      listening: { total: 10, correct: 7, passed: true },
    };

    it('menghitung skor 3 bagian untuk N1–N3 (masing-masing 60 poin)', () => {
      const result = computeJlptScores(breakdown, 'N3');
      expect(result.isN4N5).toBe(false);
      // (8+6)/20 * 60 = 42; 5/10*60 = 30; 7/10*60 = 42
      expect(result.scoreLang).toBe(42);
      expect(result.scoreRead).toBe(30);
      expect(result.scoreList).toBe(42);
    });

    it('menggabungkan pengetahuan bahasa & membaca menjadi 120 poin untuk N4/N5', () => {
      const result = computeJlptScores(breakdown, 'N5');
      expect(result.isN4N5).toBe(true);
      // (8+6+5)/30 * 120 = 76
      expect(result.scoreLang).toBe(76);
      // 7/10*60 = 42
      expect(result.scoreList).toBe(42);
    });

    it('menghitung nilai huruf berdasarkan rasio benar', () => {
      const result = computeJlptScores(breakdown, 'N3');
      expect(result.vocabGrade).toBe('A'); // 80%
      expect(result.grammarGrade).toBe('B'); // 60%
      expect(result.readingGrade).toBe('B'); // 50%
    });
  });

  describe('computeJftScores', () => {
    const breakdown = {
      vocabulary: { total: 10, correct: 9, passed: true },
      grammar: { total: 10, correct: 8, passed: true },
      reading: { total: 10, correct: 8, passed: true },
      listening: { total: 10, correct: 8, passed: true },
    };

    it('menghitung skala 250 dan status lulus >= 200 tanpa gagal seksi', () => {
      const result = computeJftScores(breakdown, 33, 40, false);
      // 33/40 * 250 ≈ 206
      expect(result.score).toBe(206);
      expect(result.passed).toBe(true);
    });

    it('tidak lulus jika ada seksi yang gagal walau skor tinggi', () => {
      const result = computeJftScores(breakdown, 40, 40, true);
      expect(result.score).toBe(250);
      expect(result.passed).toBe(false);
    });
  });

  describe('buildCertificateData', () => {
    it('membangun payload sertifikat dengan level default JLPT', () => {
      const data = buildCertificateData({
        userName: 'Budi',
        examTitle: 'JLPT N5',
        score: 120,
        levelCode: 'n5',
        isJft: false,
      });
      expect(data.userName).toBe('Budi');
      expect(data.score).toBe(120);
      expect(data.level).toBe('N5');
      expect(data.date).toMatch(/\d{1,2} \w+ \d{4}/);
    });

    it('memakai A2 saat isJft dan tidak ada levelCode', () => {
      const data = buildCertificateData({
        userName: 'Budi',
        examTitle: 'JFT-Basic',
        score: 220,
        isJft: true,
      });
      expect(data.level).toBe('A2');
    });
  });
});
