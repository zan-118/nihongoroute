import { describe, it, expect } from 'vitest';
import { getJlptQuotaRequests, buildRandomTemplateQuestionRows, type JlptQuotaRequest } from '@/lib/exams/jlpt-session';

describe('Exam Generators Core Utils', () => {
  describe('getJlptQuotaRequests', () => {
    it('harus mem-parsing JSON konfigurasi kuota dengan benar', () => {
      const config = { vocabulary: { total: 10 }, grammar: { total: 5 } };
      const requests = getJlptQuotaRequests(config);
      
      expect(requests.length).toBe(2);
      expect(requests.find(r => r.section === 'vocabulary')?.total).toBe(10);
      expect(requests.find(r => r.section === 'grammar')?.total).toBe(5);
    });

    it('harus melemparkan error jika section tidak valid atau total bukan positif', () => {
      expect(() => getJlptQuotaRequests({ magic: { total: 10 } })).toThrow(/tidak dikenal/);
      expect(() => getJlptQuotaRequests({ grammar: { total: 0 } })).toThrow(/integer positif/);
    });
  });

  describe('buildRandomTemplateQuestionRows', () => {
    it('harus merakit baris template acak sesuai kuota', () => {
      const quotaRequests: JlptQuotaRequest[] = [{ section: 'vocabulary', total: 2 }];
      const questionsBySection: Record<string, unknown[]> = {
        vocabulary: [
          { id: 'v1', session_type: 'vocabulary' },
          { id: 'v2', session_type: 'vocabulary' },
          { id: 'v3', session_type: 'vocabulary' }
        ]
      };
      
      const rows = buildRandomTemplateQuestionRows({
        quotaRequests,
        questionsBySection: questionsBySection as unknown as Parameters<typeof buildRandomTemplateQuestionRows>[0]['questionsBySection'],
        shuffleQuestions: (arr) => arr, // Disable shuffle untuk mempermudah tes
      });

      expect(rows.length).toBe(2);
      expect(rows[0].position).toBe(1);
      expect(rows[1].position).toBe(2);
      // Section order untuk vocabulary adalah 0
      expect(rows[0].section_order).toBe(0);
    });

    it('harus melemparkan error jika stok soal tidak cukup untuk memenuhi kuota', () => {
      const quotaRequests: JlptQuotaRequest[] = [{ section: 'vocabulary', total: 10 }];
      const questionsBySection = { vocabulary: [{ id: 'v1' }] };
      
      expect(() => buildRandomTemplateQuestionRows({
        quotaRequests,
        questionsBySection: questionsBySection as unknown as Parameters<typeof buildRandomTemplateQuestionRows>[0]['questionsBySection']
      })).toThrow(/tersedia/);
    });
  });
});
