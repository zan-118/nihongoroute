import { describe, it, expect } from 'vitest';
import { 
  conjugateVerb, 
  normalizeConjugationAnswer, 
  isConjugationAnswerCorrect 
} from '@/lib/japanese/verb-conjugation';

describe('Verb Conjugation', () => {
  describe('conjugateVerb', () => {
    it('harus melempar error jika string kosong', () => {
      expect(() => conjugateVerb('', 'godan')).toThrow('Verba belum diisi');
    });

    it('harus mengkonjugasi golongan Irregular (来る)', () => {
      const result = conjugateVerb('来る', 'irregular');
      expect(result.group).toBe('irregular');
      expect(result.forms.masu).toBe('来ます');
      expect(result.forms.nai).toBe('来ない');
      expect(result.forms.te).toBe('来て');
    });

    it('harus mengkonjugasi golongan Irregular (する)', () => {
      const result = conjugateVerb('勉強する', 'irregular');
      expect(result.group).toBe('irregular');
      expect(result.forms.masu).toBe('勉強します');
      expect(result.forms.nai).toBe('勉強しない');
      expect(result.forms.ta).toBe('勉強した');
    });

    it('harus mengkonjugasi golongan Ichidan (食べる)', () => {
      const result = conjugateVerb('食べる', 'ichidan');
      expect(result.group).toBe('ichidan');
      expect(result.forms.masu).toBe('食べます');
      expect(result.forms.nai).toBe('食べない');
      expect(result.forms.te).toBe('食べて');
    });

    it('harus melempar error jika mengklaim Ichidan tapi tidak berakhiran る', () => {
      expect(() => conjugateVerb('飲む', 'ichidan')).toThrow('Ichidan biasanya berakhiran る');
    });

    it('harus mengkonjugasi golongan Godan khusus (行く)', () => {
      const result = conjugateVerb('行く', 'godan');
      expect(result.group).toBe('godan');
      expect(result.forms.te).toBe('行って'); // exception rule te
      expect(result.forms.ta).toBe('行った');
      expect(result.forms.masu).toBe('行きます');
    });

    it('harus mengkonjugasi golongan Godan khusus turunan (持っていく)', () => {
      const result = conjugateVerb('持っていく', 'godan');
      expect(result.group).toBe('godan');
      expect(result.forms.te).toBe('持っていって');
      expect(result.forms.ta).toBe('持っていった');
      expect(result.forms.masu).toBe('持っていきます');
    });

    it('harus mengkonjugasi golongan Godan umum (飲む)', () => {
      const result = conjugateVerb('飲む', 'godan');
      expect(result.group).toBe('godan');
      expect(result.forms.masu).toBe('飲みます');
      expect(result.forms.nai).toBe('飲まない');
      expect(result.forms.te).toBe('飲んで');
    });

    it('harus melemparkan error jika akhiran Godan tidak dikenali', () => {
      expect(() => conjugateVerb('飲あ', 'godan')).toThrow('Akhiran verba godan tidak dikenali: あ');
    });
  });

  describe('isConjugationAnswerCorrect', () => {
    it('harus menyamakan jawaban walau ada spasi berlebih atau fullwidth', () => {
      const expected = '食べます';
      const attempt = ' 食 べ ます '; // ada spasi
      
      expect(isConjugationAnswerCorrect(expected, attempt)).toBe(true);
    });

    it('harus mengembalikan false jika karakter berbeda', () => {
      expect(isConjugationAnswerCorrect('食べます', '食べない')).toBe(false);
    });
  });
});
