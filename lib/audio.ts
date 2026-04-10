class SoundEngine {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      this.ctx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
    }
  }

  private playTone(
    freq: number,
    type: OscillatorType,
    duration: number,
    volume: number,
  ) {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      this.ctx.currentTime + duration,
    );

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // Nada tinggi berurutan untuk sukses
  playSuccess() {
    this.playTone(880, "sine", 0.3, 0.1);
    setTimeout(() => this.playTone(1320, "sine", 0.2, 0.05), 50);
  }

  // Nada rendah berat untuk salah
  playError() {
    this.playTone(150, "triangle", 0.4, 0.2);
  }

  // Suara klik ringan
  playPop() {
    this.playTone(400, "sine", 0.1, 0.05);
  }
}

export const sounds = typeof window !== "undefined" ? new SoundEngine() : null;
