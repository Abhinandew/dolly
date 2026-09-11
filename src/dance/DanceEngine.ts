import { DollPose, MovementType } from '../types/pose';
import { AudioAnalysis } from '../types/audio';
import { MovementLibrary, createNeutralPose } from './MovementLibrary';
import { PoseBlender } from './PoseBlender';

/**
 * Procedural Dance Engine
 * 
 * Generates live, rhythm-reactive dancing poses directly from real-time audio analysis.
 * Combines multiple movement primitives (body bounce, head bob, arm waves, hip sway, steps)
 * dynamically based on energy, bass, and beat phase.
 */
export class DanceEngine {
  private currentPose: DollPose = createNeutralPose();
  private targetPose: DollPose = createNeutralPose();
  private primaryMovement: MovementType = 'idle';
  private secondaryMovement: MovementType = 'head bob';
  private movementDurationBeats: number = 6;
  private currentBeatCount: number = 0;

  // Full repertoire — every primary/secondary combo uses a different movement
  // so switching feels genuinely varied rather than cycling a short fixed list.
  private grooveSets: Array<{ primary: MovementType; secondary: MovementType }> = [
    { primary: 'body bounce',    secondary: 'head bob' },
    { primary: 'hip sway',       secondary: 'shoulder bounce' },
    { primary: 'side groove',    secondary: 'head bob' },
    { primary: 'left arm wave',  secondary: 'body bounce' },
    { primary: 'right arm wave', secondary: 'body bounce' },
    { primary: 'hands on hips',  secondary: 'hip sway' },
    { primary: 'left step',      secondary: 'shoulder bounce' },
    { primary: 'right step',     secondary: 'head bob' },
    { primary: 'forward step',   secondary: 'hip sway' },
    { primary: 'backward step',  secondary: 'shoulder bounce' },
    { primary: 'squat',          secondary: 'body bounce' },
    { primary: 'spin',           secondary: 'head bob' },
    { primary: 'left arm wave',  secondary: 'hip sway' },
    { primary: 'right arm wave', secondary: 'shoulder bounce' },
    { primary: 'body bounce',    secondary: 'left arm wave' },
    { primary: 'side groove',    secondary: 'shoulder bounce' },
    { primary: 'hip sway',       secondary: 'head bob' },
    { primary: 'both arms up',   secondary: 'body bounce' },
    { primary: 'squat',          secondary: 'hip sway' },
    { primary: 'left step',      secondary: 'right arm wave' },
    { primary: 'right step',     secondary: 'left arm wave' },
    { primary: 'forward step',   secondary: 'body bounce' },
    { primary: 'spin',           secondary: 'shoulder bounce' },
    { primary: 'hands on hips',  secondary: 'body bounce' },
  ];

  // Drop hype movements triggered on high-energy bass hits
  private dropMovements: MovementType[] = ['jump', 'both arms up', 'spin', 'squat', 'final pose'];

  private currentGrooveIndex: number = 0;

  constructor() {
    // Start on a random groove so every session feels different
    this.currentGrooveIndex = Math.floor(Math.random() * this.grooveSets.length);
    const set = this.grooveSets[this.currentGrooveIndex];
    this.primaryMovement = set.primary;
    this.secondaryMovement = set.secondary;
  }

  /** Pick a random groove index that is different from the current one */
  private pickNextGroove(): number {
    if (this.grooveSets.length <= 1) return 0;
    let next: number;
    do {
      next = Math.floor(Math.random() * this.grooveSets.length);
    } while (next === this.currentGrooveIndex);
    return next;
  }

