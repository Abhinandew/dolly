import { AudioAnalysis, AudioConfig } from '../types/audio';
import { BeatDetector } from './BeatDetector';
import { BeatClock } from './BeatClock';

/**
 * Real-time Web Audio API Analyzer for Dolly
 * 
 * OPTIMIZED:
 * - 512 FFT size (256 frequency bins) for low latency and minimal CPU overhead.
 * - Zero heap allocations per frame by mutating a cached AudioAnalysis instance.
 * - Sub-sampled time-domain RMS computation.
 * - 100% browser-local processing with zero remote network requests.
 */
export class AudioAnalyzer {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private mediaStream: MediaStream | null = null;
  private beatDetector: BeatDetector;
  private beatClock: BeatClock;

  private freqData: Uint8Array | null = null;
  private timeData: Uint8Array | null = null;
  private isListening: boolean = false;
  private ownsContext: boolean = false;
  private sensitivity: number = 1.0;

  // Smoothing states
  private smoothedBass: number = 0;
  private smoothedMid: number = 0;
  private smoothedTreble: number = 0;
  private smoothedEnergy: number = 0;

  // Pre-allocated analysis instance to eliminate per-frame GC allocations
  private cachedAnalysis: AudioAnalysis = {
    volume: 0,
    energy: 0,
    bassEnergy: 0,
    midEnergy: 0,
    trebleEnergy: 0,
    beatDetected: false,
    beatIntensity: 0,
    estimatedBPM: 120,
    beatPhase: 0,
    timestamp: 0,
  };

  constructor(config?: Partial<AudioConfig>) {
    this.sensitivity = config?.sensitivity ?? 1.0;
    this.beatDetector = new BeatDetector();
    this.beatClock = new BeatClock(120);
  }

  /**
   * Request microphone permission and initialize audio pipeline.
   * MUST be triggered by a direct user gesture.
   */
  public async startMicrophone(): Promise<void> {
    // If we already own a microphone context, nothing to do
    if (this.isListening && this.ownsContext) return;
    // Otherwise tear down any active (externally-connected) session first
    if (this.isListening) this.stop();

    try {
      // 1. Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      this.mediaStream = stream;

      // 2. Initialize AudioContext (handle iOS/mobile gesture restrictions)
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();

      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      // 3. Create AnalyserNode with low-latency 512 FFT
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 512; // 256 bins: low latency & fast computation
      this.analyser.smoothingTimeConstant = 0.65;

      // 4. Connect microphone source to analyser (prevent feedback)
      this.sourceNode = this.audioCtx.createMediaStreamSource(stream);
      this.sourceNode.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      this.freqData = new Uint8Array(new ArrayBuffer(bufferLength));
      this.timeData = new Uint8Array(new ArrayBuffer(bufferLength));

      this.isListening = true;
      this.ownsContext = true;
      this.beatDetector.reset();
      this.beatClock.reset();
    } catch (err) {
      this.stop();
      throw err;
    }
  }

  /**
   * Connect an external audio element or custom audio node (e.g. for synthesizer demo tracks)
   */
  public connectAudioNode(node: AudioNode, ctx: AudioContext): void {
    // Stop and release any existing microphone stream before taking over
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.analyser) {
      try {
        this.analyser.disconnect();
      } catch {
        // Node may already be disconnected
      }
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    this.audioCtx = ctx;
    this.ownsContext = false;
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.65;

    node.connect(this.analyser);

    const bufferLength = this.analyser.frequencyBinCount;
    this.freqData = new Uint8Array(new ArrayBuffer(bufferLength));
    this.timeData = new Uint8Array(new ArrayBuffer(bufferLength));

    this.isListening = true;
    this.beatDetector.reset();
    this.beatClock.reset();
  }

