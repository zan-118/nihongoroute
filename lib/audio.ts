/**
 * @file audio.ts
 * @description Mesin audio sintetik (SoundEngine) untuk menghasilkan efek suara UI menggunakan Web Audio API.
 * Menghasilkan nada prosedural tanpa memerlukan file audio eksternal.
 * @module lib/audio
 */

// ======================
// TYPES / INTERFACES
// ======================

/**
 * Deklarasi fallback untuk browser lama berbasis WebKit (Safari).
 */
interface CustomWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

// ======================
// MAIN EXECUTION
// ======================

/**
 * SoundEngine: Kelas pengelola audio context dan pembuatan nada oscillator.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;

  /**
   * Inisialisasi AudioContext secara malas (lazy loading).
   * Penting untuk mematuhi kebijakan browser mengenai interaksi pengguna.
   */
  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const CustomWin = window as unknown as CustomWindow;
      const AudioCtx = window.AudioContext || CustomWin.webkitAudioContext;

      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    // Browser modern biasanya "menidurkan" audio context sampai user berinteraksi
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  /**
   * Menghasilkan nada tunggal menggunakan Oscillator.
   * 
   * @param {number} freq - Frekuensi nada (Hz).
   * @param {OscillatorType} type - Bentuk gelombang (sine, square, triangle, sawtooth).
   * @param {number} duration - Durasi suara (detik).
   * @param {number} volume - Intensitas suara (0.0 ke 1.0).
   */
  private playTone(
    freq: number,
    type: OscillatorType,
    duration: number,
    volume: number,
  ) {
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      
      // Memberikan efek fade-out yang halus
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        this.ctx.currentTime + duration,
      );

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (error) {
      console.warn("Audio playback failed:", error);
    }
  }

  // ======================
  // PUBLIC API
  // ======================

  /**
   * Memainkan nada tinggi berurutan untuk menandakan keberhasilan.
   */
  playSuccess() {
    this.playTone(880, "sine", 0.3, 0.1);
    setTimeout(() => this.playTone(1320, "sine", 0.2, 0.05), 50);
  }

  /**
   * Memainkan nada rendah berat untuk menandakan kesalahan.
   */
  playError() {
    this.playTone(150, "triangle", 0.4, 0.2);
  }

  /**
   * Memainkan suara klik/pop ringan untuk interaksi tombol.
   */
  playPop() {
    this.playTone(400, "sine", 0.1, 0.05);
  }
}

/**
 * Instance tunggal SoundEngine yang hanya aktif di sisi klien.
 */
export const sounds = typeof window !== "undefined" ? new SoundEngine() : null;
