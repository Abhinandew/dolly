/**
 * Beat Clock & Synchronization Controller
 * 
 * Provides a continuous, smooth 0.0 to 1.0 phase value per beat,
 * predictive tempo extrapolation, and gentle drift correction to prevent snapping.
 */
export class BeatClock {
  private bpm: number = 120;
  private phase: number = 0; // 0.0 to 1.0 (0.0 = on beat)
  private lastUpdateTime: number = performance.now();
  private beatCounter: number = 0;

  constructor(initialBpm: number = 120) {
    this.bpm = initialBpm;
    this.lastUpdateTime = performance.now();
  }

  /**
   * Update the clock phase based on elapsed delta time.
   * Call once per animation frame.
   */
  public update(now: number = performance.now()): { phase: number; beatCount: number; isNewBeat: boolean } {
    const deltaMs = Math.max(0, Math.min(100, now - this.lastUpdateTime));
    this.lastUpdateTime = now;

    const beatDurationMs = (60 / Math.max(40, this.bpm)) * 1000;
    const phaseDelta = deltaMs / beatDurationMs;

    const prevPhase = this.phase;
    this.phase = (this.phase + phaseDelta) % 1.0;

    let isNewBeat = false;
    if (this.phase < prevPhase) {
      this.beatCounter++;
      isNewBeat = true;
    }

    return {
      phase: this.phase,
      beatCount: this.beatCounter,
      isNewBeat,
    };
  }

  /**
   * Gently nudge phase toward 0.0 on detected beat onset.
   * Uses exponential interpolation to avoid visual snapping or jitter.
   */
  public syncToBeatOnset(intensity: number = 1.0): void {
    // If phase is near end (e.g. 0.85) or near start (e.g. 0.15), smoothly nudge to 0
    let phaseError = this.phase;
    if (phaseError > 0.5) {
      phaseError -= 1.0; // Negative error (beat came slightly early)
    }

    // Blend correction smoothly (max 30% per beat)
    const correctionFactor = 0.28 * Math.min(1.0, intensity);
    let correctedPhase = this.phase - phaseError * correctionFactor;
    if (correctedPhase < 0) correctedPhase += 1.0;
    if (correctedPhase >= 1) correctedPhase -= 1.0;

    this.phase = correctedPhase;
  }

  public setBpm(newBpm: number): void {
    if (newBpm >= 40 && newBpm <= 240) {
      // Smoothly transition BPM over time
      this.bpm = this.bpm * 0.7 + newBpm * 0.3;
    }
  }

  public getBpm(): number {
    return Math.round(this.bpm);
  }

  public getPhase(): number {
    return this.phase;
  }

  public getBeatCount(): number {
    return this.beatCounter;
  }

  public reset(): void {
    this.phase = 0;
    this.beatCounter = 0;
    this.lastUpdateTime = performance.now();
  }
}
