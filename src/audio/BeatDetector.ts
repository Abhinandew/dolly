/**
 * Real-time Beat Detector & BPM Estimator
 * 
 * Uses spectral flux / energy difference with dynamic thresholding and
 * inter-beat interval (IBI) tracking for instantaneous, low-latency beat detection.
 * Does not wait seconds before responding; kicks off immediate rhythm reaction.
 */
export class BeatDetector {
  private energyHistory: number[] = [];
  private readonly historySize: number = 43; // ~0.7 seconds at 60 FPS
  private beatIntervals: number[] = [];
  private readonly maxIntervals: number = 8;
  private lastBeatTime: number = 0;
  private minIntervalMs: number = 300; // Max ~200 BPM
  private maxIntervalMs: number = 1000; // Min ~60 BPM
  private decayRate: number = 0.95;
  private dynamicThreshold: number = 0.15;
  private estimatedBpm: number = 120;
  private confidence: number = 0.5;

  /**
   * Process a single audio frame
   * 
   * @param bassEnergy Current normalized sub-bass & bass energy (0 - 1)
   * @param overallEnergy Current normalized total RMS energy (0 - 1)
   * @param now Current timestamp in ms
   * @returns { isBeat: boolean, intensity: number, bpm: number, confidence: number }
   */
  public process(
    bassEnergy: number,
    overallEnergy: number,
    now: number
  ): { isBeat: boolean; intensity: number; bpm: number; confidence: number } {
    // Weighted rhythm energy favoring bass transients
    const instantEnergy = bassEnergy * 0.75 + overallEnergy * 0.25;

    // Maintain sliding window of recent energy
    this.energyHistory.push(instantEnergy);
    if (this.energyHistory.length > this.historySize) {
      this.energyHistory.shift();
    }

    // Compute average local energy
    const sum = this.energyHistory.reduce((a, b) => a + b, 0);
    const avgEnergy = sum / Math.max(1, this.energyHistory.length);

    // Dynamic threshold adapts to volume changes
    const variance = this.energyHistory.reduce((acc, val) => acc + Math.pow(val - avgEnergy, 2), 0) / this.energyHistory.length;
    // Higher variance = higher threshold multiplier
    const cMultiplier = Math.max(1.15, Math.min(1.5, 1.3 + Math.sqrt(variance) * 0.8));
    const targetThreshold = Math.max(avgEnergy * cMultiplier, 0.08);

    // Smooth dynamic threshold
    this.dynamicThreshold = Math.max(targetThreshold, this.dynamicThreshold * this.decayRate);

    const timeSinceLastBeat = now - this.lastBeatTime;
    let isBeat = false;
    let intensity = 0;

    // Detect beat onset
    if (
      instantEnergy > this.dynamicThreshold &&
      instantEnergy > 0.12 &&
      timeSinceLastBeat >= this.minIntervalMs
    ) {
      isBeat = true;
      intensity = Math.min(1.0, (instantEnergy - avgEnergy) / (avgEnergy + 0.001));
      this.lastBeatTime = now;

      // Track inter-beat intervals for BPM calculation
      if (timeSinceLastBeat <= this.maxIntervalMs) {
        this.beatIntervals.push(timeSinceLastBeat);
        if (this.beatIntervals.length > this.maxIntervals) {
          this.beatIntervals.shift();
        }

        // Calculate estimated BPM from median interval to eliminate outliers
        if (this.beatIntervals.length >= 3) {
          const sorted = [...this.beatIntervals].sort((a, b) => a - b);
          const medianInterval = sorted[Math.floor(sorted.length / 2)];
          const rawBpm = Math.round(60000 / medianInterval);

          // Constrain to normal dance BPM range (65 - 180)
          let normalizedBpm = rawBpm;
          if (normalizedBpm < 65) normalizedBpm *= 2;
          if (normalizedBpm > 180) normalizedBpm /= 2;

          // Smooth BPM updates without jitter
          this.estimatedBpm = Math.round(this.estimatedBpm * 0.7 + normalizedBpm * 0.3);
          this.confidence = Math.min(1.0, this.beatIntervals.length / this.maxIntervals);
        }
      }
    }

    return {
      isBeat,
      intensity: isBeat ? intensity : 0,
      bpm: this.estimatedBpm,
      confidence: this.confidence,
    };
  }

  public setManualBpm(bpm: number): void {
    this.estimatedBpm = bpm;
    this.beatIntervals = [];
  }

  public reset(): void {
    this.energyHistory = [];
    this.beatIntervals = [];
    this.lastBeatTime = 0;
    this.dynamicThreshold = 0.15;
    this.estimatedBpm = 120;
    this.confidence = 0.5;
  }
}
