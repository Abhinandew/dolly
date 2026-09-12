/**
 * Real-time Web Audio Synthesizer & Drum Groove Generator
 * 
 * Generates rhythmic musical patterns (Kick, Snare, Hi-hat, Bassline, Synth)
 * directly in the browser so users can test audio reactivity and choreography
 * synchronization instantly even without a microphone.
 */

export interface SynthTrack {
  id: string;
  name: string;
  genre: string;
  bpm: number;
  pattern: 'edm' | 'hiphop' | 'disco' | 'kpop' | 'lofi';
}

export const SYNTH_TRACKS: SynthTrack[] = [
  { id: 'synth_edm', name: 'Cyber Neon Drop', genre: 'Electronic Dance', bpm: 128, pattern: 'edm' },
  { id: 'synth_disco', name: 'Retro Funky Groove', genre: 'Nu-Disco', bpm: 120, pattern: 'disco' },
  { id: 'synth_hiphop', name: 'Boom Bap Bounce', genre: 'Hip-Hop', bpm: 95, pattern: 'hiphop' },
  { id: 'synth_kpop', name: 'Super Idol Beat', genre: 'K-Pop', bpm: 132, pattern: 'kpop' },
  { id: 'synth_lofi', name: 'Sunset Chill Tape', genre: 'Lo-Fi Chill', bpm: 84, pattern: 'lofi' },
];

export class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private currentTrack: SynthTrack | null = null;
  private timerId: number | null = null;
  private step: number = 0;
  private nextNoteTime: number = 0;

  constructor() {}

  public getAudioContext(): AudioContext | null {
    return this.ctx;
  }

  public getMasterNode(): GainNode | null {
    return this.masterGain;
  }

  public start(track: SynthTrack = SYNTH_TRACKS[0]): AudioContext {
    if (this.isPlaying) {
      this.stop();
    }

    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtxClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.currentTrack = track;
    this.isPlaying = true;
    this.step = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.05;

    this.scheduleLoop();
    return this.ctx;
  }

  private scheduleLoop = (): void => {
    if (!this.isPlaying || !this.ctx || !this.currentTrack) return;

    try {
      const secondsPerBeat = 60.0 / this.currentTrack.bpm;
      const stepDuration = secondsPerBeat / 4; // 16th notes

      // Schedule 100ms ahead
      while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
        this.playStep(this.step, this.nextNoteTime, this.currentTrack);
        this.nextNoteTime += stepDuration;
        this.step = (this.step + 1) % 16;
      }
    } catch {
      // Scheduling error (e.g. context closed mid-loop) — stop cleanly
      this.stop();
      return;
    }

    this.timerId = window.setTimeout(this.scheduleLoop, 25);
  };

  private playStep(step: number, time: number, track: SynthTrack): void {
    if (!this.ctx || !this.masterGain) return;

    // 1. Kick Drum
    let isKick = false;
    if (track.pattern === 'edm' || track.pattern === 'disco') {
      isKick = step % 4 === 0; // 4-on-the-floor
    } else if (track.pattern === 'hiphop') {
      isKick = step === 0 || step === 10 || step === 14;
    } else if (track.pattern === 'kpop') {
      isKick = step === 0 || step === 3 || step === 8 || step === 10;
    } else if (track.pattern === 'lofi') {
      isKick = step === 0 || step === 7 || step === 10;
    }

    if (isKick) {
      this.playKick(time);
    }

    // 2. Snare / Clap
    let isSnare = false;
    if (track.pattern === 'edm' || track.pattern === 'disco' || track.pattern === 'hiphop') {
      isSnare = step === 4 || step === 12; // Beats 2 & 4
    } else if (track.pattern === 'kpop') {
      isSnare = step === 4 || step === 12 || step === 15;
    } else if (track.pattern === 'lofi') {
      isSnare = step === 4 || step === 12;
    }

    if (isSnare) {
      this.playSnare(time);
    }

    // 3. Hi-Hats
    if (step % 2 === 0) {
      this.playHiHat(time, step % 4 === 2 ? 0.35 : 0.2);
    }

    // 4. Bass synth
    if (step % 4 === 0 || step % 4 === 2) {
      const freqs = [55, 65.4, 73.4, 82.4, 98]; // A1, C2, D2, E2, G2
      const freq = freqs[(Math.floor(step / 4) + (track.bpm % 3)) % freqs.length];
      this.playBass(time, freq, stepDuration(track.bpm));
    }
  }

  private playKick(time: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(36, time + 0.12);

    gain.gain.setValueAtTime(1.0, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.25);
  }

  private playSnare(time: number): void {
    if (!this.ctx || !this.masterGain) return;

    // Noise component
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(800, time);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.14);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.15);

    // Body tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(60, time + 0.08);

    oscGain.gain.setValueAtTime(0.5, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.09);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.1);
  }

  private playHiHat(time: number, volume: number): void {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.038);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.04);
  }

  private playBass(time: number, freq: number, duration: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, time);
    filter.frequency.exponentialRampToValueAtTime(120, time + duration);

    gain.gain.setValueAtTime(0.45, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close().catch(() => {
        // Ignore — context may already be released
      });
    }
    this.ctx = null;
    this.masterGain = null;
    this.currentTrack = null;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTrack(): SynthTrack | null {
    return this.currentTrack;
  }
}

function stepDuration(bpm: number): number {
  return (60 / bpm) * 0.4;
}
