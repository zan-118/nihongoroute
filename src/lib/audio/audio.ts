/**
 * @file audio.ts
 * @description Mesin audio sintetik (SoundEngine) untuk menghasilkan efek suara UI menggunakan Web Audio API. Menghasilkan nada prosedural tanpa memerlukan berkas audio eksternal untuk zero-latency feedback.
 */

// ==========================================
// DEKLARASI ANTARMUKA & TYPE
// ==========================================
/**
 * Window extension. Support legacy WebKit audio.
 */
interface CustomWindow extends Window {
 webkitAudioContext?: typeof AudioContext;
}

// ==========================================
// KELAS UTAMA SOUND ENGINE
// ==========================================

/**
 * Audio synthesizer. Generate UI sound effects via Web Audio API.
 */
class SoundEngine {
 /**
 * Web Audio context instance. Null if uninitialized.
 */
 private ctx: AudioContext | null = null;

 /**
 * Initialize audio context. Resume if suspended.
 */
 private init() {
 // Check window exist. Avoid SSR crash.
 if (!this.ctx && typeof window !== "undefined") {
 const CustomWin = window as unknown as CustomWindow;
 const AudioCtx = window.AudioContext || CustomWin.webkitAudioContext;

 if (AudioCtx) {
 this.ctx = new AudioCtx();
 }
 }

 // Resume context. Browser block autoplay.
 if (this.ctx && this.ctx.state === "suspended") {
 this.ctx.resume();
 }
 }

 /**
 * Play single oscillator tone.
 * 
 * @param freq Tone frequency in Hz.
 * @param type Waveform type.
 * @param duration Play duration in seconds.
 * @param volume Gain level (0.0 to 1.0).
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
 // Create nodes. Oscillator and gain.
 const osc = this.ctx.createOscillator();
 const gain = this.ctx.createGain();

 // Set frequency. Start immediately.
 osc.type = type;
 osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

 // Set volume. Fade out to prevent click pop.
 gain.gain.setValueAtTime(volume, this.ctx.currentTime);
 
 // Memberikan efek fade-out yang halus
 gain.gain.exponentialRampToValueAtTime(
 0.0001,
 this.ctx.currentTime + duration,
 );

 // Connect nodes. Route to output.
 osc.connect(gain);
 gain.connect(this.ctx.destination);

 // Schedule start and stop.
 osc.start();
 osc.stop(this.ctx.currentTime + duration);
 } catch (error) {
 console.warn("Pemutaran audio gagal:", error);
 }
 }

// ==========================================
 // API PUBLIK / METHODS
 // ==========================================

 /**
 * Play success sound. Two rising tones.
 */
 playSuccess() {
 this.playTone(880, "sine", 0.3, 0.1);
 setTimeout(() => this.playTone(1320, "sine", 0.2, 0.05), 50);
 }

 /**
 * Play error sound. Low frequency tone.
 */
 playError() {
 this.playTone(150, "triangle", 0.4, 0.2);
 }

 /**
 * Play UI click sound. Short sine wave.
 */
 playPop() {
 this.playTone(400, "sine", 0.1, 0.05);
 }
}

/**
 * Global sound engine instance. Client-side only.
 */
export const sounds = typeof window !== "undefined" ? new SoundEngine() : null;