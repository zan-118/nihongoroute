import { describe, it, expect } from 'vitest';
import { toLegacyExamData, type SupabaseExamPackage } from '@/lib/exams/supabase-adapter';

describe('Supabase Adapter for Mock Exam Engine', () => {
  it('harus memetakan format SupabaseExamPackage ke format legacy ExamData', () => {
    const pkg: SupabaseExamPackage = {
      id: 'uuid-1',
      title: 'Paket Supabase N5',
      timeLimitMinutes: 105,
      passingScore: 90,
      jlptLevel: 'N5',
      questions: [
        {
          id: 'q-1',
          sessionType: 'grammar',
          promptHtml: 'Kore __ pen desu.',
          choices: [
            { type: 'text', value: 'wa' },
            { type: 'text', value: 'ga' }
          ],
          correctChoiceIndex: 0,
        }
      ]
    };

    const legacy = toLegacyExamData(pkg);

    expect(legacy.id).toBe('uuid-1');
    expect(legacy.title).toBe('Paket Supabase N5');
    expect(legacy.timeLimit).toBe(105);
    expect(legacy.levelCode).toBe('n5');
    expect(legacy.source).toBe('supabase');
    expect(legacy.questions.length).toBe(1);
    expect(legacy.questions[0].options).toEqual(['wa', 'ga']); // Mapped properly
    expect(legacy.questions[0].correctAnswer).toBe(0);
    expect(legacy.questions[0].section).toBe('grammar');
  });

  it('menangani choice bertipe gambar dengan menggunakan alt atau default string', () => {
    const pkg: SupabaseExamPackage = {
      id: 'uuid-2',
      title: 'Image Test',
      timeLimitMinutes: 10,
      passingScore: 50,
      questions: [
        {
          id: 'q-2',
          sessionType: 'vocabulary',
          promptHtml: 'Gambar?',
          choices: [
            { type: 'image', value: '/a.png', alt: 'Apel' },
            { type: 'image', value: '/b.png' } // tanpa alt
          ],
          correctChoiceIndex: 0,
        }
      ]
    };

    const legacy = toLegacyExamData(pkg);
    expect(legacy.questions[0].options[0]).toBe('Apel');
    expect(legacy.questions[0].options[1]).toBe('Pilihan gambar 2');
  });
});