  /**
   * Real-time analysis per animation frame.
   * Fast, zero-allocation calculations.
   */
  public analyze(now: number = performance.now()): AudioAnalysis {
    const out = this.cachedAnalysis;
    out.timestamp = now;

    if (!this.isListening || !this.analyser || !this.freqData || !this.timeData) {
      // Still advance the clock so beat phase stays coherent when listening resumes
      const clockUpdate = this.beatClock.update(now);
      out.beatPhase = clockUpdate.phase;
      out.estimatedBPM = this.beatClock.getBpm();
      out.volume = 0;
      out.energy = 0;
      out.bassEnergy = 0;
      out.midEnergy = 0;
      out.trebleEnergy = 0;
      out.beatDetected = false;
      out.beatIntensity = 0;
      return out;
    }

    // Only tick the clock when we are actually processing audio
    const clockUpdate = this.beatClock.update(now);
    out.beatPhase = clockUpdate.phase;
    out.estimatedBPM = this.beatClock.getBpm();

    try {
      this.analyser.getByteFrequencyData(
        this.freqData as unknown as Uint8Array<ArrayBuffer>
      );
      this.analyser.getByteTimeDomainData(
        this.timeData as unknown as Uint8Array<ArrayBuffer>
      );
    } catch {
      out.volume = 0;
      out.energy = 0;
      out.bassEnergy = 0;
      out.midEnergy = 0;
      out.trebleEnergy = 0;
      out.beatDetected = false;
      out.beatIntensity = 0;
      return out;
    }

    const binCount = this.analyser.frequencyBinCount;
    const sampleRate = this.audioCtx ? this.audioCtx.sampleRate : 44100;
    const hzPerBin = (sampleRate / 2) / binCount;

    // 1. Calculate Time-Domain Volume (RMS with 2x step sampling for speed)
    let sumSquares = 0;
    const tLen = this.timeData.length;
    for (let i = 0; i < tLen; i += 2) {
      const norm = (this.timeData[i] - 128) * 0.0078125; // 1 / 128
      sumSquares += norm * norm;
    }
    const rawVolume = Math.min(1.0, Math.sqrt((sumSquares * 2) / tLen) * 3.5 * this.sensitivity);

    // 2. Frequency Bands (Sub-bass: 20-150Hz, Mids: 150-2500Hz, Treble: 2500-12000Hz)
    const bassEndBin = Math.max(1, Math.floor(150 / hzPerBin));
    const midEndBin = Math.max(bassEndBin + 1, Math.floor(2500 / hzPerBin));
    const trebleEndBin = Math.min(binCount, Math.floor(12000 / hzPerBin));

    let bassSum = 0;
    for (let i = 0; i < bassEndBin; i++) bassSum += this.freqData[i];
    const rawBass = Math.min(1.0, (bassSum / (bassEndBin * 255)) * 1.8 * this.sensitivity);

    let midSum = 0;
    for (let i = bassEndBin; i < midEndBin; i++) midSum += this.freqData[i];
    const rawMid = Math.min(1.0, (midSum / ((midEndBin - bassEndBin) * 255)) * 1.5 * this.sensitivity);

    let trebleSum = 0;
    for (let i = midEndBin; i < trebleEndBin; i++) trebleSum += this.freqData[i];
    const rawTreble = Math.min(1.0, (trebleSum / ((trebleEndBin - midEndBin) * 255)) * 1.6 * this.sensitivity);

    const rawEnergy = rawBass * 0.5 + rawMid * 0.3 + rawTreble * 0.2;

    // Smooth values for natural animation responsiveness
    this.smoothedBass = this.smoothedBass * 0.6 + rawBass * 0.4;
    this.smoothedMid = this.smoothedMid * 0.7 + rawMid * 0.3;
    this.smoothedTreble = this.smoothedTreble * 0.7 + rawTreble * 0.3;
    this.smoothedEnergy = this.smoothedEnergy * 0.65 + rawEnergy * 0.35;

    // 3. Process Beat Detection
    const beatResult = this.beatDetector.process(rawBass, rawEnergy, now);

    if (beatResult.isBeat) {
      // Sync phase first (uses current BPM), then update tempo
      this.beatClock.syncToBeatOnset(beatResult.intensity);
      this.beatClock.setBpm(beatResult.bpm);
    }

    out.volume = rawVolume;
    out.energy = this.smoothedEnergy;
    out.bassEnergy = this.smoothedBass;
    out.midEnergy = this.smoothedMid;
    out.trebleEnergy = this.smoothedTreble;
    out.beatDetected = beatResult.isBeat;
    out.beatIntensity = beatResult.intensity;

    return out;
  }

  public setSensitivity(val: number): void {
    this.sensitivity = Math.max(0.2, Math.min(3.0, val));
  }

  public getSensitivity(): number {
    return this.sensitivity;
  }

  public getByteFrequencyData(): Uint8Array | null {
  return this.freqData as Uint8Array | null;
}

  public isActive(): boolean {
    return this.isListening;
  }

  public stop(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.analyser) {
      try {
        this.analyser.disconnect();
      } catch {
        // Node may already be disconnected
      }
      this.analyser = null;
    }
    if (this.ownsContext && this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {
        // Ignore close errors (context may have already been released)
      });
    }
    this.audioCtx = null;
    this.ownsContext = false;
    this.freqData = null;
    this.timeData = null;
    this.isListening = false;
    this.smoothedBass = 0;
    this.smoothedMid = 0;
    this.smoothedTreble = 0;
    this.smoothedEnergy = 0;
  }
}