  /**
   * Update the dance pose for the current animation frame
   * 
   * @param audio Live audio analysis
   * @param isListening Whether the system is actively listening
   * @param deltaTimeMs Milliseconds since last frame
   */
  public update(audio: AudioAnalysis, isListening: boolean, deltaTimeMs: number = 16): DollPose {
    const neutral = createNeutralPose();

    // STATE 1: Waiting / Idle (Gentle breathing, no audio)
    if (!isListening || audio.energy < 0.05) {
      const slowPhase = (performance.now() * 0.001 * 0.7) % 1.0;
      const idlePose = MovementLibrary.idle(slowPhase, 0.4);
      this.targetPose = PoseBlender.applyPartial(neutral, idlePose, 1.0, createNeutralPose());
      this.currentPose = PoseBlender.blend(this.currentPose, this.targetPose, 0.15);
      return this.currentPose;
    }

    // STATE 2 / 3: Active Rhythm-Reactive Dancing
    const phase = audio.beatPhase;
    const energy  = Math.min(1.0, audio.energy * 1.3);
    const bass    = Math.min(1.0, audio.bassEnergy * 1.4);
    const treble  = Math.min(1.0, audio.trebleEnergy * 1.5); // high-pitch brightness
    const bpm     = Math.max(60, Math.min(200, audio.estimatedBPM));

    // ── Speed scalar ────────────────────────────────────────────────────────
    // Combines loudness (energy), high-pitch content (treble) and tempo (BPM).
    // Range: ~0.4 (slow/quiet) → ~1.8 (loud/fast/high-pitched)
    const bpmFactor   = (bpm - 60) / 140;                   // 0 at 60 BPM, 1 at 200 BPM
    const speedScalar = 0.4 + energy * 0.7 + treble * 0.4 + bpmFactor * 0.3;

    // ── Groove switching ─────────────────────────────────────────────────────
    // Fast/loud songs switch steps more frequently; slow/quiet songs hold longer.
    if (audio.beatDetected) {
      this.currentBeatCount++;
      if (this.currentBeatCount >= this.movementDurationBeats) {
        this.currentBeatCount = 0;
        this.currentGrooveIndex = this.pickNextGroove();
        const set = this.grooveSets[this.currentGrooveIndex];
        this.primaryMovement   = set.primary;
        this.secondaryMovement = set.secondary;

        // High energy/treble → short holds (2–5 beats); calm → longer (6–12 beats)
        const minBeats = energy > 0.6 || treble > 0.5 ? 2 : 5;
        const maxExtra = energy > 0.6 || treble > 0.5 ? 3 : 7;
        this.movementDurationBeats = Math.floor(Math.random() * maxExtra) + minBeats;
      }
    }

    // ── Drop hype movements ──────────────────────────────────────────────────
    // Triggered on heavy bass + high energy transients
    let dropMovement: MovementType | null = null;
    if (energy > 0.75 && bass > 0.7 && this.currentBeatCount % 4 === 0) {
      dropMovement = this.dropMovements[Math.floor(Math.random() * this.dropMovements.length)];
    }

    // ── Intensity scaling ────────────────────────────────────────────────────
    // Each movement layer gets an intensity driven by energy + treble so
    // loud/high-pitched songs produce larger, more exaggerated poses.
    const primaryIntensity   = Math.min(1.0, energy + treble * 0.35);
    const secondaryIntensity = Math.min(1.0, bass   + treble * 0.25);
    const headBobIntensity   = Math.min(1.0, Math.max(0.3, bass + treble * 0.2));

    // Synthesize movements using explicit output buffers per layer.
    // 1. Base primary groove
    let synthesized = PoseBlender.applyPartial(
      neutral,
      MovementLibrary.getMovementPose(this.primaryMovement, phase, primaryIntensity),
      1.0,
      createNeutralPose()
    );

    // 2. Layer secondary movement
    synthesized = PoseBlender.applyPartial(
      synthesized,
      MovementLibrary.getMovementPose(this.secondaryMovement, phase, secondaryIntensity),
      0.75,
      createNeutralPose()
    );

    // 3. Layer head bob driven by bass + treble transients
    synthesized = PoseBlender.applyPartial(
      synthesized,
      MovementLibrary.headBob(phase, headBobIntensity),
      0.8,
      createNeutralPose()
    );

    // 4. Layer drop movement if active
    if (dropMovement) {
      synthesized = PoseBlender.applyPartial(
        synthesized,
        MovementLibrary.getMovementPose(dropMovement, phase, 1.0),
        0.85,
        createNeutralPose()
      );
    }

    this.targetPose = synthesized;

    // ── Blend rate ───────────────────────────────────────────────────────────
    // Scales with speedScalar: fast/loud songs snap to target poses quicker,
    // slow/quiet songs transition more smoothly and lazily.
    const baseBlend  = (deltaTimeMs / 16.6) * 0.28;
    const blendRate  = Math.min(1.0, baseBlend * speedScalar);
    this.currentPose = PoseBlender.blend(this.currentPose, this.targetPose, blendRate);

    return this.currentPose;
  }

  public setMovement(primary: MovementType, secondary: MovementType = 'head bob'): void {
    this.primaryMovement = primary;
    this.secondaryMovement = secondary;
  }

  public reset(): void {
    this.currentPose = createNeutralPose();
    this.targetPose = createNeutralPose();
    this.currentBeatCount = 0;
    this.primaryMovement = 'idle';
  }
}
